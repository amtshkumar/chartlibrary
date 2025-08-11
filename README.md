# D3 Charts Visualization Library

A comprehensive, production-ready D3-based chart library with **30 chart types** for creating stunning data visualizations.

## 🚀 Features

- 🎯 **30 Chart Types**: Complete visualization suite from basic Bar/Line charts to advanced Sunburst, Parallel Coordinates, Stream, Violin, and Network visualizations
- 🎨 **Highly Customizable**: Extensive configuration options for colors, animations, and styling
- 📱 **Responsive Design**: Charts automatically adapt to container size changes
- 🖱️ **Interactive**: Built-in hover effects, tooltips, zoom, and click handlers
- 📊 **Smart Data Processing**: Flexible data format support with automatic validation
- 🎭 **Smooth Animations**: Beautiful entrance animations, transitions, and particle effects
- 🛡️ **Production Ready**: Comprehensive error handling and edge case management
- ⚡ **Performance Optimized**: Efficient rendering with D3.js v7+ under the hood
- 🔧 **Framework Agnostic**: Works with React, Vue, Angular, or vanilla JavaScript

## 📦 Installation

```bash
npm install d3-charts-viz-library
```

## 🎮 Interactive Playground

Explore all chart types with live examples and interactive controls:

```bash
# Clone the repository
git clone https://github.com/amtshkumar/chartlibrary.git
cd chartlibrary

# Install dependencies
npm install

# Start the playground
npm run dev:playground
```

The playground includes:
- 📊 Live chart examples with real-time updates
- 🎮 Interactive controls for all chart options
- 📝 Copy-to-clipboard code examples
- 🔄 Data generators for testing different scenarios
- 🎨 Visual customization options

## ✨ Key Features

### 🛡️ Production Ready
- Comprehensive error handling and validation
- Graceful handling of edge cases and invalid data
- Memory-efficient rendering with optimized animations
- Cross-browser compatibility (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)

### 🎨 Advanced Animations
- Smooth entrance and exit transitions
- Physics-based particle systems
- Breathing and pulsing effects
- Interactive hover states and tooltips

### 📊 Flexible Data Support
- Multiple data format compatibility
- Automatic data validation and sanitization
- Support for time-series, categorical, and network data
- Real-time data updates with smooth transitions

## Quick Start

```javascript
import { BarChart } from 'd3-charts-viz-library';

// Sample data
const data = [
  { label: 'A', value: 30 },
  { label: 'B', value: 45 },
  { label: 'C', value: 25 },
  { label: 'D', value: 60 }
];

// Create chart
const chart = new BarChart('#chart-container', {
  width: 800,
  height: 400,
  barColor: '#3498db'
});

chart.setData(data).render();
```

## 📊 Chart Types

The library includes **30 chart types**, from basic visualizations to advanced statistical and network charts:

### 🎯 **Complete Chart Collection**

**Basic Charts (7)**: BarChart, LineChart, PieChart, DonutChart, ScatterPlot, AreaChart, Histogram

**Advanced Visualizations (8)**: SankeyChart, LiquidFillChart, RadialRemainderChart, ChordDiagramChart, ForceDirectedChart, AnimatedBumpChart, RadialTimelineChart, FlowContainersChart

**Specialized Charts (10)**: SpiralChart, RadialStackedBarChart, CalendarHeatmapChart, AnimatedBubbleChart, TreemapChart, GaugeChart, WaterfallChart, RadarChart, HeatmapChart

**Advanced Analytics (5)**: SunburstChart, ParallelCoordinatesChart, StreamChart, ViolinChart, NetworkChart

### 📊 Basic Charts

#### Bar Chart

```javascript
import { BarChart } from 'd3-charts-viz-library';

const barChart = new BarChart('#container', {
  width: 800,
  height: 400,
  barColor: '#3498db',
  hoverColor: '#2980b9',
  orientation: 'vertical', // or 'horizontal'
  showValues: true
});

barChart.setData(data).render();
```

### Line Chart

```javascript
import { LineChart } from 'd3-charts-viz-library';

const lineChart = new LineChart('#container', {
  width: 800,
  height: 400,
  lineColor: '#e74c3c',
  showPoints: true,
  showArea: false,
  curve: d3.curveCardinal
});

const lineData = [
  { x: 0, y: 10 },
  { x: 1, y: 25 },
  { x: 2, y: 15 },
  { x: 3, y: 30 }
];

lineChart.setData(lineData).render();
```

### Pie Chart

```javascript
import { PieChart } from 'd3-charts-viz-library';

const pieChart = new PieChart('#container', {
  width: 600,
  height: 600,
  showLabels: true,
  showPercentages: true
});

pieChart.setData(data).render();
```

