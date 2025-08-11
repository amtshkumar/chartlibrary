import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * TreemapChart class for visualizing hierarchical data using nested rectangles
 * Data format: { name: string, value: number, children?: Array }
 */
class TreemapChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      colorScheme: 'category10',
      padding: 2,
      animation: true,
      tooltips: true,
      legend: false,
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
    this.colorScale = d3.scaleOrdinal(this.colorSchemes[this.options.colorScheme]);
    
    this.treemap = d3.treemap()
      .size([this.innerWidth, this.innerHeight])
      .padding(this.options.padding);
  }

  processData(data) {
    // Create hierarchy from data
    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    return this.treemap(root);
  }

  render() {
    if (!this.data) return this;

    // Clear previous render
    this.chartGroup.selectAll('*').remove();

    const root = this.processData(this.data);
    const leaves = root.leaves();

    // Create rectangles for each leaf node
    const cells = this.chartGroup.selectAll('.cell')
      .data(leaves)
      .enter()
      .append('g')
      .attr('class', 'cell')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    // Add rectangles
    const rects = cells.append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', (d, i) => this.colorScale(i))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer');

    // Add labels
    cells.append('text')
      .attr('x', d => (d.x1 - d.x0) / 2)
      .attr('y', d => (d.y1 - d.y0) / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', d => Math.min(12, (d.x1 - d.x0) / 8, (d.y1 - d.y0) / 4) + 'px')
      .style('fill', '#333')
      .style('pointer-events', 'none')
      .text(d => d.data.name)
      .each(function(d) {
        // Hide text if rectangle is too small
        const bbox = this.getBBox();
        if (bbox.width > (d.x1 - d.x0) || bbox.height > (d.y1 - d.y0)) {
          d3.select(this).style('display', 'none');
        }
      });

    // Add value labels for larger rectangles
    cells.append('text')
      .attr('x', d => (d.x1 - d.x0) / 2)
      .attr('y', d => (d.y1 - d.y0) / 2 + 15)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', d => Math.min(10, (d.x1 - d.x0) / 10, (d.y1 - d.y0) / 6) + 'px')
      .style('fill', '#666')
      .style('pointer-events', 'none')
      .text(d => d.data.value)
      .each(function(d) {
        // Hide value if rectangle is too small
        const bbox = this.getBBox();
        if (bbox.width > (d.x1 - d.x0) || (d.y1 - d.y0) < 40) {
          d3.select(this).style('display', 'none');
        }
      });

    // Add interactions
    if (this.options.tooltips) {
      rects
        .on('mouseover', (event, d) => {
          d3.select(event.target).style('opacity', 0.8);
          this.showTooltip(
            `<strong>${d.data.name}</strong><br/>Value: ${d.data.value}`,
            event
          );
        })
        .on('mouseout', (event) => {
          d3.select(event.target).style('opacity', 1);
          this.hideTooltip();
        });
    }

    // Add animations
    if (this.options.animation) {
      rects
        .style('opacity', 0)
        .transition()
        .duration(800)
        .delay((d, i) => i * 20)
        .style('opacity', 1);
    }

    return this;
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
}

export default TreemapChart;
