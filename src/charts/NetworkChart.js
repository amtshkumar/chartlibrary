import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * NetworkChart class for interactive node-link diagrams with force simulations
 * Data format: { nodes: [{ id: string, group?: number, value?: number }], links: [{ source: string, target: string, value?: number }] }
 */
class NetworkChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      colorScheme: 'category10',
      animation: true,
      tooltips: true,
      showLabels: true,
      nodeRadius: 8,
      linkStrength: 0.1,
      chargeStrength: -300,
      centerForce: 0.1,
      collisionRadius: 12,
      ...options
    };

    super(container, defaultOptions);
    this.setupColorSchemes();
    this.setupScales();
    this.simulation = null;
    
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
    this.colorScale = d3.scaleOrdinal(this.colorSchemes[this.options.colorScheme]);
    this.radiusScale = d3.scaleSqrt()
      .domain([1, 100])
      .range([this.options.nodeRadius / 2, this.options.nodeRadius * 2]);
  }

  processData(data) {
    if (!data || !data.nodes || !data.links) return { nodes: [], links: [] };

    // Clone data to avoid mutations
    const nodes = data.nodes.map(d => ({ ...d }));
    const links = data.links.map(d => ({ ...d }));

    // Calculate node degrees for sizing
    const nodeDegrees = new Map();
    links.forEach(link => {
      nodeDegrees.set(link.source, (nodeDegrees.get(link.source) || 0) + 1);
      nodeDegrees.set(link.target, (nodeDegrees.get(link.target) || 0) + 1);
    });

    // Add degree information to nodes
    nodes.forEach(node => {
      node.degree = nodeDegrees.get(node.id) || 0;
      node.radius = this.radiusScale(node.value || node.degree || 1);
    });

    return { nodes, links };
  }

  render() {
    if (!this.data) return this;

    // Clear previous render
    this.chartGroup.selectAll('*').remove();

    const { nodes, links } = this.processData(this.data);
    if (nodes.length === 0) return this;

    // Create simulation
    this.simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .strength(this.options.linkStrength)
        .distance(d => 30 + (d.source.radius + d.target.radius)))
      .force('charge', d3.forceManyBody()
        .strength(this.options.chargeStrength))
      .force('center', d3.forceCenter(this.innerWidth / 2, this.innerHeight / 2)
        .strength(this.options.centerForce))
      .force('collision', d3.forceCollide()
        .radius(d => d.radius + this.options.collisionRadius));

    // Add container for zoom/pan
    const container = this.chartGroup.append('g')
      .attr('class', 'network-container');

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    this.svg.call(zoom);

    // Create links
    const linkElements = container.selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.value || 1));

    // Create nodes
    const nodeElements = container.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(this.createDragBehavior());

    // Add node circles with gradients
    const defs = this.svg.append('defs');
    nodes.forEach((node, i) => {
      const gradient = defs.append('radialGradient')
        .attr('id', `node-gradient-${i}`)
        .attr('cx', '30%')
        .attr('cy', '30%');

      const color = this.colorScale(node.group || 0);
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.color(color).brighter(0.5));
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', color);
    });

    const circles = nodeElements.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', (d, i) => `url(#node-gradient-${i})`)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add node labels
    if (this.options.showLabels) {
      const labels = nodeElements.append('text')
        .attr('class', 'node-label')
        .attr('dy', d => d.radius + 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', '#333')
        .style('pointer-events', 'none')
        .text(d => d.id);
    }

    // Add interactions
    if (this.options.tooltips) {
      nodeElements
        .on('mouseover', (event, d) => {
          // Highlight connected nodes and links
          this.highlightConnections(d, nodeElements, linkElements);
          
          this.showTooltip(
            `<strong>${d.id}</strong><br/>
             Group: ${d.group || 'N/A'}<br/>
             Connections: ${d.degree}<br/>
             Value: ${d.value || 'N/A'}`,
            event
          );
        })
        .on('mouseout', (event, d) => {
          // Reset highlights
          this.resetHighlights(nodeElements, linkElements);
          this.hideTooltip();
        })
        .on('click', (event, d) => {
          // Pin/unpin node
          d.fx = d.fx ? null : d.x;
          d.fy = d.fy ? null : d.y;
          this.simulation.alpha(0.3).restart();
        });
    }

    // Update positions on simulation tick
    this.simulation.on('tick', () => {
      linkElements
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodeElements
        .attr('transform', d => `translate(${d.x}, ${d.y})`);
    });

    // Add animations
    if (this.options.animation) {
      // Animate nodes appearing
      circles
        .attr('r', 0)
        .transition()
        .duration(800)
        .delay((d, i) => i * 50)
        .ease(d3.easeElasticOut.amplitude(1).period(0.3))
        .attr('r', d => d.radius);

      // Animate links appearing
      linkElements
        .attr('stroke-opacity', 0)
        .transition()
        .duration(1000)
        .delay(500)
        .attr('stroke-opacity', 0.6);

      // Add floating animation
      this.addFloatingAnimation(circles);
    }

    return this;
  }

  createDragBehavior() {
    return d3.drag()
      .on('start', (event, d) => {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) this.simulation.alphaTarget(0);
        // Keep node pinned if it was clicked
        if (!d.pinned) {
          d.fx = null;
          d.fy = null;
        }
      });
  }

  highlightConnections(selectedNode, nodeElements, linkElements) {
    // Get connected node IDs
    const connectedNodes = new Set();
    connectedNodes.add(selectedNode.id);

    linkElements
      .style('stroke-opacity', d => {
        if (d.source.id === selectedNode.id || d.target.id === selectedNode.id) {
          connectedNodes.add(d.source.id);
          connectedNodes.add(d.target.id);
          return 1;
        }
        return 0.1;
      })
      .style('stroke-width', d => {
        return (d.source.id === selectedNode.id || d.target.id === selectedNode.id) 
          ? Math.sqrt(d.value || 1) * 2 : Math.sqrt(d.value || 1);
      });

    nodeElements
      .style('opacity', d => connectedNodes.has(d.id) ? 1 : 0.3);
  }

  resetHighlights(nodeElements, linkElements) {
    linkElements
      .style('stroke-opacity', 0.6)
      .style('stroke-width', d => Math.sqrt(d.value || 1));

    nodeElements
      .style('opacity', 1);
  }

  addFloatingAnimation(circles) {
    const float = () => {
      circles
        .transition()
        .duration(2000 + Math.random() * 1000)
        .ease(d3.easeSinInOut)
        .attr('r', d => d.radius * (0.9 + Math.random() * 0.2))
        .transition()
        .duration(2000 + Math.random() * 1000)
        .ease(d3.easeSinInOut)
        .attr('r', d => d.radius)
        .on('end', float);
    };

    setTimeout(float, 1000);
  }

  updateColorScheme(scheme) {
    this.options.colorScheme = scheme;
    this.colorScale = d3.scaleOrdinal(this.colorSchemes[scheme]);
    return this.render();
  }

  updateForces(forces) {
    if (this.simulation) {
      Object.entries(forces).forEach(([key, value]) => {
        if (key === 'linkStrength') {
          this.simulation.force('link').strength(value);
        } else if (key === 'chargeStrength') {
          this.simulation.force('charge').strength(value);
        } else if (key === 'centerForce') {
          this.simulation.force('center').strength(value);
        }
      });
      this.simulation.alpha(0.3).restart();
    }
    return this;
  }

  updateData(newData) {
    if (this.simulation) {
      this.simulation.stop();
    }
    this.setData(newData);
    return this.render();
  }

  destroy() {
    if (this.simulation) {
      this.simulation.stop();
    }
    super.destroy();
  }
}

export default NetworkChart;