### Donut Chart

```javascript
import { DonutChart } from 'd3-charts-viz-library';

const donutChart = new DonutChart('#container', {
  width: 600,
  height: 600,
  innerRadius: 0.5,
  showCenterText: true,
  centerText: 'Total: 160'
});

donutChart.setData(data).render();
```

### Scatter Plot

```javascript
import { ScatterPlot } from 'd3-charts-viz-library';

const scatterPlot = new ScatterPlot('#container', {
  width: 800,
  height: 400,
  pointRadius: 5,
  showTrendLine: true
});

const scatterData = [
  { x: 10, y: 20, label: 'Point 1' },
  { x: 15, y: 35, label: 'Point 2' },
  { x: 20, y: 25, label: 'Point 3' }
];

scatterPlot.setData(scatterData).render();
```

### Area Chart

```javascript
import { AreaChart } from 'd3-charts-viz-library';

const areaChart = new AreaChart('#container', {
  width: 800,
  height: 400,
  areaColor: 'rgba(52, 152, 219, 0.6)',
  showLine: true,
  showPoints: false
});

areaChart.setData(lineData).render();
```

### Histogram

```javascript
import { Histogram } from 'd3-charts-viz-library';

const histogram = new Histogram('#container', {
  width: 800,
  height: 400,
  bins: 20,
  showDensity: true
});

const histogramData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Raw values

histogram.setData(histogramData).render();
```

### 🎆 Advanced Charts

#### Sankey Chart
Flow diagrams showing data movement between nodes.

```javascript
import { SankeyChart } from 'd3-charts-viz-library';

const sankeyChart = new SankeyChart('#container', {
  width: 800,
  height: 600,
  nodeWidth: 15,
  nodePadding: 10
});

const sankeyData = {
  nodes: [
    { name: 'Source A' },
    { name: 'Source B' },
    { name: 'Target X' },
    { name: 'Target Y' }
  ],
  links: [
    { source: 0, target: 2, value: 10 },
    { source: 1, target: 3, value: 15 }
  ]
};

sankeyChart.setData(sankeyData).render();
```

#### Liquid Fill Chart
Animated liquid-filled containers with wave effects.

```javascript
import { LiquidFillChart } from 'd3-charts-viz-library';

const liquidChart = new LiquidFillChart('#container', {
  width: 400,
  height: 400,
  liquidColor: '#3498db',
  showWaves: true,
  animationDuration: 2000
});

liquidChart.setData({ percentage: 0.75, label: '75%' }).render();
```

#### Chord Diagram Chart
Circular layout showing relationships between entities.

```javascript
import { ChordDiagramChart } from 'd3-charts-viz-library';

const chordChart = new ChordDiagramChart('#container', {
  width: 600,
  height: 600,
  innerRadius: 200,
  outerRadius: 220
});

const matrix = [
  [0, 5, 6, 4],
  [7, 0, 4, 2],
  [8, 4, 0, 8],
  [3, 5, 9, 0]
];

chordChart.setData({ matrix, labels: ['A', 'B', 'C', 'D'] }).render();
```

#### Force Directed Chart
Network visualization with physics-based node positioning.

```javascript
import { ForceDirectedChart } from 'd3-charts-viz-library';

const forceChart = new ForceDirectedChart('#container', {
  width: 800,
  height: 600,
  showParticles: true,
  showGlowEffects: true,
  enableZoom: true
});

const networkData = {
  economicSchedule: [
    { remainder: 100000, distribution: 5000 },
    { remainder: 110000, distribution: 5500 }
  ]
};

forceChart.setData(networkData).render();
```

#### Radial Timeline Chart
Circular timeline with animated arcs and data points.

```javascript
import { RadialTimelineChart } from 'd3-charts-viz-library';

const radialChart = new RadialTimelineChart('#container', {
  width: 500,
  height: 500,
  innerRadius: 40,
  showGridLines: true,
  animationDuration: 1000
});

const timelineData = {
  economicSchedule: [
    { remainder: 100000, distribution: 5000 },
    { remainder: 110000, distribution: 5500 },
    { remainder: 125000, distribution: 6000 }
  ]
};

radialChart.setData(timelineData).render();
```

#### Flow Containers Chart
Animated containers with liquid filling and particle effects.

```javascript
import { FlowContainersChart } from 'd3-charts-viz-library';

const flowChart = new FlowContainersChart('#container', {
  width: 800,
  height: 600,
  showParticles: true,
  showBubbles: true,
  animationDuration: 2000
});

const containerData = {
  containers: [
    { year: 2024, amount: 120000, fillPercentage: 0.65 },
    { year: 2025, amount: 135000, fillPercentage: 0.72 }
  ]
};

flowChart.setData(containerData).render();
```

