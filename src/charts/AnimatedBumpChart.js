import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * AnimatedBumpChart - Creates an animated area bump chart visualization
 * Features stacked areas, animated transitions, and interactive tooltips
 * Perfect for showing component breakdown over time with smooth animations
 */
class AnimatedBumpChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      width: 800,
      height: 500,
      margin: { top: 40, right: 120, bottom: 60, left: 80 },
      animationDuration: 1500,
      animationDelay: 500,
      pointRadius: 6,
      strokeWidth: 2,
      principalRatio: 0.6, // 60% principal, 40% growth
      colors: ['#3498db', '#e74c3c', '#f39c12'],
      showDistributionBars: true,
      showPoints: true,
      showTooltip: true,
      curve: d3.curveCatmullRom,
      ...options
    };
    
    super(container, defaultOptions);
    this.addTooltip();
    this.colorScale = d3.scaleOrdinal(this.options.colors);
  }

  /**
   * Process raw data for bump chart visualization
   */
  processData(rawData) {
    if (!rawData?.economicSchedule) return [];

    const scheduleData = rawData.economicSchedule.slice(0, 10);
    
    return scheduleData.map((d, i) => {
      const principal = d.remainder * this.options.principalRatio;
      const growth = d.remainder * (1 - this.options.principalRatio);
      
      return {
        year: i + 1,
        principal: principal,
        growth: growth,
        total: d.remainder,
        distribution: d.distribution || 0,
        income: d.income || 0
      };
    });
  }

  /**
   * Create gradient definitions
   */
  createGradients() {
    const defs = this.svg.append("defs");
    
    // Principal gradient
    const principalGradient = defs.append("linearGradient")
      .attr("id", "principal-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", this.innerHeight)
      .attr("x2", 0).attr("y2", 0);
    
    principalGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", this.colorScale(0))
      .attr("stop-opacity", 0.8);
    
    principalGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", this.colorScale(0))
      .attr("stop-opacity", 0.3);

    // Growth gradient
    const growthGradient = defs.append("linearGradient")
      .attr("id", "growth-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", this.innerHeight)
      .attr("x2", 0).attr("y2", 0);
    
    growthGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", this.colorScale(1))
      .attr("stop-opacity", 0.8);
    
    growthGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", this.colorScale(1))
      .attr("stop-opacity", 0.3);
  }

  /**
   * Create scales for the chart
   */
  createScales(data) {
    const maxYear = d3.max(data, d => d.year) || 10;
    const maxValue = d3.max(data, d => d.total) || 1000000;

    this.xScale = d3.scaleLinear()
      .domain([1, maxYear])
      .range([0, this.innerWidth]);

    this.yScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([this.innerHeight, 0]);
  }

  /**
   * Create area generators
   */
  createAreaGenerators() {
    this.principalArea = d3.area()
      .x(d => this.xScale(d.year))
      .y0(this.innerHeight)
      .y1(d => this.yScale(d.principal))
      .curve(this.options.curve);

    this.growthArea = d3.area()
      .x(d => this.xScale(d.year))
      .y0(d => this.yScale(d.principal))
      .y1(d => this.yScale(d.total))
      .curve(this.options.curve);
  }

  /**
   * Draw animated areas
   */
  drawAreas(data) {
    // Principal area
    const principalPath = this.chartGroup.append("path")
      .datum(data)
      .attr("class", "principal-area")
      .attr("fill", "url(#principal-gradient)")
      .attr("stroke", this.colorScale(0))
      .attr("stroke-width", this.options.strokeWidth)
      .attr("d", this.principalArea)
      .style("opacity", 0);

    // Growth area
    const growthPath = this.chartGroup.append("path")
      .datum(data)
      .attr("class", "growth-area")
      .attr("fill", "url(#growth-gradient)")
      .attr("stroke", this.colorScale(1))
      .attr("stroke-width", this.options.strokeWidth)
      .attr("d", this.growthArea)
      .style("opacity", 0);

    // Animate areas
    principalPath
      .transition()
      .duration(this.options.animationDuration)
      .style("opacity", 1);

    growthPath
      .transition()
      .delay(this.options.animationDelay)
      .duration(this.options.animationDuration)
      .style("opacity", 1);

    return { principalPath, growthPath };
  }

  /**
   * Draw animated data points
   */
  drawPoints(data) {
    if (!this.options.showPoints) return;

    // Principal points
    const principalPoints = this.chartGroup.selectAll(".principal-point")
      .data(data)
      .enter().append("circle")
      .attr("class", "principal-point")
      .attr("cx", d => this.xScale(d.year))
      .attr("cy", d => this.yScale(d.principal))
      .attr("r", 0)
      .attr("fill", this.colorScale(0))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))");

    // Growth points
    const growthPoints = this.chartGroup.selectAll(".growth-point")
      .data(data)
      .enter().append("circle")
      .attr("class", "growth-point")
      .attr("cx", d => this.xScale(d.year))
      .attr("cy", d => this.yScale(d.total))
      .attr("r", 0)
      .attr("fill", this.colorScale(1))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))");

    // Animate points
    principalPoints
      .transition()
      .delay((d, i) => 1000 + i * 100)
      .duration(300)
      .attr("r", this.options.pointRadius);

    growthPoints
      .transition()
      .delay((d, i) => 1500 + i * 100)
      .duration(300)
      .attr("r", this.options.pointRadius);
  }

  /**
   * Draw distribution bars
   */
  drawDistributionBars(data) {
    if (!this.options.showDistributionBars) return;

    const maxDistribution = d3.max(data, d => d.distribution) || 50000;
    
    const distributionBars = this.chartGroup.selectAll(".distribution-bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "distribution-bar")
      .attr("x", d => this.xScale(d.year) - 8)
      .attr("y", d => this.yScale(d.total) - 40)
      .attr("width", 16)
      .attr("height", 0)
      .attr("fill", this.colorScale(2))
      .attr("rx", 2)
      .style("opacity", 0.7);

    distributionBars
      .transition()
      .delay((d, i) => 2000 + i * 100)
      .duration(500)
      .attr("height", d => Math.max(2, (d.distribution / maxDistribution) * 30));
  }

  /**
   * Add interactive hover functionality
   */
  addInteractivity(data) {
    if (!this.options.showTooltip) return;

    const hoverArea = this.chartGroup.append("rect")
      .attr("width", this.innerWidth)
      .attr("height", this.innerHeight)
      .attr("fill", "transparent")
      .style("cursor", "crosshair")
      .on("mousemove", (event) => {
        const [mouseX] = d3.pointer(event);
        const year = Math.round(this.xScale.invert(mouseX));
        const dataPoint = data.find(d => d.year === year);
        
        if (dataPoint) {
          const tooltipContent = `
            <div style="font-weight: bold; margin-bottom: 5px;">Year ${dataPoint.year}</div>
            <div>Principal: ${this.formatValue(dataPoint.principal)}</div>
            <div>Growth: ${this.formatValue(dataPoint.growth)}</div>
            <div>Distribution: ${this.formatValue(dataPoint.distribution)}</div>
            <div style="color: ${this.colorScale(0)}; font-weight: bold; margin-top: 5px;">
              Total: ${this.formatValue(dataPoint.total)}
            </div>
          `;
          
          this.showTooltip(tooltipContent, event);
        }
      })
      .on("mouseout", () => {
        this.hideTooltip();
      });
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
   * Draw axes
   */
  drawAxes() {
    const xAxis = d3.axisBottom(this.xScale)
      .tickFormat(d => `Year ${d}`);

    const yAxis = d3.axisLeft(this.yScale)
      .tickFormat(d => this.formatValue(d));

    // X-axis
    this.chartGroup.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${this.innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .attr("font-size", "11px")
      .attr("fill", "#64748b");

    // Y-axis
    this.chartGroup.append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .selectAll("text")
      .attr("font-size", "11px")
      .attr("fill", "#64748b");

    // Axis labels
    this.chartGroup.append("text")
      .attr("transform", `translate(${this.innerWidth / 2}, ${this.innerHeight + 45})`)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .attr("fill", "#1e293b")
      .text("Time Period");

    this.chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x", -this.innerHeight / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .attr("fill", "#1e293b")
      .text("Value");
  }

  /**
   * Create legend
   */
  createLegend() {
    const legend = this.svg.append("g")
      .attr("transform", `translate(${this.options.width - 100}, 60)`);

    const legendItems = [
      { label: "Principal", color: this.colorScale(0) },
      { label: "Growth", color: this.colorScale(1) },
      { label: "Distribution", color: this.colorScale(2) }
    ];

    legendItems.forEach((item, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${i * 25})`);

      legendItem.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", item.color)
        .attr("rx", 3);

      legendItem.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .attr("font-size", "11px")
        .attr("fill", "#1e293b")
        .text(item.label);
    });
  }

  /**
   * Main render method
   */
  render() {
    if (!this.data) return this;

    // Clear existing content
    this.chartGroup.selectAll('*').remove();
    this.svg.selectAll('defs').remove();

    // Process data
    const processedData = this.processData(this.data);
    if (processedData.length === 0) return this;

    // Create gradients
    this.createGradients();

    // Create scales
    this.createScales(processedData);

    // Create area generators
    this.createAreaGenerators();

    // Draw components
    this.drawAreas(processedData);
    this.drawPoints(processedData);
    this.drawDistributionBars(processedData);
    this.drawAxes();
    this.createLegend();
    this.addInteractivity(processedData);

    return this;
  }

  /**
   * Update chart with new data
   */
  update(newData) {
    this.setData(newData);
    return this.render();
  }
}

export default AnimatedBumpChart;
