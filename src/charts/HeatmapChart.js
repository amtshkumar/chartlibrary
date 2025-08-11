import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * HeatmapChart class for matrix data visualization
 * Data format: [{ row: string, column: string, value: number }]
 */
class HeatmapChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      colorScheme: 'blues',
      animation: true,
      tooltips: true,
      showValues: false,
      cellPadding: 2,
      ...options
    };

    super(container, defaultOptions);
    this.setupColorSchemes();
    this.setupScales();
    
    if (this.options.tooltips) {
      this.addTooltip();
    }
  }

  setupColorSchemes() {
    this.colorSchemes = {
      blues: d3.interpolateBlues,
      greens: d3.interpolateGreens,
      reds: d3.interpolateReds,
      oranges: d3.interpolateOranges,
      purples: d3.interpolatePurples,
      viridis: d3.interpolateViridis,
      plasma: d3.interpolatePlasma,
      inferno: d3.interpolateInferno
    };
  }

  setupScales() {
    this.xScale = d3.scaleBand()
      .range([0, this.innerWidth])
      .padding(0.05);

    this.yScale = d3.scaleBand()
      .range([0, this.innerHeight])
      .padding(0.05);

    this.colorScale = d3.scaleSequential(this.colorSchemes[this.options.colorScheme]);
  }

  processData(data) {
    if (!Array.isArray(data)) return { processedData: [], rows: [], columns: [] };

    const rows = [...new Set(data.map(d => d.row))].sort();
    const columns = [...new Set(data.map(d => d.column))].sort();
    
    // Create matrix with all combinations
    const processedData = [];
    rows.forEach(row => {
      columns.forEach(column => {
        const existing = data.find(d => d.row === row && d.column === column);
        processedData.push({
          row,
          column,
          value: existing ? existing.value : 0
        });
      });
    });

    return { processedData, rows, columns };
  }

  render() {
    if (!this.data || !Array.isArray(this.data)) return this;

    // Clear previous render
    this.chartGroup.selectAll('*').remove();

    const { processedData, rows, columns } = this.processData(this.data);
    if (processedData.length === 0) return this;

    // Update scales
    this.xScale.domain(columns);
    this.yScale.domain(rows);
    
    const valueExtent = d3.extent(processedData, d => d.value);
    this.colorScale.domain(valueExtent);

    // Add axes
    const xAxis = this.chartGroup.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.innerHeight})`)
      .call(d3.axisBottom(this.xScale).tickSize(0));

    xAxis.selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '11px');

    const yAxis = this.chartGroup.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(this.yScale).tickSize(0));

    yAxis.selectAll('text')
      .style('font-size', '11px');

    // Remove axis lines
    xAxis.select('.domain').remove();
    yAxis.select('.domain').remove();

    // Create cells
    const cells = this.chartGroup.selectAll('.cell')
      .data(processedData)
      .enter()
      .append('g')
      .attr('class', 'cell')
      .attr('transform', d => `translate(${this.xScale(d.column)}, ${this.yScale(d.row)})`);

    const rects = cells.append('rect')
      .attr('width', this.xScale.bandwidth())
      .attr('height', this.yScale.bandwidth())
      .attr('fill', d => this.colorScale(d.value))
      .attr('stroke', '#fff')
      .attr('stroke-width', this.options.cellPadding)
      .style('cursor', 'pointer');

    // Add value labels if requested
    if (this.options.showValues) {
      cells.append('text')
        .attr('x', this.xScale.bandwidth() / 2)
        .attr('y', this.yScale.bandwidth() / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', Math.min(this.xScale.bandwidth(), this.yScale.bandwidth()) / 4 + 'px')
        .style('fill', d => {
          // Use contrasting color for text
          const brightness = d3.hsl(this.colorScale(d.value)).l;
          return brightness > 0.5 ? '#333' : '#fff';
        })
        .style('pointer-events', 'none')
        .text(d => Math.round(d.value * 100) / 100);
    }

    // Add color legend
    this.addColorLegend(valueExtent);

    // Add interactions
    if (this.options.tooltips) {
      rects
        .on('mouseover', (event, d) => {
          d3.select(event.target)
            .attr('stroke', '#333')
            .attr('stroke-width', 2);
          
          this.showTooltip(
            `<strong>Row:</strong> ${d.row}<br/>
             <strong>Column:</strong> ${d.column}<br/>
             <strong>Value:</strong> ${d.value}`,
            event
          );
        })
        .on('mouseout', (event, d) => {
          d3.select(event.target)
            .attr('stroke', '#fff')
            .attr('stroke-width', this.options.cellPadding);
          
          this.hideTooltip();
        });
    }

    // Add animations
    if (this.options.animation) {
      rects
        .style('opacity', 0)
        .transition()
        .duration(600)
        .delay((d, i) => i * 10)
        .style('opacity', 1);
    }

    return this;
  }

  addColorLegend(valueExtent) {
    const legendWidth = 20;
    const legendHeight = 200;
    const legendX = this.innerWidth + 30;
    const legendY = (this.innerHeight - legendHeight) / 2;

    const legendGroup = this.chartGroup.append('g')
      .attr('class', 'color-legend')
      .attr('transform', `translate(${legendX}, ${legendY})`);

    // Create gradient
    const gradient = this.svg.append('defs')
      .append('linearGradient')
      .attr('id', 'heatmap-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', legendHeight)
      .attr('x2', 0).attr('y2', 0);

    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const value = valueExtent[0] + (valueExtent[1] - valueExtent[0]) * i / steps;
      gradient.append('stop')
        .attr('offset', `${i * 100 / steps}%`)
        .attr('stop-color', this.colorScale(value));
    }

    // Legend rectangle
    legendGroup.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#heatmap-gradient)')
      .attr('stroke', '#333')
      .attr('stroke-width', 1);

    // Legend scale
    const legendScale = d3.scaleLinear()
      .domain(valueExtent)
      .range([legendHeight, 0]);

    const legendAxis = d3.axisRight(legendScale)
      .tickSize(4)
      .ticks(5);

    legendGroup.append('g')
      .attr('transform', `translate(${legendWidth}, 0)`)
      .call(legendAxis)
      .selectAll('text')
      .style('font-size', '10px');
  }

  updateColorScheme(scheme) {
    this.options.colorScheme = scheme;
    this.colorScale = d3.scaleSequential(this.colorSchemes[scheme]);
    return this.render();
  }

  updateData(newData) {
    this.setData(newData);
    return this.render();
  }
}

export default HeatmapChart;