#### Spiral Chart 🆕
Spiral visualization with floating particles and breathing animations.

```javascript
import { SpiralChart } from 'd3-charts-viz-library';

const spiralChart = new SpiralChart('#container', {
  width: 800,
  height: 600,
  turns: 4,
  showParticles: true,
  showFlowLines: true,
  showBreathing: true,
  centerLabel: 'Data Flow'
});

const spiralData = {
  timeSeries: [
    { period: 1, primaryValue: 100000, secondaryValue: 25000 },
    { period: 2, primaryValue: 110000, secondaryValue: 28000 },
    { period: 3, primaryValue: 125000, secondaryValue: 32000 }
  ]
};

spiralChart.setData(spiralData).render();
```

#### Animated Bump Chart
Animated area chart showing component breakdown over time.

```javascript
import { AnimatedBumpChart } from 'd3-charts-viz-library';

const bumpChart = new AnimatedBumpChart('#container', {
  width: 800,
  height: 500,
  principalRatio: 0.6,
  showDistributionBars: true,
  showPoints: true
});

bumpChart.setData(timelineData).render();
```

#### Radial Remainder Chart
Spiral visualization showing growth patterns over time.

```javascript
import { RadialRemainderChart } from 'd3-charts-viz-library';

const radialRemainderChart = new RadialRemainderChart('#container', {
  width: 600,
  height: 600,
  spiralRotations: 2,
  animationDuration: 3000
});

radialRemainderChart.setData(timelineData).render();
```

#### Radial Stacked Bar Chart
Concentric rings with stacked segments for multi-category data visualization.

```javascript
import { RadialStackedBarChart } from 'd3-charts-viz-library';

const radialStackedBarChart = new RadialStackedBarChart('#container', {
  width: 600,
  height: 600,
  colorScheme: 'blue', // 'blue', 'orange', or 'green'
  animated: true,
  showLegend: true,
  showTooltip: true
});

const data = [
  {
    year: 2024,
    categoryA: 50000,
    categoryB: 75000,
    categoryC: 5000,
    totalValue: 130000
  },
  {
    year: 2025,
    categoryA: 52500,
    categoryB: 82000,
    categoryC: 5200,
    totalValue: 139700
  },
  {
    year: 2026,
    categoryA: 55125,
    categoryB: 89500,
    categoryC: 5400,
    totalValue: 150025
  }
];

radialStackedBarChart.setData(data).render();
```

#### Calendar Heatmap Chart
GitHub-style calendar visualization for displaying activity patterns over time.

```javascript
import { CalendarHeatmapChart } from 'd3-charts-viz-library';

const calendarChart = new CalendarHeatmapChart('#container', {
  width: 900,
  height: 200,
  colorScheme: 'green', // 'green', 'blue', 'purple', or 'orange'
  year: 2024,
  showTooltip: true,
  showLegend: true,
  animated: true
});

const data = [
  { date: '2024-01-15', value: 12 },
  { date: '2024-02-20', value: 8 },
  { date: '2024-03-10', value: 15 },
  { date: '2024-04-05', value: 22 },
  { date: '2024-05-12', value: 18 },
  { date: '2024-06-08', value: 25 },
  { date: '2024-07-14', value: 30 },
  { date: '2024-08-22', value: 28 },
  { date: '2024-09-17', value: 20 },
  { date: '2024-10-11', value: 16 },
  { date: '2024-11-25', value: 14 },
  { date: '2024-12-18', value: 10 }
];

calendarChart.setData(data).render();
```

#### Animated Bubble Chart
Time-based animated bubble chart with smooth transitions between periods.

```javascript
import { AnimatedBubbleChart } from 'd3-charts-viz-library';

const animatedBubbleChart = new AnimatedBubbleChart('#container', {
  width: 900,
  height: 600,
  xLabel: 'Gain Realized',
  yLabel: 'Tax Due',
  timeField: 'period',
  xField: 'x',
  yField: 'y',
  sizeField: 'size',
  categoryField: 'category',
  animated: true,
  showLegend: true,
  duration: 750
});

const bubbleData = [
  // Period 0
  { id: 'stock', category: 'Stock', period: 0, x: 10000, y: 2000, size: 500000 },
  { id: 'realestate', category: 'Real Estate', period: 0, x: 15000, y: 3000, size: 1000000 },
  { id: 'crypto', category: 'Crypto', period: 0, x: 4000, y: 1200, size: 150000 },
  // Period 1
  { id: 'stock', category: 'Stock', period: 1, x: 12000, y: 2400, size: 540000 },
  { id: 'realestate', category: 'Real Estate', period: 1, x: 16500, y: 3300, size: 1050000 },
  { id: 'crypto', category: 'Crypto', period: 1, x: 5200, y: 1560, size: 172000 }
];

animatedBubbleChart.setData(bubbleData).setPeriod(0);

// Animate through periods
animatedBubbleChart.setPeriod(1); // Switch to period 1 with smooth animation
```

