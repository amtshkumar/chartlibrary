import * as d3 from 'd3';

/**
 * Base Chart class that provides common functionality for all chart types
 */
class BaseChart {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      width: 800,
      height: 400,
      margin: { top: 20, right: 30, bottom: 40, left: 40 },
      backgroundColor: '#ffffff',
      ...options
    };
    
    this.data = null;
    this.svg = null;
    this.chartGroup = null;
    
    this.init();
  }

  /**
   * Initialize the SVG container and chart group
   */
  init() {
    // Clear existing content
    d3.select(this.container).selectAll('*').remove();
    
    // Create SVG
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', this.options.width)
      .attr('height', this.options.height)
      .style('background-color', this.options.backgroundColor);
    
    // Create chart group with margins
    this.chartGroup = this.svg.append('g')
      .attr('transform', `translate(${this.options.margin.left}, ${this.options.margin.top})`);
    
    // Calculate inner dimensions
    this.innerWidth = this.options.width - this.options.margin.left - this.options.margin.right;
    this.innerHeight = this.options.height - this.options.margin.top - this.options.margin.bottom;
  }

  /**
   * Set data for the chart
   */
  setData(data) {
    this.data = data;
    return this;
  }

  /**
   * Update chart options
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.init();
    return this;
  }

  /**
   * Get chart dimensions
   */
  getDimensions() {
    return {
      width: this.innerWidth,
      height: this.innerHeight,
      margin: this.options.margin
    };
  }

  /**
   * Add title to the chart
   */
  addTitle(title, options = {}) {
    const titleOptions = {
      fontSize: '16px',
      fontWeight: 'bold',
      textAnchor: 'middle',
      fill: '#333',
      ...options
    };

    this.svg.append('text')
      .attr('x', this.options.width / 2)
      .attr('y', titleOptions.fontSize === '16px' ? 16 : parseInt(titleOptions.fontSize))
      .style('font-size', titleOptions.fontSize)
      .style('font-weight', titleOptions.fontWeight)
      .style('text-anchor', titleOptions.textAnchor)
      .style('fill', titleOptions.fill)
      .text(title);

    return this;
  }

  /**
   * Add legend to the chart
   */
  addLegend(items, options = {}) {
    const legendOptions = {
      x: this.options.width - 100,
      y: 30,
      itemHeight: 20,
      fontSize: '12px',
      ...options
    };

    const legend = this.svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${legendOptions.x}, ${legendOptions.y})`);

    const legendItems = legend.selectAll('.legend-item')
      .data(items)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * legendOptions.itemHeight})`);

    legendItems.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', d => d.color);

    legendItems.append('text')
      .attr('x', 16)
      .attr('y', 9)
      .style('font-size', legendOptions.fontSize)
      .style('alignment-baseline', 'middle')
      .text(d => d.label);

    return this;
  }

  /**
   * Add tooltip functionality
   */
  addTooltip() {
    this.tooltip = d3.select('body')
      .append('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000');

    return this;
  }

  /**
   * Show tooltip
   */
  showTooltip(content, event) {
    if (this.tooltip) {
      this.tooltip
        .style('visibility', 'visible')
        .html(content)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    }
  }

  /**
   * Hide tooltip
   */
  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.style('visibility', 'hidden');
    }
  }

  /**
   * Render method to be implemented by subclasses
   */
  render() {
    throw new Error('render() method must be implemented by subclasses');
  }

  /**
   * Destroy the chart and clean up
   */
  destroy() {
    if (this.tooltip) {
      this.tooltip.remove();
    }
    d3.select(this.container).selectAll('*').remove();
  }
}

export default BaseChart;
