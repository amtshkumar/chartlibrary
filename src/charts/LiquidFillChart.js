import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * Liquid Fill Gauge Chart implementation with animated wave effects
 */
class LiquidFillChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      circleRadius: 0.6, // Relative to available space
      waveHeight: 8,
      waveCount: 3,
      animationDuration: 3000,
      colors: {
        primary: '#10b981',
        secondary: '#f59e0b',
        connecting: '#6366f1'
      },
      showConnectingFlow: true,
      showPercentages: true,
      showValues: true,
      dualGauge: false, // Single or dual gauge mode
      ...options
    };
    
    super(container, defaultOptions);
  }

  /**
   * Render the liquid fill chart
   */
  render() {
    if (!this.data || this.data.length === 0) {
      console.warn('No data provided for LiquidFillChart');
      return this;
    }

    // Clear previous chart
    this.chartGroup.selectAll('*').remove();

    const centerX = this.innerWidth / 2;
    const centerY = this.innerHeight / 2;
    const radius = Math.min(this.innerWidth, this.innerHeight) / 2 - 40;

    // Create main container
    const container = this.chartGroup.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    this.createGradients();

    if (this.options.dualGauge && this.data.length >= 2) {
      this.renderDualGauge(container, radius);
    } else {
      this.renderSingleGauge(container, radius);
    }

    this.addTitle(container, radius);
    
    return this;
  }

  /**
   * Create gradient definitions for liquid effects
   */
  createGradients() {
    const defs = this.svg.select('defs').empty() ? 
      this.svg.append('defs') : this.svg.select('defs');

    // Primary liquid gradient
    const primaryGradient = defs.append('linearGradient')
      .attr('id', 'primary-liquid')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    
    primaryGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', this.options.colors.primary)
      .attr('stop-opacity', 0.8);
    
    primaryGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d3.color(this.options.colors.primary).darker(0.5))
      .attr('stop-opacity', 0.9);

    // Secondary liquid gradient
    const secondaryGradient = defs.append('linearGradient')
      .attr('id', 'secondary-liquid')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    
    secondaryGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', this.options.colors.secondary)
      .attr('stop-opacity', 0.8);
    
    secondaryGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d3.color(this.options.colors.secondary).darker(0.5))
      .attr('stop-opacity', 0.9);
  }

  /**
   * Render single gauge
   */
  renderSingleGauge(container, radius) {
    const data = this.data[0];
    const fillPercent = Math.min(Math.max(data.value / 100, 0), 1);
    
    this.createLiquidFill(
      container,
      fillPercent,
      this.options.colors.primary,
      data.title || 'Value',
      data.value,
      0,
      radius * this.options.circleRadius
    );
  }

  /**
   * Render dual gauge
   */
  renderDualGauge(container, radius) {
    const total = this.data.reduce((sum, d) => sum + d.value, 0);
    const leftData = this.data[0];
    const rightData = this.data[1];
    
    const leftPercent = total > 0 ? leftData.value / total : 0;
    const rightPercent = total > 0 ? rightData.value / total : 0;

    // Left circle
    const leftCircle = container.append('g')
      .attr('transform', `translate(${-radius * 0.7}, 0)`);
    
    // Right circle
    const rightCircle = container.append('g')
      .attr('transform', `translate(${radius * 0.7}, 0)`);

    this.createLiquidFill(
      leftCircle,
      leftPercent,
      this.options.colors.secondary,
      leftData.title || 'Left',
      leftData.value,
      0,
      radius * this.options.circleRadius
    );

    this.createLiquidFill(
      rightCircle,
      rightPercent,
      this.options.colors.primary,
      rightData.title || 'Right',
      rightData.value,
      1,
      radius * this.options.circleRadius
    );

    // Add connecting flow if enabled
    if (this.options.showConnectingFlow) {
      this.addConnectingFlow(container, radius);
    }

    // Add total value at the bottom
    container.append('text')
      .attr('x', 0)
      .attr('y', radius + 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#6b7280')
      .text(`Total: ${this.formatValue(total)}`);
  }

  /**
   * Create liquid fill effect for a single gauge
   */
  createLiquidFill(container, fillPercent, color, title, value, index, circleRadius) {
    const defs = this.svg.select('defs');
    
    // Outer circle (container)
    container.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', circleRadius)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 3)
      .attr('opacity', 0.3);

    // Create clipping path for liquid
    const clipId = `clip-${title.toLowerCase().replace(/[^a-z]/g, '')}-${index}`;
    defs.append('clipPath')
      .attr('id', clipId)
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', circleRadius - 2);

    // Liquid container
    const liquidContainer = container.append('g')
      .attr('clip-path', `url(#${clipId})`);

    // Create wave generator
    const waveGenerator = d3.line()
      .x(d => d[0])
      .y(d => d[1])
      .curve(d3.curveBasis);

    // Create multiple wave layers for depth
    for (let i = 0; i < this.options.waveCount; i++) {
      this.createWaveLayer(
        liquidContainer,
        waveGenerator,
        fillPercent,
        color,
        circleRadius,
        i,
        index === 0 ? 'secondary' : 'primary'
      );
    }

    // Add percentage text in center
    if (this.options.showPercentages) {
      container.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '24px')
        .attr('font-weight', 'bold')
        .attr('fill', color)
        .text(`${(fillPercent * 100).toFixed(1)}%`);
    }

    // Add title below
    container.append('text')
      .attr('x', 0)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('fill', '#666')
      .text(title);

    // Add value below title
    if (this.options.showValues) {
      container.append('text')
        .attr('x', 0)
        .attr('y', 35)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', '#888')
        .text(this.formatValue(value));
    }

    // Add subtle glow effect
    container.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', circleRadius + 5)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 1)
      .attr('opacity', 0.2)
      .style('filter', 'blur(2px)');

    // Add hover effects
    const self = this;
    container
      .style('cursor', 'pointer')
      .on('mouseover', function(event) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', d3.select(this).attr('transform') + ' scale(1.05)');
        
        const tooltipContent = `${title}<br>Value: ${self.formatValue(value)}<br>Percentage: ${(fillPercent * 100).toFixed(1)}%`;
        self.showTooltip(tooltipContent, event);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', d3.select(this).attr('transform').replace(' scale(1.05)', ''));
        
        self.hideTooltip();
      })
      .on('click', function(event) {
        if (self.options.onClick) {
          self.options.onClick({ title, value, fillPercent }, event);
        }
      });
  }

  /**
   * Create individual wave layer
   */
  createWaveLayer(liquidContainer, waveGenerator, fillPercent, color, circleRadius, layerIndex, gradientType) {
    const waveHeight = this.options.waveHeight - layerIndex * 2;
    const waveLength = circleRadius * 2;
    const waveData = [];
    
    // Generate wave points
    for (let x = -circleRadius * 1.5; x <= circleRadius * 1.5; x += 2) {
      const y = Math.sin((x / waveLength) * Math.PI * 4 + layerIndex * Math.PI / 3) * waveHeight;
      waveData.push([x, y]);
    }

    // Base liquid level (inverted because SVG y increases downward)
    const liquidLevel = circleRadius * (1 - fillPercent * 2) + circleRadius * 0.1;

    // Create wave path
    const wavePath = liquidContainer.append('path')
      .attr('d', () => {
        const wavePoints = waveData.map(([x, y]) => [x, y + liquidLevel]);
        const bottomPoints = [
          [circleRadius * 1.5, circleRadius],
          [-circleRadius * 1.5, circleRadius]
        ];
        return waveGenerator([...wavePoints, ...bottomPoints]) + 'Z';
      })
      .attr('fill', `url(#${gradientType}-liquid)`)
      .attr('opacity', 0.7 - layerIndex * 0.1);

    // Animate wave
    this.animateWave(wavePath, waveGenerator, waveData, waveLength, waveHeight, liquidLevel, circleRadius, layerIndex);
  }

  /**
   * Animate wave movement
   */
  animateWave(wavePath, waveGenerator, waveData, waveLength, waveHeight, liquidLevel, circleRadius, layerIndex) {
    const animationDuration = this.options.animationDuration + layerIndex * 500;

    function animate() {
      wavePath
        .transition()
        .duration(animationDuration)
        .ease(d3.easeLinear)
        .attrTween('d', () => {
          return (t) => {
            const animatedWaveData = waveData.map(([x, y]) => {
              const animatedY = Math.sin((x / waveLength) * Math.PI * 4 + layerIndex * Math.PI / 3 + t * Math.PI * 2) * waveHeight;
              return [x, animatedY + liquidLevel];
            });
            const bottomPoints = [
              [circleRadius * 1.5, circleRadius],
              [-circleRadius * 1.5, circleRadius]
            ];
            return waveGenerator([...animatedWaveData, ...bottomPoints]) + 'Z';
          };
        })
        .on('end', animate);
    }

    animate();
  }

  /**
   * Add connecting flow animation between dual gauges
   */
  addConnectingFlow(container, radius) {
    const flowPath = container.append('path')
      .attr('d', `M ${-radius * 0.1} 0 Q 0 -20 ${radius * 0.1} 0`)
      .attr('stroke', this.options.colors.connecting)
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('opacity', 0.6)
      .attr('stroke-dasharray', '5,5');

    // Animate the connecting flow
    function animateFlow() {
      flowPath
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attrTween('stroke-dashoffset', () => {
          return (t) => `${-t * 10}`;
        })
        .on('end', animateFlow);
    }

    animateFlow();
  }

  /**
   * Add title to the chart
   */
  addTitle(container, radius) {
    if (this.options.title) {
      container.append('text')
        .attr('x', 0)
        .attr('y', -radius - 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .attr('fill', '#374151')
        .text(this.options.title);
    }
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
   * Create liquid fill chart from economic data
   */
  static fromEconomicData(economicData, options = {}) {
    const fmv = economicData.economicSchedule?.[0]?.beginningPrincipal || 0;
    const charitDeduction = economicData.charitDeduction || 0;
    const nonDeductibleValue = fmv - charitDeduction;

    return [
      { title: 'Non-deductible', value: nonDeductibleValue },
      { title: 'Deductible', value: charitDeduction }
    ];
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
   * Set dual gauge mode
   */
  setDualGauge(enabled = true) {
    this.options.dualGauge = enabled;
    return this;
  }

  /**
   * Toggle wave animation
   */
  toggleAnimation(enabled = null) {
    // This would require more complex state management to pause/resume animations
    // For now, just re-render with animation enabled/disabled
    if (enabled !== null) {
      this.options.animationDuration = enabled ? 3000 : 0;
      this.render();
    }
    return this;
  }

  /**
   * Set custom colors
   */
  setColors(colors) {
    this.options.colors = { ...this.options.colors, ...colors };
    return this;
  }
}

export default LiquidFillChart;
