import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * GaugeChart class for displaying single metric values with min/max ranges
 * Data format: { value: number, min: number, max: number, label?: string }
 */
class GaugeChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      colorScheme: 'traffic',
      startAngle: -Math.PI / 2,
      endAngle: Math.PI / 2,
      animation: true,
      showValue: true,
      showTicks: true,
      tickCount: 5,
      ...options
    };

    super(container, defaultOptions);
    this.setupColorSchemes();
    this.setupScales();
  }

  setupColorSchemes() {
    this.colorSchemes = {
      traffic: ['#d32f2f', '#ff9800', '#4caf50'], // Red, Orange, Green
      blue: ['#e3f2fd', '#2196f3', '#0d47a1'],
      purple: ['#f3e5f5', '#9c27b0', '#4a148c'],
      green: ['#e8f5e8', '#4caf50', '#1b5e20']
    };
  }

  setupScales() {
    const radius = Math.min(this.innerWidth, this.innerHeight) / 2;
    this.radius = radius * 0.8;
    this.centerX = this.innerWidth / 2;
    this.centerY = this.innerHeight / 2;
  }

  processData(data) {
    const { value, min, max } = data;
    const range = max - min;
    const normalizedValue = (value - min) / range;
    
    return {
      ...data,
      normalizedValue: Math.max(0, Math.min(1, normalizedValue)),
      range
    };
  }

  render() {
    if (!this.data) return this;

    // Clear previous render
    this.chartGroup.selectAll('*').remove();

    const processedData = this.processData(this.data);
    const { value, min, max, normalizedValue, label } = processedData;

    // Create gauge group
    const gaugeGroup = this.chartGroup.append('g')
      .attr('transform', `translate(${this.centerX}, ${this.centerY})`);

    // Background arc
    const backgroundArc = d3.arc()
      .innerRadius(this.radius * 0.7)
      .outerRadius(this.radius)
      .startAngle(this.options.startAngle)
      .endAngle(this.options.endAngle);

    gaugeGroup.append('path')
      .datum({ startAngle: this.options.startAngle, endAngle: this.options.endAngle })
      .attr('d', backgroundArc)
      .attr('fill', '#e0e0e0')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1);

    // Value arc
    const valueAngle = this.options.startAngle + 
      (this.options.endAngle - this.options.startAngle) * normalizedValue;

    const valueArc = d3.arc()
      .innerRadius(this.radius * 0.7)
      .outerRadius(this.radius)
      .startAngle(this.options.startAngle)
      .endAngle(valueAngle);

    // Determine color based on value
    const colors = this.colorSchemes[this.options.colorScheme];
    let color;
    if (normalizedValue < 0.33) {
      color = colors[0]; // Low range
    } else if (normalizedValue < 0.66) {
      color = colors[1]; // Medium range
    } else {
      color = colors[2]; // High range
    }

    const valueArcElement = gaugeGroup.append('path')
      .attr('d', valueArc)
      .attr('fill', color)
      .attr('stroke', d3.color(color).darker(0.5))
      .attr('stroke-width', 1);

    // Add ticks
    if (this.options.showTicks) {
      const tickData = d3.range(this.options.tickCount + 1).map(i => {
        const ratio = i / this.options.tickCount;
        const angle = this.options.startAngle + 
          (this.options.endAngle - this.options.startAngle) * ratio;
        const tickValue = min + (max - min) * ratio;
        return { angle, value: tickValue };
      });

      const ticks = gaugeGroup.selectAll('.tick')
        .data(tickData)
        .enter()
        .append('g')
        .attr('class', 'tick');

      // Tick lines
      ticks.append('line')
        .attr('x1', d => Math.cos(d.angle) * (this.radius * 0.65))
        .attr('y1', d => Math.sin(d.angle) * (this.radius * 0.65))
        .attr('x2', d => Math.cos(d.angle) * (this.radius * 0.6))
        .attr('y2', d => Math.sin(d.angle) * (this.radius * 0.6))
        .attr('stroke', '#666')
        .attr('stroke-width', 2);

      // Tick labels
      ticks.append('text')
        .attr('x', d => Math.cos(d.angle) * (this.radius * 0.55))
        .attr('y', d => Math.sin(d.angle) * (this.radius * 0.55))
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '10px')
        .style('fill', '#666')
        .text(d => Math.round(d.value));
    }

    // Needle
    const needleAngle = this.options.startAngle + 
      (this.options.endAngle - this.options.startAngle) * normalizedValue;

    const needleLength = this.radius * 0.6;
    const needlePath = `M 0,0 L ${Math.cos(needleAngle) * needleLength},${Math.sin(needleAngle) * needleLength}`;

    gaugeGroup.append('path')
      .attr('d', needlePath)
      .attr('stroke', '#333')
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round');

    // Center circle
    gaugeGroup.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 6)
      .attr('fill', '#333');

    // Value text
    if (this.options.showValue) {
      gaugeGroup.append('text')
        .attr('x', 0)
        .attr('y', this.radius * 0.3)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '24px')
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .text(Math.round(value * 100) / 100);

      // Label text
      if (label) {
        gaugeGroup.append('text')
          .attr('x', 0)
          .attr('y', this.radius * 0.45)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '14px')
          .style('fill', '#666')
          .text(label);
      }
    }

    // Add animations
    if (this.options.animation) {
      // Animate value arc
      valueArcElement
        .datum({ startAngle: this.options.startAngle, endAngle: this.options.startAngle })
        .transition()
        .duration(1000)
        .attrTween('d', d => {
          const interpolate = d3.interpolate(d.endAngle, valueAngle);
          return t => {
            d.endAngle = interpolate(t);
            return valueArc(d);
          };
        });
    }

    return this;
  }

  updateColorScheme(scheme) {
    this.options.colorScheme = scheme;
    return this.render();
  }

  updateData(newData) {
    this.setData(newData);
    return this.render();
  }
}

export default GaugeChart;