## Multi-Series Charts

### Multi-Line Chart

```javascript
const seriesData = [
  {
    name: 'Series 1',
    color: '#3498db',
    data: [{ x: 0, y: 10 }, { x: 1, y: 25 }, { x: 2, y: 15 }]
  },
  {
    name: 'Series 2',
    color: '#e74c3c',
    data: [{ x: 0, y: 5 }, { x: 1, y: 20 }, { x: 2, y: 30 }]
  }
];

lineChart.renderMultiSeries(seriesData);
```

### Stacked Area Chart

```javascript
areaChart.renderStacked(seriesData);
```

## Utility Functions

The library includes utility functions for data processing:

```javascript
import { DataUtils, ColorUtils, MathUtils } from 'd3-charts-viz-library';

// Generate sample data
const sampleData = DataUtils.generateSampleData('linear', 50);

// Parse CSV data
const csvData = DataUtils.parseCSV(csvString, 'x', 'y', 'label');

// Generate color palette
const colors = ColorUtils.generatePalette(5, 'category10');

// Calculate statistics
const stats = MathUtils.stats(data, 'value');
```

## Configuration Options

### Common Options

All charts inherit from `BaseChart` and support these common options:

```javascript
{
  width: 800,              // Chart width
  height: 400,             // Chart height
  margin: {                // Chart margins
    top: 20,
    right: 30,
    bottom: 40,
    left: 40
  },
  backgroundColor: '#ffffff', // Background color
  onClick: (data, event) => {} // Click handler
}
```

### Chart-Specific Options

Each chart type has its own specific options. Refer to the individual chart documentation for details.

## Responsive Charts

Make your charts responsive:

```javascript
import { DOMUtils } from 'd3-charts-viz-library';

const chart = new BarChart('#container');
const container = document.getElementById('container');

// Make chart responsive
DOMUtils.makeResponsive(chart, container);
```

## Exporting Charts

Export charts as images:

```javascript
import { DOMUtils } from 'd3-charts-viz-library';

const svgElement = document.querySelector('#container svg');
DOMUtils.exportAsImage(svgElement, 'my-chart.png');
```

## Animation

Charts come with built-in animations. You can customize animation timing:

```javascript
const chart = new BarChart('#container', {
  animationDuration: 1000,
  animationDelay: 100
});
```

## Events

Charts support various events:

