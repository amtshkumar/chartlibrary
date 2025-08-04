import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * Bar Chart implementation
 */
class BarChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      barPadding: 0.1,
      barColor: '#3498db',
      hoverColor: '#2980b9',
      showValues: false,
      orientation: 'vertical', // 'vertical' or 'horizontal'
      ...options
    };
    
    super(container, defaultOptions);
    this.addTooltip();
  }

  /**
   * Render the bar chart
   */
  render() {
    if (!this.data || this.data.length === 0) {
      console.warn('No data provided for BarChart');
      return this;
    }

    // Clear previous chart
    this.chartGroup.selectAll('*').remove();

    if (this.options.orientation === 'vertical') {
      this.renderVerticalBars();
    } else {
      this.renderHorizontalBars();
    }

    return this;
  }

  /**
   * Render vertical bars
   */
  renderVerticalBars() {
    // Create scales
    const xScale = d3.scaleBand()
      .domain(this.data.map(d => d.label))
      .range([0, this.innerWidth])
      .padding(this.options.barPadding);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => d.value)])
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

    // Create bars
    const bars = this.chartGroup.selectAll('.bar')
      .data(this.data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.label))
      .attr('width', xScale.bandwidth())
      .attr('y', this.innerHeight)
      .attr('height', 0)
      .attr('fill', this.options.barColor)
      .style('cursor', 'pointer');

    // Animate bars
    bars.transition()
      .duration(800)
      .attr('y', d => yScale(d.value))
      .attr('height', d => this.innerHeight - yScale(d.value));

    // Add interactivity
    this.addBarInteractivity(bars);

    // Add value labels if requested
    if (this.options.showValues) {
      this.addValueLabels(xScale, yScale);
    }
  }

  /**
   * Render horizontal bars
   */
  renderHorizontalBars() {
    // Create scales
    const yScale = d3.scaleBand()
      .domain(this.data.map(d => d.label))
      .range([0, this.innerHeight])
      .padding(this.options.barPadding);

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => d.value)])
      .range([0, this.innerWidth]);

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

    // Create bars
    const bars = this.chartGroup.selectAll('.bar')
      .data(this.data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', d => yScale(d.label))
      .attr('height', yScale.bandwidth())
      .attr('x', 0)
      .attr('width', 0)
      .attr('fill', this.options.barColor)
      .style('cursor', 'pointer');

    // Animate bars
    bars.transition()
      .duration(800)
      .attr('width', d => xScale(d.value));

    // Add interactivity
    this.addBarInteractivity(bars);
  }

  /**
   * Add interactivity to bars
   */
  addBarInteractivity(bars) {
    const self = this;

    bars
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', self.options.hoverColor);
        self.showTooltip(`${d.label}: ${d.value}`, event);
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
   * Add value labels on bars
   */
  addValueLabels(xScale, yScale) {
    if (this.options.orientation === 'vertical') {
      this.chartGroup.selectAll('.value-label')
        .data(this.data)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', d => xScale(d.label) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.value) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#333')
        .text(d => d.value);
    } else {
      this.chartGroup.selectAll('.value-label')
        .data(this.data)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', d => xScale(d.value) + 5)
        .attr('y', d => yScale(d.label) + yScale.bandwidth() / 2)
        .attr('text-anchor', 'start')
        .attr('alignment-baseline', 'middle')
        .style('font-size', '12px')
        .style('fill', '#333')
        .text(d => d.value);
    }
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

export default BarChart;
