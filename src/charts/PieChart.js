import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * Pie Chart implementation
 */
class PieChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      innerRadius: 0,
      outerRadius: null, // Will be calculated based on chart size
      padAngle: 0.02,
      cornerRadius: 0,
      colors: d3.schemeCategory10,
      showLabels: true,
      labelOffset: 20,
      showPercentages: true,
      ...options
    };
    
    super(container, defaultOptions);
    this.addTooltip();
  }

  /**
   * Render the pie chart
   */
  render() {
    if (!this.data || this.data.length === 0) {
      console.warn('No data provided for PieChart');
      return this;
    }

    // Clear previous chart
    this.chartGroup.selectAll('*').remove();

    // Calculate radius if not provided
    const radius = this.options.outerRadius || 
      Math.min(this.innerWidth, this.innerHeight) / 2 - 10;

    // Center the chart
    const centerX = this.innerWidth / 2;
    const centerY = this.innerHeight / 2;

    const chartCenter = this.chartGroup.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // Create pie layout
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null)
      .padAngle(this.options.padAngle);

    // Create arc generator
    const arc = d3.arc()
      .innerRadius(this.options.innerRadius)
      .outerRadius(radius)
      .cornerRadius(this.options.cornerRadius);

    // Create arc generator for labels
    const labelArc = d3.arc()
      .innerRadius(radius + this.options.labelOffset)
      .outerRadius(radius + this.options.labelOffset);

    // Color scale
    const colorScale = d3.scaleOrdinal(this.options.colors);

    // Create pie slices
    const slices = chartCenter.selectAll('.slice')
      .data(pie(this.data))
      .enter()
      .append('g')
      .attr('class', 'slice');

    // Add paths
    const paths = slices.append('path')
      .attr('fill', (d, i) => colorScale(i))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .each(function(d) { this._current = { startAngle: 0, endAngle: 0 }; });

    // Animate slices
    paths.transition()
      .duration(1000)
      .attrTween('d', function(d) {
        const interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          return arc(interpolate(t));
        };
      });

    // Add interactivity
    this.addSliceInteractivity(paths, arc);

    // Add labels if requested
    if (this.options.showLabels) {
      this.addLabels(slices, pie(this.data), labelArc);
    }

    return this;
  }

  /**
   * Add interactivity to pie slices
   */
  addSliceInteractivity(paths, arc) {
    const self = this;
    const hoverArc = d3.arc()
      .innerRadius(this.options.innerRadius)
      .outerRadius(arc.outerRadius()() + 10)
      .cornerRadius(this.options.cornerRadius);

    paths
      .on('mouseover', function(event, d) {
        // Expand slice
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', hoverArc);

        // Show tooltip
        const percentage = ((d.endAngle - d.startAngle) / (2 * Math.PI) * 100).toFixed(1);
        const tooltipContent = `${d.data.label}: ${d.data.value} (${percentage}%)`;
        self.showTooltip(tooltipContent, event);
      })
      .on('mouseout', function(event, d) {
        // Return to normal size
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc);

        self.hideTooltip();
      })
      .on('click', function(event, d) {
        if (self.options.onClick) {
          self.options.onClick(d.data, event);
        }
      });
  }

  /**
   * Add labels to pie slices
   */
  addLabels(slices, pieData, labelArc) {
    const labels = slices.append('text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .style('font-size', '12px')
      .style('fill', '#333')
      .style('opacity', 0);

    // Add label text
    labels.text(d => {
      if (this.options.showPercentages) {
        const percentage = ((d.endAngle - d.startAngle) / (2 * Math.PI) * 100).toFixed(1);
        return `${d.data.label} (${percentage}%)`;
      }
      return d.data.label;
    });

    // Animate labels
    labels.transition()
      .delay(500)
      .duration(500)
      .style('opacity', 1);

    // Add lines connecting labels to slices
    this.addLabelLines(slices, pieData, labelArc);
  }

  /**
   * Add lines connecting labels to slices
   */
  addLabelLines(slices, pieData, labelArc) {
    const arc = d3.arc()
      .innerRadius(this.options.innerRadius)
      .outerRadius(this.options.outerRadius || 
        Math.min(this.innerWidth, this.innerHeight) / 2 - 10);

    const lines = slices.append('polyline')
      .attr('fill', 'none')
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .style('opacity', 0);

    lines.attr('points', d => {
      const pos = labelArc.centroid(d);
      const midPos = arc.centroid(d);
      return [midPos, pos];
    });

    // Animate lines
    lines.transition()
      .delay(500)
      .duration(500)
      .style('opacity', 0.7);
  }

  /**
   * Create a donut chart (pie chart with inner radius)
   */
  createDonut(innerRadiusRatio = 0.5) {
    const radius = this.options.outerRadius || 
      Math.min(this.innerWidth, this.innerHeight) / 2 - 10;
    
    this.options.innerRadius = radius * innerRadiusRatio;
    return this.render();
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
   * Animate slice explosion
   */
  explodeSlice(index, distance = 20) {
    const slice = this.chartGroup.select(`.slice:nth-child(${index + 1})`);
    const pieData = d3.pie().value(d => d.value)(this.data);
    const centroid = d3.arc()
      .innerRadius(this.options.innerRadius)
      .outerRadius(this.options.outerRadius || 
        Math.min(this.innerWidth, this.innerHeight) / 2 - 10)
      .centroid(pieData[index]);

    const x = centroid[0] * distance / 100;
    const y = centroid[1] * distance / 100;

    slice.transition()
      .duration(300)
      .attr('transform', `translate(${x}, ${y})`);

    return this;
  }

  /**
   * Reset all slice positions
   */
  resetSlices() {
    this.chartGroup.selectAll('.slice')
      .transition()
      .duration(300)
      .attr('transform', 'translate(0, 0)');

    return this;
  }
}

export default PieChart;
