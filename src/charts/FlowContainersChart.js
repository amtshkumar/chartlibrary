import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * FlowContainersChart - Creates an animated flow visualization with bucket containers
 * Features dollar symbols flowing into containers with liquid-like filling effects
 * Perfect for showing financial data flow with engaging animations
 */
class FlowContainersChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      width: 800,
      height: 600,
      margin: { top: 60, right: 40, bottom: 60, left: 40 },
      containerWidth: 120,
      containerHeight: 200,
      containerSpacing: 180,
      animationDuration: 1000,
      animationDelay: 100,
      maxDollarSymbols: 12,
      particleCount: 10,
      sparkleCount: 20,
      colors: ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'],
      showSparkles: true,
      showParticles: true,
      showYearLabels: true,
      autoPlay: false,
      ...options
    };
    
    super(container, defaultOptions);
    this.addTooltip();
    this.colorScale = d3.scaleOrdinal(this.options.colors);
    
    // Animation state
    this.isAnimating = false;
    this.currentYear = 0;
    this.showTotals = false;
    
    // Container definitions
    this.containers = [
      { key: 'primaryValue', label: 'Primary', icon: '💰', color: this.colorScale(0) },
      { key: 'secondaryValue', label: 'Secondary', icon: '📈', color: this.colorScale(1) },
      { key: 'tertiaryValue', label: 'Tertiary', icon: '💵', color: this.colorScale(2) },
      { key: 'distributionValue', label: 'Distribution', icon: '📤', color: this.colorScale(3) },
      { key: 'remainderValue', label: 'Remainder', icon: '💎', color: this.colorScale(4) }
    ];
  }

  /**
   * Process raw data for flow containers visualization
   */
  processData(rawData) {
    // Handle new containers data format
    if (rawData?.containers) {
      return rawData.containers.slice(0, 10).map((d, i) => ({
        year: d.year || (i + 1),
        primaryValue: Math.abs(d.amount * 0.4) || 0,
        secondaryValue: Math.abs(d.amount * 0.3) || 0,
        tertiaryValue: Math.abs(d.amount * 0.2) || 0,
        distributionValue: Math.abs(d.amount * 0.1) || 0,
        remainderValue: Math.abs(d.amount * 0.05) || 0,
        totalValue: Math.abs(d.amount) || 0,
        fillPercentage: d.fillPercentage || 0.5,
        label: d.label || `Year ${d.year || (i + 1)}`
      }));
    }
    
    // Handle legacy economicSchedule format
    if (rawData?.economicSchedule) {
      const scheduleData = rawData.economicSchedule.slice(0, 10);
      
      return scheduleData.map((d, i) => ({
        year: i + 1,
        primaryValue: Math.abs(d.remainder * 0.4) || 0,
        secondaryValue: Math.abs(d.remainder * 0.3) || 0,
        tertiaryValue: Math.abs(d.remainder * 0.2) || 0,
        distributionValue: Math.abs(d.distribution) || 0,
        remainderValue: Math.abs(d.remainder * 0.1) || 0,
        totalValue: Math.abs(d.remainder) || 0,
        fillPercentage: 0.5,
        label: `Year ${i + 1}`
      }));
    }
    
    return [];
  }

  /**
   * Create gradient definitions and filters
   */
  createDefsAndFilters() {
    const defs = this.svg.append("defs");
    
    // Create gradients for each container
    this.containers.forEach(container => {
      const gradient = defs.append("linearGradient")
        .attr("id", `gradient-${container.key}`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");
      
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d3.color(container.color)?.brighter(0.5)?.toString() || container.color)
        .attr("stop-opacity", 0.9);
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", container.color)
        .attr("stop-opacity", 0.7);
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
   * Create floating sparkles background
   */
  createSparkles(mainGroup) {
    if (!this.options.showSparkles) return;

    const sparkleGroup = mainGroup.append("g").attr("class", "sparkles");
    
    const { width, height } = this.options;
    
    for (let i = 0; i < this.options.sparkleCount; i++) {
      sparkleGroup.append("circle")
        .attr("cx", Math.random() * width)
        .attr("cy", Math.random() * height)
        .attr("r", Math.random() * 3 + 1)
        .attr("fill", "#fbbf24")
        .attr("opacity", Math.random() * 0.5 + 0.2)
        .attr("filter", "url(#glow)")
        .transition()
        .duration(2000 + Math.random() * 3000)
        .ease(d3.easeSinInOut)
        .attr("cy", Math.random() * height)
        .attr("opacity", Math.random() * 0.3 + 0.1)
        .on("end", function repeat() {
          d3.select(this)
            .transition()
            .duration(2000 + Math.random() * 3000)
            .ease(d3.easeSinInOut)
            .attr("cy", Math.random() * height)
            .attr("opacity", Math.random() * 0.5 + 0.2)
            .on("end", repeat);
        });
    }
  }

  /**
   * Create container groups with bucket shapes
   */
  createContainers(mainGroup, data) {
    const startX = (this.options.width - (this.containers.length * this.options.containerSpacing - (this.options.containerSpacing - this.options.containerWidth))) / 2;
    
    // Calculate maximum values for scaling
    const maxValues = this.containers.map(container => {
      return data.reduce((sum, d) => sum + Math.abs(d[container.key] || 0), 0);
    });

    const containerGroups = mainGroup.selectAll(".container-group")
      .data(this.containers)
      .enter()
      .append("g")
      .attr("class", "container-group")
      .attr("transform", (d, i) => `translate(${startX + i * this.options.containerSpacing}, 200)`);

    // Draw bucket-shaped container outlines
    containerGroups.append("path")
      .attr("class", "container-outline")
      .attr("d", () => {
        const topWidth = this.options.containerWidth * 0.8;
        const bottomWidth = this.options.containerWidth;
        const height = this.options.containerHeight;
        
        const topLeft = (this.options.containerWidth - topWidth) / 2;
        const topRight = (this.options.containerWidth + topWidth) / 2;
        
        return `M ${topLeft} 0 L ${topRight} 0 L ${bottomWidth} ${height} L 0 ${height} Z`;
      })
      .attr("fill", "none")
      .attr("stroke", d => d.color)
      .attr("stroke-width", 3)
      .attr("stroke-opacity", 0.6)
      .attr("rx", 5);

    // Add container labels
    containerGroups.append("text")
      .attr("class", "container-label")
      .attr("x", this.options.containerWidth / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", d => d.color)
      .text(d => `${d.icon} ${d.label}`);

    // Add value displays
    containerGroups.append("text")
      .attr("class", "value-display")
      .attr("x", this.options.containerWidth / 2)
      .attr("y", this.options.containerHeight + 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#374151")
      .text("$0");

    // Create sub-groups for different elements
    containerGroups.append("g").attr("class", "dollar-container");
    containerGroups.append("g").attr("class", "year-lines");
    containerGroups.append("g").attr("class", "dollar-particles");

    // Add amount display backgrounds
    containerGroups.append("rect")
      .attr("class", "amount-bg")
      .attr("x", -10)
      .attr("y", this.options.containerHeight + 10)
      .attr("width", this.options.containerWidth + 20)
      .attr("height", 30)
      .attr("rx", 15)
      .attr("fill", d => d.color)
      .attr("opacity", 0.2)
      .attr("filter", "url(#glow)");

    // Add fill level indicator line
    containerGroups.append("line")
      .attr("class", "fill-level-indicator")
      .attr("x1", -5)
      .attr("x2", this.options.containerWidth + 5)
      .attr("y1", this.options.containerHeight)
      .attr("y2", this.options.containerHeight)
      .attr("stroke", d => d.color)
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "8,4")
      .attr("opacity", 0)
      .attr("filter", "url(#glow)");

    // Initialize fill elements
    this.initializeFillElements(containerGroups);

    return { containerGroups, maxValues };
  }

  /**
   * Initialize liquid fill elements for containers
   */
  initializeFillElements(containerGroups) {
    containerGroups.each((d, i) => {
      const containerGroup = d3.select(containerGroups.nodes()[i]);
      const container = this.containers[i];
      
      // Main fill rectangle
      containerGroup.append("rect")
        .attr("class", "fill-background")
        .attr("x", 8)
        .attr("width", this.options.containerWidth - 16)
        .attr("y", this.options.containerHeight)
        .attr("height", 0)
        .attr("fill", container.color)
        .attr("opacity", 0.15)
        .attr("rx", 5);
      
      // Liquid surface effect
      containerGroup.append("ellipse")
        .attr("class", "liquid-surface")
        .attr("cx", this.options.containerWidth / 2)
        .attr("cy", this.options.containerHeight)
        .attr("rx", (this.options.containerWidth - 16) / 2)
        .attr("ry", 3)
        .attr("fill", container.color)
        .attr("opacity", 0)
        .attr("filter", "url(#glow)");
      
      // Bubble effects
      for (let b = 0; b < 3; b++) {
        containerGroup.append("circle")
          .attr("class", `bubble-${b}`)
          .attr("cx", this.options.containerWidth / 2 + (Math.random() - 0.5) * 40)
          .attr("cy", this.options.containerHeight)
          .attr("r", 1)
          .attr("fill", container.color)
          .attr("opacity", 0)
          .attr("filter", "url(#glow)");
      }
    });
  }

  /**
   * Animate a specific year
   */
  animateYear(yearIndex, data, containerGroups, maxValues, mainGroup) {
    if (yearIndex >= data.length) {
      this.showTotals = true;
      this.isAnimating = false;
      this._showTotalValuesInternal(data, containerGroups, maxValues);
      return;
    }

    const yearData = data[yearIndex];
    
    // Update containers for this year
    this.containers.forEach((container, i) => {
      if (!container || !container.key) return;
      
      const cumulativeValue = data.slice(0, yearIndex + 1).reduce((sum, d) => {
        return sum + Math.abs((d && d[container.key]) || 0);
      }, 0);
      
      const maxValue = maxValues && maxValues[i] ? maxValues[i] : 1;
      const fillHeight = maxValue > 0 ? (cumulativeValue / maxValue) * this.options.containerHeight * 0.8 : 0;
      const currentValue = Math.abs((yearData && yearData[container.key]) || 0);
      const numDollars = Math.min(Math.floor(fillHeight / 15), this.options.maxDollarSymbols);
      
      const containerGroup = d3.select(containerGroups.nodes()[i]);
      if (containerGroup.empty()) return;
      
      this.updateContainerFill(containerGroup, container, fillHeight, currentValue, yearIndex);
      this.createDollarSymbols(containerGroup, container, numDollars, currentValue);
      this.createFlowingParticles(containerGroup, container, currentValue, fillHeight, numDollars);
      this.updateValueDisplay(containerGroup, cumulativeValue);
    });

    // Update year indicator
    this.updateYearIndicator(mainGroup, yearData.year);

    // Continue to next year
    const totalCurrentValue = this.containers.reduce((sum, c) => sum + Math.abs(yearData[c.key] || 0), 0);
    const delay = totalCurrentValue > 0 ? this.options.animationDuration + 1000 : 500;
    
    d3.timeout(() => {
      if (this.isAnimating) {
        this.animateYear(yearIndex + 1, data, containerGroups, maxValues, mainGroup);
      }
    }, delay);
  }

  /**
   * Update container fill animation
   */
  updateContainerFill(containerGroup, container, fillHeight, currentValue, yearIndex) {
    // Add year separation line
    const yearLinesGroup = containerGroup.select(".year-lines");
    
    yearLinesGroup.append("line")
      .attr("x1", 10)
      .attr("x2", this.options.containerWidth - 10)
      .attr("y1", this.options.containerHeight - fillHeight)
      .attr("y2", this.options.containerHeight - fillHeight)
      .attr("stroke", container.color)
      .attr("stroke-width", 2)
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .attr("opacity", currentValue > 0 ? 0.4 : 0);

    if (this.options.showYearLabels) {
      yearLinesGroup.append("text")
        .attr("x", this.options.containerWidth + 15)
        .attr("y", this.options.containerHeight - fillHeight + 5)
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("fill", container.color)
        .attr("opacity", 0)
        .text(`Y${yearIndex + 1}`)
        .transition()
        .duration(500)
        .attr("opacity", currentValue > 0 ? 0.9 : 0);
    }

    // Animate liquid fill
    containerGroup.select(".fill-background")
      .transition()
      .duration(this.options.animationDuration * 1.5)
      .ease(d3.easeExpOut)
      .attr("y", this.options.containerHeight - fillHeight)
      .attr("height", fillHeight)
      .attr("opacity", fillHeight > 0 ? 0.25 : 0.15);

    // Animate liquid surface
    containerGroup.select(".liquid-surface")
      .transition()
      .duration(this.options.animationDuration * 1.5)
      .ease(d3.easeExpOut)
      .attr("cy", this.options.containerHeight - fillHeight)
      .attr("opacity", fillHeight > 0 ? 0.6 : 0)
      .attr("ry", fillHeight > 0 ? 4 : 3);

    // Animate bubbles
    for (let b = 0; b < 3; b++) {
      containerGroup.select(`.bubble-${b}`)
        .transition()
        .duration(this.options.animationDuration * 1.2)
        .delay(b * 200)
        .ease(d3.easeExpOut)
        .attr("cy", this.options.containerHeight - fillHeight + Math.random() * 10)
        .attr("opacity", fillHeight > 0 ? 0.4 : 0)
        .attr("r", fillHeight > 0 ? Math.random() * 3 + 1 : 1);
    }

    // Animate fill level indicator
    containerGroup.select(".fill-level-indicator")
      .transition()
      .duration(this.options.animationDuration * 1.5)
      .ease(d3.easeExpOut)
      .attr("y1", this.options.containerHeight - fillHeight)
      .attr("y2", this.options.containerHeight - fillHeight)
      .attr("opacity", fillHeight > 0 ? 0.9 : 0)
      .attr("stroke-width", fillHeight > 0 ? 4 : 3);
  }

  /**
   * Create dollar symbols in container
   */
  createDollarSymbols(containerGroup, container, numDollars, currentValue) {
    const dollarGroup = containerGroup.select(".dollar-container");
    dollarGroup.selectAll("*").remove();

    for (let d = 0; d < numDollars; d++) {
      const dollarY = this.options.containerHeight - (d + 1) * 15;
      const dollarX = this.options.containerWidth / 2 + (Math.random() - 0.5) * 60;
      
      dollarGroup.append("text")
        .attr("x", dollarX)
        .attr("y", this.options.containerHeight + 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .attr("fill", container.color)
        .attr("opacity", 0)
        .attr("filter", "url(#glow)")
        .text("$")
        .attr("transform", "scale(0.5)")
        .transition()
        .duration(this.options.animationDuration * 0.8)
        .delay(d * 100)
        .ease(d3.easeExpOut)
        .attr("y", dollarY)
        .attr("opacity", 0.9)
        .attr("transform", `scale(1.2) rotate(${(Math.random() - 0.5) * 10})`)
        .on("end", function() {
          // Add floating animation
          d3.select(this)
            .transition()
            .duration(3000 + Math.random() * 2000)
            .ease(d3.easeSinInOut)
            .attr("y", dollarY - 3)
            .transition()
            .duration(3000 + Math.random() * 2000)
            .ease(d3.easeSinInOut)
            .attr("y", dollarY + 3)
            .on("end", function floatRepeat() {
              d3.select(this)
                .transition()
                .duration(3000 + Math.random() * 2000)
                .ease(d3.easeSinInOut)
                .attr("y", dollarY - 3)
                .transition()
                .duration(3000 + Math.random() * 2000)
                .ease(d3.easeSinInOut)
                .attr("y", dollarY + 3)
                .on("end", floatRepeat);
            });
        });
    }
  }

  /**
   * Create flowing particle effects
   */
  createFlowingParticles(containerGroup, container, currentValue, fillHeight, numDollars) {
    if (!this.options.showParticles || currentValue <= 0) return;

    const particleGroup = containerGroup.select(".dollar-particles");
    const { animationDuration, containerWidth, containerHeight } = this.options;
    
    for (let p = 0; p < this.options.particleCount; p++) {
      const startY = -80 - (Math.random() * 40);
      const endY = containerHeight - fillHeight - 20;
      
      const particle = particleGroup.append("text")
        .attr("x", containerWidth / 2 + (Math.random() - 0.5) * 50)
        .attr("y", startY)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .attr("fill", container.color)
        .attr("opacity", 0.8)
        .attr("filter", "url(#glow)")
        .text("$")
        .attr("transform", `rotate(${(Math.random() - 0.5) * 45}) scale(1.2)`);

      // Falling animation
      particle.transition()
        .duration(animationDuration * 0.8)
        .delay(p * 120)
        .ease(d3.easeQuadIn)
        .attr("y", endY)
        .attr("transform", `rotate(${(Math.random() - 0.5) * 90}) scale(1.0)`)
        .on("end", function() {
          // Settle animation
          d3.select(this)
            .transition()
            .duration(animationDuration * 0.3)
            .ease(d3.easeBounceOut)
            .attr("y", containerHeight - (Math.floor(Math.random() * numDollars) + 1) * 15)
            .attr("x", containerWidth / 2 + (Math.random() - 0.5) * 70)
            .attr("opacity", 0.9)
            .attr("transform", `rotate(${(Math.random() - 0.5) * 20}) scale(1.1)`)
            .on("end", function() {
              // Fade out
              d3.select(this)
                .transition()
                .duration(500)
                .attr("opacity", 0)
                .remove();
            });
        });
    }
  }

  /**
   * Update value display
   */
  updateValueDisplay(containerGroup, cumulativeValue) {
    containerGroup.select(".value-display")
      .transition()
      .duration(this.options.animationDuration)
      .tween("text", function() {
        const node = this;
        const previousValue = parseFloat(node.textContent.replace(/[$,]/g, '')) || 0;
        const interpolate = d3.interpolateNumber(previousValue, cumulativeValue);
        
        return function(t) {
          node.textContent = `$${Math.round(interpolate(t)).toLocaleString()}`;
        };
      });
  }

  /**
   * Update year indicator
   */
  updateYearIndicator(mainGroup, year) {
    let yearIndicator = mainGroup.select(".year-indicator");
    
    if (yearIndicator.empty()) {
      yearIndicator = mainGroup.append("text")
        .attr("class", "year-indicator")
        .attr("x", this.options.width / 2)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .attr("fill", "#1f2937");
    }
    
    yearIndicator.text(`Year ${year}`);
  }

  /**
   * Show total values (internal method with parameters)
   */
  _showTotalValuesInternal(data, containerGroups, maxValues) {
    const totals = this.containers.map(container => {
      return data.reduce((sum, d) => sum + Math.abs(d[container.key] || 0), 0);
    });

    this.containers.forEach((container, i) => {
      const total = totals[i];
      const maxTotal = Math.max(...totals);
      const fillHeight = maxTotal > 0 ? (total / maxTotal) * this.options.containerHeight * 0.8 : 0;
      
      const containerGroup = d3.select(containerGroups.nodes()[i]);
      
      // Update fill
      containerGroup.select(".fill-background")
        .transition()
        .duration(1000)
        .ease(d3.easeQuadInOut)
        .attr("y", this.options.containerHeight - fillHeight)
        .attr("height", fillHeight);

      // Update value display
      containerGroup.select(".value-display")
        .transition()
        .duration(1000)
        .tween("text", function() {
          const node = this;
          const currentValue = parseFloat(node.textContent.replace(/[$,]/g, '')) || 0;
          const interpolate = d3.interpolateNumber(currentValue, total);
          
          return function(t) {
            node.textContent = `$${Math.round(interpolate(t)).toLocaleString()}`;
          };
        });
    });

    // Update year indicator
    const mainGroup = this.svg.select(".main-visualization");
    mainGroup.select(".year-indicator").text("Total Values");
  }

  /**
   * Main render method
   */
  render() {
    if (!this.data) return this;

    // Clear existing content
    this.svg.selectAll('*').remove();

    // Process data
    const processedData = this.processData(this.data);
    if (processedData.length === 0) return this;

    // Create defs and filters
    this.createDefsAndFilters();

    // Create main group
    const mainGroup = this.svg.append("g").attr("class", "main-visualization");

    // Create sparkles
    this.createSparkles(mainGroup);

    // Create containers
    const { containerGroups, maxValues } = this.createContainers(mainGroup, processedData);

    // Start animation if auto-play is enabled
    if (this.options.autoPlay) {
      this.startAnimation(processedData, containerGroups, maxValues, mainGroup);
    }

    return this;
  }

  /**
   * Start animation
   */
  startAnimation(data, containerGroups, maxValues, mainGroup) {
    // If called without parameters (from playground), use current state
    if (!data) {
      const processedData = this.processData(this.data);
      const currentContainerGroups = this.svg.selectAll(".container-group");
      const currentMaxValues = this.containers.map(container => {
        return processedData.reduce((sum, d) => sum + Math.abs((d && d[container.key]) || 0), 0);
      });
      const currentMainGroup = this.svg.select(".main-group");
      
      return this.startAnimation(processedData, currentContainerGroups, currentMaxValues, currentMainGroup);
    }
    
    this.isAnimating = true;
    this.currentYear = 0;
    this.showTotals = false;
    
    // Clear existing animations
    this.svg.selectAll(".dollar-container").selectAll("*").remove();
    this.svg.selectAll(".year-lines").selectAll("*").remove();
    
    this.animateYear(0, data, containerGroups, maxValues, mainGroup);
  }

  /**
   * Show totals
   */
  showTotalValues() {
    const processedData = this.processData(this.data);
    const containerGroups = this.svg.selectAll(".container-group");
    const maxValues = this.containers.map(container => {
      return processedData.reduce((sum, d) => sum + Math.abs(d[container.key] || 0), 0);
    });
    
    // Call the internal method with parameters
    this._showTotalValuesInternal(processedData, containerGroups, maxValues);
  }

  /**
   * Reset animation
   */
  reset() {
    this.isAnimating = false;
    this.currentYear = 0;
    this.showTotals = false;
    return this.render();
  }

  /**
   * Update chart with new data
   */
  update(newData) {
    this.setData(newData);
    return this.render();
  }
}

export default FlowContainersChart;
