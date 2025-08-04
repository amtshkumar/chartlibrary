import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * Sankey Chart implementation with animated flows
 */
class SankeyChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      nodeWidth: 25,
      nodeColors: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'],
      linkOpacity: 0.8,
      animationDuration: 1500,
      particleAnimation: true,
      showValues: true,
      showEfficiency: true,
      nodeSpacing: 200,
      ...options
    };
    
    super(container, defaultOptions);
    this.addTooltip();
  }

  /**
   * Render the Sankey chart
   */
  render() {
    if (!this.data || !this.data.nodes || !this.data.links) {
      console.warn('No valid Sankey data provided. Expected format: { nodes: [], links: [] }');
      return this;
    }

    // Clear previous chart
    this.chartGroup.selectAll('*').remove();

    this.createGradients();
    this.calculateNodePositions();
    this.renderLinks();
    this.renderNodes();
    this.addTitle();
    
    if (this.options.showEfficiency) {
      this.addEfficiencyPanel();
    }

    return this;
  }

  /**
   * Calculate node positions for optimal layout
   */
  calculateNodePositions() {
    const { nodes, links } = this.data;
    
    // Group nodes by columns if not specified
    if (!nodes[0].hasOwnProperty('x')) {
      this.autoLayoutNodes();
    }

    // Scale positions to chart dimensions
    const xScale = d3.scaleLinear()
      .domain(d3.extent(nodes, d => d.x))
      .range([50, this.innerWidth - 50]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(nodes, d => d.y))
      .range([50, this.innerHeight - 50]);

    nodes.forEach(node => {
      node.scaledX = xScale(node.x);
      node.scaledY = yScale(node.y);
    });

    // Calculate link thickness scale
    const maxValue = Math.max(...links.map(d => d.value));
    this.linkScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([2, 40]);
  }

  /**
   * Auto-layout nodes in columns
   */
  autoLayoutNodes() {
    const { nodes, links } = this.data;
    
    // Find source and target nodes
    const sourceNodes = new Set(links.map(d => d.source));
    const targetNodes = new Set(links.map(d => d.target));
    
    // Assign columns
    nodes.forEach((node, i) => {
      if (!targetNodes.has(i)) {
        node.x = 0; // Source column
      } else if (!sourceNodes.has(i)) {
        node.x = 2; // Target column
      } else {
        node.x = 1; // Middle column
      }
      
      // Distribute vertically within column
      const sameColumnNodes = nodes.filter(n => n.x === node.x);
      const columnIndex = sameColumnNodes.indexOf(node);
      node.y = columnIndex * (this.innerHeight / sameColumnNodes.length) + 50;
    });
  }

  /**
   * Create gradients for animated flows
   */
  createGradients() {
    const defs = this.svg.select('defs').empty() ? 
      this.svg.append('defs') : this.svg.select('defs');

    this.data.links.forEach((link, i) => {
      const sourceNode = this.data.nodes[link.source];
      const targetNode = this.data.nodes[link.target];
      const linkColor = link.color || this.options.nodeColors[i % this.options.nodeColors.length];

      const gradient = defs.append('linearGradient')
        .attr('id', `flow-gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', sourceNode.scaledX || sourceNode.x)
        .attr('y1', sourceNode.scaledY || sourceNode.y)
        .attr('x2', targetNode.scaledX || targetNode.x)
        .attr('y2', targetNode.scaledY || targetNode.y);

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', linkColor)
        .attr('stop-opacity', 0.8);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', linkColor)
        .attr('stop-opacity', 0.4);
    });
  }

  /**
   * Render animated links
   */
  renderLinks() {
    const self = this;
    
    this.data.links.forEach((link, i) => {
      const sourceNode = this.data.nodes[link.source];
      const targetNode = this.data.nodes[link.target];
      const linkColor = link.color || this.options.nodeColors[i % this.options.nodeColors.length];

      // Create curved path
      const midX = (sourceNode.scaledX + targetNode.scaledX) / 2;
      const midY = (sourceNode.scaledY + targetNode.scaledY) / 2 + (Math.random() - 0.5) * 100;
      const pathData = `M${sourceNode.scaledX},${sourceNode.scaledY} Q${midX},${midY} ${targetNode.scaledX},${targetNode.scaledY}`;

      const linkPath = this.chartGroup.append('path')
        .attr('d', pathData)
        .attr('fill', 'none')
        .attr('stroke', `url(#flow-gradient-${i})`)
        .attr('stroke-width', this.linkScale(link.value))
        .attr('stroke-linecap', 'round')
        .style('opacity', 0)
        .style('filter', `drop-shadow(0 2px 8px ${linkColor}40)`)
        .style('cursor', 'pointer');

      // Animate link appearance
      const totalLength = linkPath.node().getTotalLength();
      linkPath
        .attr('stroke-dasharray', totalLength + ' ' + totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .delay(i * 400)
        .duration(this.options.animationDuration)
        .ease(d3.easeLinear)
        .style('opacity', this.options.linkOpacity)
        .attr('stroke-dashoffset', 0);

      // Add interactivity
      linkPath
        .on('mouseover', function(event) {
          d3.select(this).style('opacity', 1);
          const tooltipContent = `${sourceNode.name} → ${targetNode.name}<br>Value: ${self.formatValue(link.value)}`;
          self.showTooltip(tooltipContent, event);
        })
        .on('mouseout', function() {
          d3.select(this).style('opacity', self.options.linkOpacity);
          self.hideTooltip();
        });

      // Add flowing particles if enabled
      if (this.options.particleAnimation) {
        this.addFlowingParticles(linkPath, linkColor, i, totalLength);
      }
    });
  }

  /**
   * Add flowing particles along links
   */
  addFlowingParticles(linkPath, color, index, totalLength) {
    const particle = this.chartGroup.append('circle')
      .attr('r', 4)
      .attr('fill', color)
      .style('opacity', 0)
      .style('filter', 'drop-shadow(0 0 6px currentColor)');

    const animateParticle = () => {
      particle
        .transition()
        .duration(2000 + Math.random() * 1000)
        .ease(d3.easeLinear)
        .style('opacity', 1)
        .attrTween('transform', () => {
          return (t) => {
            const point = linkPath.node().getPointAtLength(t * totalLength);
            return point ? `translate(${point.x},${point.y})` : '';
          };
        })
        .transition()
        .duration(200)
        .style('opacity', 0)
        .on('end', () => {
          setTimeout(animateParticle, Math.random() * 2000 + 1000);
        });
    };

    setTimeout(() => animateParticle(), index * 400 + this.options.animationDuration);
  }

  /**
   * Render nodes with enhanced styling
   */
  renderNodes() {
    const self = this;

    this.data.nodes.forEach((node, i) => {
      const nodeColor = node.color || this.options.nodeColors[i % this.options.nodeColors.length];
      
      const nodeGroup = this.chartGroup.append('g')
        .attr('transform', `translate(${node.scaledX},${node.scaledY})`)
        .style('opacity', 0)
        .style('cursor', 'pointer');

      // Node background circle
      nodeGroup.append('circle')
        .attr('r', this.options.nodeWidth)
        .attr('fill', nodeColor)
        .attr('stroke', 'white')
        .attr('stroke-width', 3)
        .style('filter', `drop-shadow(0 4px 12px ${nodeColor}40)`);

      // Node value text (if enabled)
      if (this.options.showValues) {
        nodeGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .attr('fill', 'white')
          .text(this.formatValue(node.value));
      }

      // Node label
      nodeGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '45px')
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .attr('fill', '#1e293b')
        .text(node.name);

      // Animate node appearance
      nodeGroup
        .transition()
        .delay(i * 200)
        .duration(800)
        .style('opacity', 1);

      // Add hover effects
      nodeGroup
        .on('mouseover', function(event) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('transform', `translate(${node.scaledX},${node.scaledY}) scale(1.2)`);
          
          const tooltipContent = `${node.name}<br>Value: ${self.formatValue(node.value)}`;
          self.showTooltip(tooltipContent, event);
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('transform', `translate(${node.scaledX},${node.scaledY}) scale(1)`);
          
          self.hideTooltip();
        })
        .on('click', function(event) {
          if (self.options.onClick) {
            self.options.onClick(node, event);
          }
        });
    });
  }

  /**
   * Add efficiency panel
   */
  addEfficiencyPanel() {
    if (!this.data.efficiency) return;

    const efficiency = this.data.efficiency;
    const panelGroup = this.chartGroup.append('g')
      .attr('transform', `translate(${this.innerWidth - 150}, ${this.innerHeight - 60})`);

    panelGroup.append('rect')
      .attr('width', 140)
      .attr('height', 50)
      .attr('fill', 'rgba(16, 185, 129, 0.1)')
      .attr('stroke', this.options.nodeColors[0])
      .attr('stroke-width', 1)
      .attr('rx', 6);

    panelGroup.append('text')
      .attr('x', 70)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#1e293b')
      .text('Efficiency');

    const efficiencyColor = efficiency > 90 ? this.options.nodeColors[2] : 
                           efficiency > 70 ? this.options.nodeColors[3] : 
                           this.options.nodeColors[1];

    panelGroup.append('text')
      .attr('x', 70)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', efficiencyColor)
      .text(`${efficiency.toFixed(1)}%`);
  }

  /**
   * Format values for display
   */
  formatValue(value) {
    if (this.options.valueFormatter) {
      return this.options.valueFormatter(value);
    }
    
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  }

  /**
   * Create Sankey chart from economic schedule data
   */
  static fromEconomicSchedule(economicData, options = {}) {
    const totalDistribution = economicData.reduce((sum, item) => sum + item.distribution, 0);
    const optimalPayout = options.optimalPayout || totalDistribution * 1.1;
    const actualPayout = totalDistribution;
    const initialTrust = economicData[0]?.remainder || 1000000;
    const finalRemainder = economicData[economicData.length - 1]?.remainder || 0;
    const charitableDeduction = options.charitDeduction || initialTrust * 0.3;

    const nodes = [
      { name: 'Initial Trust', x: 0, y: 250, value: initialTrust },
      { name: 'Optimal Strategy', x: 1, y: 150, value: optimalPayout },
      { name: 'Actual Payouts', x: 1, y: 350, value: actualPayout },
      { name: 'Beneficiaries', x: 2, y: 150, value: actualPayout },
      { name: 'Charitable Remainder', x: 2, y: 350, value: finalRemainder },
      { name: 'Tax Deduction', x: 3, y: 250, value: charitableDeduction }
    ];

    const links = [
      { source: 0, target: 1, value: optimalPayout },
      { source: 0, target: 2, value: actualPayout },
      { source: 1, target: 3, value: optimalPayout * 0.7 },
      { source: 2, target: 3, value: actualPayout * 0.8 },
      { source: 1, target: 4, value: optimalPayout * 0.3 },
      { source: 2, target: 4, value: actualPayout * 0.2 },
      { source: 4, target: 5, value: charitableDeduction }
    ];

    const efficiency = (actualPayout / optimalPayout) * 100;

    return {
      nodes,
      links,
      efficiency
    };
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
   * Set custom value formatter
   */
  setValueFormatter(formatter) {
    this.options.valueFormatter = formatter;
    return this;
  }

  /**
   * Toggle particle animation
   */
  toggleParticles(enabled = null) {
    this.options.particleAnimation = enabled !== null ? enabled : !this.options.particleAnimation;
    this.render();
    return this;
  }
}

export default SankeyChart;
