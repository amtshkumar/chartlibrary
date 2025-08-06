import * as d3 from 'd3';
import BaseChart from './BaseChart.js';

/**
 * RadialStackedBarChart class for creating radial stacked bar visualizations
 * Perfect for trust and financial data visualization with animated effects
 */
class RadialStackedBarChart extends BaseChart {
  constructor(container, options = {}) {
    const defaultOptions = {
      width: 600,
      height: 600,
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
      colorScheme: 'blue', // 'blue', 'orange', 'green'
      animated: true,
      innerRadiusRatio: 0.3,
      ringPadding: 0.02,
      showLegend: true,
      showTooltip: true,
      showCenterLabel: true,
      backgroundColor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      ...options
    };

    // Initialize color schemes before calling super() since init() will be called
    const colorSchemes = {
      blue: {
        categoryA: '#4f46e5', // Deep indigo
        categoryB: '#7c3aed', // Rich purple
        categoryC: '#06b6d4', // Bright cyan
        gradient: 'from-indigo-500 via-purple-500 to-cyan-500',
        glow: '#8b5cf6'
      },
      orange: {
        categoryA: '#f59e0b', // Warm amber
        categoryB: '#ea580c', // Vibrant orange
        categoryC: '#eab308', // Golden yellow
        gradient: 'from-amber-400 via-orange-500 to-yellow-500',
        glow: '#f97316'
      },
      green: {
        categoryA: '#10b981', // Emerald green
        categoryB: '#059669', // Deep emerald
        categoryC: '#34d399', // Light emerald
        gradient: 'from-emerald-400 via-green-500 to-teal-500',
        glow: '#22c55e'
      }
    };

    super(container, defaultOptions);
    
    this.selectedYear = null;
    this.animationPhase = 0;
    this.colorSchemes = colorSchemes;
    
    if (this.options.showTooltip) {
      this.addTooltip();
    }
  }

  /**
   * Initialize the chart with enhanced SVG setup
   */
  init() {
    // Ensure colorSchemes is available
    if (!this.colorSchemes) {
      this.colorSchemes = {
        blue: {
          categoryA: '#4f46e5', // Deep indigo
          categoryB: '#7c3aed', // Rich purple
          categoryC: '#06b6d4', // Bright cyan
          gradient: 'from-indigo-500 via-purple-500 to-cyan-500',
          glow: '#8b5cf6'
        },
        orange: {
          categoryA: '#f59e0b', // Warm amber
          categoryB: '#ea580c', // Vibrant orange
          categoryC: '#eab308', // Golden yellow
          gradient: 'from-amber-400 via-orange-500 to-yellow-500',
          glow: '#f97316'
        },
        green: {
          categoryA: '#10b981', // Emerald green
          categoryB: '#059669', // Deep emerald
          categoryC: '#34d399', // Light emerald
          gradient: 'from-emerald-400 via-green-500 to-teal-500',
          glow: '#22c55e'
        }
      };
    }
    
    // Clear existing content
    d3.select(this.container).selectAll('*').remove();
    
    // Create main container with background
    const container = d3.select(this.container)
      .style('position', 'relative')
      .style('background', this.options.backgroundColor)
      .style('border-radius', '12px')
      .style('overflow', 'hidden')
      .style('box-shadow', '0 10px 25px rgba(0,0,0,0.1)');
    
    // Create SVG
    this.svg = container
      .append('svg')
      .attr('width', this.options.width)
      .attr('height', this.options.height)
      .style('display', 'block');
    
    // Calculate center and radius
    this.centerX = this.options.width / 2;
    this.centerY = this.options.height / 2;
    this.outerRadius = Math.min(this.options.width, this.options.height) / 2 - 40;
    this.innerRadius = this.outerRadius * this.options.innerRadiusRatio;
    
    // Create main group
    this.chartGroup = this.svg.append('g')
      .attr('transform', `translate(${this.centerX},${this.centerY})`);
    
    // Setup filters and gradients
    this.setupFiltersAndGradients();
    
    // Add legend if enabled
    if (this.options.showLegend) {
      this.addLegendContainer();
    }
    
    // Add instructions
    this.addInstructions();
  }

