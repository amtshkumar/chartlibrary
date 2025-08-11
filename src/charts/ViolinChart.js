import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * ViolinChart class for distribution visualization with smooth curves
 * Data format: [{ category: string, values: number[] }] or [{ category: string, value: number }]
 */
class ViolinChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      colorScheme: 'category10',
      animation: true,
      tooltips: true,
      showBoxPlot: true,
      showMedian: true,
      bandwidth: 0.1,
      resolution: 40,
      violinWidth: 0.8,
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
      category10: d3.schemeCategory10,
      blues: d3.schemeBlues[9],
      greens: d3.schemeGreens[9],
      oranges: d3.schemeOranges[9],
      purples: d3.schemePurples[9],
      viridis: d3.schemeViridis
    };
  }

  setupScales() {
    this.xScale = d3.scaleBand()
      .range([0, this.innerWidth])
      .padding(0.2);

    this.yScale = d3.scaleLinear()
      .range([this.innerHeight, 0]);

    this.colorScale = d3.scaleOrdinal(this.colorSchemes[this.options.colorScheme]);
  }

  processData(data) {
    if (!Array.isArray(data) || data.length === 0) return [];

    // Handle different data formats
    let processedData;
    if (data[0].values && Array.isArray(data[0].values)) {
      // Format: [{ category: string, values: number[] }]
      processedData = data;
    } else {
      // Format: [{ category: string, value: number }] - group by category
      const grouped = d3.group(data, d => d.category);
      processedData = Array.from(grouped, ([category, values]) => ({
        category,
        values: values.map(d => d.value)
      }));
    }

    // Calculate statistics for each category
    return processedData.map(d => {
      const values = d.values.sort(d3.ascending);
      const q1 = d3.quantile(values, 0.25);
      const median = d3.quantile(values, 0.5);
      const q3 = d3.quantile(values, 0.75);
      const iqr = q3 - q1;
      const min = Math.max(d3.min(values), q1 - 1.5 * iqr);
      const max = Math.min(d3.max(values), q3 + 1.5 * iqr);

      // Calculate kernel density estimation
      const kde = this.kernelDensityEstimator(
        this.kernelEpanechnikov(this.options.bandwidth),
        this.yScale.ticks(this.options.resolution)
      );
      const density = kde(values);

      return {
        ...d,
        statistics: { q1, median, q3, min, max },
        density,
        maxDensity: d3.max(density, d => d[1])
      };
    });
  }

  kernelDensityEstimator(kernel, X) {
    return function(V) {
      return X.map(function(x) {
        return [x, d3.mean(V, function(v) { return kernel(x - v); })];
      });
    };
  }

  kernelEpanechnikov(k) {
    return function(v) {
      return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
  }

  render() {
    if (!this.data || !Array.isArray(this.data)) return this;

    // Clear previous render
    this.chartGroup.selectAll('*').remove();

    const processedData = this.processData(this.data);
    if (processedData.length === 0) return this;

    // Update scales
    this.xScale.domain(processedData.map(d => d.category));
    
    const allValues = processedData.flatMap(d => d.values);
    this.yScale.domain(d3.extent(allValues));

    // Calculate violin width scale
    const maxDensity = d3.max(processedData, d => d.maxDensity);
    const violinWidthScale = d3.scaleLinear()
      .domain([0, maxDensity])
      .range([0, this.xScale.bandwidth() * this.options.violinWidth / 2]);

    // Create violin groups
    const violins = this.chartGroup.selectAll('.violin')
      .data(processedData)
      .enter()
      .append('g')
      .attr('class', 'violin')
      .attr('transform', d => `translate(${this.xScale(d.category) + this.xScale.bandwidth() / 2}, 0)`);

    // Create area generator for violin shape
    const area = d3.area()
      .x0(d => -violinWidthScale(d[1]))
      .x1(d => violinWidthScale(d[1]))
      .y(d => this.yScale(d[0]))
      .curve(d3.curveBasis);

    // Add violin shapes
    const violinPaths = violins.append('path')
      .attr('class', 'violin-area')
      .attr('d', d => area(d.density))
      .attr('fill', (d, i) => this.colorScale(i))
      .attr('fill-opacity', 0.7)
      .attr('stroke', (d, i) => d3.color(this.colorScale(i)).darker(0.5))
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer');

    // Add box plots if enabled
    if (this.options.showBoxPlot) {
      this.addBoxPlots(violins, violinWidthScale);
    }

    // Add median lines if enabled
    if (this.options.showMedian) {
      violins.append('line')
        .attr('class', 'median-line')
        .attr('x1', d => -violinWidthScale(d.maxDensity) * 0.8)
        .attr('x2', d => violinWidthScale(d.maxDensity) * 0.8)
        .attr('y1', d => this.yScale(d.statistics.median))
        .attr('y2', d => this.yScale(d.statistics.median))
        .attr('stroke', '#fff')
        .attr('stroke-width', 3)
        .attr('opacity', 0.9);
    }

    // Add axes
    this.chartGroup.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.innerHeight})`)
      .call(d3.axisBottom(this.xScale));

    this.chartGroup.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(this.yScale));

    // Add interactions
    if (this.options.tooltips) {
      violinPaths
        .on('mouseover', (event, d) => {
          d3.select(event.target)
            .attr('fill-opacity', 0.9)
            .attr('stroke-width', 2);

          const stats = d.statistics;
          this.showTooltip(
            `<strong>${d.category}</strong><br/>
             Count: ${d.values.length}<br/>
             Median: ${stats.median.toFixed(2)}<br/>
             Q1: ${stats.q1.toFixed(2)}<br/>
             Q3: ${stats.q3.toFixed(2)}<br/>
             Range: ${stats.min.toFixed(2)} - ${stats.max.toFixed(2)}`,
            event
          );
        })
        .on('mouseout', (event) => {
          d3.select(event.target)
            .attr('fill-opacity', 0.7)
            .attr('stroke-width', 1.5);
          
          this.hideTooltip();
        });
    }

    // Add animations
    if (this.options.animation) {
      // Animate violin shapes growing from center
      violinPaths
        .attr('transform', 'scale(1,0)')
        .transition()
        .duration(1200)
        .delay((d, i) => i * 200)
        .ease(d3.easeElasticOut.amplitude(1).period(0.4))
        .attr('transform', 'scale(1,1)');

      // Add pulsing animation
      this.addPulsingAnimation(violinPaths);
    }

    return this;
  }

  addBoxPlots(violins, violinWidthScale) {
    const boxWidth = 8;
    const self = this;

    violins.each(function(d) {
      const violin = d3.select(this);
      const stats = d.statistics;

      // Box
      violin.append('rect')
        .attr('class', 'box')
        .attr('x', -boxWidth / 2)
        .attr('y', self.yScale(stats.q3))
        .attr('width', boxWidth)
        .attr('height', self.yScale(stats.q1) - self.yScale(stats.q3))
        .attr('fill', '#fff')
        .attr('stroke', '#333')
        .attr('stroke-width', 1.5);

      // Median line
      violin.append('line')
        .attr('class', 'median')
        .attr('x1', -boxWidth / 2)
        .attr('x2', boxWidth / 2)
        .attr('y1', self.yScale(stats.median))
        .attr('y2', self.yScale(stats.median))
        .attr('stroke', '#333')
        .attr('stroke-width', 2);

      // Whiskers
      violin.append('line')
        .attr('class', 'whisker')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', self.yScale(stats.q1))
        .attr('y2', self.yScale(stats.min))
        .attr('stroke', '#333')
        .attr('stroke-width', 1);

      violin.append('line')
        .attr('class', 'whisker')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', self.yScale(stats.q3))
        .attr('y2', self.yScale(stats.max))
        .attr('stroke', '#333')
        .attr('stroke-width', 1);

      // Whisker caps
      violin.append('line')
        .attr('class', 'whisker-cap')
        .attr('x1', -boxWidth / 4)
        .attr('x2', boxWidth / 4)
        .attr('y1', self.yScale(stats.min))
        .attr('y2', self.yScale(stats.min))
        .attr('stroke', '#333')
        .attr('stroke-width', 1);

      violin.append('line')
        .attr('class', 'whisker-cap')
        .attr('x1', -boxWidth / 4)
        .attr('x2', boxWidth / 4)
        .attr('y1', self.yScale(stats.max))
        .attr('y2', self.yScale(stats.max))
        .attr('stroke', '#333')
        .attr('stroke-width', 1);
    });
  }

  addPulsingAnimation(violinPaths) {
    const pulse = () => {
      violinPaths
        .transition()
        .duration(2000)
        .ease(d3.easeSinInOut)
        .attr('fill-opacity', 0.5)
        .transition()
        .duration(2000)
        .ease(d3.easeSinInOut)
        .attr('fill-opacity', 0.7)
        .on('end', pulse);
    };

    setTimeout(pulse, 1500);
  }

  updateColorScheme(scheme) {
    this.options.colorScheme = scheme;
    this.colorScale = d3.scaleOrdinal(this.colorSchemes[scheme]);
    return this.render();
  }

  updateBandwidth(bandwidth) {
    this.options.bandwidth = bandwidth;
    return this.render();
  }

  updateData(newData) {
    this.setData(newData);
    return this.render();
  }
}

export default ViolinChart;
