import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * Animated Bubble Chart (generic)
 *
 * Generic, time-aware bubble chart for comparing two numeric metrics (x, y)
 * with bubble size and categorical color. Designed to be flexible and reusable.
 *
 * Data format (flat array):
 * [
 *   {
 *     id: 'entity-1',
 *     category: 'Group A',
 *     period: 0, // time key (customizable via options.timeField)
 *     x: 12000,  // xField
 *     y: 3500,   // yField
 *     size: 500000 // sizeField (determines bubble radius)
 *   }, ...
 * ]
 */
class AnimatedBubbleChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      xField: 'x',
      yField: 'y',
      sizeField: 'size',
      categoryField: 'category',
      idField: 'id',
      timeField: 'period',
      currentPeriod: 0,
      animated: true,
      duration: 750,
      minRadius: 8,
      maxRadius: 50,
      colorScheme: d3.schemeTableau10,
      showLegend: true,
      xLabel: 'X',
      yLabel: 'Y',
      backgroundColor: '#ffffff'
    };
    super(container, { ...defaultOptions, ...options });
    this.addTooltip();
    this.currentPeriod = this.options.currentPeriod;
  }

  setData(data) {
    this.data = Array.isArray(data) ? data.slice() : [];
    // Pre-compute global domains for stable axes
    const { xField, yField, sizeField } = this.options;
    this._xDomain = d3.extent(this.data, d => +d[xField]);
    this._yDomain = d3.extent(this.data, d => +d[yField]);
    const sizeExtent = d3.extent(this.data, d => +d[sizeField]);
    this._sizeScale = d3.scaleSqrt()
      .domain(sizeExtent[0] === sizeExtent[1] ? [0, sizeExtent[1] || 1] : sizeExtent)
      .range([this.options.minRadius, this.options.maxRadius]);
    // Categories
    const { categoryField } = this.options;
    this._categories = [...new Set(this.data.map(d => d[categoryField]).filter(v => v != null))];
    this._color = d3.scaleOrdinal(this.options.colorScheme).domain(this._categories);
    return this;
  }

  setPeriod(period) {
    this.currentPeriod = period;
    return this.render();
  }

  formatTooltip(d) {
    const { xField, yField, sizeField, categoryField, timeField } = this.options;
    const fmt = d3.format('~s');
    return `
      <div style="min-width:180px">
        <div style="font-weight:700;margin-bottom:4px">${d[categoryField] ?? 'Item'}</div>
        <div><b>${timeField}:</b> ${d[timeField]}</div>
        <div><b>${xField}:</b> ${fmt(d[xField])}</div>
        <div><b>${yField}:</b> ${fmt(d[yField])}</div>
        <div><b>${sizeField}:</b> ${fmt(d[sizeField])}</div>
      </div>
    `;
  }

  render() {
    if (!this.data || this.data.length === 0) return this;

    const {
      xField, yField, sizeField, categoryField, idField, timeField,
      duration, showLegend, xLabel, yLabel
    } = this.options;

    // Prepare filtered data for current period
    const periodData = this.data.filter(d => d[timeField] === this.currentPeriod);

    // Scales (use stable precomputed domains)
    const x = d3.scaleLinear()
      .domain(this._padDomain(this._xDomain))
      .range([0, this.innerWidth])
      .nice();

    const y = d3.scaleLinear()
      .domain(this._padDomain(this._yDomain))
      .range([this.innerHeight, 0])
      .nice();

    const r = this._sizeScale;
    const color = this._color;

    // Only create axes and labels once
    if (!this._axesCreated) {
      // Axes
      this.chartGroup.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${this.innerHeight})`)
        .call(d3.axisBottom(x).tickFormat(d3.format('~s')));

      this.chartGroup.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).tickFormat(d3.format('~s')));

      // Labels
      if (xLabel) {
        this.chartGroup.append('text')
          .attr('class', 'x-label')
          .attr('x', this.innerWidth / 2)
          .attr('y', this.innerHeight + 35)
          .attr('text-anchor', 'middle')
          .style('font-size', '14px')
          .style('fill', '#333')
          .text(xLabel);
      }
      if (yLabel) {
        this.chartGroup.append('text')
          .attr('class', 'y-label')
          .attr('transform', 'rotate(-90)')
          .attr('x', -this.innerHeight / 2)
          .attr('y', -35)
          .attr('text-anchor', 'middle')
          .style('font-size', '14px')
          .style('fill', '#333')
          .text(yLabel);
      }

      this._axesCreated = true;
    }

    // Update period watermark text
    let periodDisplay = this.chartGroup.select('.period-display');
    if (periodDisplay.empty()) {
      periodDisplay = this.chartGroup.append('text')
        .attr('class', 'period-display')
        .attr('x', this.innerWidth / 2)
        .attr('y', this.innerHeight / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '96px')
        .style('font-weight', 'bold')
        .style('fill', 'rgba(0,0,0,0.05)');
    }
    periodDisplay.text(`${timeField}: ${this.currentPeriod}`);

    // Data join with smooth transitions
    const groups = this.chartGroup.selectAll('.bubble-group')
      .data(periodData, d => d[idField]);

    // Enter new bubbles
    const groupsEnter = groups.enter().append('g')
      .attr('class', 'bubble-group')
      .attr('transform', d => `translate(${x(d[xField])}, ${y(d[yField])})`);

    // Circle
    groupsEnter.append('circle')
      .attr('r', 0)
      .attr('fill', d => color(d[categoryField]))
      .attr('fill-opacity', 0.6)
      .attr('stroke', d => d3.color(color(d[categoryField]))?.darker(0.7).toString() || '#000')
      .attr('stroke-width', 2);

    // Label (value of size or custom)
    groupsEnter.append('text')
      .attr('class', 'bubble-label')
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .style('font-size', '0px')
      .style('fill', '#fff')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .text(d => d3.format('.2s')(d[sizeField]).replace('G', 'B'));

    const merged = groupsEnter.merge(groups);

    // Hover interactions
    const self = this;
    merged
      .on('mouseover', function (event, d) {
        d3.select(this).select('circle')
          .transition().duration(150)
          .attr('stroke-width', 3)
          .attr('fill-opacity', 1);
        self.showTooltip(self.formatTooltip(d), event);
      })
      .on('mousemove', function (event) {
        self.showTooltip('', event); // updates position only
      })
      .on('mouseout', function () {
        d3.select(this).select('circle')
          .transition().duration(150)
          .attr('stroke-width', 2)
          .attr('fill-opacity', 0.6);
        self.hideTooltip();
      });

    // Smooth transitions for position and size
    merged.transition().duration(duration).ease(d3.easeCubicOut)
      .attr('transform', d => `translate(${x(d[xField])}, ${y(d[yField])})`);

    merged.select('circle')
      .transition().duration(duration).ease(d3.easeCubicOut)
      .attr('r', d => r(d[sizeField]));

    merged.select('.bubble-label')
      .transition().duration(duration)
      .style('font-size', d => Math.max(10, r(d[sizeField]) / 3.5) + 'px')
      .tween('text', function (d) {
        const that = this;
        const currentValue = parseFloat(that.textContent.replace(/[^\d.]/g, '')) || 0;
        const targetValue = +d[sizeField];
        const i = d3.interpolateNumber(currentValue, targetValue);
        return function (t) {
          that.textContent = d3.format('.2s')(i(t)).replace('G', 'B');
        };
      });

    // Exit bubbles with smooth shrinking
    groups.exit()
      .transition().duration(duration)
      .select('circle')
      .attr('r', 0)
      .end()
      .then(() => groups.exit().remove())
      .catch(() => {}); // Ignore errors from interrupted transitions

    // Legend (only update if needed)
    if (showLegend && this._categories.length) {
      this.chartGroup.selectAll('.legend').remove();
      const legendItems = this._categories.map(c => ({ label: c, color: color(c) }));
      this.addLegend(legendItems, { x: this.options.width - 140, y: 20 });
    }

    return this;
  }

  _padDomain(ext) {
    const [a, b] = ext;
    if (a == null || b == null) return [0, 1];
    if (a === b) return [0, b || 1];
    const pad = (b - a) * 0.05;
    return [a - pad, b + pad];
  }
}

export default AnimatedBubbleChart;
