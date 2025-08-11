import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * WaterfallChart class for showing cumulative effects of sequential positive/negative values
 * Data format: [{ label: string, value: number, type?: 'positive'|'negative'|'total' }]
 */
class WaterfallChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      colorScheme: 'default',
      animation: true,
      tooltips: true,
      showConnectors: true,
      showValues: true,
      ...options
    };

    super(container, defaultOptions);
    this.setupColorSchemes();
    this.setupScales();
    
    if (this.options.tooltips) {
      this.addTooltip();
    }
  }

  setupColorSchemes() {
    this.colorSchemes = {
      default: {
        positive: '#4caf50',
        negative: '#f44336',
        total: '#2196f3',
        connector: '#999'
      },
      business: {
        positive: '#00c853',
        negative: '#d32f2f',
        total: '#1976d2',
        connector: '#666'
      },
      muted: {
        positive: '#81c784',
        negative: '#e57373',
        total: '#64b5f6',
        connector: '#bbb'
      }
    };
  }

  setupScales() {
    this.xScale = d3.scaleBand()
      .range([0, this.innerWidth])
      .padding(0.2);

    this.yScale = d3.scaleLinear()
      .range([this.innerHeight, 0]);
  }

  processData(data) {
    let cumulativeValue = 0;
    const processedData = [];

    data.forEach((d, i) => {
      const item = {
        ...d,
        index: i,
        startValue: cumulativeValue,
        endValue: cumulativeValue + d.value,
        type: d.type || (d.value >= 0 ? 'positive' : 'negative')
      };

      if (item.type !== 'total') {
        cumulativeValue += d.value;
      } else {
        item.startValue = 0;
        item.endValue = d.value;
        cumulativeValue = d.value;
      }

      processedData.push(item);
    });

    return processedData;
  }

  render() {
    if (!this.data || !Array.isArray(this.data)) return this;

    // Clear previous render
    this.chartGroup.selectAll('*').remove();

    const processedData = this.processData(this.data);
    const colors = this.colorSchemes[this.options.colorScheme];

    // Update scales
    this.xScale.domain(processedData.map(d => d.label));
    
    const allValues = processedData.flatMap(d => [d.startValue, d.endValue]);
    const yExtent = d3.extent(allValues);
    this.yScale.domain([
      Math.min(0, yExtent[0] * 1.1),
      Math.max(0, yExtent[1] * 1.1)
    ]);

    // Add axes
    this.chartGroup.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.yScale(0)})`)
      .call(d3.axisBottom(this.xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    this.chartGroup.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(this.yScale));

    // Add zero line
    this.chartGroup.append('line')
      .attr('x1', 0)
      .attr('x2', this.innerWidth)
      .attr('y1', this.yScale(0))
      .attr('y2', this.yScale(0))
      .attr('stroke', '#333')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    // Add connectors
    if (this.options.showConnectors) {
      const connectors = this.chartGroup.selectAll('.connector')
        .data(processedData.slice(0, -1))
        .enter()
        .append('line')
        .attr('class', 'connector')
        .attr('x1', d => this.xScale(d.label) + this.xScale.bandwidth())
        .attr('x2', (d, i) => this.xScale(processedData[i + 1].label))
        .attr('y1', d => this.yScale(d.endValue))
        .attr('y2', (d, i) => this.yScale(processedData[i + 1].startValue))
        .attr('stroke', colors.connector)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2');

      if (this.options.animation) {
        connectors
          .attr('stroke-dashoffset', 100)
          .transition()
          .duration(1000)
          .delay((d, i) => i * 200)
          .attr('stroke-dashoffset', 0);
      }
    }

    // Add bars
    const bars = this.chartGroup.selectAll('.bar')
      .data(processedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => this.xScale(d.label))
      .attr('width', this.xScale.bandwidth())
      .attr('y', d => this.yScale(Math.max(d.startValue, d.endValue)))
      .attr('height', d => Math.abs(this.yScale(d.startValue) - this.yScale(d.endValue)))
      .attr('fill', d => colors[d.type])
      .attr('stroke', d => d3.color(colors[d.type]).darker(0.3))
      .attr('stroke-width', 1)
      .style('cursor', 'pointer');

    // Add value labels
    if (this.options.showValues) {
      this.chartGroup.selectAll('.value-label')
        .data(processedData)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', d => this.xScale(d.label) + this.xScale.bandwidth() / 2)
        .attr('y', d => {
          const barTop = this.yScale(Math.max(d.startValue, d.endValue));
          return barTop - 5;
        })
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .text(d => d.value > 0 ? `+${d.value}` : d.value);
    }

    // Add interactions
    if (this.options.tooltips) {
      bars
        .on('mouseover', (event, d) => {
          d3.select(event.target).style('opacity', 0.8);
          const changeText = d.type === 'total' ? 'Total' : 
            (d.value >= 0 ? `+${d.value}` : `${d.value}`);
          this.showTooltip(
            `<strong>${d.label}</strong><br/>
             Change: ${changeText}<br/>
             Running Total: ${d.endValue}`,
            event
          );
        })
        .on('mouseout', (event) => {
          d3.select(event.target).style('opacity', 1);
          this.hideTooltip();
        });
    }

    // Add animations
    if (this.options.animation) {
      bars
        .attr('height', 0)
        .attr('y', this.yScale(0))
        .transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .attr('y', d => this.yScale(Math.max(d.startValue, d.endValue)))
        .attr('height', d => Math.abs(this.yScale(d.startValue) - this.yScale(d.endValue)));
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

export default WaterfallChart;
