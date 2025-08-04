import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * RadialTimelineChart - Creates a radial timeline visualization with animated arcs
 * Features layered arcs, interactive tooltips, and smooth animations
 * Perfect for showing time-based data with multiple value components
 */
class RadialTimelineChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      width: 500,
      height: 500,
      margin: { top: 60, right: 60, bottom: 60, left: 60 },
      animationDuration: 1000,
      animationDelay: 100,
      innerRadius: 40,
      outerRadiusOffset: 20,
      cornerRadius: 2,
      strokeWidth: 1,
      segmentWidthRatio: 0.8, // 80% width for gaps
      gridRings: 5,
      colors: ['#22c55e', '#3b82f6', '#f59e0b'], // Green, Blue, Amber
      showGridLines: true,
      showYearLabels: true,
      showCenterLabel: true,
      centerLabelText: 'Timeline',
      valueRatios: [0.6, 0.4], // Default ratios for primary/secondary values
      ...options
    };
    
    super(container, defaultOptions);
    this.addTooltip();
    this.colorScale = d3.scaleOrdinal(this.options.colors);
    this.hoveredYear = null;
  }

  /**
   * Process raw data for radial timeline visualization
   */
  processData(rawData) {
    if (!rawData?.economicSchedule) return [];

    const scheduleData = rawData.economicSchedule.slice(0, 12); // Up to 12 years
    
    return scheduleData.map((d, i) => {
      const primaryValue = d.remainder * this.options.valueRatios[0];
      const secondaryValue = d.remainder * this.options.valueRatios[1];
      
      return {
        year: i + 1,
        primaryValue: primaryValue,
        secondaryValue: secondaryValue,
        totalValue: d.remainder,
        tertiaryValue: d.distribution || 0,
        income: d.income || 0
      };
    });
  }

  /**
   * Calculate chart dimensions
   */
  calculateDimensions() {
    const radius = Math.min(this.options.width, this.options.height) / 2 - Math.max(...Object.values(this.options.margin));
    const centerX = this.options.width / 2;
    const centerY = this.options.height / 2;
    
    return { radius, centerX, centerY };
  }

  /**
   * Create scales for the chart with comprehensive validation
   */
  createScales(data) {
    // Validate input data and calculate max value
    const validData = data.filter(d => d && typeof d === 'object');
    const values = validData.map(d => Math.abs(d.totalValue || 0)).filter(v => isFinite(v));
    const maxValue = Math.max(1, d3.max(values) || 1);
    
    const { radius } = this.calculateDimensions();
    
    // Ensure valid radius range with comprehensive validation
    const innerRadius = Math.max(0, this.options.innerRadius || 0);
    const outerRadiusOffset = Math.max(0, this.options.outerRadiusOffset || 0);
    const minRadius = innerRadius;
    const maxRadius = Math.max(minRadius + 20, radius - outerRadiusOffset);
    
    // Validate radius values
    if (!isFinite(minRadius) || !isFinite(maxRadius) || maxRadius <= minRadius) {
      console.warn('Invalid radius values, using defaults:', { minRadius, maxRadius });
      const fallbackMin = 40;
      const fallbackMax = Math.max(fallbackMin + 20, 100);
      this.radiusScale = d3.scaleLinear().domain([0, maxValue]).range([fallbackMin, fallbackMax]);
    } else {
      this.radiusScale = d3.scaleLinear().domain([0, maxValue]).range([minRadius, maxRadius]);
    }

    // Create angle scale with validation
    const dataLength = Math.max(1, validData.length);
    this.angleScale = d3.scaleLinear()
      .domain([0, dataLength])
      .range([0, 2 * Math.PI]);

    // Create color gradients with safe color handling
    try {
      const primaryColor = this.colorScale(0) || '#22c55e';
      const secondaryColor = this.colorScale(1) || '#3b82f6';
      const tertiaryColor = this.colorScale(2) || '#f59e0b';
      
      this.primaryColorScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([d3.color(primaryColor)?.brighter(0.3)?.toString() || primaryColor, primaryColor]);

      this.secondaryColorScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([d3.color(secondaryColor)?.brighter(0.3)?.toString() || secondaryColor, secondaryColor]);

      this.tertiaryColorScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([d3.color(tertiaryColor)?.brighter(0.3)?.toString() || tertiaryColor, tertiaryColor]);
    } catch (e) {
      console.warn('Color scale creation failed, using fallbacks:', e);
      // Fallback color scales
      this.primaryColorScale = d3.scaleLinear().domain([0, maxValue]).range(['#22c55e', '#16a34a']);
      this.secondaryColorScale = d3.scaleLinear().domain([0, maxValue]).range(['#3b82f6', '#2563eb']);
      this.tertiaryColorScale = d3.scaleLinear().domain([0, maxValue]).range(['#f59e0b', '#d97706']);
    }
  }

  /**
   * Create radial grid lines
   */
  createGridLines() {
    if (!this.options.showGridLines) return;

    const { radius, centerX, centerY } = this.calculateDimensions();
    const g = this.svg.append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    for (let i = 1; i <= this.options.gridRings; i++) {
      const ringRadius = (radius / this.options.gridRings) * i;
      g.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", ringRadius)
        .attr("fill", "none")
        .attr("stroke", "#374151")
        .attr("stroke-width", 0.5)
        .attr("stroke-dasharray", "2,2")
        .attr("opacity", 0.3);
    }

    return g;
  }

  /**
   * Create year labels around the circle
   */
  createYearLabels(data, mainGroup) {
    if (!this.options.showYearLabels) return;

    const { radius } = this.calculateDimensions();

    data.forEach((d, i) => {
      const angle = this.angleScale(i) - Math.PI / 2; // Start from top
      const labelRadius = radius + 20;
      const x = Math.cos(angle) * labelRadius;
      const y = Math.sin(angle) * labelRadius;

      mainGroup.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", "12px")
        .attr("fill", "#94a3b8")
        .attr("font-weight", "500")
        .text(`Y${d.year}`)
        .style("opacity", 0)
        .transition()
        .delay(i * this.options.animationDelay)
        .duration(this.options.animationDuration)
        .style("opacity", 1);
    });
  }

  /**
   * Create center label
   */
  createCenterLabel(mainGroup) {
    if (!this.options.showCenterLabel) return;

    const centerGroup = mainGroup.append("g").attr("class", "center-label");

    centerGroup.append("text")
      .attr("x", 0)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", "#e2e8f0")
      .text("RADIAL")
      .style("opacity", 0)
      .transition()
      .delay(500)
      .duration(this.options.animationDuration)
      .style("opacity", 1);

    centerGroup.append("text")
      .attr("x", 0)
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#94a3b8")
      .text(this.options.centerLabelText)
      .style("opacity", 0)
      .transition()
      .delay(700)
      .duration(this.options.animationDuration)
      .style("opacity", 1);
  }

  /**
   * Process data into arc segments with comprehensive validation
   */
  processArcs(data) {
    const arcs = [];
    
    data.forEach((d, i) => {
      // Validate input data
      const totalValue = isFinite(d.totalValue) ? Math.abs(d.totalValue || 0) : 0;
      const primaryValue = isFinite(d.primaryValue) ? Math.abs(d.primaryValue || 0) : 0;
      const secondaryValue = isFinite(d.secondaryValue) ? Math.abs(d.secondaryValue || 0) : 0;
      const tertiaryValue = isFinite(d.tertiaryValue) ? Math.abs(d.tertiaryValue || 0) : 0;
      
      const angle = this.angleScale(i) - Math.PI / 2;
      const segmentWidth = (2 * Math.PI) / Math.max(1, data.length) * this.options.segmentWidthRatio;
      const startAngle = angle - segmentWidth / 2;
      const endAngle = angle + segmentWidth / 2;

      // Validate angles
      if (!isFinite(startAngle) || !isFinite(endAngle) || startAngle >= endAngle) {
        console.warn(`Invalid angles for arc ${i}:`, { startAngle, endAngle });
        return; // Skip this arc
      }

      // Calculate radii with validation
      const totalRadiusRaw = this.radiusScale(totalValue);
      const primaryRadiusRaw = this.radiusScale(primaryValue);
      
      if (!isFinite(totalRadiusRaw) || !isFinite(primaryRadiusRaw)) {
        console.warn(`Invalid radius values for arc ${i}:`, { totalRadiusRaw, primaryRadiusRaw });
        return; // Skip this arc
      }
      
      const totalRadius = Math.max(0, totalRadiusRaw - this.options.innerRadius);
      const primaryRadius = Math.max(0, primaryRadiusRaw - this.options.innerRadius);
      const secondaryRadius = Math.max(0, totalRadius - primaryRadius);

      // Primary value arc (inner) - only add if valid
      if (primaryRadius > 0) {
        const innerRadius = Math.max(0, this.options.innerRadius);
        const outerRadius = Math.max(innerRadius + 1, innerRadius + primaryRadius);
        
        arcs.push({
          type: 'primary',
          year: d.year,
          value: primaryValue,
          innerRadius,
          outerRadius,
          startAngle,
          endAngle,
          color: this.primaryColorScale(primaryValue),
          data: d,
          index: i
        });
      }

      // Secondary value arc (outer) - only add if valid
      if (secondaryRadius > 0) {
        const innerRadius = Math.max(0, this.options.innerRadius + primaryRadius);
        const outerRadius = Math.max(innerRadius + 1, this.options.innerRadius + totalRadius);
        
        arcs.push({
          type: 'secondary',
          year: d.year,
          value: secondaryValue,
          innerRadius,
          outerRadius,
          startAngle,
          endAngle,
          color: this.secondaryColorScale(secondaryValue),
          data: d,
          index: i
        });
      }

      // Tertiary value arc (if applicable)
      if (tertiaryValue > 0) {
        const tertiaryRadiusRaw = this.radiusScale(tertiaryValue) * 0.3; // Smaller scale
        
        if (isFinite(tertiaryRadiusRaw)) {
          const tertiaryRadius = Math.max(0, tertiaryRadiusRaw);
          
          if (tertiaryRadius > 0) {
            const innerRadius = Math.max(0, this.options.innerRadius + totalRadius + 5);
            const outerRadius = Math.max(innerRadius + 1, innerRadius + tertiaryRadius);
            
            arcs.push({
              type: 'tertiary',
              year: d.year,
              value: tertiaryValue,
              innerRadius,
              outerRadius,
              startAngle,
              endAngle,
              color: this.tertiaryColorScale(tertiaryValue),
              data: d,
              index: i
            });
          }
        }
      }
    });

    // Final validation of all arcs
    const validArcs = arcs.filter(arc => {
      const isValid = isFinite(arc.innerRadius) && 
                     isFinite(arc.outerRadius) && 
                     isFinite(arc.startAngle) && 
                     isFinite(arc.endAngle) &&
                     arc.innerRadius >= 0 &&
                     arc.outerRadius > arc.innerRadius &&
                     arc.startAngle < arc.endAngle;
      
      if (!isValid) {
        console.warn('Filtered out invalid arc:', arc);
      }
      
      return isValid;
    });

    return validArcs;
  }

  /**
   * Create arc generator with comprehensive validation
   */
  createArcGenerator() {
    return d3.arc()
      .innerRadius(d => {
        const value = d.innerRadius || 0;
        return isFinite(value) && value >= 0 ? Math.max(0, value) : 0;
      })
      .outerRadius(d => {
        const value = d.outerRadius || 0;
        const innerValue = d.innerRadius || 0;
        const validValue = isFinite(value) && value >= 0 ? Math.max(0, value) : 0;
        const validInner = isFinite(innerValue) && innerValue >= 0 ? Math.max(0, innerValue) : 0;
        return Math.max(validInner + 1, validValue); // Ensure outer > inner
      })
      .startAngle(d => {
        const value = d.startAngle;
        return isFinite(value) ? value : 0;
      })
      .endAngle(d => {
        const value = d.endAngle;
        return isFinite(value) ? value : 0;
      })
      .cornerRadius(d => {
        const cornerRadius = this.options.cornerRadius || 0;
        return isFinite(cornerRadius) && cornerRadius >= 0 ? cornerRadius : 0;
      });
  }

  /**
   * Draw animated arcs with safe transitions
   */
  drawArcs(arcs, mainGroup) {
    const arcGenerator = this.createArcGenerator();

    const arcPaths = mainGroup.selectAll(".arc")
      .data(arcs)
      .enter()
      .append("path")
      .attr("class", "arc")
      .attr("fill", d => d.color)
      .attr("stroke", "#1e293b")
      .attr("stroke-width", this.options.strokeWidth)
      .style("cursor", "pointer")
      .style("opacity", d => this.hoveredYear && this.hoveredYear !== d.year ? 0.3 : 1)
      .attr("d", d => {
        // Start with zero radius for animation - ensure all values are valid
        const startArc = {
          ...d,
          outerRadius: Math.max(0, d.innerRadius || 0),
          innerRadius: Math.max(0, d.innerRadius || 0),
          startAngle: isFinite(d.startAngle) ? d.startAngle : 0,
          endAngle: isFinite(d.endAngle) ? d.endAngle : 0
        };
        try {
          return arcGenerator(startArc) || 'M0,0';
        } catch (e) {
          console.warn('Arc generation failed:', e);
          return 'M0,0';
        }
      });

    // Animate arcs with safe interpolation
    arcPaths
      .transition()
      .delay(d => d.index * this.options.animationDelay + 300)
      .duration(this.options.animationDuration)
      .attrTween('d', function(d) {
        const node = this;
        const startRadius = Math.max(0, d.innerRadius || 0);
        const endRadius = Math.max(startRadius + 1, d.outerRadius || 0);
        
        // Create interpolator for radius
        const radiusInterpolator = d3.interpolateNumber(startRadius, endRadius);
        
        return function(t) {
          const currentRadius = radiusInterpolator(t);
          const safeArc = {
            ...d,
            innerRadius: Math.max(0, d.innerRadius || 0),
            outerRadius: Math.max(d.innerRadius + 1, currentRadius),
            startAngle: isFinite(d.startAngle) ? d.startAngle : 0,
            endAngle: isFinite(d.endAngle) ? d.endAngle : 0
          };
          
          try {
            const path = arcGenerator(safeArc);
            return path || 'M0,0';
          } catch (e) {
            console.warn('Arc animation failed:', e);
            return 'M0,0';
          }
        };
      });

    // Add hover interactions
    arcPaths
      .on("mouseover", (event, d) => {
        this.hoveredYear = d.year;
        this.updateArcOpacity(arcPaths);
        this.showArcTooltip(event, d);
      })
      .on("mousemove", (event) => {
        this.moveTooltip(event);
      })
      .on("mouseout", () => {
        this.hoveredYear = null;
        this.updateArcOpacity(arcPaths);
        this.hideTooltip();
      });

    return arcPaths;
  }

  /**
   * Update arc opacity based on hover state
   */
  updateArcOpacity(arcPaths) {
    arcPaths
      .transition()
      .duration(200)
      .style("opacity", d => this.hoveredYear && this.hoveredYear !== d.year ? 0.3 : 1);
  }

  /**
   * Show tooltip for arc
   */
  showArcTooltip(event, d) {
    const tooltipContent = `
      <div style="font-weight: bold; margin-bottom: 4px;">Year ${d.year}</div>
      <div style="color: ${this.colorScale(0)};">Primary: ${this.formatValue(d.data.primaryValue)}</div>
      <div style="color: ${this.colorScale(1)};">Secondary: ${this.formatValue(d.data.secondaryValue)}</div>
      ${d.data.tertiaryValue ? `<div style="color: ${this.colorScale(2)};">Tertiary: ${this.formatValue(d.data.tertiaryValue)}</div>` : ''}
      <div style="margin-top: 4px; font-weight: bold;">Total: ${this.formatValue(d.data.totalValue)}</div>
    `;
    
    this.showTooltip(tooltipContent, event);
  }

  /**
   * Move tooltip with mouse
   */
  moveTooltip(event) {
    if (this.tooltip) {
      this.tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    }
  }

  /**
   * Format values for display
   */
  formatValue(value) {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  }

  /**
   * Create legend
   */
  createLegend() {
    const legend = this.svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(20, 20)");

    // Legend background
    legend.append("rect")
      .attr("width", 140)
      .attr("height", 90)
      .attr("fill", "rgba(30, 41, 59, 0.9)")
      .attr("stroke", "#475569")
      .attr("stroke-width", 1)
      .attr("rx", 6)
      .style("backdrop-filter", "blur(4px)");

    const legendItems = [
      { label: "Primary Value", color: this.colorScale(0) },
      { label: "Secondary Value", color: this.colorScale(1) },
      { label: "Tertiary Value", color: this.colorScale(2) }
    ];

    legendItems.forEach((item, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(10, ${15 + i * 22})`);

      legendItem.append("circle")
        .attr("cx", 6)
        .attr("cy", 0)
        .attr("r", 6)
        .attr("fill", item.color);

      legendItem.append("text")
        .attr("x", 18)
        .attr("y", 4)
        .attr("font-size", "11px")
        .attr("fill", "#e2e8f0")
        .text(item.label);
    });
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

    // Create scales
    this.createScales(processedData);

    // Create grid lines
    const mainGroup = this.createGridLines();
    const { centerX, centerY } = this.calculateDimensions();
    const chartGroup = mainGroup || this.svg.append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);

    // Create year labels
    this.createYearLabels(processedData, chartGroup);

    // Create center label
    this.createCenterLabel(chartGroup);

    // Process arcs
    const arcs = this.processArcs(processedData);

    // Draw arcs
    this.drawArcs(arcs, chartGroup);

    // Create legend
    this.createLegend();

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
   * Update hover state
   */
  setHoveredYear(year) {
    this.hoveredYear = year;
    const arcPaths = this.svg.selectAll(".arc");
    this.updateArcOpacity(arcPaths);
  }
}

export default RadialTimelineChart;
