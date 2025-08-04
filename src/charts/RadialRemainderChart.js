import * as d3 from 'd3';
import BaseChart from './BaseChart.js';
import { ColorUtils, AnimationUtils } from '../utils/index.js';

/**
 * RadialRemainderChart - Creates a radial remainder chart showing trust remainder growth in spiral pattern
 * Extends BaseChart to inherit common functionality
 */
class RadialRemainderChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      width: 600,
      height: 600,
      margin: { top: 60, right: 60, bottom: 60, left: 60 },
      minRadius: 40,
      maxRadius: null, // Will be calculated
      spiralRotations: 2,
      animationDuration: 3000,
      nodeAnimationDelay: 150,
      primaryColor: '#10b981',
      secondaryColor: '#3b82f6',
      accentColor: '#8b5cf6',
      backgroundColor: '#e2e8f0',
      showTooltip: true,
      showCenterInfo: true,
      title: 'Trust Remainder Growth'
    };

    super(container, { ...defaultOptions, ...options });
    this.spiralData = [];
    this.id = Math.random().toString(36).substr(2, 9);
  }

  /**
   * Process economic schedule data into spiral coordinates
   */
  processData(data) {
    if (!data) {
      console.warn('RadialRemainderChart: No data provided');
      return [];
    }

    // Handle different data formats
    let economicSchedule = data;
    
    // If data is an object with economicSchedule property
    if (data.economicSchedule) {
      economicSchedule = data.economicSchedule;
    } else if (data.data && data.data.economicSchedule) {
      economicSchedule = data.data.economicSchedule;
    }
    // If data is already an array, use it directly
    else if (Array.isArray(data)) {
      economicSchedule = data;
    }

    if (!Array.isArray(economicSchedule)) {
      console.warn('RadialRemainderChart: Economic schedule not found or invalid');
      return [];
    }

    const centerX = this.innerWidth / 2;
    const centerY = this.innerHeight / 2;
    const maxRadius = this.options.maxRadius || (Math.min(this.innerWidth, this.innerHeight) / 2 - 20);
    const minRadius = this.options.minRadius;

    return economicSchedule.map((d, i) => {
      const angle = (i / economicSchedule.length) * this.options.spiralRotations * 2 * Math.PI;
      const radius = minRadius + (maxRadius - minRadius) * (i / (economicSchedule.length - 1));
      
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        remainder: d.remainder || d.value || 0,
        year: i + 1,
        angle: angle,
        originalData: d
      };
    });
  }

  /**
   * Create spiral gradients
   */
  createGradients() {
    const defs = this.svg.select('defs').empty() ? this.svg.append('defs') : this.svg.select('defs');
    
    // Spiral gradient
    const spiralGradient = defs.append('linearGradient')
      .attr('id', `spiral-gradient-${this.id}`)
      .attr('gradientUnits', 'userSpaceOnUse');
    
    spiralGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', this.options.primaryColor)
      .attr('stop-opacity', 1);
    
    spiralGradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', this.options.secondaryColor)
      .attr('stop-opacity', 0.8);
      
    spiralGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', this.options.accentColor)
      .attr('stop-opacity', 0.6);

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', `glow-${this.id}`)
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
  }

  /**
   * Render the spiral path
   */
  renderSpiral() {
    const g = this.chartGroup;
    
    // Create line generator
    const line = d3.line()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveCardinal);

    // Background spiral track
    g.append('path')
      .datum(this.spiralData)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', this.options.backgroundColor)
      .attr('stroke-width', 8)
      .attr('opacity', 0.3)
      .attr('class', 'spiral-background');

    // Animated spiral path
    const spiralPath = g.append('path')
      .datum(this.spiralData)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', `url(#spiral-gradient-${this.id})`)
      .attr('stroke-width', 6)
      .attr('stroke-linecap', 'round')
      .attr('class', 'spiral-path')
      .style('filter', `url(#glow-${this.id})`);

    // Animate spiral drawing
    const totalLength = spiralPath.node()?.getTotalLength() || 0;
    spiralPath
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(this.options.animationDuration)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    return spiralPath;
  }

  /**
   * Render remainder nodes
   */
  renderNodes() {
    const g = this.chartGroup;
    
    // Calculate node sizes
    const maxRemainder = d3.max(this.spiralData, d => d.remainder) || 0;
    const radiusScale = d3.scaleSqrt()
      .domain([0, maxRemainder])
      .range([4, 16]);

    const nodes = g.selectAll('.remainder-node')
      .data(this.spiralData)
      .enter()
      .append('g')
      .attr('class', 'remainder-node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('opacity', 0);

    // Remainder circles
    nodes.append('circle')
      .attr('r', d => radiusScale(d.remainder))
      .attr('fill', this.options.primaryColor)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');

    // Year labels
    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '8px')
      .attr('font-weight', 'bold')
      .attr('fill', 'white')
      .text(d => d.year.toString());

    // Animate nodes appearance
    nodes
      .transition()
      .delay((d, i) => i * this.options.nodeAnimationDelay + 1000)
      .duration(600)
      .style('opacity', 1);

    // Add hover effects
    if (this.options.showTooltip) {
      this.addNodeInteractions(nodes);
    }

    return nodes;
  }

  /**
   * Add hover interactions to nodes
   */
  addNodeInteractions(nodes) {
    const self = this;
    
    nodes
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', `translate(${d.x},${d.y}) scale(1.3)`);
        
        self.showTooltip(event, d);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', `translate(${d.x},${d.y}) scale(1)`);
        
        self.hideTooltip();
      });
  }

  /**
   * Show tooltip for node
   */
  showTooltip(event, d) {
    const tooltip = this.chartGroup.append('g')
      .attr('class', 'chart-tooltip')
      .attr('transform', `translate(${d.x + 20},${d.y - 20})`);
    
    const text = `Year ${d.year}: ${this.formatCurrency(d.remainder)}`;
    const bbox = this.getTextBBox(text, '10px');
    
    tooltip.append('rect')
      .attr('x', -5)
      .attr('y', -bbox.height / 2 - 2)
      .attr('width', bbox.width + 10)
      .attr('height', bbox.height + 4)
      .attr('fill', 'rgba(0,0,0,0.8)')
      .attr('rx', 4);
    
    tooltip.append('text')
      .attr('fill', 'white')
      .attr('font-size', '10px')
      .attr('dy', '0.35em')
      .text(text);
  }

  /**
   * Hide tooltip
   */
  hideTooltip() {
    this.chartGroup.selectAll('.chart-tooltip').remove();
  }

  /**
   * Render center information
   */
  renderCenterInfo() {
    if (!this.options.showCenterInfo) return;

    const centerGroup = this.chartGroup.append('g')
      .attr('class', 'center-info');
    
    // Title
    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-1em')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1e293b')
      .text(this.options.title);
    
    // Final remainder value
    const finalRemainder = this.spiralData[this.spiralData.length - 1]?.remainder || 0;
    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.5em')
      .attr('font-size', '12px')
      .attr('fill', this.options.primaryColor)
      .attr('font-weight', '600')
      .text(`Projected: ${this.formatCurrency(finalRemainder)}`);
      
    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.8em')
      .attr('font-size', '10px')
      .attr('fill', '#6b7280')
      .text(`after ${this.spiralData.length} years`);
  }

  /**
   * Format currency values
   */
  formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  /**
   * Get text bounding box
   */
  getTextBBox(text, fontSize) {
    const tempText = this.svg.append('text')
      .attr('font-size', fontSize)
      .text(text)
      .style('opacity', 0);
    
    const bbox = tempText.node().getBBox();
    tempText.remove();
    
    return bbox;
  }

  /**
   * Clear the chart content
   */
  clear() {
    if (this.svg) {
      this.svg.selectAll('.radial-remainder-chart').remove();
    }
  }

  /**
   * Main render method
   */
  render() {
    if (!this.data || this.data.length === 0) {
      console.warn('RadialRemainderChart: No data to render');
      return this;
    }

    // Clear previous render
    this.clear();

    // Process data into spiral coordinates
    this.spiralData = this.processData(this.data);
    
    if (this.spiralData.length === 0) {
      console.warn('RadialRemainderChart: No valid data points found');
      return this;
    }

    // Create chart group centered
    this.chartGroup = this.svg.append('g')
      .attr('class', 'radial-remainder-chart')
      .attr('transform', `translate(${this.options.margin.left + this.innerWidth / 2}, ${this.options.margin.top + this.innerHeight / 2})`);

    // Create gradients and filters
    this.createGradients();

    // Render components
    this.renderSpiral();
    this.renderNodes();
    this.renderCenterInfo();

    return this;
  }

  /**
   * Update chart with new data
   */
  updateData(newData) {
    this.setData(newData);
    this.render();
    return this;
  }

  /**
   * Static method to create from economic data
   */
  static fromEconomicData(economicData) {
    if (!economicData || !economicData.economicSchedule) {
      console.warn('RadialRemainderChart: Invalid economic data format');
      return [];
    }

    return economicData.economicSchedule.map((item, index) => ({
      year: index + 1,
      remainder: item.remainder || 0,
      ...item
    }));
  }
}

export default RadialRemainderChart;
