import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * RadarChart class for multi-dimensional data visualization
 * Data format: [{ name: string, values: [{ axis: string, value: number }] }]
 */
class RadarChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      colorScheme: 'category10',
      levels: 5,
      maxValue: 100,
      animation: true,
      tooltips: true,
      legend: true,
      showAxes: true,
      showGrid: true,
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
      category10: d3.schemeCategory10,
      blues: d3.schemeBlues[9],
      greens: d3.schemeGreens[9],
      oranges: d3.schemeOranges[9],
      purples: d3.schemePurples[9]
    };
  }

  setupScales() {
    const radius = Math.min(this.innerWidth, this.innerHeight) / 2;
    this.radius = radius * 0.8;
    this.centerX = this.innerWidth / 2;
    this.centerY = this.innerHeight / 2;
    
    this.colorScale = d3.scaleOrdinal(this.colorSchemes[this.options.colorScheme]);
    this.radiusScale = d3.scaleLinear()
      .domain([0, this.options.maxValue])
      .range([0, this.radius]);
  }

  processData(data) {
    if (!Array.isArray(data) || data.length === 0) return [];
    
    // Get all unique axes
    const allAxes = [...new Set(data.flatMap(d => d.values.map(v => v.axis)))];
    
    // Ensure all series have values for all axes
    return data.map(series => ({
      ...series,
      values: allAxes.map(axis => {
        const existingValue = series.values.find(v => v.axis === axis);
        return existingValue || { axis, value: 0 };
      })
    }));
  }

  render() {
    if (!this.data || !Array.isArray(this.data)) return this;

    // Clear previous render
    this.chartGroup.selectAll('*').remove();

    const processedData = this.processData(this.data);
    if (processedData.length === 0) return this;

    const axes = processedData[0].values.map(d => d.axis);
    const angleSlice = (Math.PI * 2) / axes.length;

    // Create radar group
    const radarGroup = this.chartGroup.append('g')
      .attr('transform', `translate(${this.centerX}, ${this.centerY})`);

    // Draw grid circles
    if (this.options.showGrid) {
      const gridLevels = radarGroup.selectAll('.grid-level')
        .data(d3.range(1, this.options.levels + 1))
        .enter()
        .append('circle')
        .attr('class', 'grid-level')
        .attr('r', d => this.radius * d / this.options.levels)
        .attr('fill', 'none')
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1);
    }

    // Draw axis lines and labels
    if (this.options.showAxes) {
      const axisGroup = radarGroup.selectAll('.axis')
        .data(axes)
        .enter()
        .append('g')
        .attr('class', 'axis');

      // Axis lines
      axisGroup.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', (d, i) => this.radius * Math.cos(angleSlice * i - Math.PI / 2))
        .attr('y2', (d, i) => this.radius * Math.sin(angleSlice * i - Math.PI / 2))
        .attr('stroke', '#999')
        .attr('stroke-width', 1);

      // Axis labels
      axisGroup.append('text')
        .attr('x', (d, i) => (this.radius + 20) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr('y', (d, i) => (this.radius + 20) * Math.sin(angleSlice * i - Math.PI / 2))
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .text(d => d);

      // Grid level labels
      const levelLabels = radarGroup.selectAll('.level-label')
        .data(d3.range(1, this.options.levels + 1))
        .enter()
        .append('text')
        .attr('class', 'level-label')
        .attr('x', 5)
        .attr('y', d => -(this.radius * d / this.options.levels))
        .style('font-size', '10px')
        .style('fill', '#666')
        .text(d => Math.round(this.options.maxValue * d / this.options.levels));
    }

    // Line generator for radar areas
    const lineGenerator = d3.lineRadial()
      .angle((d, i) => angleSlice * i)
      .radius(d => this.radiusScale(d.value))
      .curve(d3.curveLinearClosed);

    // Draw radar areas and lines for each series
    const seriesGroups = radarGroup.selectAll('.series')
      .data(processedData)
      .enter()
      .append('g')
      .attr('class', 'series');

    // Areas
    const areas = seriesGroups.append('path')
      .attr('class', 'radar-area')
      .attr('d', d => lineGenerator(d.values))
      .attr('fill', (d, i) => this.colorScale(i))
      .attr('fill-opacity', 0.2)
      .attr('stroke', (d, i) => this.colorScale(i))
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Data points
    const pointGroups = seriesGroups.selectAll('.point')
      .data(d => d.values.map(v => ({ ...v, seriesName: d.name })))
      .enter()
      .append('g')
      .attr('class', 'point')
      .attr('transform', (d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const radius = this.radiusScale(d.value);
        return `translate(${radius * Math.cos(angle)}, ${radius * Math.sin(angle)})`;
      });

    const points = pointGroups.append('circle')
      .attr('r', 4)
      .attr('fill', (d, i, nodes) => {
        const seriesIndex = processedData.findIndex(s => s.name === d.seriesName);
        return this.colorScale(seriesIndex);
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Add interactions
    if (this.options.tooltips) {
      points
        .on('mouseover', (event, d) => {
          d3.select(event.target).attr('r', 6);
          this.showTooltip(
            `<strong>${d.seriesName}</strong><br/>
             ${d.axis}: ${d.value}`,
            event
          );
        })
        .on('mouseout', (event) => {
          d3.select(event.target).attr('r', 4);
          this.hideTooltip();
        });

      areas
        .on('mouseover', (event, d) => {
          d3.select(event.target).attr('fill-opacity', 0.4);
        })
        .on('mouseout', (event) => {
          d3.select(event.target).attr('fill-opacity', 0.2);
        });
    }

    // Add legend
    if (this.options.legend && processedData.length > 1) {
      const legendItems = processedData.map((d, i) => ({
        label: d.name,
        color: this.colorScale(i)
      }));
      this.addLegend(legendItems);
    }

    // Add animations
    if (this.options.animation) {
      // Animate areas
      areas
        .attr('stroke-dasharray', function() {
          return this.getTotalLength();
        })
        .attr('stroke-dashoffset', function() {
          return this.getTotalLength();
        })
        .transition()
        .duration(1500)
        .delay((d, i) => i * 200)
        .attr('stroke-dashoffset', 0);

      // Animate points
      points
        .attr('r', 0)
        .transition()
        .duration(800)
        .delay((d, i) => i * 50)
        .attr('r', 4);
    }

    return this;
  }

  updateColorScheme(scheme) {
    this.options.colorScheme = scheme;
    this.colorScale = d3.scaleOrdinal(this.colorSchemes[scheme]);
    return this.render();
  }

  updateMaxValue(maxValue) {
    this.options.maxValue = maxValue;
    this.radiusScale.domain([0, maxValue]);
    return this.render();
  }

  updateData(newData) {
    this.setData(newData);
    return this.render();
  }
}

export default RadarChart;