```javascript
const chart = new BarChart('#container', {
  onClick: (data, event) => {
    console.log('Clicked:', data);
  },
  onHover: (data, event) => {
    console.log('Hovered:', data);
  }
});
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- D3.js v7.8.5+

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛡️ Production Ready

This library has undergone comprehensive testing and bug fixes to ensure production reliability:

### ✅ Recent Bug Fixes (v1.0.10)
- **RadialTimelineChart**: Fixed "Expected number" SVG path errors with robust validation
- **FlowContainersChart**: Resolved context issues and infinite recursion bugs
- **ForceDirectedChart**: Enhanced coordinate validation for stable animations
- **All Charts**: Added comprehensive error handling for edge cases and invalid data

### 🎆 Error Handling
- Graceful handling of NaN, Infinity, and undefined values
- Automatic fallbacks for invalid data inputs
- Comprehensive validation in all animation transitions
- Production-ready stability with edge case management

## Changelog

### v1.0.17 - **COMPLETE LIBRARY RELEASE** 🎉
- ✨ **NEW**: Added 5 Advanced Analytics Charts - **Library now complete with 30 chart types!**
  - **SunburstChart**: Multi-level hierarchical radial visualization with zoom-to-segment functionality
  - **ParallelCoordinatesChart**: Multi-dimensional data analysis with interactive brushing and filtering
  - **StreamChart**: Flowing stacked area chart with multiple offset algorithms (wiggle, silhouette, expand)
  - **ViolinChart**: Distribution visualization with kernel density estimation and integrated box plots
  - **NetworkChart**: Interactive force-directed node-link diagrams with drag, zoom, and physics simulation
- 🔧 **MAJOR FIXES**: Resolved critical JavaScript context and SVG rendering errors
  - Fixed D3.js context binding issues in ParallelCoordinatesChart and ViolinChart
  - Resolved invalid SVG arc path generation in SunburstChart with robust validation
  - Added comprehensive null checks and error handling for brush interactions
  - Implemented arc sanitization and filtering for stable rendering
- 🎮 **COMPLETE**: Interactive playground with all 30 chart types
  - Full integration of advanced charts with interactive controls and data generators
  - Comprehensive code examples with copy-to-clipboard functionality
  - Advanced chart-specific controls (brushing, forces, bandwidth, zoom, etc.)
  - Realistic data generators for all chart types including hierarchical, multi-dimensional, and network data
- 📚 **COMPREHENSIVE**: Complete documentation and examples
  - Updated README with all 30 chart types organized by category
  - Advanced analytics section with detailed usage examples
  - Complete API documentation for all chart configurations
  - Production-ready examples with realistic data structures
- 🏆 **MILESTONE**: **D3 Charts Viz Library is now complete with 30 production-ready chart types!**

### v1.0.15
- ✨ **NEW**: Added CalendarHeatmapChart with GitHub-style calendar visualization
  - Beautiful calendar grid showing activity patterns over a full year
  - Four color schemes: green (GitHub style), blue, purple, and orange
  - Interactive hover tooltips with date and value information
  - Configurable options: year selection, animation, legend, tooltips
  - Automatic weekend vs weekday pattern generation
  - Month and weekday labels with seasonal variation simulation
- 🎮 **IMPROVED**: Interactive playground with 13 chart types
  - Added CalendarHeatmapChart to playground with full interactive controls
  - New controls: Update Data, Change Color Scheme, Change Year, Toggle Animation
  - Realistic activity data generator with patterns and seasonal variations
- 📚 **UPDATED**: Comprehensive documentation and examples
  - Complete README section with Calendar Heatmap usage examples
  - Updated chart count from 17+ to 18+ chart types
  - Added sample code with date-based data structure

### v1.0.11
- ✨ **NEW**: Added RadialStackedBarChart with concentric rings and stacked segments
  - Beautiful radial visualization with year-over-year data in concentric rings
  - Three color schemes: blue, orange, and green
  - Interactive hover tooltips with detailed component breakdown
  - Click to select years with animated transitions
  - Configurable options: animation, legend, tooltips, center label
- 🎨 **ENHANCED**: Generic data structure for broader applicability
  - Replaced financial-specific terms with generic categories (categoryA, categoryB, categoryC)
  - Flexible data format suitable for various use cases beyond financial data
  - Improved data generator with configurable percentages and growth patterns
- 🎮 **IMPROVED**: Interactive playground with 12 chart types
  - Added RadialStackedBarChart to playground with full interactive controls
  - New controls: Update Data, Change Color Scheme, Toggle Animation, Toggle Legend
  - Copy-to-clipboard functionality for complete code examples
- 📚 **UPDATED**: Comprehensive documentation and code examples
  - Complete README section with usage examples and data structure
  - Updated chart count from 16+ to 17+ chart types
  - Added sample code with generic data for easy implementation

### v1.0.10
- ✨ **NEW**: Added SpiralChart with floating particles and breathing animations
- 🔧 **FIXED**: RadialTimelineChart SVG path validation and animation safety
- 🔧 **FIXED**: FlowContainersChart context issues and recursive method calls
- 🔧 **FIXED**: ForceDirectedChart coordinate validation
- 📚 **UPDATED**: Comprehensive README with all chart types

### v1.0.9
- ✨ **NEW**: Added FlowContainersChart with liquid animations
- 🔧 **FIXED**: Multiple chart stability improvements
- 🎮 **ENHANCED**: Playground integration for all charts

### v1.0.8
- ✨ **NEW**: Added ForceDirectedChart and AnimatedBumpChart
- 🎆 **ENHANCED**: Advanced particle effects and animations
- 🔧 **IMPROVED**: Generic naming conventions for broader applicability

### v1.0.7
- ✨ **NEW**: Added RadialRemainderChart with spiral visualizations
- 🎮 **ENHANCED**: Interactive playground with live examples
- 📊 **IMPROVED**: Data processing and validation

### v1.0.6
- ✨ **NEW**: Added advanced chart types (Sankey, Liquid Fill, Chord Diagram)
- 🎨 **ENHANCED**: Visual effects and animations
- 🔧 **IMPROVED**: Code organization and modularity

### v1.0.0
- Initial release
- Support for 7 chart types
- Comprehensive utility functions
- Full documentation and examples

## Support

For questions and support, please open an issue on GitHub.
