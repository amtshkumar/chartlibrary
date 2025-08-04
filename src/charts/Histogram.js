import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * Histogram implementation
 */
class Histogram extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      bins: 20,
      barColor: '#3498db',
      hoverColor: '#2980b9',
      showDensity: false,
      densityColor: '#e74c3c',
      densityWidth: 2,
      ...options
    };
    
    super(container, defaultOptions);
    this.addTooltip();
  }

  /**
   * Render the histogram
   */
  render() {
    if (!this.data || this.data.length === 0) {
      console.warn('No data provided for Histogram');
      return this;
    }

    // Clear previous chart
    this.chartGroup.selectAll('*').remove();

    // Extract values from data
    const values = this.data.map(d => typeof d === 'object' ? d.value : d);

    // Create histogram bins
    const histogram = d3.histogram()
      .domain(d3.extent(values))
      .thresholds(this.options.bins);

    const bins = histogram(values);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(values))
      .range([0, this.innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([this.innerHeight, 0]);

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

    // Create bars
    this.createBars(bins, xScale, yScale);

    // Add density curve if requested
    if (this.options.showDensity) {
      this.addDensityCurve(values, xScale, yScale);
    }

    return this;
  }

  /**
   * Create histogram bars
   */
  createBars(bins, xScale, yScale) {
    const self = this;

    const bars = this.chartGroup.selectAll('.bar')
      .data(bins)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.x0))
      .attr('width', d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
      .attr('y', this.innerHeight)
      .attr('height', 0)
      .attr('fill', this.options.barColor)
      .style('cursor', 'pointer');

    // Animate bars
    bars.transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .attr('y', d => yScale(d.length))
      .attr('height', d => this.innerHeight - yScale(d.length));

    // Add interactivity
    bars
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', self.options.hoverColor);
        
        const tooltipContent = self.formatBinTooltip(d);
        self.showTooltip(tooltipContent, event);
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', self.options.barColor);
        self.hideTooltip();
      })
      .on('click', function(event, d) {
        if (self.options.onClick) {
          self.options.onClick(d, event);
        }
      });
  }

  /**
   * Format tooltip content for bins
   */
  formatBinTooltip(bin) {
    const range = `${bin.x0.toFixed(2)} - ${bin.x1.toFixed(2)}`;
    const count = bin.length;
    const percentage = ((count / this.data.length) * 100).toFixed(1);
    
    return `Range: ${range}<br>Count: ${count}<br>Percentage: ${percentage}%`;
  }

  /**
   * Add density curve overlay
   */
  addDensityCurve(values, xScale, yScale) {
    // Calculate kernel density estimation
    const kde = this.kernelDensityEstimator(this.kernelEpanechnikov(0.5), xScale.ticks(100));
    const density = kde(values);

    // Scale density to match histogram height
    const maxDensity = d3.max(density, d => d[1]);
    const maxCount = d3.max(yScale.domain());
    const densityScale = maxCount / maxDensity;

    // Create line generator
    const line = d3.line()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1] * densityScale))
      .curve(d3.curveCardinal);

    // Add density curve
    const path = this.chartGroup.append('path')
      .datum(density)
      .attr('class', 'density-curve')
      .attr('fill', 'none')
      .attr('stroke', this.options.densityColor)
      .attr('stroke-width', this.options.densityWidth)
      .attr('d', line);

    // Animate curve drawing
    const totalLength = path.node().getTotalLength();
    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1500)
      .attr('stroke-dashoffset', 0);
  }

  /**
   * Kernel density estimator
   */
  kernelDensityEstimator(kernel, X) {
    return function(V) {
      return X.map(function(x) {
        return [x, d3.mean(V, function(v) { return kernel(x - v); })];
      });
    };
  }

  /**
   * Epanechnikov kernel
   */
  kernelEpanechnikov(k) {
    return function(v) {
      return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
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
    const yLabel = this.options.yLabel || 'Frequency';
    this.chartGroup.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.innerHeight / 2)
      .attr('y', -35)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', '#333')
      .text(yLabel);
  }

  /**
   * Render histogram with custom binning
   */
  renderWithCustomBins(binEdges) {
    if (!this.data || this.data.length === 0) {
      console.warn('No data provided for Histogram');
      return this;
    }

    // Clear previous chart
    this.chartGroup.selectAll('*').remove();

    // Extract values from data
    const values = this.data.map(d => typeof d === 'object' ? d.value : d);

    // Create histogram with custom bins
    const histogram = d3.histogram()
      .domain(d3.extent(values))
      .thresholds(binEdges);

    const bins = histogram(values);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(values))
      .range([0, this.innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([this.innerHeight, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Add axes
    this.chartGroup.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.innerHeight})`)
      .call(xAxis);

    this.chartGroup.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    // Add axis labels
    this.addAxisLabels();

    // Create bars
    this.createBars(bins, xScale, yScale);

    return this;
  }

  /**
   * Get statistics about the data
   */
  getStatistics() {
    if (!this.data || this.data.length === 0) {
      return null;
    }

    const values = this.data.map(d => typeof d === 'object' ? d.value : d);
    const sorted = values.slice().sort((a, b) => a - b);
    const n = values.length;

    return {
      count: n,
      min: d3.min(values),
      max: d3.max(values),
      mean: d3.mean(values),
      median: d3.median(values),
      q1: d3.quantile(sorted, 0.25),
      q3: d3.quantile(sorted, 0.75),
      standardDeviation: d3.deviation(values)
    };
  }

  /**
   * Add statistics text to the chart
   */
  addStatistics(x = 10, y = 20) {
    const stats = this.getStatistics();
    if (!stats) return this;

    const statsGroup = this.chartGroup.append('g')
      .attr('class', 'statistics')
      .attr('transform', `translate(${x}, ${y})`);

    const statsText = [
      `Count: ${stats.count}`,
      `Mean: ${stats.mean.toFixed(2)}`,
      `Median: ${stats.median.toFixed(2)}`,
      `Std Dev: ${stats.standardDeviation.toFixed(2)}`
    ];

    statsGroup.selectAll('.stat-text')
      .data(statsText)
      .enter()
      .append('text')
      .attr('class', 'stat-text')
      .attr('x', 0)
      .attr('y', (d, i) => i * 15)
      .style('font-size', '12px')
      .style('fill', '#666')
      .text(d => d);

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
}

export default Histogram;
