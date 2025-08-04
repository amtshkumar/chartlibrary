import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * ForceDirectedChart - Creates an animated force-directed network visualization
 * Features particle effects, dynamic connections, and stunning visual animations
 * Perfect for showing relationships, data flows, and network analysis
 */
class ForceDirectedChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      width: 800,
      height: 600,
      particleCount: 15,
      spiralRotations: 2,
      animationDuration: 2000,
      nodeChargeStrength: -200,
      centerChargeStrength: -800,
      linkDistance: 150,
      linkStrength: 0.3,
      collisionRadius: 15,
      showParticles: true,
      showGlowEffects: true,
      enableZoom: true,
      colors: ['#3498db', '#e74c3c', '#f39c12', '#2ecc71', '#9b59b6', '#1abc9c'],
      ...options
    };
    
    super(container, defaultOptions);
    this.simulation = null;
    this.nodes = [];
    this.links = [];
    this.particleData = [];
    
    // Initialize tooltip
    this.addTooltip();
    
    // Initialize color scale
    this.colorScale = d3.scaleOrdinal(this.options.colors);
  }

  /**
   * Process raw data into nodes and links for force simulation
   */
  processData(rawData) {
    if (!rawData?.economicSchedule) return { nodes: [], links: [] };

    const scheduleData = rawData.economicSchedule.slice(0, 8);
    const charitableDeduction = rawData.charitDeduction || 0;
    const optimalPayout = rawData.optimalPayout || 0;

    // Create nodes
    const nodes = [
      // Central hub node
      {
        id: 'center-hub',
        group: 'center',
        value: scheduleData[0]?.remainder || 1000000,
        type: 'metric',
        color: this.colorScale(0),
        fx: this.options.width / 2,
        fy: this.options.height / 2,
        label: 'CENTER'
      },
      // Year nodes
      ...scheduleData.map((d, i) => ({
        id: `year-${i + 1}`,
        group: 'years',
        value: d.remainder,
        year: i + 1,
        type: 'year',
        color: d3.interpolateViridis(i / scheduleData.length),
        label: `Y${i + 1}`
      })),
      // Metric nodes
      {
        id: 'deduction-metric',
        group: 'benefits',
        value: charitableDeduction,
        type: 'metric',
        color: this.colorScale(1),
        label: 'DEDUCT'
      },
      {
        id: 'optimal-metric',
        group: 'strategy',
        value: optimalPayout,
        type: 'comparison',
        color: this.colorScale(2),
        label: 'OPTIMAL'
      },
      {
        id: 'total-metric',
        group: 'outcomes',
        value: scheduleData.reduce((sum, d) => sum + d.distribution, 0),
        type: 'metric',
        color: this.colorScale(3),
        label: 'TOTAL'
      }
    ];

    // Create links
    const links = [
      // Connect center hub to all year nodes
      ...scheduleData.map((d, i) => ({
        source: 'center-hub',
        target: `year-${i + 1}`,
        value: d.distribution,
        type: 'distribution'
      })),
      // Connect metrics to center hub
      {
        source: 'center-hub',
        target: 'deduction-metric',
        value: charitableDeduction,
        type: 'benefit'
      },
      {
        source: 'center-hub',
        target: 'optimal-metric',
        value: optimalPayout,
        type: 'strategy'
      },
      {
        source: 'center-hub',
        target: 'total-metric',
        value: scheduleData.reduce((sum, d) => sum + d.distribution, 0),
        type: 'outcome'
      },
      // Connect sequential years
      ...scheduleData.slice(1).map((d, i) => ({
        source: `year-${i + 1}`,
        target: `year-${i + 2}`,
        value: Math.abs(d.remainder - scheduleData[i].remainder),
        type: 'progression'
      }))
    ];

    return { nodes, links };
  }

  /**
   * Create background particle effects
   */
  createBackgroundParticles() {
    if (!this.options.showParticles) return;

    const backgroundParticles = this.svg.append("g").attr("class", "background-particles");
    
    this.particleData = Array.from({ length: this.options.particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * this.options.width,
      y: Math.random() * this.options.height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.4 + 0.1
    }));

    const particles = backgroundParticles.selectAll(".particle")
      .data(this.particleData)
      .enter()
      .append("circle")
      .attr("class", "particle")
      .attr("r", d => d.size)
      .attr("fill", this.colorScale(0))
      .attr("opacity", d => d.opacity);

    this.animateParticles(particles);
  }

  /**
   * Animate background particles
   */
  animateParticles(particles) {
    const animateStep = () => {
      particles
        .transition()
        .duration(4000)
        .ease(d3.easeLinear)
        .attr("cx", d => {
          d.x += d.vx * 4;
          if (d.x < 0) d.x = this.options.width;
          if (d.x > this.options.width) d.x = 0;
          return d.x;
        })
        .attr("cy", d => {
          d.y += d.vy * 4;
          if (d.y < 0) d.y = this.options.height;
          if (d.y > this.options.height) d.y = 0;
          return d.y;
        })
        .on("end", animateStep);
    };
    animateStep();
  }

  /**
   * Create enhanced filters and gradients
   */
  createFiltersAndGradients() {
    const defs = this.svg.append("defs");
    
    if (this.options.showGlowEffects) {
      // Enhanced glow filter
      const glowFilter = defs.append("filter")
        .attr("id", "glow")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");

      glowFilter.append("feGaussianBlur")
        .attr("stdDeviation", "4")
        .attr("result", "coloredBlur");

      const feMerge = glowFilter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "coloredBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");

      // Pulsing filter for central node
      const pulseFilter = defs.append("filter")
        .attr("id", "pulse")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");

      pulseFilter.append("feGaussianBlur")
        .attr("stdDeviation", "6")
        .attr("result", "coloredBlur");

      const pulseMerge = pulseFilter.append("feMerge");
      pulseMerge.append("feMergeNode").attr("in", "coloredBlur");
      pulseMerge.append("feMergeNode").attr("in", "SourceGraphic");
    }

    // Flow gradient for links
    const flowGradient = defs.append("linearGradient")
      .attr("id", "flowGradient")
      .attr("gradientUnits", "userSpaceOnUse");

    flowGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", 0.8);

    flowGradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#06d6a0")
      .attr("stop-opacity", 1);

    flowGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#3b82f6")
      .attr("stop-opacity", 0.6);

    return defs;
  }

  /**
   * Create node gradients
   */
  createNodeGradients(defs, nodes) {
    nodes.forEach(d => {
      const gradientId = `nodeGradient-${d.id}`;
      const gradient = defs.append('radialGradient')
        .attr('id', gradientId)
        .attr('cx', '30%')
        .attr('cy', '30%')
        .attr('r', '70%');
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.color(d.color)?.brighter(0.5)?.toString() || d.color)
        .attr('stop-opacity', 0.9);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d.color)
        .attr('stop-opacity', 1);
    });
  }

  /**
   * Calculate node radius based on value
   */
  getNodeRadius(value) {
    return Math.max(15, Math.min(40, Math.sqrt(value / 10000)));
  }

  /**
   * Calculate link width based on value
   */
  getLinkWidth(value) {
    return Math.max(2, Math.sqrt(value / 30000));
  }

  /**
   * Create force simulation
   */
  createSimulation(nodes, links) {
    return d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .distance(d => Math.max(50, this.options.linkDistance - (d.value / 10000)))
        .strength(this.options.linkStrength)
      )
      .force('charge', d3.forceManyBody()
        .strength(d => d.id === 'center-hub' ? this.options.centerChargeStrength : this.options.nodeChargeStrength)
      )
      .force('center', d3.forceCenter(this.options.width / 2, this.options.height / 2))
      .force('collision', d3.forceCollide()
        .radius(d => Math.max(this.options.collisionRadius, this.getNodeRadius(d.value)))
      );
  }

  /**
   * Create and animate links
   */
  createLinks(container, links) {
    const linkGroup = container.append("g").attr("class", "links");
    
    const linkElements = linkGroup.selectAll('.link')
      .data(links)
      .enter()
      .append('g')
      .attr('class', 'link-group');

    // Main link paths
    const linkPaths = linkElements.append('path')
      .attr('class', 'link')
      .attr('stroke', 'url(#flowGradient)')
      .attr('stroke-width', d => this.getLinkWidth(d.value))
      .attr('stroke-opacity', 0.7)
      .attr('stroke-linecap', 'round')
      .attr('fill', 'none')
      .attr('filter', this.options.showGlowEffects ? 'url(#glow)' : null);

    // Animated flow particles on links
    if (this.options.showParticles) {
      const flowParticles = linkElements.selectAll('.flow-particle')
        .data(d => Array.from({ length: Math.max(1, Math.floor(d.value / 100000)) }, (_, i) => ({ ...d, particleId: i })))
        .enter()
        .append('circle')
        .attr('class', 'flow-particle')
        .attr('r', 3)
        .attr('fill', '#06d6a0')
        .attr('opacity', 0.8)
        .attr('filter', this.options.showGlowEffects ? 'url(#glow)' : null);

      this.animateFlowParticles(flowParticles);
    }

    return { linkPaths, linkElements };
  }

  /**
   * Animate flow particles along paths
   */
  animateFlowParticles(flowParticles) {
    const animateStep = () => {
      flowParticles
        .transition()
        .duration(d => 2000 + Math.random() * 1000)
        .ease(d3.easeLinear)
        .attrTween('transform', function(d) {
          const path = this.parentNode?.querySelector('.link');
          if (!path) return () => '';
          try {
            const pathLength = path.getTotalLength();
            return function(t) {
              const point = path.getPointAtLength(t * pathLength);
              return `translate(${point.x}, ${point.y})`;
            };
          } catch {
            return () => '';
          }
        })
        .attr('opacity', d => 0.8 * Math.sin(Math.PI * d.particleId / 3))
        .on('end', function() {
          d3.select(this)
            .attr('opacity', 0)
            .transition()
            .duration(100)
            .attr('opacity', 0.8)
            .on('end', () => setTimeout(animateStep, Math.random() * 500));
        });
    };
    
    setTimeout(animateStep, 1500);
  }

  /**
   * Create and animate nodes
   */
  createNodes(container, nodes, defs) {
    const nodeGroup = container.append("g").attr("class", "nodes");
    
    const node = nodeGroup.selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'grab');

    // Outer glow rings for nodes
    if (this.options.showGlowEffects) {
      const glowRings = node.append('circle')
        .attr('class', 'glow-ring')
        .attr('r', d => this.getNodeRadius(d.value) * 1.3)
        .attr('fill', 'none')
        .attr('stroke', d => d.color)
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.3)
        .attr('filter', 'url(#glow)');

      this.animateGlowRings(glowRings);
    }

    // Main node circles
    const circles = node.append('circle')
      .attr('class', 'main-circle')
      .attr('r', d => this.getNodeRadius(d.value))
      .attr('fill', d => `url(#nodeGradient-${d.id})`)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 3)
      .attr('opacity', 0.95)
      .attr('filter', d => {
        if (!this.options.showGlowEffects) return null;
        return d.id === 'center-hub' ? 'url(#pulse)' : 'url(#glow)';
      });

    // Add node labels
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", d => d.id === 'center-hub' ? "14px" : "10px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .attr("stroke", "rgba(0,0,0,0.5)")
      .attr("stroke-width", 0.5)
      .text(d => d.label)
      .style("opacity", 0)
      .transition()
      .delay((d, i) => i * 150 + 300)
      .duration(400)
      .style("opacity", 1);

    // Animate central node
    this.animateCentralNode(circles);

    return { node, circles };
  }

  /**
   * Animate central node pulsing
   */
  animateCentralNode(circles) {
    const centralNode = circles.filter(d => d.id === 'center-hub');
    
    const pulse = () => {
      centralNode
        .transition()
        .duration(2000)
        .ease(d3.easeSinInOut)
        .attr('r', d => this.getNodeRadius(d.value) * 1.2)
        .transition()
        .duration(2000)
        .ease(d3.easeSinInOut)
        .attr('r', d => this.getNodeRadius(d.value))
        .on('end', pulse);
    };
    
    pulse();
  }

  /**
   * Animate glow rings
   */
  animateGlowRings(glowRings) {
    const breathe = () => {
      glowRings
        .transition()
        .duration(3000)
        .ease(d3.easeSinInOut)
        .attr('stroke-opacity', 0.6)
        .attr('r', d => this.getNodeRadius(d.value) * 1.4)
        .transition()
        .duration(3000)
        .ease(d3.easeSinInOut)
        .attr('stroke-opacity', 0.3)
        .attr('r', d => this.getNodeRadius(d.value) * 1.3)
        .on('end', breathe);
    };
    
    breathe();
  }

  /**
   * Add hover interactions
   */
  addInteractions(node, linkPaths) {
    node
      .on('mouseover', (event, d) => {
        // Highlight connected links
        linkPaths
          .style('stroke-opacity', l => 
            l.source.id === d.id || l.target.id === d.id ? 1 : 0.2
          )
          .style('stroke-width', l => 
            l.source.id === d.id || l.target.id === d.id 
              ? this.getLinkWidth(l.value) * 1.5 
              : this.getLinkWidth(l.value)
          );

        this.showTooltip(event, d);
      })
      .on('mouseout', (event, d) => {
        // Reset link styles
        linkPaths
          .style('stroke-opacity', 0.7)
          .style('stroke-width', d => this.getLinkWidth(d.value));

        this.hideTooltip();
      });
  }

  /**
   * Add zoom functionality
   */
  addZoom(container) {
    if (!this.options.enableZoom) return;

    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    this.svg.call(zoom);
  }

  /**
   * Create legend
   */
  createLegend() {
    const legend = this.svg.append("g")
      .attr("transform", "translate(20, 20)");

    legend.append("rect")
      .attr("width", 160)
      .attr("height", 120)
      .attr("fill", "rgba(255,255,255,0.9)")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1)
      .attr("rx", 8);

    const legendItems = [
      { label: "Center Hub", color: this.colorScale(0), type: "circle" },
      { label: "Time Nodes", color: "#8b5cf6", type: "circle" },
      { label: "Metrics", color: this.colorScale(1), type: "circle" },
      { label: "Flow Connections", color: "#10b981", type: "line" }
    ];

    legendItems.forEach((item, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(10, ${20 + i * 22})`);

      if (item.type === "circle") {
        legendItem.append("circle")
          .attr("cx", 8)
          .attr("cy", 0)
          .attr("r", 6)
          .attr("fill", item.color);
      } else {
        legendItem.append("line")
          .attr("x1", 2)
          .attr("y1", 0)
          .attr("x2", 14)
          .attr("y2", 0)
          .attr("stroke", item.color)
          .attr("stroke-width", 3);
      }

      legendItem.append("text")
        .attr("x", 20)
        .attr("y", 4)
        .attr("font-size", "11px")
        .attr("fill", "#1e293b")
        .text(item.label);
    });
  }

  /**
   * Main render method
   */
  render() {
    if (!this.data) return this;

    // Clear existing content
    this.svg.selectAll('*').remove();
    
    // Process data
    const { nodes, links } = this.processData(this.data);
    this.nodes = nodes;
    this.links = links;

    // Create background particles
    this.createBackgroundParticles();

    // Create filters and gradients
    const defs = this.createFiltersAndGradients();
    this.createNodeGradients(defs, nodes);

    // Create container group
    const container = this.svg.append("g");

    // Add zoom
    this.addZoom(container);

    // Create simulation
    this.simulation = this.createSimulation(nodes, links);

    // Create links
    const { linkPaths } = this.createLinks(container, links);

    // Create nodes
    const { node } = this.createNodes(container, nodes, defs);

    // Add interactions
    this.addInteractions(node, linkPaths);

    // Update positions on simulation tick
    this.simulation.on('tick', () => {
      // Update curved link paths
      linkPaths.attr('d', d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 0.3;
        
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Create legend
    this.createLegend();

    return this;
  }

  /**
   * Update chart with new data
   */
  update(newData) {
    this.setData(newData);
    return this.render();
  }

  /**
   * Destroy simulation and cleanup
   */
  destroy() {
    if (this.simulation) {
      this.simulation.stop();
      this.simulation = null;
    }
    super.destroy();
  }
}

export default ForceDirectedChart;
