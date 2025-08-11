import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * StreamChart class for flowing stacked area visualization
 * Data format: [{ date: Date, [category]: number, ... }]
 */
class StreamChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      colorScheme: 'category10',
      animation: true,
      tooltips: true,
      legend: true,
      curve: 'cardinal',
      offset: 'wiggle',
      transitionDuration: 1500,
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
      spectral: d3.schemeSpectral[11]
    };
  }

  setupScales() {
    this.xScale = d3.scaleTime().range([0, this.innerWidth]);
    this.yScale = d3.scaleLinear().range([this.innerHeight, 0]);
    this.colorScale = d3.scaleOrdinal(this.colorSchemes[this.options.colorScheme]);
  }

  processData(data) {
    if (!Array.isArray(data) || data.length === 0) return { series: [], keys: [] };

    // Extract keys (categories) excluding date
    const keys = Object.keys(data[0]).filter(key => key !== 'date');
    
    // Create stack generator
    const stack = d3.stack()
      .keys(keys)
      .offset(this.getOffsetFunction())
      .order(d3.stackOrderNone);

    const series = stack(data);

    // Update scales
    this.xScale.domain(d3.extent(data, d => d.date));
    
    // For stream charts, y-scale should be symmetric around 0
    const yExtent = d3.extent(series.flat(2));
    const maxAbs = Math.max(Math.abs(yExtent[0]), Math.abs(yExtent[1]));
    this.yScale.domain([-maxAbs, maxAbs]);

    return { series, keys };
  }

  getOffsetFunction() {
    const offsets = {
      wiggle: d3.stackOffsetWiggle,
      silhouette: d3.stackOffsetSilhouette,
      expand: d3.stackOffsetExpand,
      none: d3.stackOffsetNone
    };
    return offsets[this.options.offset] || d3.stackOffsetWiggle;
  }

  getCurveFunction() {
    const curves = {
      linear: d3.curveLinear,
      cardinal: d3.curveCardinal,
      catmullRom: d3.curveCatmullRom,
      monotone: d3.curveMonotoneX,
      basis: d3.curveBasis,
      bundle: d3.curveBundle
    };
    return curves[this.options.curve] || d3.curveCardinal;
  }

  render() {
    if (!this.data || !Array.isArray(this.data)) return this;

    // Clear previous render
    this.chartGroup.selectAll('*').remove();

    const { series, keys } = this.processData(this.data);
    if (series.length === 0) return this;

    // Create area generator
    const area = d3.area()
      .x(d => this.xScale(d.data.date))
      .y0(d => this.yScale(d[0]))
      .y1(d => this.yScale(d[1]))
      .curve(this.getCurveFunction());

    // Create line generator for borders
    const line = d3.line()
      .x(d => this.xScale(d.data.date))
      .y(d => this.yScale(d[1]))
      .curve(this.getCurveFunction());

    // Add gradient definitions
    const defs = this.svg.append('defs');
    series.forEach((s, i) => {
      const gradient = defs.append('linearGradient')
        .attr('id', `stream-gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0).attr('y1', this.yScale.range()[0])
        .attr('x2', 0).attr('y2', this.yScale.range()[1]);

      const color = this.colorScale(i);
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', color)
        .attr('stop-opacity', 0.8);
      
      gradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', color)
        .attr('stop-opacity', 0.6);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', color)
        .attr('stop-opacity', 0.8);
    });

    // Create stream layers
    const layers = this.chartGroup.selectAll('.layer')
      .data(series)
      .enter()
      .append('g')
      .attr('class', 'layer');

    // Add areas
    const areas = layers.append('path')
      .attr('class', 'area')
      .attr('d', area)
      .attr('fill', (d, i) => `url(#stream-gradient-${i})`)
      .attr('stroke', 'none')
      .style('cursor', 'pointer');

    // Add border lines
    const borders = layers.append('path')
      .attr('class', 'border')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', (d, i) => d3.color(this.colorScale(i)).darker(0.5))
      .attr('stroke-width', 1)
      .attr('opacity', 0.7);

    // Add axes
    this.chartGroup.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.yScale(0)})`)
      .call(d3.axisBottom(this.xScale)
        .tickFormat(d3.timeFormat('%Y-%m')));

    this.chartGroup.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(this.yScale));

    // Add interactions
    if (this.options.tooltips) {
      layers
        .on('mouseover', (event, d) => {
          const layerIndex = series.indexOf(d);
          const category = keys[layerIndex];
          
          // Highlight current layer
          d3.select(event.currentTarget).select('.area')
            .attr('opacity', 1);
          
          // Fade other layers
          layers.filter(data => data !== d)
            .select('.area')
            .attr('opacity', 0.3);

          // Find closest data point
          const [mouseX] = d3.pointer(event, this.chartGroup.node());
          const date = this.xScale.invert(mouseX);
          const bisect = d3.bisector(d => d.date).left;
          const index = bisect(this.data, date, 1);
          const dataPoint = this.data[index - 1] || this.data[index];
          
          if (dataPoint) {
            this.showTooltip(
              `<strong>${category}</strong><br/>
               Date: ${d3.timeFormat('%Y-%m-%d')(dataPoint.date)}<br/>
               Value: ${dataPoint[category] || 0}`,
              event
            );
          }
        })
        .on('mouseout', (event) => {
          // Reset all layers
          layers.select('.area').attr('opacity', 1);
          this.hideTooltip();
        });
    }

    // Add legend
    if (this.options.legend && keys.length > 1) {
      const legendItems = keys.map((key, i) => ({
        label: key,
        color: this.colorScale(i)
      }));
      this.addLegend(legendItems);
    }

    // Add animations
    if (this.options.animation) {
      // Animate areas with wave effect
      areas
        .attr('opacity', 0)
        .attr('transform', 'scale(1,0)')
        .transition()
        .duration(this.options.transitionDuration)
        .delay((d, i) => i * 200)
        .ease(d3.easeElasticOut.amplitude(1).period(0.3))
        .attr('opacity', 1)
        .attr('transform', 'scale(1,1)');

      // Animate borders
      borders
        .attr('stroke-dasharray', function() {
          return this.getTotalLength();
        })
        .attr('stroke-dashoffset', function() {
          return this.getTotalLength();
        })
        .transition()
        .duration(this.options.transitionDuration)
        .delay((d, i) => i * 200 + 500)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);

      // Add flowing animation
      this.addFlowingAnimation(areas);
    }

    return this;
  }

  addFlowingAnimation(areas) {
    // Create flowing gradient animation
    areas.each(function(d, i) {
      const area = d3.select(this);
      const gradientId = `stream-gradient-${i}`;
      
      // Animate gradient position
      const animate = () => {
        const gradient = d3.select(`#${gradientId}`);
        gradient.selectAll('stop')
          .transition()
          .duration(3000)
          .ease(d3.easeSinInOut)
          .attr('stop-opacity', (d, j) => {
            const base = j === 1 ? 0.6 : 0.8;
            return base + Math.sin(Date.now() * 0.001 + i + j) * 0.2;
          })
          .on('end', animate);
      };
      
      setTimeout(animate, i * 500);
    });
  }

  updateColorScheme(scheme) {
    this.options.colorScheme = scheme;
    this.colorScale = d3.scaleOrdinal(this.colorSchemes[scheme]);
    return this.render();
  }

  updateOffset(offset) {
    this.options.offset = offset;
    return this.render();
  }

  updateCurve(curve) {
    this.options.curve = curve;
    return this.render();
  }

  updateData(newData) {
    this.setData(newData);
    return this.render();
  }
}

export default StreamChart;