  /**
   * Setup SVG filters and gradients for enhanced visuals
   */
  setupFiltersAndGradients() {
    const defs = this.svg.append('defs');
    
    // Enhanced magical glow filters
    const glowFilter = defs.append('filter')
      .attr('id', 'radial-glow')
      .attr('x', '-100%')
      .attr('y', '-100%')
      .attr('width', '300%')
      .attr('height', '300%');
    
    // Multiple glow layers for depth
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'glow1');
    
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '8')
      .attr('result', 'glow2');
    
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'glow2');
    feMerge.append('feMergeNode').attr('in', 'glow1');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Pulsing glow filter
    const pulseFilter = defs.append('filter')
      .attr('id', 'pulse-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    
    const pulseBlur = pulseFilter.append('feGaussianBlur')
      .attr('stdDeviation', '6')
      .attr('result', 'pulseBlur');
    
    // Animate the blur intensity
    pulseBlur.append('animate')
      .attr('attributeName', 'stdDeviation')
      .attr('values', '6;12;6')
      .attr('dur', '3s')
      .attr('repeatCount', 'indefinite');
    
    const pulseMerge = pulseFilter.append('feMerge');
    pulseMerge.append('feMergeNode').attr('in', 'pulseBlur');
    pulseMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Create radial gradients for each component
    const colors = this.colorSchemes[this.options.colorScheme];
    Object.entries(colors).forEach(([component, color]) => {
      if (component !== 'gradient' && component !== 'glow') {
        const gradient = defs.append('radialGradient')
          .attr('id', `radial-gradient-${component}`)
          .attr('cx', '50%')
          .attr('cy', '50%')
          .attr('r', '50%');
        
        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', d3.color(color)?.brighter(0.3)?.toString() || color)
          .attr('stop-opacity', 0.9);
        
        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', color)
          .attr('stop-opacity', 0.8);
      }
    });
  }

  /**
   * Add legend container
   */
  addLegendContainer() {
    const colors = this.colorSchemes[this.options.colorScheme];
    const legendContainer = d3.select(this.container)
      .append('div')
      .style('position', 'absolute')
      .style('top', '24px')
      .style('right', '24px')
      .style('background', 'rgba(255,255,255,0.9)')
      .style('backdrop-filter', 'blur(10px)')
      .style('border-radius', '12px')
      .style('padding', '16px')
      .style('box-shadow', '0 4px 12px rgba(0,0,0,0.1)')
      .style('border', '1px solid rgba(226,232,240,0.8)');

    legendContainer.append('div')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('margin-bottom', '12px')
      .style('color', '#475569')
      .text('Components');

    const legendItems = legendContainer.append('div')
      .style('display', 'flex')
      .style('flex-direction', 'column')
      .style('gap', '8px');

    Object.entries(colors).forEach(([component, color]) => {
      if (component === 'gradient' || component === 'glow') return;
      
      const item = legendItems.append('div')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('gap', '12px')
        .style('font-size', '12px');

      item.append('div')
        .style('width', '16px')
        .style('height', '16px')
        .style('border-radius', '50%')
        .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
        .style('background', `radial-gradient(circle at 30% 30%, ${d3.color(color)?.brighter(0.3)}, ${color})`);

      item.append('span')
        .style('font-weight', '500')
        .style('color', '#64748b')
        .text(component === 'categoryA' ? 'Category A' : 
              component === 'categoryB' ? 'Category B' : 
              component === 'categoryC' ? 'Category C' : component);
    });
  }

  /**
   * Add instructions
   */
  addInstructions() {
    d3.select(this.container)
      .append('div')
      .style('position', 'absolute')
      .style('bottom', '24px')
      .style('left', '24px')
      .style('background', 'rgba(255,255,255,0.9)')
      .style('backdrop-filter', 'blur(10px)')
      .style('border-radius', '8px')
      .style('padding', '8px 12px')
      .style('box-shadow', '0 2px 8px rgba(0,0,0,0.05)')
      .style('font-size', '12px')
      .style('color', '#64748b')
      .style('font-weight', '500')
      .text('Hover segments • Click to select year');
  }

  /**
   * Render the radial stacked bar chart
   */
  render() {
    if (!this.data || this.data.length === 0) {
      console.warn('No data provided to RadialStackedBarChart');
      return this;
    }

    // Clear existing chart content
    this.chartGroup.selectAll('*').remove();

    const ringWidth = (this.outerRadius - this.innerRadius) / this.data.length;
    const colors = this.colorSchemes[this.options.colorScheme];

    // Create rings for each year
    this.data.forEach((yearData, yearIndex) => {
      this.createRing(yearData, yearIndex, ringWidth, colors);
    });

    // Add center label if enabled
    if (this.options.showCenterLabel) {
      this.addCenterLabel();
    }

    // Update selected year info if exists
    this.updateSelectedYearInfo();

    return this;
  }

  /**
   * Create a ring for a specific year's data
   */
  createRing(yearData, yearIndex, ringWidth, colors) {
    const currentInnerRadius = this.innerRadius + (yearIndex * ringWidth);
    const currentOuterRadius = currentInnerRadius + ringWidth * 0.8;
    
    // Calculate stack data
    const stackData = [
      { component: 'categoryA', value: yearData.categoryA, startAngle: 0 },
      { component: 'categoryB', value: yearData.categoryB, startAngle: 0 },
      { component: 'categoryC', value: yearData.categoryC, startAngle: 0 }
    ];

    // Calculate cumulative angles
    let cumulativeAngle = 0;
    stackData.forEach(d => {
      d.startAngle = cumulativeAngle;
      const proportion = d.value / yearData.totalValue;
      cumulativeAngle += proportion * 2 * Math.PI;
    });

    // Create arc generator
    const arc = d3.arc()
      .innerRadius(currentInnerRadius)
      .outerRadius(currentOuterRadius)
      .startAngle(d => d.startAngle)
      .endAngle((d, i) => {
        const nextIndex = i + 1;
        return nextIndex < stackData.length ? stackData[nextIndex].startAngle : 2 * Math.PI;
      })
      .padAngle(this.options.ringPadding);

    // Create ring group
    const ringGroup = this.chartGroup.append('g')
      .attr('class', `ring-${yearIndex}`)
      .style('opacity', 0);

    // Add background ring
    ringGroup.append('circle')
      .attr('r', currentOuterRadius)
      .attr('fill', 'none')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1)
      .attr('opacity', 0.3);

    // Create segments
    const segments = ringGroup.selectAll('.segment')
      .data(stackData)
      .enter()
      .append('path')
      .attr('class', 'segment')
      .attr('d', arc)
      .attr('fill', d => `url(#radial-gradient-${d.component})`)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .style('filter', 'url(#radial-glow)')
      .style('cursor', 'pointer')
      .style('opacity', 0);

    // Add hover interactions
    this.addSegmentInteractions(segments, ringGroup, yearData, colors);

    // Add year label
    ringGroup.append('text')
      .attr('x', 0)
      .attr('y', -currentInnerRadius - ringWidth / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('fill', '#64748b')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .style('opacity', 0)
      .text(yearData.year.toString());

    // Animate ring appearance
    if (this.options.animated) {
      this.animateRing(ringGroup, segments, yearIndex);
    } else {
      ringGroup.style('opacity', 1);
      segments.style('opacity', 0.8);
      ringGroup.select('text').style('opacity', 1);
    }
  }

  /**
   * Add interactions to segments
   */
  addSegmentInteractions(segments, ringGroup, yearData, colors) {
    const self = this;
    
    segments
      .on('mouseover', function(event, d) {
        const segment = d3.select(this);
        
        // Highlight effect
        ringGroup.selectAll('.segment').style('opacity', 0.4);
        segment.style('opacity', 1)
          .style('stroke-width', 3)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1.05)');

        // Show tooltip
        if (self.options.showTooltip) {
          const tooltipContent = `
            <div style="background: linear-gradient(135deg, ${colors[d.component]}, ${d3.color(colors[d.component])?.darker(0.2)}); padding: 12px; border-radius: 8px; color: white; font-size: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
              <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">Radial Chart - ${yearData.year}</div>
              <div style="margin-bottom: 4px;"><strong>Component:</strong> ${d.component === 'categoryA' ? 'Category A' : d.component === 'categoryB' ? 'Category B' : d.component === 'categoryC' ? 'Category C' : d.component}</div>
              <div style="margin-bottom: 4px;"><strong>Value:</strong> ${d3.format('$,.0f')(d.value)}</div>
              <div style="margin-bottom: 4px;"><strong>Percentage:</strong> ${d3.format('.1%')(d.value / yearData.totalValue)}</div>
              <div><strong>Total:</strong> ${d3.format('$,.0f')(yearData.totalValue)}</div>
            </div>
          `;
          self.showTooltip(tooltipContent, event);
        }
      })
      .on('mouseout', function() {
        // Reset segments
        ringGroup.selectAll('.segment')
          .style('opacity', 0.8)
          .style('stroke-width', 1)
          .transition()
          .duration(300)
          .attr('transform', 'scale(1)');

        if (self.options.showTooltip) {
          self.hideTooltip();
        }
      })
      .on('click', function(event, d) {
        self.selectedYear = self.selectedYear === yearData.year ? null : yearData.year;
        self.updateSelectedYearInfo();
        
        // Click animation
        const segment = d3.select(this);
        segment.transition()
          .duration(150)
          .attr('transform', 'scale(0.95)')
          .transition()
          .duration(150)
          .attr('transform', 'scale(1.02)');
      });
  }

  /**
   * Animate ring appearance
   */
  animateRing(ringGroup, segments, yearIndex) {
    ringGroup
      .transition()
      .delay(yearIndex * 200)
      .duration(800)
      .ease(d3.easeBackOut)
      .style('opacity', 1);

    segments
      .transition()
      .delay(yearIndex * 200 + 400)
      .duration(600)
      .ease(d3.easeBounceOut)
      .style('opacity', 0.8);

    ringGroup.select('text')
      .transition()
      .delay(yearIndex * 200 + 800)
      .duration(400)
      .style('opacity', 1);
  }

  /**
   * Add center label
   */
  addCenterLabel() {
    const centerGroup = this.chartGroup.append('g')
      .attr('class', 'center-label')
      .style('opacity', 0);

    centerGroup.append('circle')
      .attr('r', this.innerRadius * 0.8)
      .attr('fill', `url(#radial-gradient-categoryA)`)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 3)
      .style('filter', 'url(#radial-glow)');

    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('y', -10)
      .style('fill', 'white')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.7)')
      .text('Radial Chart');

    centerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('y', 10)
      .style('fill', 'white')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.7)')
      .text(`${this.data.length} Years`);

    if (this.options.animated) {
      centerGroup
        .transition()
        .delay(this.data.length * 200 + 1000)
        .duration(600)
        .ease(d3.easeBackOut)
        .style('opacity', 1);
    } else {
      centerGroup.style('opacity', 1);
    }
  }

  /**
   * Update selected year information display
   */
  updateSelectedYearInfo() {
    // Remove existing selected year info
    d3.select(this.container).select('.selected-year-info').remove();

    if (this.selectedYear) {
      const yearData = this.data.find(d => d.year === this.selectedYear);
      if (yearData) {
        const infoContainer = d3.select(this.container)
          .append('div')
          .attr('class', 'selected-year-info')
          .style('position', 'absolute')
          .style('top', '24px')
          .style('left', '24px')
          .style('background', 'rgba(255,255,255,0.95)')
          .style('backdrop-filter', 'blur(10px)')
          .style('border-radius', '12px')
          .style('padding', '16px')
          .style('box-shadow', '0 4px 12px rgba(0,0,0,0.1)')
          .style('border', '1px solid rgba(226,232,240,0.8)');

        infoContainer.append('div')
          .style('font-size', '14px')
          .style('font-weight', '600')
          .style('margin-bottom', '8px')
          .style('color', '#475569')
          .text(`Year ${this.selectedYear}`);

        const infoItems = infoContainer.append('div')
          .style('display', 'flex')
          .style('flex-direction', 'column')
          .style('gap', '4px')
          .style('font-size', '12px')
          .style('color', '#64748b');

        infoItems.append('div').text(`Total: ${d3.format('$,.0f')(yearData.totalValue)}`);
        infoItems.append('div').text(`Category A: ${d3.format('$,.0f')(yearData.categoryA)}`);
        infoItems.append('div').text(`Category B: ${d3.format('$,.0f')(yearData.categoryB)}`);
        infoItems.append('div').text(`Category C: ${d3.format('$,.0f')(yearData.categoryC)}`);
      }
    }
  }

  /**
   * Update color scheme and re-render
   */
  updateColorScheme(colorScheme) {
    this.options.colorScheme = colorScheme;
    // Color schemes are already initialized in constructor
    this.init();
    this.render();
    return this;
  }

  /**
   * Set selected year
   */
  setSelectedYear(year) {
    this.selectedYear = year;
    this.updateSelectedYearInfo();
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
}

export default RadialStackedBarChart;
