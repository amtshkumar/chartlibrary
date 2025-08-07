import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * CalendarHeatmapChart class for creating calendar-based heatmap visualizations
 * Perfect for showing activity patterns over time (like GitHub contribution graphs)
 */
class CalendarHeatmapChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      width: 900,
      height: 200,
      margin: { top: 20, right: 20, bottom: 20, left: 50 },
      colorScheme: 'green', // 'green', 'blue', 'purple', 'orange'
      showTooltip: true,
      showLegend: true,
      cellSize: 12,
      cellPadding: 2,
      showMonthLabels: true,
      showWeekdayLabels: true,
      showYearLabel: true,
      animated: true,
      year: new Date().getFullYear(),
      ...options
    };

    super(container, defaultOptions);
    
    // Initialize color schemes after super() call
    this.colorSchemes = {
      green: {
        colors: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
        name: 'GitHub Green'
      },
      blue: {
        colors: ['#f0f9ff', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7'],
        name: 'Ocean Blue'
      },
      purple: {
        colors: ['#faf5ff', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed'],
        name: 'Royal Purple'
      },
      orange: {
        colors: ['#fff7ed', '#fed7aa', '#fdba74', '#fb923c', '#f97316'],
        name: 'Sunset Orange'
      }
    };

    // Date utilities
    this.timeWeek = d3.timeWeek;
    this.timeDay = d3.timeDay;
    this.timeFormat = d3.timeFormat;
    this.timeParse = d3.timeParse;

    if (this.options.showTooltip) {
      this.addTooltip();
    }
  }

  /**
   * Initialize the chart
   */
  init() {
    super.init();
    
    // Ensure colorSchemes is initialized (in case init is called before constructor completes)
    if (!this.colorSchemes) {
      this.colorSchemes = {
        green: {
          colors: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
          name: 'GitHub Green'
        },
        blue: {
          colors: ['#f0f9ff', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7'],
          name: 'Ocean Blue'
        },
        purple: {
          colors: ['#faf5ff', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed'],
          name: 'Royal Purple'
        },
        orange: {
          colors: ['#fff7ed', '#fed7aa', '#fdba74', '#fb923c', '#f97316'],
          name: 'Sunset Orange'
        }
      };
    }
    
    // Calculate dimensions based on year
    this.year = this.options.year;
    this.cellSize = this.options.cellSize;
    this.cellPadding = this.options.cellPadding;
    
    // Date range for the year
    this.yearStart = new Date(this.year, 0, 1);
    this.yearEnd = new Date(this.year, 11, 31);
    
    // Calculate actual chart dimensions
    const weeksInYear = d3.timeWeek.count(this.yearStart, this.yearEnd) + 1;
    this.chartWidth = weeksInYear * (this.cellSize + this.cellPadding);
    this.chartHeight = 7 * (this.cellSize + this.cellPadding);
    
    // Update container dimensions if needed
    if (this.options.width < this.chartWidth + this.options.margin.left + this.options.margin.right) {
      this.options.width = this.chartWidth + this.options.margin.left + this.options.margin.right;
      this.svg.attr('width', this.options.width);
    }
    
    if (this.options.height < this.chartHeight + this.options.margin.top + this.options.margin.bottom + 60) {
      this.options.height = this.chartHeight + this.options.margin.top + this.options.margin.bottom + 60;
      this.svg.attr('height', this.options.height);
    }

    // Create scales
    this.setupScales();
    
    // Add labels
    if (this.options.showWeekdayLabels) {
      this.addWeekdayLabels();
    }
    
    if (this.options.showMonthLabels) {
      this.addMonthLabels();
    }
    
    if (this.options.showYearLabel) {
      this.addYearLabel();
    }
    
    if (this.options.showLegend) {
      this.addLegend();
    }
  }

  /**
   * Setup scales for the calendar
   */
  setupScales() {
    // Color scale based on data values
    const colorScheme = this.colorSchemes[this.options.colorScheme];
    this.colorScale = d3.scaleQuantile()
      .range(colorScheme.colors);
    
    // Position scales
    this.xScale = (date) => d3.timeWeek.count(this.yearStart, date) * (this.cellSize + this.cellPadding);
    this.yScale = (date) => date.getDay() * (this.cellSize + this.cellPadding);
  }

  /**
   * Add weekday labels
   */
  addWeekdayLabels() {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    this.chartGroup.selectAll('.weekday-label')
      .data(weekdays)
      .enter()
      .append('text')
      .attr('class', 'weekday-label')
      .attr('x', -10)
      .attr('y', (d, i) => i * (this.cellSize + this.cellPadding) + this.cellSize / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '10px')
      .style('fill', '#666')
      .style('font-family', 'monospace')
      .text(d => d);
  }

  /**
   * Add month labels
   */
  addMonthLabels() {
    const monthLabels = this.chartGroup.selectAll('.month-label')
      .data(d3.timeMonths(this.yearStart, new Date(this.year + 1, 0, 1)))
      .enter()
      .append('text')
      .attr('class', 'month-label')
      .attr('x', d => this.xScale(d))
      .attr('y', -10)
      .style('font-size', '10px')
      .style('fill', '#666')
      .style('font-family', 'monospace')
      .text(d => d3.timeFormat('%b')(d));
  }

  /**
   * Add year label
   */
  addYearLabel() {
    this.svg.append('text')
      .attr('class', 'year-label')
      .attr('x', this.options.margin.left)
      .attr('y', this.options.height - 10)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text(this.year);
  }

  /**
   * Add legend
   */
  addLegend() {
    const legendGroup = this.svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${this.options.width - 200}, ${this.options.height - 30})`);

    legendGroup.append('text')
      .attr('x', 0)
      .attr('y', -5)
      .style('font-size', '10px')
      .style('fill', '#666')
      .text('Less');

    legendGroup.append('text')
      .attr('x', 80)
      .attr('y', -5)
      .style('font-size', '10px')
      .style('fill', '#666')
      .text('More');

    const colorScheme = this.colorSchemes[this.options.colorScheme];
    legendGroup.selectAll('.legend-cell')
      .data(colorScheme.colors)
      .enter()
      .append('rect')
      .attr('class', 'legend-cell')
      .attr('x', (d, i) => i * 12)
      .attr('y', 0)
      .attr('width', 10)
      .attr('height', 10)
      .attr('fill', d => d)
      .attr('stroke', '#ccc')
      .attr('stroke-width', 0.5);
  }

  /**
   * Render the calendar heatmap
   */
  render() {
    if (!this.data) {
      console.warn('No data provided to CalendarHeatmapChart');
      return this;
    }

    // Process data into a map for quick lookup
    this.dataMap = new Map();
    let maxValue = 0;
    
    this.data.forEach(d => {
      const date = typeof d.date === 'string' ? new Date(d.date) : d.date;
      const dateStr = d3.timeFormat('%Y-%m-%d')(date);
      this.dataMap.set(dateStr, d.value || 0);
      maxValue = Math.max(maxValue, d.value || 0);
    });

    // Update color scale domain
    this.colorScale.domain([0, maxValue]);

    // Generate all days in the year
    const days = d3.timeDays(this.yearStart, new Date(this.year + 1, 0, 1));

    // Create calendar cells
    const cells = this.chartGroup.selectAll('.day-cell')
      .data(days, d => d3.timeFormat('%Y-%m-%d')(d));

    // Remove old cells
    cells.exit().remove();

    // Add new cells
    const cellsEnter = cells.enter()
      .append('rect')
      .attr('class', 'day-cell')
      .attr('width', this.cellSize)
      .attr('height', this.cellSize)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('stroke', '#ccc')
      .attr('stroke-width', 0.5);

    // Merge and update all cells
    const cellsUpdate = cellsEnter.merge(cells)
      .attr('x', d => this.xScale(d))
      .attr('y', d => this.yScale(d))
      .attr('fill', d => {
        const dateStr = d3.timeFormat('%Y-%m-%d')(d);
        const value = this.dataMap.get(dateStr) || 0;
        return this.colorScale(value);
      });

    // Add interactions
    if (this.options.showTooltip) {
      cellsUpdate
        .on('mouseover', (event, d) => {
          const dateStr = d3.timeFormat('%Y-%m-%d')(d);
          const value = this.dataMap.get(dateStr) || 0;
          const formattedDate = d3.timeFormat('%B %d, %Y')(d);
          
          this.showTooltip(
            `<strong>${formattedDate}</strong><br/>Value: ${value}`,
            event
          );
          
          d3.select(event.target)
            .attr('stroke', '#333')
            .attr('stroke-width', 2);
        })
        .on('mouseout', (event) => {
          this.hideTooltip();
          d3.select(event.target)
            .attr('stroke', '#ccc')
            .attr('stroke-width', 0.5);
        });
    }

    // Add animations
    if (this.options.animated) {
      cellsEnter
        .style('opacity', 0)
        .transition()
        .duration(50)
        .delay((d, i) => i * 2)
        .style('opacity', 1);
    }

    return this;
  }

  /**
   * Update the year and re-render
   */
  updateYear(year) {
    this.options.year = year;
    this.init();
    this.render();
    return this;
  }

  /**
   * Update color scheme and re-render
   */
  updateColorScheme(colorScheme) {
    this.options.colorScheme = colorScheme;
    this.setupScales();
    this.render();
    return this;
  }

  /**
   * Update data and re-render
   */
  updateData(newData) {
    this.setData(newData);
    this.render();
    return this;
  }

  /**
   * Get data for a specific date
   */
  getDataForDate(date) {
    const dateStr = d3.timeFormat('%Y-%m-%d')(date);
    return this.dataMap.get(dateStr) || 0;
  }

  /**
   * Set data for a specific date
   */
  setDataForDate(date, value) {
    const dateStr = d3.timeFormat('%Y-%m-%d')(date);
    this.dataMap.set(dateStr, value);
    
    // Update the original data array
    const existingIndex = this.data.findIndex(d => {
      const itemDate = typeof d.date === 'string' ? new Date(d.date) : d.date;
      return d3.timeFormat('%Y-%m-%d')(itemDate) === dateStr;
    });
    
    if (existingIndex >= 0) {
      this.data[existingIndex].value = value;
    } else {
      this.data.push({ date: new Date(date), value });
    }
    
    this.render();
    return this;
  }
}

export default CalendarHeatmapChart;
