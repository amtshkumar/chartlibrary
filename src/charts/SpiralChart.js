import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * SpiralChart - Creates an animated spiral visualization showing data progression over time
 * Features floating particles, breathing animations, and interactive data points
 * Perfect for displaying time-series data with engaging spiral layout
 */
class SpiralChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      width: 800,
      height: 600,
      margin: { top: 60, right: 60, bottom: 60, left: 60 },
      maxRadius: 250,
      turns: 4,
      particleCount: 20,
      animationDuration: 1000,
      animationDelay: 100,
      showParticles: true,
      showFlowLines: true,
      showBreathing: true,
      selectedMetric: 'all',
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      centerLabel: 'Data Flow',
      timeField: 'period',
      valueField: 'value',
      ...options
    };
    
    super(container, defaultOptions);
    this.addTooltip();
    this.colorScale = d3.scaleOrdinal(this.options.colors);
    
    // Animation state
    this.isAnimating = false;
    this.currentPeriod = 0;
    this.hoveredPeriod = null;
    this.particles = [];
    
    // Metrics configuration - can be customized via options
    this.metrics = this.options.metrics || [
      { key: 'all', label: 'All Metrics', color: '#3b82f6', icon: '🌟' },
      { key: 'primary', label: 'Primary Value', color: '#10b981', icon: '📈' },
      { key: 'secondary', label: 'Secondary Value', color: '#f59e0b', icon: '💵' },
      { key: 'tertiary', label: 'Tertiary Value', color: '#ef4444', icon: '📤' },
      { key: 'quaternary', label: 'Quaternary Value', color: '#8b5cf6', icon: '💎' }
    ];
  }

  /**
   * Process raw data for spiral visualization
   */
  processData(rawData) {
    // Handle different data formats
    let dataArray = [];
    
    if (Array.isArray(rawData)) {
      dataArray = rawData;
    } else if (rawData?.timeSeries) {
      dataArray = rawData.timeSeries;
    } else if (rawData?.data) {
      dataArray = rawData.data;
    } else if (rawData?.economicSchedule) {
      // Legacy support for economic data
      dataArray = rawData.economicSchedule;
    } else {
      return [];
    }

    return dataArray.slice(0, 20).map((d, i) => {
      // Generic data mapping with fallbacks
      const period = d[this.options.timeField] || d.year || d.time || d.period || (i + 1);
      const primaryValue = Math.abs(d.primaryValue || d.value || d.amount || d.growth || 0);
      const secondaryValue = Math.abs(d.secondaryValue || d.income || d.revenue || 0);
      const tertiaryValue = Math.abs(d.tertiaryValue || d.distribution || d.expense || 0);
      const quaternaryValue = Math.abs(d.quaternaryValue || d.remainder || d.profit || 0);
      
      return {
        period,
        primaryValue,
        secondaryValue,
        tertiaryValue,
        quaternaryValue,
        totalValue: primaryValue + secondaryValue + tertiaryValue + quaternaryValue,
        originalData: d
      };
    });
  }

  /**
   * Calculate spiral positions for each data point
   */
  calculateSpiralPositions(data) {
    const centerX = this.options.width / 2;
    const centerY = this.options.height / 2;
    const maxRadius = Math.min(this.options.width, this.options.height) / 2.5;
    
    return data.map((d, i) => {
      const progress = i / Math.max(1, data.length - 1);
      // Use quadratic progression for better spacing
      const radiusProgress = Math.pow(progress, 0.8);
      const angle = progress * this.options.turns * 2 * Math.PI;
      const radius = Math.max(30, radiusProgress * maxRadius);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      return {
        ...d,
        x: isFinite(x) ? x : centerX,
        y: isFinite(y) ? y : centerY,
        angle: isFinite(angle) ? angle : 0,
        radius: isFinite(radius) ? radius : 30,
        progress
      };
    });
  }

  /**
   * Create gradient definitions and filters
   */
  createDefsAndFilters() {
    const defs = this.svg.append("defs");
    
    // Create gradients for each metric
    this.metrics.forEach(metric => {
      const gradient = defs.append("radialGradient")
        .attr("id", `gradient-${metric.key}`)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%");
      
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", metric.color)
        .attr("stop-opacity", 0.8);
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", metric.color)
        .attr("stop-opacity", 0.2);
    });

    // Create glow filter
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    filter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");

    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    return defs;
  }

  /**
   * Create background spiral path
   */
  createBackgroundSpiral() {
    const centerX = this.options.width / 2;
    const centerY = this.options.height / 2;
    const maxRadius = Math.min(this.options.width, this.options.height) / 2.5;
    
    const backgroundSpiral = this.svg.append("g").attr("class", "background-spiral");
    
    // Create spiral path
    const spiralPath = d3.path();
    const pointsPerTurn = 50;
    const totalPoints = this.options.turns * pointsPerTurn;
    
    for (let i = 0; i <= totalPoints; i++) {
      const angle = (i / pointsPerTurn) * 2 * Math.PI;
      const radius = (i / totalPoints) * maxRadius;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      if (i === 0) {
        spiralPath.moveTo(x, y);
      } else {
        spiralPath.lineTo(x, y);
      }
    }

    backgroundSpiral.append("path")
      .attr("d", spiralPath.toString())
      .attr("fill", "none")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 2)
      .attr("opacity", 0.3);

    return backgroundSpiral;
  }

  /**
   * Create data point nodes along the spiral
   */
  createDataNodes(positions, mainGroup) {
    const yearNodes = mainGroup.selectAll(".data-node")
      .data(positions)
      .enter()
      .append("g")
      .attr("class", "data-node")
      .attr("transform", d => `translate(${d.x}, ${d.y})`);

    // Add glow circles for each data point
    yearNodes.append("circle")
      .attr("class", "glow-circle")
      .attr("r", 0)
      .attr("fill", d => {
        const metric = this.metrics.find(m => m.key === this.options.selectedMetric) || this.metrics[0];
        return `url(#gradient-${metric.key})`;
      })
      .attr("filter", "url(#glow)")
      .transition()
      .delay((d, i) => i * this.options.animationDelay)
      .duration(this.options.animationDuration)
      .attr("r", d => this.calculateNodeRadius(d));

    // Add metric value circles
    yearNodes.append("circle")
      .attr("class", "metric-circle")
      .attr("r", 0)
      .attr("fill", "white")
      .attr("stroke", d => {
        const metric = this.metrics.find(m => m.key === this.options.selectedMetric) || this.metrics[0];
        return metric.color;
      })
      .attr("stroke-width", 3)
      .transition()
      .delay((d, i) => i * this.options.animationDelay + 200)
      .duration(this.options.animationDuration * 0.8)
      .attr("r", d => this.calculateNodeRadius(d));

    // Add period labels
    yearNodes.append("text")
      .attr("class", "period-label")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#374151")
      .attr("opacity", 0)
      .text(d => `${d.period}`)
      .transition()
      .delay((d, i) => i * this.options.animationDelay + 400)
      .duration(this.options.animationDuration * 0.6)
      .attr("opacity", 1);

    return yearNodes;
  }

  /**
   * Calculate node radius based on selected metric
   */
  calculateNodeRadius(d) {
    const maxValue = Math.max(1, d3.max(this.processedData, item => this.getMetricValue(item)));
    const value = this.getMetricValue(d);
    return Math.max(8, 8 + (value / maxValue) * 15); // 8-23px radius
  }

  /**
   * Get metric value based on selected metric
   */
  getMetricValue(d) {
    switch (this.options.selectedMetric) {
      case 'primary':
        return d.primaryValue || 0;
      case 'secondary':
        return d.secondaryValue || 0;
      case 'tertiary':
        return d.tertiaryValue || 0;
      case 'quaternary':
        return d.quaternaryValue || 0;
      default:
        return d.totalValue || d.primaryValue || 0;
    }
  }

  /**
   * Create connecting flow lines between data points
   */
  createFlowLines(positions, mainGroup) {
    if (!this.options.showFlowLines) return;

    const flowLines = mainGroup.append("g").attr("class", "flow-lines");
    
    for (let i = 0; i < positions.length - 1; i++) {
      const current = positions[i];
      const next = positions[i + 1];
      
      const line = flowLines.append("line")
        .attr("x1", current.x)
        .attr("y1", current.y)
        .attr("x2", current.x)
        .attr("y2", current.y)
        .attr("stroke", "#6366f1")
        .attr("stroke-width", 2)
        .attr("opacity", 0.6)
        .attr("stroke-dasharray", "5,5");

      line.transition()
        .delay(i * 150 + 600)
        .duration(800)
        .attr("x2", next.x)
        .attr("y2", next.y);
    }

    return flowLines;
  }

  /**
   * Create floating particles along the spiral
   */
  createFloatingParticles(positions, mainGroup) {
    if (!this.options.showParticles) return;

    const particles = mainGroup.append("g").attr("class", "particles");
    
    for (let i = 0; i < this.options.particleCount; i++) {
      const particle = particles.append("circle")
        .attr("class", "particle")
        .attr("r", Math.random() * 3 + 1)
        .attr("fill", this.colorScale(0))
        .attr("opacity", 0.6);

      this.animateParticle(particle, positions);
    }

    return particles;
  }

  /**
   * Animate particle along spiral path
   */
  animateParticle(particle, positions) {
    const randomStart = Math.floor(Math.random() * positions.length);
    const startPos = positions[randomStart];
    
    particle
      .attr("cx", startPos.x)
      .attr("cy", startPos.y)
      .transition()
      .duration(3000 + Math.random() * 2000)
      .ease(d3.easeLinear)
      .attrTween("cx", () => {
        return (t) => {
          const index = Math.floor(t * (positions.length - 1));
          const nextIndex = Math.min(index + 1, positions.length - 1);
          const localT = (t * (positions.length - 1)) - index;
          return positions[index].x + (positions[nextIndex].x - positions[index].x) * localT;
        };
      })
      .attrTween("cy", () => {
        return (t) => {
          const index = Math.floor(t * (positions.length - 1));
          const nextIndex = Math.min(index + 1, positions.length - 1);
          const localT = (t * (positions.length - 1)) - index;
          return positions[index].y + (positions[nextIndex].y - positions[index].y) * localT;
        };
      })
      .on("end", () => this.animateParticle(particle, positions));
  }

  /**
   * Add breathing animation to nodes
   */
  addBreathingAnimation(nodes) {
    if (!this.options.showBreathing) return;

    const breathe = () => {
      nodes.selectAll(".glow-circle")
        .transition()
        .duration(2000)
        .ease(d3.easeSinInOut)
        .attr("r", d => this.calculateNodeRadius(d) * 1.15)
        .transition()
        .duration(2000)
        .ease(d3.easeSinInOut)
        .attr("r", d => this.calculateNodeRadius(d))
        .on("end", function() {
          if (!this.isAnimating) {
            breathe();
          }
        });
    };

    setTimeout(() => {
      if (!this.isAnimating) {
        breathe();
      }
    }, 2000);
  }

  /**
   * Create center information display
   */
  createCenterInfo() {
    const centerX = this.options.width / 2;
    const centerY = this.options.height / 2;
    
    const centerInfo = this.svg.append("g")
      .attr("class", "center-info")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    centerInfo.append("circle")
      .attr("r", 40)
      .attr("fill", "rgba(59, 130, 246, 0.1)")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    centerInfo.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.5em")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "#374151")
      .text("SPIRAL");

    centerInfo.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .attr("font-size", "12px")
      .attr("fill", "#6b7280")
      .text(this.options.centerLabel);

    return centerInfo;
  }

  /**
   * Add hover interactions to nodes
   */
  addHoverInteractions(nodes) {
    const self = this;
    
    nodes
      .on("mouseover", function(event, d) {
        self.hoveredPeriod = d.period;
        
        d3.select(this).select(".glow-circle")
          .transition()
          .duration(200)
          .attr("r", self.calculateNodeRadius(d) * 1.3);

        self.showDataTooltip(event, d);
      })
      .on("mouseout", function(event, d) {
        self.hoveredPeriod = null;
        
        d3.select(this).select(".glow-circle")
          .transition()
          .duration(200)
          .attr("r", self.calculateNodeRadius(d));

        self.hideTooltip();
      });
  }

  /**
   * Show tooltip with data information
   */
  showDataTooltip(event, d) {
    const tooltipContent = `
      <div style="font-weight: bold; margin-bottom: 8px;">Period ${d.period}</div>
      <div style="color: ${this.colorScale(0)};">Primary: ${this.formatValue(d.primaryValue)}</div>
      <div style="color: ${this.colorScale(1)};">Secondary: ${this.formatValue(d.secondaryValue)}</div>
      <div style="color: ${this.colorScale(2)};">Tertiary: ${this.formatValue(d.tertiaryValue)}</div>
      <div style="color: ${this.colorScale(3)};">Quaternary: ${this.formatValue(d.quaternaryValue)}</div>
      <div style="margin-top: 8px; font-weight: bold;">Total: ${this.formatValue(d.totalValue)}</div>
    `;
    
    super.showTooltip(tooltipContent, event);
  }

  /**
   * Format values for display
   */
  formatValue(value) {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return `${value.toFixed(0)}`;
  }

  /**
   * Main render method
   */
  render() {
    if (!this.data) return this;

    // Clear existing content
    this.svg.selectAll('*').remove();

    // Process data
    this.processedData = this.processData(this.data);
    if (this.processedData.length === 0) return this;

    // Calculate spiral positions
    const positions = this.calculateSpiralPositions(this.processedData);

    // Create defs and filters
    this.createDefsAndFilters();

    // Create background spiral
    this.createBackgroundSpiral();

    // Create main visualization group
    const mainGroup = this.svg.append("g").attr("class", "main-visualization");

    // Create data nodes
    const nodes = this.createDataNodes(positions, mainGroup);

    // Create flow lines
    this.createFlowLines(positions, mainGroup);

    // Create floating particles
    this.createFloatingParticles(positions, mainGroup);

    // Add breathing animation
    this.addBreathingAnimation(nodes);

    // Create center info
    this.createCenterInfo();

    // Add hover interactions
    this.addHoverInteractions(nodes);

    return this;
  }

  /**
   * Update chart with new data
   */
  update(newData) {
    this.setData(newData);
    return this.render();
  }

  /**
   * Set selected metric and re-render
   */
  setSelectedMetric(metric) {
    this.options.selectedMetric = metric;
    return this.render();
  }

  /**
   * Start animation sequence
   */
  startAnimation() {
    this.isAnimating = true;
    // Implement custom animation logic here
    setTimeout(() => {
      this.isAnimating = false;
    }, 5000);
    return this;
  }

  /**
   * Reset chart to initial state
   */
  reset() {
    this.isAnimating = false;
    this.currentPeriod = 0;
    this.options.selectedMetric = 'all';
    return this.render();
  }
}

export default SpiralChart;
