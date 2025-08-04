// Utility functions for the D3 Chart Library

/**
 * Data processing utilities
 */
export const DataUtils = {
  /**
   * Convert CSV data to chart format
   */
  parseCSV: function(csvString, xColumn, yColumn, labelColumn = null) {
    const lines = csvString.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const xIndex = headers.indexOf(xColumn);
    const yIndex = headers.indexOf(yColumn);
    const labelIndex = labelColumn ? headers.indexOf(labelColumn) : -1;
    
    if (xIndex === -1 || yIndex === -1) {
      throw new Error('Column not found in CSV data');
    }
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const dataPoint = {
        x: isNaN(values[xIndex]) ? values[xIndex] : +values[xIndex],
        y: isNaN(values[yIndex]) ? values[yIndex] : +values[yIndex]
      };
      
      if (labelIndex !== -1) {
        dataPoint.label = values[labelIndex];
      }
      
      return dataPoint;
    });
  },

  /**
   * Generate sample data for testing
   */
  generateSampleData: function(type = 'linear', count = 50) {
    const data = [];
    
    switch (type) {
      case 'linear':
        for (let i = 0; i < count; i++) {
          data.push({
            x: i,
            y: i * 2 + Math.random() * 10,
            label: `Point ${i}`
          });
        }
        break;
        
      case 'sine':
        for (let i = 0; i < count; i++) {
          const x = (i / count) * 4 * Math.PI;
          data.push({
            x: x,
            y: Math.sin(x) * 50 + 50,
            label: `Point ${i}`
          });
        }
        break;
        
      case 'random':
        for (let i = 0; i < count; i++) {
          data.push({
            x: Math.random() * 100,
            y: Math.random() * 100,
            label: `Point ${i}`
          });
        }
        break;
        
      case 'categories':
        const categories = ['A', 'B', 'C', 'D', 'E'];
        return categories.map(cat => ({
          label: cat,
          value: Math.floor(Math.random() * 100) + 10
        }));
    }
    
    return data;
  },

  /**
   * Normalize data to a specific range
   */
  normalize: function(data, field = 'y', min = 0, max = 1) {
    const values = data.map(d => d[field]);
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);
    const range = dataMax - dataMin;
    
    return data.map(d => ({
      ...d,
      [field]: ((d[field] - dataMin) / range) * (max - min) + min
    }));
  },

  /**
   * Group data by a specific field
   */
  groupBy: function(data, field) {
    return data.reduce((groups, item) => {
      const key = item[field];
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});
  },

  /**
   * Calculate moving average
   */
  movingAverage: function(data, window = 5, field = 'y') {
    const result = [];
    
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(window / 2));
      const end = Math.min(data.length, i + Math.ceil(window / 2));
      const subset = data.slice(start, end);
      const average = subset.reduce((sum, d) => sum + d[field], 0) / subset.length;
      
      result.push({
        ...data[i],
        [field]: average
      });
    }
    
    return result;
  }
};

/**
 * Color utilities
 */
export const ColorUtils = {
  /**
   * Generate color palette
   */
  generatePalette: function(count, scheme = 'category10') {
    const schemes = {
      category10: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
      pastel: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2'],
      dark: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666']
    };
    
    const colors = schemes[scheme] || schemes.category10;
    const palette = [];
    
    for (let i = 0; i < count; i++) {
      palette.push(colors[i % colors.length]);
    }
    
    return palette;
  },

  /**
   * Interpolate between two colors
   */
  interpolateColor: function(color1, color2, factor) {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    
    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);
    
    return this.rgbToHex(r, g, b);
  },

  /**
   * Convert hex to RGB
   */
  hexToRgb: function(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  /**
   * Convert RGB to hex
   */
  rgbToHex: function(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  /**
   * Darken a color
   */
  darken: function(color, amount = 0.2) {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;
    
    const r = Math.max(0, Math.round(rgb.r * (1 - amount)));
    const g = Math.max(0, Math.round(rgb.g * (1 - amount)));
    const b = Math.max(0, Math.round(rgb.b * (1 - amount)));
    
    return this.rgbToHex(r, g, b);
  },

  /**
   * Lighten a color
   */
  lighten: function(color, amount = 0.2) {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;
    
    const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount));
    const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount));
    const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount));
    
    return this.rgbToHex(r, g, b);
  }
};

/**
 * Animation utilities
 */
export const AnimationUtils = {
  /**
   * Easing functions
   */
  easing: {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  },

  /**
   * Animate a value over time
   */
  animate: function(from, to, duration, callback, easing = 'easeOutQuad') {
    const start = Date.now();
    const easingFn = this.easing[easing] || this.easing.linear;
    
    function step() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFn(progress);
      const currentValue = from + (to - from) * easedProgress;
      
      callback(currentValue, progress);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    
    requestAnimationFrame(step);
  },

  /**
   * Stagger animation delays
   */
  stagger: function(items, delay = 100) {
    return items.map((item, index) => ({
      ...item,
      delay: index * delay
    }));
  }
};

/**
 * Math utilities
 */
export const MathUtils = {
  /**
   * Calculate statistical measures
   */
  stats: function(data, field = 'y') {
    const values = data.map(d => d[field]).filter(v => !isNaN(v));
    const sorted = values.slice().sort((a, b) => a - b);
    const n = values.length;
    
    if (n === 0) return null;
    
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    
    return {
      count: n,
      min: Math.min(...values),
      max: Math.max(...values),
      sum: sum,
      mean: mean,
      median: n % 2 === 0 ? (sorted[n/2 - 1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)],
      mode: this.calculateMode(values),
      variance: variance,
      standardDeviation: Math.sqrt(variance),
      q1: this.percentile(sorted, 0.25),
      q3: this.percentile(sorted, 0.75)
    };
  },

  /**
   * Calculate percentile
   */
  percentile: function(sorted, p) {
    const index = p * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    if (upper >= sorted.length) return sorted[sorted.length - 1];
    
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  },

  /**
   * Calculate mode
   */
  calculateMode: function(values) {
    const frequency = {};
    let maxFreq = 0;
    let mode = null;
    
    values.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1;
      if (frequency[value] > maxFreq) {
        maxFreq = frequency[value];
        mode = value;
      }
    });
    
    return mode;
  },

  /**
   * Linear interpolation
   */
  lerp: function(a, b, t) {
    return a + (b - a) * t;
  },

  /**
   * Clamp value between min and max
   */
  clamp: function(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * Map value from one range to another
   */
  map: function(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  }
};

/**
 * DOM utilities
 */
export const DOMUtils = {
  /**
   * Get element dimensions
   */
  getDimensions: function(element) {
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left
    };
  },

  /**
   * Create responsive container
   */
  makeResponsive: function(chart, container) {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        chart.updateOptions({ width, height });
        chart.render();
      }
    });
    
    resizeObserver.observe(container);
    return resizeObserver;
  },

  /**
   * Export chart as image
   */
  exportAsImage: function(svgElement, filename = 'chart.png', scale = 2) {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = function() {
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(blob => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = URL.createObjectURL(blob);
        link.click();
        
        URL.revokeObjectURL(url);
        URL.revokeObjectURL(link.href);
      });
    };
    
    img.src = url;
  }
};
