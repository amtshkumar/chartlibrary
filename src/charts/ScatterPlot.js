import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * Scatter Plot implementation
 */
class ScatterPlot extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      pointRadius: 4,
      pointColor: '#3498db',
      pointOpacity: 0.7,
      hoverRadius: 6,
      hoverOpacity: 1,
      showTrendLine: false,
      trendLineColor: '#e74c3c',
      trendLineWidth: 2,
      ...options
    };
    
    super(container, defaultOptions);
    this.addTooltip();
  }

  /**
   * Render the scatter plot
   */
  render() {
    if (!this.data || this.data.length === 0) {
      console.warn('No data provided for ScatterPlot');
      return this;
    }

    // Clear previous chart
    this.chartGroup.selectAll('*').remove();

    // Create scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(this.data, d => d.x))
      .range([0, this.innerWidth])
      .nice();

    const yScale = d3.scaleLinear()
      .domain(d3.extent(this.data, d => d.y))
      .range([this.innerHeight, 0])
      .nice();

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Add X axis
    this.chartGroup.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.innerHeight})`)
      .call(xAxis);

    // Add Y axis
    this.chartGroup.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    // Add axis labels
    this.addAxisLabels();

    // Add trend line if requested
    if (this.options.showTrendLine) {
      this.addTrendLine(xScale, yScale);
    }

    // Create points
    this.addPoints(xScale, yScale);

    return this;
  }

  /**
   * Add scatter plot points
   */
  addPoints(xScale, yScale) {
    const self = this;

    const points = this.chartGroup.selectAll('.point')
      .data(this.data)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 0)
      .attr('fill', d => d.color || this.options.pointColor)
      .attr('opacity', this.options.pointOpacity)
      .style('cursor', 'pointer');

    // Animate points
    points.transition()
      .delay((d, i) => i * 20)
      .duration(500)
      .attr('r', d => d.radius || this.options.pointRadius);

    // Add interactivity
    points
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', self.options.hoverRadius)
          .attr('opacity', self.options.hoverOpacity);

        const tooltipContent = self.formatTooltip(d);
        self.showTooltip(tooltipContent, event);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', d.radius || self.options.pointRadius)
          .attr('opacity', self.options.pointOpacity);

        self.hideTooltip();
      })
      .on('click', function(event, d) {
        if (self.options.onClick) {
          self.options.onClick(d, event);
        }
      });
  }

  /**
   * Format tooltip content
   */
  formatTooltip(d) {
    let content = `X: ${d.x}<br>Y: ${d.y}`;
    
    if (d.label) {
      content = `${d.label}<br>${content}`;
    }
    
    if (d.category) {
      content += `<br>Category: ${d.category}`;
    }
    
    return content;
  }

  /**
   * Add trend line using linear regression
   */
  addTrendLine(xScale, yScale) {
    const regression = this.calculateLinearRegression();
    
    if (!regression) return;

    const xDomain = xScale.domain();
    const trendData = [
      { x: xDomain[0], y: regression.slope * xDomain[0] + regression.intercept },
      { x: xDomain[1], y: regression.slope * xDomain[1] + regression.intercept }
    ];

    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y));

    this.chartGroup.append('path')
      .datum(trendData)
      .attr('class', 'trend-line')
      .attr('fill', 'none')
      .attr('stroke', this.options.trendLineColor)
      .attr('stroke-width', this.options.trendLineWidth)
      .attr('stroke-dasharray', '5,5')
      .attr('d', line);

    // Add R² value
    this.chartGroup.append('text')
      .attr('x', this.innerWidth - 10)
      .attr('y', 20)
      .attr('text-anchor', 'end')
      .style('font-size', '12px')
      .style('fill', this.options.trendLineColor)
      .text(`R² = ${regression.rSquared.toFixed(3)}`);
  }

  /**
   * Calculate linear regression
   */
  calculateLinearRegression() {
    if (this.data.length < 2) return null;

    const n = this.data.length;
    const sumX = d3.sum(this.data, d => d.x);
    const sumY = d3.sum(this.data, d => d.y);
    const sumXY = d3.sum(this.data, d => d.x * d.y);
    const sumXX = d3.sum(this.data, d => d.x * d.x);
    const sumYY = d3.sum(this.data, d => d.y * d.y);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R²
    const yMean = sumY / n;
    const ssRes = d3.sum(this.data, d => Math.pow(d.y - (slope * d.x + intercept), 2));
    const ssTot = d3.sum(this.data, d => Math.pow(d.y - yMean, 2));
    const rSquared = 1 - (ssRes / ssTot);

    return { slope, intercept, rSquared };
  }

  /**
   * Add axis labels
   */
  addAxisLabels() {
    // X axis label
    if (this.options.xLabel) {
      this.chartGroup.append('text')
        .attr('x', this.innerWidth / 2)
        .attr('y', this.innerHeight + 35)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#333')
        .text(this.options.xLabel);
    }

    // Y axis label
    if (this.options.yLabel) {
      this.chartGroup.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -this.innerHeight / 2)
        .attr('y', -35)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#333')
        .text(this.options.yLabel);
    }
  }

  /**
   * Render scatter plot with categories (different colors)
   */
  renderWithCategories(data, categoryField = 'category') {
    this.setData(data);

    // Get unique categories
    const categories = [...new Set(data.map(d => d[categoryField]))];
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(categories);

    // Assign colors based on category
    this.data.forEach(d => {
      d.color = colorScale(d[categoryField]);
    });

    this.render();

    // Add legend
    const legendItems = categories.map(category => ({
      label: category,
      color: colorScale(category)
    }));
    this.addLegend(legendItems);

    return this;
  }

  /**
   * Render bubble chart (scatter plot with varying point sizes)
   */
  renderBubbleChart(sizeField = 'size') {
    if (!this.data || this.data.length === 0) {
      console.warn('No data provided for BubbleChart');
      return this;
    }

    // Create size scale
    const sizeExtent = d3.extent(this.data, d => d[sizeField]);
    const sizeScale = d3.scaleSqrt()
      .domain(sizeExtent)
      .range([3, 20]);

    // Assign radius based on size field
    this.data.forEach(d => {
      d.radius = sizeScale(d[sizeField]);
    });

    this.render();

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
   * Highlight points based on condition
   */
  highlightPoints(condition, highlightColor = '#e74c3c') {
    this.chartGroup.selectAll('.point')
      .attr('fill', d => condition(d) ? highlightColor : (d.color || this.options.pointColor));

    return this;
  }

  /**
   * Reset point colors
   */
  resetHighlight() {
    this.chartGroup.selectAll('.point')
      .attr('fill', d => d.color || this.options.pointColor);

    return this;
  }
}

export default ScatterPlot;
