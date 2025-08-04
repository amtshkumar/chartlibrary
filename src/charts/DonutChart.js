import * as d3 from 'd3';
import PieChart from './PieChart.js';

/**
 * Donut Chart implementation (extends PieChart)
 */
class DonutChart extends PieChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      innerRadius: 0.5, // Ratio of outer radius
      showCenterText: true,
      centerText: '',
      centerTextSize: '24px',
      centerTextColor: '#333',
      ...options
    };
    
    super(container, defaultOptions);
  }

  /**
   * Render the donut chart
   */
  render() {
    if (!this.data || this.data.length === 0) {
      console.warn('No data provided for DonutChart');
      return this;
    }

    // Calculate radius if not provided
    const outerRadius = this.options.outerRadius || 
      Math.min(this.innerWidth, this.innerHeight) / 2 - 10;
    
    // Set inner radius based on ratio
    if (typeof this.options.innerRadius === 'number' && this.options.innerRadius < 1) {
      this.options.innerRadius = outerRadius * this.options.innerRadius;
    }

    // Call parent render method
    super.render();

    // Add center text if requested
    if (this.options.showCenterText) {
      this.addCenterText();
    }

    return this;
  }

  /**
   * Add text in the center of the donut
   */
  addCenterText() {
    const centerX = this.innerWidth / 2;
    const centerY = this.innerHeight / 2;

    const centerGroup = this.chartGroup.select('g')
      .append('g')
      .attr('class', 'center-text');

    // Main center text
    const centerText = this.options.centerText || this.calculateTotal();
    
    centerGroup.append('text')
      .attr('class', 'center-main-text')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .style('font-size', this.options.centerTextSize)
      .style('font-weight', 'bold')
      .style('fill', this.options.centerTextColor)
      .text(centerText);

    // Optional subtitle
    if (this.options.centerSubtext) {
      centerGroup.append('text')
        .attr('class', 'center-sub-text')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('dy', '1.5em')
        .style('font-size', '14px')
        .style('fill', '#666')
        .text(this.options.centerSubtext);
    }
  }

  /**
   * Calculate total value for center display
   */
  calculateTotal() {
    return d3.sum(this.data, d => d.value);
  }

  /**
   * Update center text
   */
  updateCenterText(text, subtext = null) {
    const centerGroup = this.chartGroup.select('.center-text');
    
    if (!centerGroup.empty()) {
      centerGroup.select('.center-main-text').text(text);
      
      if (subtext !== null) {
        let subtextElement = centerGroup.select('.center-sub-text');
        if (subtextElement.empty()) {
          subtextElement = centerGroup.append('text')
            .attr('class', 'center-sub-text')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('dy', '1.5em')
            .style('font-size', '14px')
            .style('fill', '#666');
        }
        subtextElement.text(subtext);
      }
    }

    return this;
  }

  /**
   * Create a progress donut (single value with remaining)
   */
  renderProgress(value, total, options = {}) {
    const progressOptions = {
      progressColor: '#3498db',
      remainingColor: '#ecf0f1',
      showPercentage: true,
      ...options
    };

    const percentage = (value / total) * 100;
    const remaining = total - value;

    const progressData = [
      { label: 'Progress', value: value, color: progressOptions.progressColor },
      { label: 'Remaining', value: remaining, color: progressOptions.remainingColor }
    ];

    this.setData(progressData);
    this.options.colors = [progressOptions.progressColor, progressOptions.remainingColor];
    this.options.showLabels = false;

    this.render();

    // Update center text with percentage
    if (progressOptions.showPercentage) {
      this.updateCenterText(`${percentage.toFixed(1)}%`, 'Complete');
    }

    return this;
  }

  /**
   * Create animated progress donut
   */
  animateProgress(targetValue, total, duration = 2000, options = {}) {
    const progressOptions = {
      progressColor: '#3498db',
      remainingColor: '#ecf0f1',
      ...options
    };

    // Start with 0 progress
    this.renderProgress(0, total, progressOptions);

    // Animate to target value
    const self = this;
    const startTime = Date.now();

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = targetValue * progress;

      self.renderProgress(currentValue, total, progressOptions);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
    return this;
  }

  /**
   * Add interactive hover effects for donut segments
   */
  addDonutInteractivity() {
    const self = this;
    const paths = this.chartGroup.selectAll('.slice path');

    paths
      .on('mouseover', function(event, d) {
        // Highlight segment
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 0.8);

        // Update center text with segment info
        const percentage = ((d.endAngle - d.startAngle) / (2 * Math.PI) * 100).toFixed(1);
        self.updateCenterText(d.data.value, `${d.data.label} (${percentage}%)`);

        // Show tooltip
        const tooltipContent = `${d.data.label}: ${d.data.value} (${percentage}%)`;
        self.showTooltip(tooltipContent, event);
      })
      .on('mouseout', function(event, d) {
        // Reset segment
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 1);

        // Reset center text
        const centerText = self.options.centerText || self.calculateTotal();
        self.updateCenterText(centerText, self.options.centerSubtext);

        self.hideTooltip();
      });

    return this;
  }

  /**
   * Create multi-level donut chart
   */
  renderMultiLevel(innerData, outerData) {
    // Clear previous chart
    this.chartGroup.selectAll('*').remove();

    const centerX = this.innerWidth / 2;
    const centerY = this.innerHeight / 2;
    const maxRadius = Math.min(this.innerWidth, this.innerHeight) / 2 - 10;

    const chartCenter = this.chartGroup.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // Inner donut
    this.renderDonutLevel(chartCenter, innerData, maxRadius * 0.3, maxRadius * 0.6, 'inner');

    // Outer donut
    this.renderDonutLevel(chartCenter, outerData, maxRadius * 0.7, maxRadius, 'outer');

    return this;
  }

  /**
   * Render a single level of multi-level donut
   */
  renderDonutLevel(container, data, innerRadius, outerRadius, className) {
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const slices = container.selectAll(`.${className}-slice`)
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', `${className}-slice`);

    slices.append('path')
      .attr('fill', (d, i) => colorScale(i))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('d', arc)
      .each(function(d) { this._current = { startAngle: 0, endAngle: 0 }; })
      .transition()
      .duration(1000)
      .attrTween('d', function(d) {
        const interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          return arc(interpolate(t));
        };
      });

    return this;
  }
}

export default DonutChart;
