import * as d3 from 'd3';
import BaseChart from './BaseChart.js';
import { ColorUtils, AnimationUtils } from '../utils/index.js';

/**
 * ChordDiagramChart - Creates a chord diagram for visualizing relationships between trust components
 * Extends BaseChart to inherit common functionality
 */
class ChordDiagramChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      width: 600,
      height: 600,
      margin: { top: 60, right: 60, bottom: 60, left: 60 },
      outerRadius: null, // Will be calculated
      innerRadius: null, // Will be calculated
      padAngle: 0.05,
      animationDuration: 1200,
      groupAnimationDelay: 200,
      chordAnimationDelay: 1000,
      primaryColor: '#10b981',
      secondaryColor: '#3b82f6',
      accentColor: '#8b5cf6',
      warningColor: '#f59e0b',
      mutedColor: '#6b7280',
      showTooltip: true,
      showCenterInfo: true,
      title: 'Trust Relationships'
    };

    super(container, { ...defaultOptions, ...options });
    this.chordData = [];
    this.matrix = [];
    this.labels = ['Charitable\nDeduction', 'Income\nStream', 'Annual\nDistributions', 'Trust\nRemainder'];
    this.colors = [
      this.options.primaryColor,
      this.options.secondaryColor,
      this.options.accentColor,
      this.options.warningColor
    ];
    this.id = Math.random().toString(36).substr(2, 9);
  }

  /**
   * Process economic data into chord matrix
   */
  processData(data) {
    if (!data) {
      console.warn('ChordDiagramChart: No data provided');
      return { matrix: [], labels: this.labels };
    }

    // Handle different data formats
    let economicData = data;
    if (data.data) {
      economicData = data.data;
    }

    // Extract values from economic data
    const totalTrust = economicData.economicSchedule?.[0]?.remainder || 
                      economicData.economicSchedule?.[0]?.beginningPrincipal || 
                      1000000;
    
    const totalDistribution = economicData.economicSchedule?.reduce((sum, d) => 
      sum + (d.distribution || 0), 0) || totalTrust * 0.05;
    
    const charitableDeduction = economicData.charitDeduction || 
                               economicData.charitableDeduction || 
                               totalTrust * 0.3;
    
    const remainderValue = economicData.economicSchedule?.[economicData.economicSchedule.length - 1]?.remainder || 
                          totalTrust * 0.7;

    // Create matrix for chord diagram - represents relationships between components
    const matrix = [
      [0, charitableDeduction * 0.3, totalDistribution * 0.2, remainderValue * 0.1], // Charitable Deduction
      [charitableDeduction * 0.3, 0, totalDistribution * 0.4, remainderValue * 0.3], // Income Stream
      [totalDistribution * 0.2, totalDistribution * 0.4, 0, remainderValue * 0.2], // Distributions
      [remainderValue * 0.1, remainderValue * 0.3, remainderValue * 0.2, 0] // Remainder
    ];

    return {
      matrix,
      labels: this.labels,
      totalFlow: totalDistribution + charitableDeduction,
      totalTrust,
      charitableDeduction,
      totalDistribution,
      remainderValue
    };
  }

  /**
   * Create gradients for chord visualization
   */
  createGradients() {
    const defs = this.svg.select('defs').empty() ? this.svg.append('defs') : this.svg.select('defs');
    
    this.colors.forEach((color, i) => {
      const gradient = defs.append('radialGradient')
        .attr('id', `chord-gradient-${this.id}-${i}`)
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', ColorUtils.lighten(color, 0.2))
        .attr('stop-opacity', 1);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', color)
        .attr('stop-opacity', 0.8);
    });

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', `chord-glow-${this.id}`)
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '2')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
  }

  /**
   * Render chord groups (outer arcs)
   */
  renderGroups(chords) {
    const arc = d3.arc()
      .innerRadius(this.innerRadius)
      .outerRadius(this.outerRadius);

    const groups = this.chartGroup.selectAll('.chord-group')
      .data(chords.groups)
      .enter()
      .append('g')
      .attr('class', 'chord-group');

    // Group arcs
    groups.append('path')
      .attr('fill', (d, i) => `url(#chord-gradient-${this.id}-${i})`)
      .attr('stroke', (d, i) => this.colors[i])
      .attr('stroke-width', 2)
      .attr('d', arc)
      .style('opacity', 0)
      .style('filter', `url(#chord-glow-${this.id})`)
      .transition()
      .delay((d, i) => i * this.options.groupAnimationDelay)
      .duration(800)
      .style('opacity', 0.8);

    // Group labels
    groups.append('text')
      .attr('transform', (d) => {
        const angle = (d.startAngle + d.endAngle) / 2;
        const radius = this.outerRadius + 20;
        return `translate(${Math.cos(angle - Math.PI / 2) * radius},${Math.sin(angle - Math.PI / 2) * radius})`;
      })
      .attr('text-anchor', (d) => {
        const angle = (d.startAngle + d.endAngle) / 2;
        return angle > Math.PI ? 'end' : 'start';
      })
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1e293b')
      .style('opacity', 0)
      .text((d, i) => this.processedData.labels[i])
      .transition()
      .delay((d, i) => i * this.options.groupAnimationDelay + 400)
      .duration(600)
      .style('opacity', 1);

    return groups;
  }

  /**
   * Render chord connections
   */
  renderChords(chords) {
    const ribbon = d3.ribbon()
      .radius(this.innerRadius);

    const chordPaths = this.chartGroup.selectAll('.chord-path')
      .data(chords)
      .enter()
      .append('path')
      .attr('class', 'chord-path')
      .attr('fill', (d) => this.colors[d.source.index])
      .attr('stroke', (d) => this.colors[d.source.index])
      .attr('stroke-width', 1)
      .attr('opacity', 0.6)
      .attr('d', ribbon)
      .style('opacity', 0)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');

    // Animate chords
    chordPaths
      .transition()
      .delay(this.options.chordAnimationDelay)
      .duration(this.options.animationDuration)
      .style('opacity', 0.6);

    return chordPaths;
  }

  /**
   * Add hover interactions
   */
  addInteractions(groups, chordPaths) {
    if (!this.options.showTooltip) return;

    const self = this;
    
    groups
      .on('mouseover', function(event, d) {
        const groupIndex = d.index;
        
        // Highlight related chords
        chordPaths
          .style('opacity', (chord) => {
            return (chord.source.index === groupIndex || chord.target.index === groupIndex) ? 0.8 : 0.1;
          });
        
        self.showTooltip(event, d);
      })
      .on('mouseout', function() {
        chordPaths.style('opacity', 0.6);
        self.hideTooltip();
      });
  }

  /**
   * Show tooltip for group
   */
  showTooltip(event, d) {
    const tooltip = this.chartGroup.append('g')
      .attr('class', 'chord-tooltip');
    
    const value = d.value;
    const text = this.formatCurrency(value);
    const bbox = this.getTextBBox(text, '11px');
    
    tooltip.append('rect')
      .attr('x', -bbox.width / 2 - 5)
      .attr('y', -bbox.height / 2 - 2)
      .attr('width', bbox.width + 10)
      .attr('height', bbox.height + 4)
      .attr('fill', 'rgba(0,0,0,0.8)')
      .attr('rx', 4);
    
    tooltip.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .text(text);
  }

  /**
   * Hide tooltip
   */
  hideTooltip() {
    this.chartGroup.selectAll('.chord-tooltip').remove();
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
      .attr('dy', '-0.5em')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1e293b')
      .text(this.options.title);
    
    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .attr('font-size', '10px')
      .attr('fill', this.options.mutedColor)
      .text('Component Interactions');

    // Value summary
    const summaryGroup = this.chartGroup.append('g')
      .attr('class', 'summary-info')
      .attr('transform', `translate(0, ${this.outerRadius + 60})`);
    
    summaryGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', this.options.primaryColor)
      .text(`Total Flow: ${this.formatCurrency(this.processedData.totalFlow)}`);
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
      this.svg.selectAll('.chord-diagram-chart').remove();
    }
  }

  /**
   * Main render method
   */
  render() {
    if (!this.data) {
      console.warn('ChordDiagramChart: No data to render');
      return this;
    }

    // Clear previous render
    this.clear();

    // Process data
    this.processedData = this.processData(this.data);
    
    if (!this.processedData.matrix || this.processedData.matrix.length === 0) {
      console.warn('ChordDiagramChart: No valid matrix data found');
      return this;
    }

    // Calculate dimensions
    this.outerRadius = this.options.outerRadius || (Math.min(this.innerWidth, this.innerHeight) * 0.4);
    this.innerRadius = this.options.innerRadius || (this.outerRadius - 30);

    // Create chart group centered
    this.chartGroup = this.svg.append('g')
      .attr('class', 'chord-diagram-chart')
      .attr('transform', `translate(${this.options.margin.left + this.innerWidth / 2}, ${this.options.margin.top + this.innerHeight / 2})`);

    // Create gradients and filters
    this.createGradients();

    // Create chord layout
    const chord = d3.chord()
      .padAngle(this.options.padAngle)
      .sortSubgroups(d3.descending);

    const chords = chord(this.processedData.matrix);

    // Render components
    const groups = this.renderGroups(chords);
    const chordPaths = this.renderChords(chords);
    this.addInteractions(groups, chordPaths);
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
      console.warn('ChordDiagramChart: Invalid economic data format');
      return {};
    }

    return {
      data: economicData
    };
  }
}

export default ChordDiagramChart;
