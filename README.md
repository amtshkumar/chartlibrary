# D3 Chart Library

A comprehensive, customizable D3-based chart library for creating beautiful data visualizations.

## Features

- 🎯 **Multiple Chart Types**: Bar, Line, Pie, Donut, Scatter Plot, Area, and Histogram charts
- 🎨 **Highly Customizable**: Extensive configuration options for colors, animations, and styling
- 📱 **Responsive Design**: Charts adapt to container size changes
- 🖱️ **Interactive**: Built-in hover effects, tooltips, and click handlers
- 📊 **Data Processing**: Utility functions for data manipulation and formatting
- 🎭 **Animations**: Smooth transitions and entrance animations
- 🔧 **TypeScript Ready**: Full TypeScript support (coming soon)

## Installation

```bash
npm install d3-chart-library
```

## Quick Start

```javascript
import { BarChart } from 'd3-chart-library';

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

## Chart Types

### Bar Chart

```javascript
import { BarChart } from 'd3-chart-library';

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
import { LineChart } from 'd3-chart-library';

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
import { PieChart } from 'd3-chart-library';

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
import { DonutChart } from 'd3-chart-library';

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
import { ScatterPlot } from 'd3-chart-library';

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
import { AreaChart } from 'd3-chart-library';

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
import { Histogram } from 'd3-chart-library';

const histogram = new Histogram('#container', {
  width: 800,
  height: 400,
  bins: 20,
  showDensity: true
});

const histogramData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Raw values

histogram.setData(histogramData).render();
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
import { DataUtils, ColorUtils, MathUtils } from 'd3-chart-library';

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
import { DOMUtils } from 'd3-chart-library';

const chart = new BarChart('#container');
const container = document.getElementById('container');

// Make chart responsive
DOMUtils.makeResponsive(chart, container);
```

## Exporting Charts

Export charts as images:

```javascript
import { DOMUtils } from 'd3-chart-library';

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

## Changelog

### v1.0.0
- Initial release
- Support for 7 chart types
- Comprehensive utility functions
- Full documentation and examples

## Support

For questions and support, please open an issue on GitHub.
