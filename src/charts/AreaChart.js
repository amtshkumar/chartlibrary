import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * Area Chart implementation
 */
class AreaChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      areaColor: 'rgba(52, 152, 219, 0.6)',
      lineColor: '#3498db',
      lineWidth: 2,
      curve: d3.curveLinear,
      showLine: true,
      showPoints: false,
      pointRadius: 3,
      ...options
    };
    
    super(container, defaultOptions);
    this.addTooltip();
  }

  /**
   * Render the area chart
   */
  render() {
    if (!this.data || this.data.length === 0) {
      console.warn('No data provided for AreaChart');
      return this;
    }

    // Clear previous chart
    this.chartGroup.selectAll('*').remove();

    // Create scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(this.data, d => d.x))
      .range([0, this.innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => d.y)])
      .range([this.innerHeight, 0]);

    // Create area generator
    const area = d3.area()
      .x(d => xScale(d.x))
      .y0(this.innerHeight)
      .y1(d => yScale(d.y))
      .curve(this.options.curve);

    // Create line generator
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(this.options.curve);

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

    // Add area
    const areaPath = this.chartGroup.append('path')
      .datum(this.data)
      .attr('class', 'area')
      .attr('fill', this.options.areaColor)
      .attr('d', area);

    // Animate area
    this.animateArea(areaPath);

    // Add line if requested
    if (this.options.showLine) {
      const linePath = this.chartGroup.append('path')
        .datum(this.data)
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', this.options.lineColor)
        .attr('stroke-width', this.options.lineWidth)
        .attr('d', line);

      // Animate line
      this.animateLine(linePath);
    }

    // Add points if requested
    if (this.options.showPoints) {
      this.addPoints(xScale, yScale);
    }

    // Add interaction overlay
    this.addInteractionOverlay(xScale, yScale);

    return this;
  }

  /**
   * Animate area drawing
   */
  animateArea(areaPath) {
    const totalLength = areaPath.node().getTotalLength();
    
    areaPath
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .attr('stroke', this.options.areaColor)
      .attr('stroke-width', 1)
      .transition()
      .duration(1500)
      .attr('stroke-dashoffset', 0)
      .on('end', function() {
        d3.select(this).attr('stroke', 'none');
      });
  }

  /**
   * Animate line drawing
   */
  animateLine(linePath) {
    const totalLength = linePath.node().getTotalLength();
    
    linePath
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1500)
      .attr('stroke-dashoffset', 0);
  }

  /**
   * Add interactive points
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
      .attr('fill', this.options.lineColor)
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
          .attr('r', self.options.pointRadius * 1.5);
        
        self.showTooltip(`(${d.x}, ${d.y})`, event);
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
   * Add interaction overlay for hover effects
   */
  addInteractionOverlay(xScale, yScale) {
    const self = this;

    // Create bisector for finding closest data point
    const bisect = d3.bisector(d => d.x).left;

    // Add invisible overlay for mouse tracking
    const overlay = this.chartGroup.append('rect')
      .attr('class', 'overlay')
      .attr('width', this.innerWidth)
      .attr('height', this.innerHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .style('cursor', 'crosshair');

    // Add focus elements
    const focus = this.chartGroup.append('g')
      .attr('class', 'focus')
      .style('display', 'none');

    focus.append('circle')
      .attr('r', 4)
      .attr('fill', this.options.lineColor)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    focus.append('line')
      .attr('class', 'x-hover-line')
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    focus.append('line')
      .attr('class', 'y-hover-line')
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    // Mouse events
    overlay
      .on('mouseover', () => focus.style('display', null))
      .on('mouseout', () => {
        focus.style('display', 'none');
        self.hideTooltip();
      })
      .on('mousemove', function(event) {
        const [mouseX] = d3.pointer(event, this);
        const x0 = xScale.invert(mouseX);
        const i = bisect(self.data, x0, 1);
        
        if (i >= self.data.length) return;
        
        const d0 = self.data[i - 1];
        const d1 = self.data[i];
        const d = x0 - d0.x > d1.x - x0 ? d1 : d0;

        focus.attr('transform', `translate(${xScale(d.x)}, ${yScale(d.y)})`);

        focus.select('.x-hover-line')
          .attr('y1', -yScale(d.y))
          .attr('y2', self.innerHeight - yScale(d.y));

        focus.select('.y-hover-line')
          .attr('x1', -xScale(d.x))
          .attr('x2', self.innerWidth - xScale(d.x));

        self.showTooltip(`(${d.x}, ${d.y})`, event);
      });
  }

  /**
   * Render stacked area chart
   */
  renderStacked(seriesData) {
    if (!seriesData || seriesData.length === 0) {
      console.warn('No series data provided for stacked AreaChart');
      return this;
    }

    // Clear previous chart
    this.chartGroup.selectAll('*').remove();

    // Prepare data for stacking
    const keys = seriesData.map(d => d.name);
    const stackData = this.prepareStackData(seriesData);

    // Create stack generator
    const stack = d3.stack()
      .keys(keys)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const stackedData = stack(stackData);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(stackData, d => d.x))
      .range([0, this.innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))])
      .range([this.innerHeight, 0]);

    // Color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create area generator
    const area = d3.area()
      .x(d => xScale(d.data.x))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
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

    // Add areas
    const areas = this.chartGroup.selectAll('.area')
      .data(stackedData)
      .enter()
      .append('path')
      .attr('class', 'area')
      .attr('fill', (d, i) => colorScale(i))
      .attr('d', area)
      .style('opacity', 0.8);

    // Add legend
    const legendItems = keys.map((key, i) => ({
      label: key,
      color: colorScale(i)
    }));
    this.addLegend(legendItems);

    return this;
  }

  /**
   * Prepare data for stacking
   */
  prepareStackData(seriesData) {
    // Get all unique x values
    const allXValues = [...new Set(
      seriesData.flatMap(series => series.data.map(d => d.x))
    )].sort((a, b) => a - b);

    // Create combined data structure
    return allXValues.map(x => {
      const dataPoint = { x };
      
      seriesData.forEach(series => {
        const point = series.data.find(d => d.x === x);
        dataPoint[series.name] = point ? point.y : 0;
      });
      
      return dataPoint;
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

export default AreaChart;
