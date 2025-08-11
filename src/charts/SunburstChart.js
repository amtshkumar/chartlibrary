import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * SunburstChart class for multi-level hierarchical data visualization
 * Data format: { name: string, value?: number, children?: Array }
 */
class SunburstChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      colorScheme: 'category10',
      animation: true,
      tooltips: true,
      showLabels: true,
      arcPadding: 0.01,
      transitionDuration: 750,
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
      rainbow: d3.schemeSpectral[11]
    };
  }

  setupScales() {
    const radius = Math.min(this.innerWidth, this.innerHeight) / 2;
    this.radius = radius * 0.9;
    this.centerX = this.innerWidth / 2;
    this.centerY = this.innerHeight / 2;
    
    this.colorScale = d3.scaleOrdinal(this.colorSchemes[this.options.colorScheme]);
    
    this.partition = d3.partition()
      .size([2 * Math.PI, this.radius]);

    this.arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1)
      .padAngle(0);
  }

  // Ensure angles in [0, 2π], radii non-negative, and minimal arc thickness
  sanitizeNode(node) {
    const tau = 2 * Math.PI;
    const eps = 1e-6;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    let x0 = Number.isFinite(node.x0) ? clamp(node.x0, 0, tau) : 0;
    let x1 = Number.isFinite(node.x1) ? clamp(node.x1, 0, tau) : x0 + eps;
    if (x1 <= x0) x1 = x0 + eps;
    let y0 = Number.isFinite(node.y0) ? Math.max(0, node.y0) : 0;
    let y1 = Number.isFinite(node.y1) ? Math.max(y0 + eps, node.y1) : y0 + 1;
    y1 = Math.min(this.radius, y1);
    return { ...node, x0, x1, y0, y1 };
  }

  processData(data) {
    const root = d3.hierarchy(data)
      .sum(d => (typeof d.value === 'number' ? d.value : 0))
      .sort((a, b) => b.value - a.value);

    return this.partition(root);
  }

  render() {
    if (!this.data) return this;

    // Clear previous render
    this.chartGroup.selectAll('*').remove();

    const root = this.processData(this.data);
    const descendants = root.descendants()
      .slice(1) // Remove root
      .filter(d => (
        Number.isFinite(d.x0) && Number.isFinite(d.x1) && Number.isFinite(d.y0) && Number.isFinite(d.y1) &&
        d.x1 > d.x0 + 0.0005 && d.y1 > d.y0
      )); // Filter out invalid or tiny arcs

    // Create sunburst group
    const sunburstGroup = this.chartGroup.append('g')
      .attr('transform', `translate(${this.centerX}, ${this.centerY})`);

    // Create arcs
    const arcs = sunburstGroup.selectAll('.arc')
      .data(descendants)
      .enter()
      .append('g')
      .attr('class', 'arc');

    const paths = arcs.append('path')
      .attr('d', d => this.arc(this.sanitizeNode(d)))
      .attr('fill', (d, i) => this.colorScale(i))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .style('opacity', 0.8);

    // Add labels for larger segments
    let labels = null;
    if (this.options.showLabels) {
      labels = arcs.append('text')
        .attr('transform', d => {
          const angle = (d.x0 + d.x1) / 2;
          const radius = (d.y0 + d.y1) / 2;
          return `rotate(${(angle * 180 / Math.PI - 90)}) translate(${radius},0) rotate(${angle > Math.PI ? 180 : 0})`;
        })
        .attr('dy', '0.35em')
        .attr('text-anchor', d => (d.x0 + d.x1) / 2 > Math.PI ? 'end' : 'start')
        .style('font-size', d => Math.min(12, (d.y1 - d.y0) / 4) + 'px')
        .style('fill', '#333')
        .style('pointer-events', 'none')
        .text(d => {
          const arcLength = d.x1 - d.x0;
          const radius = d.y1 - d.y0;
          return arcLength * radius > 0.1 ? d.data.name : '';
        });
    }

    // Add center circle
    sunburstGroup.append('circle')
      .attr('r', root.children ? 0 : this.radius * 0.1)
      .attr('fill', '#f8f9fa')
      .attr('stroke', '#dee2e6')
      .attr('stroke-width', 2);

    // Add center text
    if (root.data.name) {
      sunburstGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .text(root.data.name);
    }

    // Add interactions
    if (this.options.tooltips) {
      paths
        .on('mouseover', (event, d) => {
          d3.select(event.target)
            .style('opacity', 1)
            .attr('stroke-width', 2);
          
          // Highlight path to root
          this.highlightPath(d, sunburstGroup);
          
          this.showTooltip(
            `<strong>${d.data.name}</strong><br/>
             Value: ${d.value}<br/>
             Percentage: ${((d.value / root.value) * 100).toFixed(1)}%`,
            event
          );
        })
        .on('mouseout', (event, d) => {
          d3.select(event.target)
            .style('opacity', 0.8)
            .attr('stroke-width', 1);
          
          // Remove highlights
          sunburstGroup.selectAll('.arc path')
            .style('opacity', 0.8);
          
          this.hideTooltip();
        })
        .on('click', (event, d) => {
          this.zoomToSegment(d, sunburstGroup);
        });
    }

    // Add animations
    if (this.options.animation) {
      // Animate arcs growing from center
      paths
        .style('opacity', 0)
        .transition()
        .duration(this.options.transitionDuration)
        .delay((d, i) => i * 50)
        .style('opacity', 0.8);

      // Animate labels
      if (this.options.showLabels && labels) {
        labels
          .style('opacity', 0)
          .transition()
          .duration(this.options.transitionDuration)
          .delay((d, i) => i * 50 + 500)
          .style('opacity', 1);
      }
    }

    return this;
  }

  highlightPath(d, container) {
    // Get path to root
    const pathToRoot = d.ancestors().reverse();
    
    container.selectAll('.arc path')
      .style('opacity', node => {
        return pathToRoot.includes(node) ? 1 : 0.3;
      });
  }

  zoomToSegment(d, container) {
    const transition = container.transition()
      .duration(this.options.transitionDuration);

    // Calculate new scale and translate
    const kx = (d.x1 - d.x0) ? (2 * Math.PI) / (d.x1 - d.x0) : 1;
    const ky = this.radius / d.y1;
    // Animate to new view by tweening arc parameters
    container.selectAll('.arc path')
      .transition(transition)
      .attrTween('d', node => {
        const iX0 = d3.interpolate(node.x0, Math.max(0, Math.min(2 * Math.PI, kx * (node.x0 - d.x0))));
        const iX1 = d3.interpolate(node.x1, Math.max(0, Math.min(2 * Math.PI, kx * (node.x1 - d.x0))));
        const iY0 = d3.interpolate(node.y0, ky * node.y0);
        const iY1 = d3.interpolate(node.y1, ky * node.y1);
        return t => this.arc({ ...node, x0: iX0(t), x1: iX1(t), y0: iY0(t), y1: iY1(t) });
      });
  }

  updateColorScheme(scheme) {
    this.options.colorScheme = scheme;
    this.colorScale = d3.scaleOrdinal(this.colorSchemes[scheme]);
    return this.render();
  }

  updateData(newData) {
    this.setData(newData);
    return this.render();
  }
}

export default SunburstChart;
