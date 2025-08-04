import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * Line Chart implementation
 */
class LineChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      lineColor: '#3498db',
      lineWidth: 2,
      pointRadius: 4,
      pointColor: '#3498db',
      pointHoverRadius: 6,
      showPoints: true,
      showArea: false,
      areaColor: 'rgba(52, 152, 219, 0.3)',
      curve: d3.curveLinear,
      ...options
    };
    
    super(container, defaultOptions);
    this.addTooltip();
  }

  /**
   * Render the line chart
   */
  render() {
    if (!this.data || this.data.length === 0) {
      console.warn('No data provided for LineChart');
      return this;
    }

    // Clear previous chart
    this.chartGroup.selectAll('*').remove();

    // Create scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(this.data, d => d.x))
      .range([0, this.innerWidth]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(this.data, d => d.y))
      .range([this.innerHeight, 0]);

    // Create line generator
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(this.options.curve);

    // Create area generator (if needed)
    let area;
    if (this.options.showArea) {
      area = d3.area()
        .x(d => xScale(d.x))
        .y0(this.innerHeight)
        .y1(d => yScale(d.y))
        .curve(this.options.curve);
    }

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

    // Add area if requested
    if (this.options.showArea && area) {
      this.chartGroup.append('path')
        .datum(this.data)
        .attr('class', 'area')
        .attr('fill', this.options.areaColor)
        .attr('d', area);
    }

    // Add line
    const path = this.chartGroup.append('path')
      .datum(this.data)
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', this.options.lineColor)
      .attr('stroke-width', this.options.lineWidth)
      .attr('d', line);

    // Animate line drawing
    const totalLength = path.node().getTotalLength();
    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1000)
      .attr('stroke-dashoffset', 0);

    // Add points if requested
    if (this.options.showPoints) {
      this.addPoints(xScale, yScale);
    }

    return this;
  }

  /**
   * Add interactive points to the line
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
      .attr('fill', this.options.pointColor)
      .style('cursor', 'pointer');

    // Animate points
    points.transition()
      .delay((d, i) => i * 50)
      .duration(300)
      .attr('r', this.options.pointRadius);

    // Add interactivity
    points
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', self.options.pointHoverRadius);
        
        self.showTooltip(`(${d.x}, ${d.y})`, event);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', self.options.pointRadius);
        
        self.hideTooltip();
      })
      .on('click', function(event, d) {
        if (self.options.onClick) {
          self.options.onClick(d, event);
        }
      });
  }

  /**
   * Add multiple lines for multi-series data
   */
  renderMultiSeries(seriesData) {
    if (!seriesData || seriesData.length === 0) {
      console.warn('No series data provided for LineChart');
      return this;
    }

    // Clear previous chart
    this.chartGroup.selectAll('*').remove();

    // Get all data points for scaling
    const allData = seriesData.flatMap(series => series.data);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(allData, d => d.x))
      .range([0, this.innerWidth]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(allData, d => d.y))
      .range([this.innerHeight, 0]);

    // Color scale for different series
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create line generator
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(this.options.curve);

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

    // Add lines for each series
    seriesData.forEach((series, index) => {
      const color = series.color || colorScale(index);

      // Add line
      const path = this.chartGroup.append('path')
        .datum(series.data)
        .attr('class', `line series-${index}`)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', this.options.lineWidth)
        .attr('d', line);

      // Animate line drawing
      const totalLength = path.node().getTotalLength();
      path
        .attr('stroke-dasharray', totalLength + ' ' + totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .delay(index * 200)
        .duration(1000)
        .attr('stroke-dashoffset', 0);

      // Add points if requested
      if (this.options.showPoints) {
        this.addSeriesPoints(series.data, xScale, yScale, color, series.name);
      }
    });

    // Add legend
    const legendItems = seriesData.map((series, index) => ({
      label: series.name || `Series ${index + 1}`,
      color: series.color || colorScale(index)
    }));
    this.addLegend(legendItems);

    return this;
  }

  /**
   * Add points for a specific series
   */
  addSeriesPoints(data, xScale, yScale, color, seriesName) {
    const self = this;

    const points = this.chartGroup.selectAll(`.point-${seriesName}`)
      .data(data)
      .enter()
      .append('circle')
      .attr('class', `point point-${seriesName}`)
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 0)
      .attr('fill', color)
      .style('cursor', 'pointer');

    // Animate points
    points.transition()
      .delay((d, i) => i * 30)
      .duration(300)
      .attr('r', this.options.pointRadius);

    // Add interactivity
    points
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', self.options.pointHoverRadius);
        
        self.showTooltip(`${seriesName}: (${d.x}, ${d.y})`, event);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', self.options.pointRadius);
        
        self.hideTooltip();
      });
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

export default LineChart;
