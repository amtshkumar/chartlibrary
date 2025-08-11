import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * ParallelCoordinatesChart class for multi-dimensional data analysis
 * Data format: [{ name: string, [dimension]: number, ... }]
 */
class ParallelCoordinatesChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      colorScheme: 'category10',
      animation: true,
      tooltips: true,
      brushing: true,
      lineOpacity: 0.6,
      highlightOpacity: 0.9,
      fadeOpacity: 0.1,
      ...options
    };

    super(container, defaultOptions);
    this.setupColorSchemes();
    this.setupScales();
    this.brushes = new Map();
    
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
      purples: d3.schemePurples[9],
      viridis: d3.schemeViridis
    };
  }

  setupScales() {
    this.colorScale = d3.scaleOrdinal(this.colorSchemes[this.options.colorScheme]);
    this.dimensions = [];
    this.yScales = new Map();
  }

  processData(data) {
    if (!Array.isArray(data) || data.length === 0) return [];

    // Extract dimensions (numeric columns)
    const sample = data[0];
    this.dimensions = Object.keys(sample).filter(key => 
      key !== 'name' && typeof sample[key] === 'number'
    );

    // Create scales for each dimension
    this.dimensions.forEach(dim => {
      const extent = d3.extent(data, d => d[dim]);
      this.yScales.set(dim, d3.scaleLinear()
        .domain(extent)
        .range([this.innerHeight, 0])
      );
    });

    // Create x scale for dimensions
    this.xScale = d3.scalePoint()
      .domain(this.dimensions)
      .range([0, this.innerWidth])
      .padding(0.1);

    return data;
  }

  render() {
    if (!this.data || !Array.isArray(this.data)) return this;

    // Clear previous render
    this.chartGroup.selectAll('*').remove();

    const processedData = this.processData(this.data);
    if (processedData.length === 0) return this;

    // Create line generator
    const line = d3.line()
      .x(dim => this.xScale(dim))
      .y(dim => this.yScales.get(dim)(processedData[0][dim]))
      .curve(d3.curveCardinal.tension(0.5));

    // Draw background lines
    const background = this.chartGroup.append('g')
      .attr('class', 'background');

    // Draw foreground lines
    const foreground = this.chartGroup.append('g')
      .attr('class', 'foreground');

    // Create paths for each data point
    const paths = foreground.selectAll('.line')
      .data(processedData)
      .enter()
      .append('path')
      .attr('class', 'line')
      .attr('d', d => {
        const lineGen = d3.line()
          .x(dimension => this.xScale(dimension))
          .y(dimension => this.yScales.get(dimension)(d[dimension]))
          .curve(d3.curveCardinal.tension(0.5));
        return lineGen(this.dimensions);
      })
      .attr('fill', 'none')
      .attr('stroke', (d, i) => this.colorScale(i))
      .attr('stroke-width', 2)
      .attr('opacity', this.options.lineOpacity)
      .style('cursor', 'pointer');

    // Draw axes
    const axes = this.chartGroup.selectAll('.axis')
      .data(this.dimensions)
      .enter()
      .append('g')
      .attr('class', 'axis')
      .attr('data-dimension', d => d)
      .attr('transform', d => `translate(${this.xScale(d)}, 0)`);

    // Add axis lines
    const self = this;
    axes.append('g')
      .each(function(d) {
        d3.select(this).call(d3.axisLeft(self.yScales.get(d)));
      });

    // Add axis titles
    axes.append('text')
      .attr('class', 'axis-title')
      .attr('text-anchor', 'middle')
      .attr('y', -10)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text(d => d);

    // Add brushing if enabled
    if (this.options.brushing) {
      this.addBrushing(axes, paths);
    }

    // Add interactions
    if (this.options.tooltips) {
      paths
        .on('mouseover', (event, d) => {
          // Highlight current line
          d3.select(event.target)
            .attr('opacity', this.options.highlightOpacity)
            .attr('stroke-width', 3);

          // Fade other lines
          paths.filter(data => data !== d)
            .attr('opacity', this.options.fadeOpacity);

          // Show tooltip
          const tooltipContent = `<strong>${d.name || 'Data Point'}</strong><br/>` +
            this.dimensions.map(dim => `${dim}: ${d[dim]}`).join('<br/>');
          
          this.showTooltip(tooltipContent, event);
        })
        .on('mouseout', (event, d) => {
          // Reset all lines
          paths
            .attr('opacity', this.options.lineOpacity)
            .attr('stroke-width', 2);

          this.hideTooltip();
        });
    }

    // Add animations
    if (this.options.animation) {
      // Animate lines drawing
      const totalLength = paths.nodes().map(node => node.getTotalLength());
      
      paths
        .attr('stroke-dasharray', (d, i) => `0 ${totalLength[i]}`)
        .transition()
        .duration(1500)
        .delay((d, i) => i * 50)
        .ease(d3.easeLinear)
        .attr('stroke-dasharray', (d, i) => `${totalLength[i]} 0`);

      // Animate axes
      axes
        .style('opacity', 0)
        .transition()
        .duration(800)
        .delay((d, i) => i * 100 + 500)
        .style('opacity', 1);
    }

    return this;
  }

  addBrushing(axes, paths) {
    axes.append('g')
      .attr('class', 'brush')
      .each((d, i, nodes) => {
        const brush = d3.brushY()
          .extent([[-10, 0], [10, this.innerHeight]])
          .on('brush end', () => this.onBrush(paths));
        
        this.brushes.set(d, brush);
        d3.select(nodes[i]).call(brush);
      });
  }

  onBrush(paths) {
    const actives = [];
    
    // Get active brushes
    this.brushes.forEach((brush, dimension) => {
      const brushGroupSel = this.chartGroup.select(`.axis[data-dimension="${dimension}"] .brush`);
      const node = brushGroupSel.node();
      if (!node) return; // axis or brush not present
      const selection = d3.brushSelection(node);
      if (selection) {
        const scale = this.yScales.get(dimension);
        actives.push({
          dimension,
          extent: selection.map(scale.invert)
        });
      }
    });

    // Filter paths based on active brushes
    paths.style('display', d => {
      return actives.every(active => {
        const value = d[active.dimension];
        return value >= active.extent[1] && value <= active.extent[0];
      }) ? null : 'none';
    });
  }

  updateColorScheme(scheme) {
    this.options.colorScheme = scheme;
    this.colorScale = d3.scaleOrdinal(this.colorSchemes[scheme]);
    return this.render();
  }

  updateData(newData) {
    this.setData(newData);
    return this.render();
  }

  clearBrushes() {
    this.brushes.forEach((brush, dimension) => {
      const brushGroup = this.chartGroup.select(`.axis[data-dimension="${dimension}"] .brush`);
      const node = brushGroup.node();
      if (!node) return;
      // Clear via calling brush on selection then clear
      brush.clear(brushGroup);
    });
    
    // Show all paths
    this.chartGroup.selectAll('.line').style('display', null);
  }
}

export default ParallelCoordinatesChart;
