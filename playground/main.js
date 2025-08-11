import * as d3 from 'd3';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  DonutChart, 
  ScatterPlot, 
  AreaChart, 
  Histogram,
  SankeyChart,
  LiquidFillChart,
  RadialRemainderChart,
  ChordDiagramChart,
  ForceDirectedChart,
  AnimatedBumpChart,
  RadialTimelineChart,
  FlowContainersChart,
  SpiralChart,
  RadialStackedBarChart,
  CalendarHeatmapChart,
  AnimatedBubbleChart,
  TreemapChart,
  GaugeChart,
  WaterfallChart,
  RadarChart,
  HeatmapChart,
  SunburstChart,
  ParallelCoordinatesChart,
  StreamChart,
  ViolinChart,
  NetworkChart,
  DataUtils,
  ColorUtils
} from '../dist/index.esm.js';

// Global chart instances
let barChart, lineChart, pieChart, donutChart, scatterPlot, areaChart, histogram, sankeyChart, liquidFillChart, radialRemainderChart, chordDiagramChart, forceDirectedChart, animatedBumpChart, radialTimelineChart, flowContainersChart, spiralChart, radialStackedBarChart, calendarHeatmapChart, animatedBubbleChart, treemapChart, gaugeChart, waterfallChart, radarChart, heatmapChart, sunburstChart, parallelCoordinatesChart, streamChart, violinChart, networkChart;
let isMultiSeries = false;
let showTrendLine = false;
let showDensity = false;
let currentBins = 20;

// Code examples for copying
const importCode = `import { BarChart, LineChart, PieChart } from 'd3-charts-viz-library';`;

const barChartCode = `const barChart = new BarChart('#bar-chart', {
  width: 500,
  height: 300,
  barColor: '#3498db',
  hoverColor: '#2980b9',
  showValues: true
});

const data = [
  { label: 'Product A', value: 30 },
  { label: 'Product B', value: 45 },
  { label: 'Product C', value: 25 },
  { label: 'Product D', value: 60 },
  { label: 'Product E', value: 35 }
];

barChart.setData(data).render();`;

const lineChartCode = `const lineChart = new LineChart('#line-chart', {
  width: 500,
  height: 300,
  lineColor: '#e74c3c',
  showPoints: true,
  pointRadius: 4
});

const data = [];
for (let i = 0; i < 20; i++) {
  data.push({
    x: i,
    y: Math.sin(i * 0.3) * 30 + 50 + Math.random() * 10
  });
}

lineChart.setData(data).render();`;

const pieChartCode = `const pieChart = new PieChart('#pie-chart', {
  width: 400,
  height: 400,
  showLabels: true,
  showPercentages: true
});

const data = [
  { label: 'Desktop', value: 45 },
  { label: 'Mobile', value: 35 },
  { label: 'Tablet', value: 15 },
  { label: 'Other', value: 5 }
];

pieChart.setData(data).render();`;

const donutChartCode = `const donutChart = new DonutChart('#donut-chart', {
  width: 400,
  height: 400,
  innerRadius: 0.5,
  showCenterText: true,
  centerText: 'Total: 100'
});

donutChart.setData(data).render();`;

const scatterPlotCode = `const scatterPlot = new ScatterPlot('#scatter-plot', {
  width: 500,
  height: 300,
  pointRadius: 5,
  showTrendLine: true
});

const data = [];
for (let i = 0; i < 50; i++) {
  data.push({
    x: Math.random() * 100,
    y: Math.random() * 100,
    label: \`Point \${i + 1}\`
  });
}

scatterPlot.setData(data).render();`;

const areaChartCode = `const areaChart = new AreaChart('#area-chart', {
  width: 500,
  height: 300,
  areaColor: 'rgba(52, 152, 219, 0.6)',
  showLine: true
});

const data = [];
for (let i = 0; i < 20; i++) {
  data.push({
    x: i,
    y: Math.sin(i * 0.2) * 20 + 40 + Math.random() * 10
  });
}

areaChart.setData(data).render();`;

const histogramCode = `const histogram = new Histogram('#histogram', {
  width: 500,
  height: 300,
  bins: 20,
  showDensity: true,
  xLabel: 'Value',
  yLabel: 'Frequency'
});

// Generate normal distribution data
const data = [];
for (let i = 0; i < 1000; i++) {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  const normal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  data.push(normal * 15 + 50);
}

histogram.setData(data).render();`;

const sankeyChartCode = `const sankeyChart = new SankeyChart('#sankey-chart', {
  width: 500,
  height: 300,
  particleAnimation: true,
  showValues: true,
  showEfficiency: true
});

const data = {
  nodes: [
    { name: 'Source A', value: 100 },
    { name: 'Source B', value: 80 },
    { name: 'Process 1', value: 120 },
    { name: 'Process 2', value: 60 },
    { name: 'Output', value: 180 }
  ],
  links: [
    { source: 0, target: 2, value: 100 },
    { source: 1, target: 2, value: 20 },
    { source: 1, target: 3, value: 60 },
    { source: 2, target: 4, value: 120 },
    { source: 3, target: 4, value: 60 }
  ],
  efficiency: 85.5
};

sankeyChart.setData(data).render();`;

const liquidFillChartCode = `const liquidFillChart = new LiquidFillChart('#liquid-fill-chart', {
  width: 500,
  height: 400,
  dualGauge: true,
  showConnectingFlow: true,
  title: 'Tax Deduction Breakdown'
});

const data = [
  { title: 'Non-deductible', value: 700000 },
  { title: 'Deductible', value: 300000 }
];

liquidFillChart.setData(data).render();`;

const radialRemainderChartCode = `const radialRemainderChart = new RadialRemainderChart('#radial-remainder-chart', {
  width: 600,
  height: 600,
  spiralRotations: 2,
  animationDuration: 3000,
  title: 'Trust Remainder Growth'
});

const data = {
  economicSchedule: [
    { remainder: 1000000 },
    { remainder: 1050000 },
    { remainder: 1102500 },
    { remainder: 1157625 },
    { remainder: 1215506 }
  ]
};

radialRemainderChart.setData(data).render();`;

const chordDiagramChartCode = `const chordDiagramChart = new ChordDiagramChart('#chord-diagram-chart', {
  width: 600,
  height: 600,
  padAngle: 0.05,
  animationDuration: 1200,
  title: 'Trust Relationships'
});

const data = {
  data: {
    economicSchedule: [
      { remainder: 1000000, distribution: 50000 },
      { remainder: 1050000, distribution: 52500 },
      { remainder: 1102500, distribution: 55125 }
    ],
    charitDeduction: 300000
  }
};

chordDiagramChart.setData(data).render();`;

const forceDirectedChartCode = `const forceDirectedChart = new ForceDirectedChart('#force-directed-chart', {
  width: 800,
  height: 600,
  particleCount: 15,
  animationDuration: 2000,
  showParticles: true,
  showGlowEffects: true,
  enableZoom: true
});

const data = {
  economicSchedule: [
    { remainder: 1000000, distribution: 50000 },
    { remainder: 1050000, distribution: 52500 },
    { remainder: 1102500, distribution: 55125 },
    { remainder: 1157625, distribution: 57881 },
    { remainder: 1215506, distribution: 60775 }
  ],
  charitDeduction: 300000,
  optimalPayout: 250000
};

forceDirectedChart.setData(data).render();`;

const animatedBumpChartCode = `const animatedBumpChart = new AnimatedBumpChart('#animated-bump-chart', {
  width: 800,
  height: 500,
  animationDuration: 1500,
  animationDelay: 500,
  principalRatio: 0.6,
  showDistributionBars: true,
  showPoints: true
});

const data = {
  economicSchedule: [
    { remainder: 1000000, distribution: 50000 },
    { remainder: 1050000, distribution: 52500 },
    { remainder: 1102500, distribution: 55125 },
    { remainder: 1157625, distribution: 57881 },
    { remainder: 1215506, distribution: 60775 },
    { remainder: 1276281, distribution: 63814 },
    { remainder: 1340095, distribution: 67005 },
    { remainder: 1407100, distribution: 70355 },
    { remainder: 1477455, distribution: 73873 },
    { remainder: 1551328, distribution: 77566 }
  ]
};

animatedBumpChart.setData(data).render();`;

const radialTimelineChartCode = `const radialTimelineChart = new RadialTimelineChart('#radial-timeline-chart', {
  width: 500,
  height: 500,
  animationDuration: 1000,
  animationDelay: 100,
  innerRadius: 40,
  cornerRadius: 2,
  showGridLines: true,
  showYearLabels: true
});

const data = {
  economicSchedule: [
    { remainder: 1000000, distribution: 50000 },
    { remainder: 1050000, distribution: 52500 },
    { remainder: 1102500, distribution: 55125 },
    { remainder: 1157625, distribution: 57881 },
    { remainder: 1215506, distribution: 60775 },
    { remainder: 1276281, distribution: 63814 },
    { remainder: 1340095, distribution: 67005 },
    { remainder: 1407100, distribution: 70355 },
    { remainder: 1477455, distribution: 73873 },
    { remainder: 1551328, distribution: 77566 },
    { remainder: 1628894, distribution: 81445 },
    { remainder: 1710339, distribution: 85517 }
  ]
};

radialTimelineChart.setData(data).render();`;

const flowContainersChartCode = `const flowContainersChart = new FlowContainersChart('#flow-containers-chart', {
  width: 800,
  height: 600,
  animationDuration: 2000,
  showParticles: true,
  showBubbles: true,
  containerSpacing: 80,
  liquidColor: '#3498db'
});

const data = {
  containers: [
    { period: 1, value: 120000, fillPercentage: 0.65, label: 'Period 1' },
    { period: 2, value: 135000, fillPercentage: 0.72, label: 'Period 2' },
    { period: 3, value: 148000, fillPercentage: 0.58, label: 'Period 3' },
    { period: 4, value: 162000, fillPercentage: 0.81, label: 'Period 4' }
  ],
  totalValue: 565000,
  title: 'Data Flow Containers'
};

flowContainersChart.setData(data).render();`;

const spiralChartCode = `const spiralChart = new SpiralChart('#spiral-chart', {
  width: 800,
  height: 600,
  turns: 4,
  maxRadius: 250,
  showParticles: true,
  showFlowLines: true,
  showBreathing: true,
  selectedMetric: 'all',
  centerLabel: 'Data Flow',
  animationDuration: 1000
});

const data = {
  timeSeries: [
    { period: 1, primaryValue: 100000, secondaryValue: 25000, tertiaryValue: 15000, quaternaryValue: 8000 },
    { period: 2, primaryValue: 110000, secondaryValue: 28000, tertiaryValue: 18000, quaternaryValue: 12000 },
    { period: 3, primaryValue: 125000, secondaryValue: 32000, tertiaryValue: 22000, quaternaryValue: 15000 },
    { period: 4, primaryValue: 140000, secondaryValue: 38000, tertiaryValue: 25000, quaternaryValue: 18000 },
    { period: 5, primaryValue: 155000, secondaryValue: 42000, tertiaryValue: 28000, quaternaryValue: 22000 }
  ]
};

spiralChart.setData(data).render();`;

const radialStackedBarChartCode = `const radialStackedBarChart = new RadialStackedBarChart('#radial-stacked-bar-chart', {
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

radialStackedBarChart.setData(data).render();`;

const calendarHeatmapChartCode = `const calendarHeatmapChart = new CalendarHeatmapChart('#calendar-heatmap-chart', {
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

calendarHeatmapChart.setData(data).render();`;

const animatedBubbleChartCode = `const animatedBubbleChart = new AnimatedBubbleChart('#animated-bubble-chart', {
  width: 900,
  height: 600,
  xLabel: 'Gain Realized',
  yLabel: 'Tax Due',
  timeField: 'period',
  xField: 'x',
  yField: 'y',
  sizeField: 'size',
  categoryField: 'category',
  animated: true
});

const data = [
  // period 0
  { id: 'a1', category: 'Stock', period: 0, x: 10000, y: 2000, size: 500000 },
  { id: 'a2', category: 'Real Estate', period: 0, x: 15000, y: 3000, size: 1000000 },
  { id: 'a3', category: 'Crypto', period: 0, x: 4000, y: 1200, size: 150000 },
  // period 1
  { id: 'a1', category: 'Stock', period: 1, x: 12000, y: 2400, size: 540000 },
  { id: 'a2', category: 'Real Estate', period: 1, x: 16500, y: 3300, size: 1050000 },
  { id: 'a3', category: 'Crypto', period: 1, x: 5200, y: 1560, size: 172000 }
];

animatedBubbleChart.setData(data).setPeriod(0);`;

const treemapChartCode = `const treemapChart = new TreemapChart('#treemap-chart', {
  width: 600,
  height: 400,
  colorScheme: 'category10',
  animation: true,
  tooltips: true,
  padding: 2
});

const data = {
  name: "Technology Stack",
  children: [
    {
      name: "Frontend",
      children: [
        { name: "React", value: 45 },
        { name: "Vue", value: 30 },
        { name: "Angular", value: 25 }
      ]
    },
    {
      name: "Backend", 
      children: [
        { name: "Node.js", value: 40 },
        { name: "Python", value: 35 },
        { name: "Java", value: 30 }
      ]
    }
  ]
};

treemapChart.setData(data).render();`;

const gaugeChartCode = `const gaugeChart = new GaugeChart('#gauge-chart', {
  width: 400,
  height: 300,
  colorScheme: 'traffic',
  animation: true,
  showValue: true,
  showTicks: true
});

const data = {
  value: 75,
  min: 0,
  max: 100,
  label: "Performance Score"
};

gaugeChart.setData(data).render();`;

const waterfallChartCode = `const waterfallChart = new WaterfallChart('#waterfall-chart', {
  width: 600,
  height: 400,
  colorScheme: 'default',
  animation: true,
  tooltips: true,
  showConnectors: true,
  showValues: true
});

const data = [
  { label: "Starting Revenue", value: 100, type: "total" },
  { label: "Product Sales", value: 25 },
  { label: "Service Revenue", value: 15 },
  { label: "Operating Costs", value: -30 },
  { label: "Marketing", value: -8 },
  { label: "Net Income", value: 102, type: "total" }
];

waterfallChart.setData(data).render();`;

const radarChartCode = `const radarChart = new RadarChart('#radar-chart', {
  width: 500,
  height: 500,
  colorScheme: 'category10',
  levels: 5,
  maxValue: 100,
  animation: true,
  tooltips: true,
  legend: true
});

const data = [
  {
    name: "Product A",
    values: [
      { axis: "Speed", value: 80 },
      { axis: "Reliability", value: 90 },
      { axis: "Security", value: 70 },
      { axis: "Usability", value: 85 }
    ]
  },
  {
    name: "Product B",
    values: [
      { axis: "Speed", value: 70 },
      { axis: "Reliability", value: 75 },
      { axis: "Security", value: 95 },
      { axis: "Usability", value: 80 }
    ]
  }
];

radarChart.setData(data).render();`;

const heatmapChartCode = `const heatmapChart = new HeatmapChart('#heatmap-chart', {
  width: 600,
  height: 400,
  colorScheme: 'blues',
  animation: true,
  tooltips: true,
  showValues: false
});

const data = [
  { row: "Monday", column: "08:00", value: 45 },
  { row: "Monday", column: "12:00", value: 78 },
  { row: "Monday", column: "16:00", value: 62 },
  { row: "Tuesday", column: "08:00", value: 52 },
  { row: "Tuesday", column: "12:00", value: 85 },
  { row: "Tuesday", column: "16:00", value: 70 }
];

heatmapChart.setData(data).render();`;

const sunburstChartCode = `const sunburstChart = new SunburstChart('#sunburst-chart', {
  width: 600,
  height: 600,
  colorScheme: 'category10',
  animation: true,
  tooltips: true
});

const data = {
  name: "Root",
  children: [
    {
      name: "Technology",
      children: [
        { name: "Frontend", value: 30 },
        { name: "Backend", value: 25 },
        { name: "DevOps", value: 15 }
      ]
    },
    {
      name: "Marketing",
      children: [
        { name: "Digital", value: 20 },
        { name: "Traditional", value: 10 }
      ]
    }
  ]
};

sunburstChart.setData(data).render();`;

const parallelCoordinatesChartCode = `const parallelCoordinatesChart = new ParallelCoordinatesChart('#parallel-coordinates-chart', {
  width: 800,
  height: 400,
  colorScheme: 'category10',
  animation: true,
  tooltips: true,
  brushing: true
});

const data = [
  { name: "Item 1", price: 100, quality: 8, popularity: 7, rating: 4.5 },
  { name: "Item 2", price: 150, quality: 9, popularity: 6, rating: 4.2 },
  { name: "Item 3", price: 80, quality: 6, popularity: 9, rating: 4.8 }
];

parallelCoordinatesChart.setData(data).render();`;

const streamChartCode = `const streamChart = new StreamChart('#stream-chart', {
  width: 800,
  height: 400,
  colorScheme: 'spectral',
  animation: true,
  tooltips: true,
  legend: true,
  curve: 'cardinal',
  offset: 'wiggle'
});

const data = [
  { date: new Date('2020-01-01'), category1: 20, category2: 30, category3: 15 },
  { date: new Date('2020-02-01'), category1: 25, category2: 35, category3: 20 },
  { date: new Date('2020-03-01'), category1: 30, category2: 25, category3: 25 }
];

streamChart.setData(data).render();`;

const violinChartCode = `const violinChart = new ViolinChart('#violin-chart', {
  width: 600,
  height: 400,
  colorScheme: 'category10',
  animation: true,
  tooltips: true,
  showBoxPlot: true,
  showMedian: true
});

const data = [
  { category: "Group A", values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { category: "Group B", values: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20] },
  { category: "Group C", values: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50] }
];

violinChart.setData(data).render();`;

const networkChartCode = `const networkChart = new NetworkChart('#network-chart', {
  width: 700,
  height: 500,
  colorScheme: 'category10',
  animation: true,
  tooltips: true,
  showLabels: true,
  nodeRadius: 8,
  linkStrength: 0.1,
  chargeStrength: -300
});

const data = {
  nodes: [
    { id: "A", group: 1 },
    { id: "B", group: 1 },
    { id: "C", group: 2 },
    { id: "D", group: 2 }
  ],
  links: [
    { source: "A", target: "B", value: 1 },
    { source: "B", target: "C", value: 2 },
    { source: "C", target: "D", value: 1 }
  ]
};

networkChart.setData(data).render();`;

// Data generators
function generateBarData() {
  const labels = ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'];
  return labels.map(label => ({
    label,
    value: Math.floor(Math.random() * 80) + 20
  }));
}

function generateLineData() {
  const data = [];
  for (let i = 0; i < 20; i++) {
    data.push({
      x: i,
      y: Math.sin(i * 0.3) * 30 + 50 + Math.random() * 10
    });
  }
  return data;
}

function generatePieData() {
  const categories = ['Segment A', 'Segment B', 'Segment C', 'Segment D', 'Segment E'];
  return categories.map(category => ({
    label: category,
    value: Math.floor(Math.random() * 50) + 10
  }));
}

function generateScatterData() {
  const data = [];
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 100;
    data.push({
      x: x,
      y: x * 0.8 + Math.random() * 30, // Some correlation
      label: `Point ${i + 1}`
    });
  }
  return data;
}

function generateAreaData() {
  const data = [];
  for (let i = 0; i < 20; i++) {
    data.push({
      x: i,
      y: Math.sin(i * 0.2) * 20 + 40 + Math.random() * 10
    });
  }
  return data;
}

function generateHistogramData() {
  const data = [];
  for (let i = 0; i < 1000; i++) {
    // Generate normal distribution
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    const normal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    data.push(normal * 15 + 50);
  }
  return data;
}

// Animated Bubble Chart generator
function generateAnimatedBubbleData(periods = 6, categories = ['Stock', 'Real Estate', 'Crypto', 'Bonds']) {
  const data = [];
  const ids = categories.map((c, i) => ({ id: `id-${i}`, category: c }));
  ids.forEach(({ id, category }, idx) => {
    const baseX = 8000 + idx * 3000 + Math.random() * 2000;
    const baseY = 1500 + idx * 700 + Math.random() * 800;
    const baseSize = 200000 + idx * 250000 + Math.random() * 150000;
    for (let p = 0; p < periods; p++) {
      const growth = 1 + p * (0.08 + Math.random() * 0.04);
      const driftX = (Math.sin(p * 0.6 + idx) + Math.random() * 0.5) * 1200;
      const driftY = (Math.cos(p * 0.5 + idx) + Math.random() * 0.5) * 600;
      data.push({
        id,
        category,
        period: p,
        x: Math.max(0, baseX * growth + driftX),
        y: Math.max(0, baseY * growth * 0.22 + driftY),
        size: Math.max(1, baseSize * (0.9 + p * 0.12))
      });
    }
  });
  return data;
}

function generateSankeyData() {
  const nodes = [
    { name: 'Revenue', value: 1000 },
    { name: 'Operating Costs', value: 600 },
    { name: 'Marketing', value: 200 },
    { name: 'R&D', value: 150 },
    { name: 'Profit', value: 400 },
    { name: 'Reinvestment', value: 250 },
    { name: 'Dividends', value: 150 }
  ];

  const links = [
    { source: 0, target: 1, value: 600 },
    { source: 0, target: 2, value: 200 },
    { source: 0, target: 3, value: 150 },
    { source: 0, target: 4, value: 50 },
    { source: 4, target: 5, value: 250 },
    { source: 4, target: 6, value: 150 }
  ];

  const efficiency = 75 + Math.random() * 20;

  return { nodes, links, efficiency };
}

function generateAlternateSankeyData() {
  const timeSeries = [
    { secondaryValue: 50000, primaryValue: 1000000 },
    { secondaryValue: 55000, primaryValue: 950000 },
    { secondaryValue: 60000, primaryValue: 890000 },
    { secondaryValue: 65000, primaryValue: 825000 },
    { secondaryValue: 70000, primaryValue: 755000 }
  ];

  // Backward compatibility mapping
  const economicSchedule = timeSeries.map(d => ({
    distribution: d.secondaryValue,
    remainder: d.primaryValue
  }));

  return SankeyChart.fromEconomicSchedule ? 
    SankeyChart.fromEconomicSchedule(economicSchedule, {
      optimalPayout: 350000,
      charitDeduction: 300000
    }) : {
      timeSeries,
      targetValue: 350000,
      adjustment: 300000
    };
}

function generateMultiSeriesData() {
  return [
    {
      name: 'Series 1',
      color: '#3498db',
      data: generateLineData()
    },
    {
      name: 'Series 2',
      color: '#e74c3c',
      data: generateLineData().map(d => ({ ...d, y: d.y + 20 }))
    },
    {
      name: 'Series 3',
      color: '#2ecc71',
      data: generateLineData().map(d => ({ ...d, y: d.y - 10 }))
    }
  ];
}

function generateLiquidFillData() {
  const total = 1000000;
  const deductible = Math.floor(Math.random() * 400000) + 200000;
  const nonDeductible = total - deductible;
  
  return [
    { title: 'Non-deductible', value: nonDeductible },
    { title: 'Deductible', value: deductible }
  ];
}

function generateSingleLiquidFillData() {
  const percentage = Math.floor(Math.random() * 80) + 20;
  return [
    { title: 'Progress', value: percentage }
  ];
}

function generateAlternateLiquidFillData() {
  const dataSet = {
    timeSeries: [{ initialValue: 1000000 }],
    adjustment: 350000,
    // Backward compatibility
    economicSchedule: [{ beginningPrincipal: 1000000 }],
    charitDeduction: 350000
  };
  
  return LiquidFillChart.fromEconomicData ? 
    LiquidFillChart.fromEconomicData(dataSet) : 
    [{ title: 'Progress', value: Math.floor((dataSet.adjustment / dataSet.timeSeries[0].initialValue) * 100) }];
}

function generateRadialRemainderData() {
  const periods = 10;
  const initialValue = 1000000;
  const growthRate = 0.05;
  
  const timeSeries = [];
  for (let i = 0; i < periods; i++) {
    const value = initialValue * Math.pow(1 + growthRate, i);
    timeSeries.push({ 
      period: i + 1,
      value: Math.floor(value),
      remainder: Math.floor(value) // Keep for backward compatibility
    });
  }
  
  return { 
    timeSeries,
    economicSchedule: timeSeries.map(d => ({ remainder: d.remainder })) // Backward compatibility
  };
}

function generateComplexRadialRemainderData() {
  const periods = 15;
  const initialValue = 1000000;
  
  const timeSeries = [];
  for (let i = 0; i < periods; i++) {
    // Variable growth rate with some volatility
    const baseGrowth = 0.05;
    const volatility = Math.sin(i * 0.5) * 0.02;
    const growthRate = baseGrowth + volatility;
    
    const value = i === 0 ? initialValue : 
      timeSeries[i - 1].value * (1 + growthRate);
    
    timeSeries.push({ 
      period: i + 1,
      value: Math.floor(value),
      remainder: Math.floor(value), // Keep for backward compatibility
      growthRate: growthRate
    });
  }
  
  return { 
    timeSeries,
    economicSchedule: timeSeries.map(d => ({ remainder: d.remainder })) // Backward compatibility
  };
}

function generateChordDiagramData() {
  const years = 5;
  const initialValue = 1000000;
  const baseDistribution = 50000;
  const charitDeduction = initialValue * 0.3;
  
  const economicSchedule = [];
  for (let i = 0; i < years; i++) {
    const remainder = initialValue * Math.pow(1.05, i);
    const distribution = baseDistribution * (1 + i * 0.05);
    
    economicSchedule.push({ 
      remainder: Math.floor(remainder),
      distribution: Math.floor(distribution)
    });
  }
  
  return {
    data: {
      economicSchedule,
      charitDeduction
    }
  };
}

function generateComplexChordDiagramData() {
  const years = 10;
  const initialValue = 2000000;
  const charitDeduction = initialValue * 0.35;
  
  const economicSchedule = [];
  for (let i = 0; i < years; i++) {
    // Variable growth and distributions
    const growthRate = 0.04 + Math.sin(i * 0.3) * 0.02;
    const remainder = i === 0 ? initialValue : 
      economicSchedule[i - 1].remainder * (1 + growthRate);
    
    const distributionRate = 0.045 + Math.cos(i * 0.4) * 0.01;
    const distribution = remainder * distributionRate;
    
    economicSchedule.push({ 
      remainder: Math.floor(remainder),
      distribution: Math.floor(distribution),
      year: i + 1
    });
  }
  
  return {
    data: {
      economicSchedule,
      charitDeduction
    }
  };
}

function generateForceDirectedData() {
  const periods = 8;
  const initialValue = 1000000;
  const baseFlow = 50000;
  const adjustment = initialValue * 0.3;
  const targetValue = initialValue * 0.25;
  
  const timeSeries = [];
  for (let i = 0; i < periods; i++) {
    const primaryValue = initialValue * Math.pow(1.05, i);
    const secondaryValue = baseFlow * (1 + i * 0.05);
    
    timeSeries.push({ 
      period: i + 1,
      primaryValue: Math.floor(primaryValue),
      secondaryValue: Math.floor(secondaryValue),
      remainder: Math.floor(primaryValue), // Backward compatibility
      distribution: Math.floor(secondaryValue) // Backward compatibility
    });
  }
  
  return {
    timeSeries,
    economicSchedule: timeSeries.map(d => ({ remainder: d.remainder, distribution: d.distribution })), // Backward compatibility
    adjustment,
    targetValue,
    charitDeduction: adjustment, // Backward compatibility
    optimalPayout: targetValue // Backward compatibility
  };
}

function generateAnimatedBumpData() {
  const periods = 10;
  const initialValue = 1000000;
  const baseFlow = 50000;
  
  const timeSeries = [];
  for (let i = 0; i < periods; i++) {
    const primaryValue = initialValue * Math.pow(1.05, i);
    const secondaryValue = baseFlow * (1 + i * 0.05);
    const tertiaryValue = secondaryValue * 0.8; // Assume 80% of secondary is tertiary
    
    timeSeries.push({ 
      period: i + 1,
      primaryValue: Math.floor(primaryValue),
      secondaryValue: Math.floor(secondaryValue),
      tertiaryValue: Math.floor(tertiaryValue),
      remainder: Math.floor(primaryValue), // Backward compatibility
      distribution: Math.floor(secondaryValue), // Backward compatibility
      income: Math.floor(tertiaryValue) // Backward compatibility
    });
  }
  
  return {
    timeSeries,
    economicSchedule: timeSeries.map(d => ({ 
      remainder: d.remainder, 
      distribution: d.distribution, 
      income: d.income 
    })) // Backward compatibility
  };
}

function generateRadialTimelineData() {
  const periods = 12;
  const initialValue = 1000000;
  const baseFlow = 50000;
  
  const timeSeries = [];
  for (let i = 0; i < periods; i++) {
    const primaryValue = initialValue * Math.pow(1.05, i);
    const secondaryValue = baseFlow * (1 + i * 0.05);
    const tertiaryValue = secondaryValue * 0.75; // Assume 75% of secondary is tertiary
    
    timeSeries.push({ 
      period: i + 1,
      primaryValue: Math.floor(primaryValue),
      secondaryValue: Math.floor(secondaryValue),
      tertiaryValue: Math.floor(tertiaryValue),
      remainder: Math.floor(primaryValue), // Backward compatibility
      distribution: Math.floor(secondaryValue), // Backward compatibility
      income: Math.floor(tertiaryValue) // Backward compatibility
    });
  }
  
  return {
    timeSeries,
    economicSchedule: timeSeries.map(d => ({ 
      remainder: d.remainder, 
      distribution: d.distribution, 
      income: d.income 
    })) // Backward compatibility
  };
}

function generateFlowContainersData() {
  const periods = 8;
  const baseValue = 100000;
  
  const containers = [];
  for (let i = 0; i < periods; i++) {
    const period = i + 1;
    const value = baseValue * (1 + Math.random() * 0.5); // Random growth
    const fillPercentage = 0.3 + Math.random() * 0.6; // 30-90% fill
    
    containers.push({
      period,
      year: 2024 + i, // Keep for backward compatibility
      value: Math.floor(value),
      amount: Math.floor(value), // Keep for backward compatibility
      fillPercentage,
      label: `Period ${period}`,
      category: i < 4 ? 'Phase A' : 'Phase B'
    });
  }
  
  return {
    containers,
    totalValue: containers.reduce((sum, c) => sum + c.value, 0),
    totalAmount: containers.reduce((sum, c) => sum + c.amount, 0), // Backward compatibility
    title: 'Data Flow Containers'
  };
}

function generateSpiralData() {
  const periods = 12;
  const baseValue = 50000;
  
  const timeSeries = [];
  for (let i = 0; i < periods; i++) {
    const period = i + 1;
    const growthFactor = 1 + (Math.random() * 0.4 - 0.2); // -20% to +20% variation
    
    const primaryValue = Math.floor(baseValue * growthFactor * (1 + i * 0.1));
    const secondaryValue = Math.floor(primaryValue * (0.2 + Math.random() * 0.3));
    const tertiaryValue = Math.floor(primaryValue * (0.1 + Math.random() * 0.2));
    const quaternaryValue = Math.floor(primaryValue * (0.05 + Math.random() * 0.15));
    
    timeSeries.push({
      period,
      primaryValue,
      secondaryValue,
      tertiaryValue,
      quaternaryValue,
      // Legacy support for economic data
      year: period,
      growth: primaryValue,
      income: secondaryValue,
      distribution: tertiaryValue,
      remainder: quaternaryValue
    });
  }
  
  return {
    timeSeries,
    // Legacy format support
    economicSchedule: timeSeries
  };
}

function generateRadialStackedBarData() {
  const years = 8;
  const baseYear = 2024;
  const baseValue = 100000;
  
  const data = [];
  for (let i = 0; i < years; i++) {
    const year = baseYear + i;
    const growthFactor = 1 + (i * 0.08); // 8% annual growth
    const volatility = 0.9 + (Math.random() * 0.2); // ±10% volatility
    
    const totalValue = Math.floor(baseValue * growthFactor * volatility);
    const categoryA = Math.floor(totalValue * (0.4 + Math.random() * 0.2)); // 40-60%
    const categoryC = Math.floor(totalValue * (0.05 + Math.random() * 0.05)); // 5-10%
    const categoryB = totalValue - categoryA - categoryC; // Remainder
    
    data.push({
      year,
      categoryA,
      categoryB,
      categoryC,
      totalValue
    });
  }
  
  return data;
}

function generateCalendarHeatmapData(year = 2024) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const dayMs = 24 * 60 * 60 * 1000;
  const data = [];
  for (let d = new Date(start); d <= end; d = new Date(d.getTime() + dayMs)) {
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const seasonal = Math.sin((d.getMonth() / 12) * Math.PI * 2) * 10 + 15;
    const noise = Math.random() * 6;
    const value = Math.max(0, Math.round((isWeekend ? 0.6 : 1) * (seasonal + noise)));
    data.push({ date: new Date(d), value });
  }
  return data;
}

// Data generators for new charts
function generateTreemapData() {
  return {
    name: "Technology Stack",
    children: [
      {
        name: "Frontend",
        children: [
          { name: "React", value: 45 },
          { name: "Vue", value: 30 },
          { name: "Angular", value: 25 },
          { name: "Svelte", value: 15 }
        ]
      },
      {
        name: "Backend",
        children: [
          { name: "Node.js", value: 40 },
          { name: "Python", value: 35 },
          { name: "Java", value: 30 },
          { name: "Go", value: 20 }
        ]
      },
      {
        name: "Database",
        children: [
          { name: "PostgreSQL", value: 35 },
          { name: "MongoDB", value: 30 },
          { name: "Redis", value: 20 },
          { name: "MySQL", value: 25 }
        ]
      }
    ]
  };
}

function generateGaugeData() {
  return {
    value: Math.random() * 100,
    min: 0,
    max: 100,
    label: "Performance Score"
  };
}

function generateWaterfallData() {
  return [
    { label: "Starting Revenue", value: 100, type: "total" },
    { label: "Product Sales", value: 25 },
    { label: "Service Revenue", value: 15 },
    { label: "Operating Costs", value: -30 },
    { label: "Marketing", value: -8 },
    { label: "R&D", value: -12 },
    { label: "Net Income", value: 90, type: "total" }
  ];
}

function generateRadarData() {
  const axes = ["Speed", "Reliability", "Security", "Usability", "Performance", "Scalability"];
  return [
    {
      name: "Product A",
      values: axes.map(axis => ({
        axis,
        value: Math.random() * 80 + 20
      }))
    },
    {
      name: "Product B", 
      values: axes.map(axis => ({
        axis,
        value: Math.random() * 80 + 20
      }))
    },
    {
      name: "Product C",
      values: axes.map(axis => ({
        axis,
        value: Math.random() * 80 + 20
      }))
    }
  ];
}

function generateHeatmapData() {
  const rows = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const columns = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];
  const data = [];
  
  rows.forEach(row => {
    columns.forEach(column => {
      const isWeekend = row === "Saturday" || row === "Sunday";
      const isBusinessHours = column === "08:00" || column === "12:00" || column === "16:00";
      let baseValue = Math.random() * 50;
      
      if (!isWeekend && isBusinessHours) {
        baseValue += 30; // Higher activity during business hours on weekdays
      }
      
      data.push({
        row,
        column,
        value: Math.round(baseValue)
      });
    });
  });
  
  return data;
}

// Advanced chart data generators
function generateSunburstData() {
  return {
    name: "Organization",
    children: [
      {
        name: "Engineering",
        children: [
          { name: "Frontend", value: 45 },
          { name: "Backend", value: 35 },
          { name: "DevOps", value: 20 },
          { name: "QA", value: 15 }
        ]
      },
      {
        name: "Product",
        children: [
          { name: "Design", value: 25 },
          { name: "Research", value: 20 },
          { name: "Strategy", value: 15 }
        ]
      },
      {
        name: "Marketing",
        children: [
          { name: "Digital", value: 30 },
          { name: "Content", value: 20 },
          { name: "Analytics", value: 15 }
        ]
      }
    ]
  };
}

function generateParallelCoordinatesData() {
  const products = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];
  return products.map((product, i) => ({
    name: product,
    price: Math.random() * 200 + 50,
    quality: Math.random() * 10 + 1,
    popularity: Math.random() * 10 + 1,
    rating: Math.random() * 5 + 1,
    sales: Math.random() * 1000 + 100
  }));
}

function generateStreamData() {
  const categories = ['Category A', 'Category B', 'Category C', 'Category D'];
  const data = [];
  
  for (let month = 0; month < 12; month++) {
    const date = new Date(2023, month, 1);
    const dataPoint = { date };
    
    categories.forEach(category => {
      dataPoint[category] = Math.random() * 50 + 10 + Math.sin(month * 0.5) * 20;
    });
    
    data.push(dataPoint);
  }
  
  return data;
}

function generateViolinData() {
  const groups = ['Group A', 'Group B', 'Group C'];
  return groups.map(group => {
    const values = [];
    const mean = Math.random() * 50 + 25;
    const std = Math.random() * 10 + 5;
    
    // Generate normal distribution
    for (let i = 0; i < 100; i++) {
      let u = 0, v = 0;
      while(u === 0) u = Math.random();
      while(v === 0) v = Math.random();
      const normal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      values.push(mean + normal * std);
    }
    
    return {
      category: group,
      values: values
    };
  });
}

function generateNetworkData() {
  const nodeCount = 15;
  const nodes = [];
  const links = [];
  
  // Generate nodes
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: `Node ${i + 1}`,
      group: Math.floor(i / 5) + 1,
      value: Math.random() * 20 + 5
    });
  }
  
  // Generate links
  for (let i = 0; i < nodeCount * 1.5; i++) {
    const source = Math.floor(Math.random() * nodeCount);
    const target = Math.floor(Math.random() * nodeCount);
    
    if (source !== target) {
      links.push({
        source: `Node ${source + 1}`,
        target: `Node ${target + 1}`,
        value: Math.random() * 5 + 1
      });
    }
  }
  
  return { nodes, links };
}

// Initialize charts
function initializeCharts() {
  // Bar Chart
  barChart = new BarChart('#bar-chart', {
    width: 500,
    height: 300,
    barColor: '#3498db',
    hoverColor: '#2980b9',
    showValues: true
  });
  barChart.setData(generateBarData()).render();

  // Line Chart
  lineChart = new LineChart('#line-chart', {
    width: 500,
    height: 300,
    lineColor: '#e74c3c',
    showPoints: true,
    pointRadius: 4
  });
  lineChart.setData(generateLineData()).render();

  // Pie Chart
  pieChart = new PieChart('#pie-chart', {
    width: 400,
    height: 400,
    showLabels: true,
    showPercentages: true
  });
  pieChart.setData(generatePieData()).render();

  // Donut Chart
  donutChart = new DonutChart('#donut-chart', {
    width: 400,
    height: 400,
    innerRadius: 0.5,
    showCenterText: true,
    centerText: 'Total'
  });
  donutChart.setData(generatePieData()).render();

  // Scatter Plot
  scatterPlot = new ScatterPlot('#scatter-plot', {
    width: 500,
    height: 300,
    pointRadius: 5,
    showTrendLine: false
  });
  scatterPlot.setData(generateScatterData()).render();

  // Area Chart
  areaChart = new AreaChart('#area-chart', {
    width: 500,
    height: 300,
    areaColor: 'rgba(52, 152, 219, 0.6)',
    showLine: true
  });
  areaChart.setData(generateAreaData()).render();

  // Histogram
  histogram = new Histogram('#histogram', {
    width: 500,
    height: 300,
    bins: currentBins,
    showDensity: showDensity,
    xLabel: 'Value',
    yLabel: 'Frequency'
  });
  histogram.setData(generateHistogramData()).render();

  // Sankey Chart
  sankeyChart = new SankeyChart('#sankey-chart', {
    width: 500,
    height: 300,
    particleAnimation: true,
    showValues: true,
    showEfficiency: true
  });
  sankeyChart.setData(generateSankeyData()).render();

  // Liquid Fill Chart
  liquidFillChart = new LiquidFillChart('#liquid-fill-chart', {
    width: 500,
    height: 400,
    dualGauge: true,
    showConnectingFlow: true,
    title: 'Tax Deduction Breakdown'
  });
  liquidFillChart.setData(generateLiquidFillData()).render();

  // Radial Remainder Chart
  radialRemainderChart = new RadialRemainderChart('#radial-remainder-chart', {
    width: 600,
    height: 600,
    spiralRotations: 2,
    animationDuration: 3000,
    title: 'Trust Remainder Growth'
  });
  radialRemainderChart.setData(generateRadialRemainderData()).render();

  // Chord Diagram Chart
  chordDiagramChart = new ChordDiagramChart('#chord-diagram-chart', {
    width: 600,
    height: 600,
    padAngle: 0.05,
    animationDuration: 1200,
    title: 'Trust Relationships'
  });
  chordDiagramChart.setData(generateChordDiagramData()).render();

  // Force Directed Chart
  forceDirectedChart = new ForceDirectedChart('#force-directed-chart', {
    width: 800,
    height: 600,
    particleCount: 15,
    animationDuration: 2000,
    showParticles: true,
    showGlowEffects: true,
    enableZoom: true
  });
  forceDirectedChart.setData(generateForceDirectedData()).render();

  // Animated Bump Chart
  animatedBumpChart = new AnimatedBumpChart('#animated-bump-chart', {
    width: 800,
    height: 500,
    animationDuration: 1500,
    animationDelay: 500,
    principalRatio: 0.6,
    showDistributionBars: true,
    showPoints: true
  });
  animatedBumpChart.setData(generateAnimatedBumpData()).render();

  // Radial Timeline Chart
  radialTimelineChart = new RadialTimelineChart('#radial-timeline-chart', {
    width: 500,
    height: 500,
    animationDuration: 1000,
    animationDelay: 100,
    innerRadius: 40,
    cornerRadius: 2,
    showGridLines: true,
    showYearLabels: true,
    centerLabelText: 'Timeline'
  });
  radialTimelineChart.setData(generateRadialTimelineData()).render();

  // Flow Containers Chart
  flowContainersChart = new FlowContainersChart('#flow-containers-chart', {
    width: 800,
    height: 600,
    animationDuration: 2000,
    showParticles: true,
    showBubbles: true,
    containerSpacing: 80,
    liquidColor: '#3498db'
  });
  flowContainersChart.setData(generateFlowContainersData()).render();

  // Spiral Chart
  spiralChart = new SpiralChart('#spiral-chart', {
    width: 800,
    height: 600,
    turns: 4,
    maxRadius: 250,
    showParticles: true,
    showFlowLines: true,
    showBreathing: true,
    selectedMetric: 'all',
    centerLabel: 'Data Flow',
    animationDuration: 1000,
    particleCount: 15
  });
  spiralChart.setData(generateSpiralData()).render();

  // Radial Stacked Bar Chart
  radialStackedBarChart = new RadialStackedBarChart('#radial-stacked-bar-chart', {
    width: 600,
    height: 600,
    colorScheme: 'blue',
    animated: true,
    showLegend: true,
    showTooltip: true,
    showCenterLabel: true
  });
  radialStackedBarChart.setData(generateRadialStackedBarData()).render();

  // Calendar Heatmap Chart
  calendarHeatmapChart = new CalendarHeatmapChart('#calendar-heatmap-chart', {
    width: 900,
    height: 200,
    colorScheme: 'green',
    year: 2024,
    showTooltip: true,
    showLegend: true,
    animated: true
  });
  calendarHeatmapChart.setData(generateCalendarHeatmapData(2024)).render();

  // Animated Bubble Chart
  animatedBubbleChart = new AnimatedBubbleChart('#animated-bubble-chart', {
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
    showLegend: true
  });
  const bubbleData = generateAnimatedBubbleData(8);
  animatedBubbleChart.setData(bubbleData).setPeriod(0);

  // Treemap Chart
  treemapChart = new TreemapChart('#treemap-chart', {
    width: 600,
    height: 400,
    colorScheme: 'category10',
    animation: true,
    tooltips: true,
    padding: 2
  });
  treemapChart.setData(generateTreemapData()).render();

  // Gauge Chart
  gaugeChart = new GaugeChart('#gauge-chart', {
    width: 400,
    height: 300,
    colorScheme: 'traffic',
    animation: true,
    showValue: true,
    showTicks: true
  });
  gaugeChart.setData(generateGaugeData()).render();

  // Waterfall Chart
  waterfallChart = new WaterfallChart('#waterfall-chart', {
    width: 600,
    height: 400,
    colorScheme: 'default',
    animation: true,
    tooltips: true,
    showConnectors: true,
    showValues: true
  });
  waterfallChart.setData(generateWaterfallData()).render();

  // Radar Chart
  radarChart = new RadarChart('#radar-chart', {
    width: 500,
    height: 500,
    colorScheme: 'category10',
    levels: 5,
    maxValue: 100,
    animation: true,
    tooltips: true,
    legend: true
  });
  radarChart.setData(generateRadarData()).render();

  // Heatmap Chart
  heatmapChart = new HeatmapChart('#heatmap-chart', {
    width: 600,
    height: 400,
    colorScheme: 'blues',
    animation: true,
    tooltips: true,
    showValues: false
  });
  heatmapChart.setData(generateHeatmapData()).render();

  // Sunburst Chart
  sunburstChart = new SunburstChart('#sunburst-chart', {
    width: 600,
    height: 600,
    colorScheme: 'category10',
    animation: true,
    tooltips: true
  });
  sunburstChart.setData(generateSunburstData()).render();

  // Parallel Coordinates Chart
  parallelCoordinatesChart = new ParallelCoordinatesChart('#parallel-coordinates-chart', {
    width: 800,
    height: 400,
    colorScheme: 'category10',
    animation: true,
    tooltips: true,
    brushing: true
  });
  parallelCoordinatesChart.setData(generateParallelCoordinatesData()).render();

  // Stream Chart
  streamChart = new StreamChart('#stream-chart', {
    width: 800,
    height: 400,
    colorScheme: 'spectral',
    animation: true,
    tooltips: true,
    legend: true,
    curve: 'cardinal',
    offset: 'wiggle'
  });
  streamChart.setData(generateStreamData()).render();

  // Violin Chart
  violinChart = new ViolinChart('#violin-chart', {
    width: 600,
    height: 400,
    colorScheme: 'category10',
    animation: true,
    tooltips: true,
    showBoxPlot: true,
    showMedian: true
  });
  violinChart.setData(generateViolinData()).render();

  // Network Chart
  networkChart = new NetworkChart('#network-chart', {
    width: 700,
    height: 500,
    colorScheme: 'category10',
    animation: true,
    tooltips: true,
    showLabels: true,
    nodeRadius: 8,
    linkStrength: 0.1,
    chargeStrength: -300
  });
  networkChart.setData(generateNetworkData()).render();

  // Update code examples
  updateCodeExamples();
}

function updateCodeExamples() {
  document.getElementById('bar-code').textContent = barChartCode;
  document.getElementById('line-code').textContent = lineChartCode;
  document.getElementById('pie-code').textContent = pieChartCode;
  document.getElementById('donut-code').textContent = donutChartCode;
  document.getElementById('scatter-code').textContent = scatterPlotCode;
  document.getElementById('area-code').textContent = areaChartCode;
  document.getElementById('histogram-code').textContent = histogramCode;
  document.getElementById('sankey-code').textContent = sankeyChartCode;
  document.getElementById('liquid-fill-code').textContent = liquidFillChartCode;
  document.getElementById('radial-remainder-code').textContent = radialRemainderChartCode;
  document.getElementById('chord-diagram-code').textContent = chordDiagramChartCode;
  document.getElementById('force-directed-code').textContent = forceDirectedChartCode;
  document.getElementById('animated-bump-code').textContent = animatedBumpChartCode;
  document.getElementById('radial-timeline-code').textContent = radialTimelineChartCode;
  document.getElementById('flow-containers-code').textContent = flowContainersChartCode;
  document.getElementById('spiral-code').textContent = spiralChartCode;
  document.getElementById('radial-stacked-bar-code').textContent = radialStackedBarChartCode;
  document.getElementById('calendar-heatmap-code').textContent = calendarHeatmapChartCode;
  const bubbleCodeEl = document.getElementById('animated-bubble-code');
  if (bubbleCodeEl) bubbleCodeEl.textContent = animatedBubbleChartCode;
  
  // New chart code examples
  document.getElementById('treemap-code').textContent = treemapChartCode;
  document.getElementById('gauge-code').textContent = gaugeChartCode;
  document.getElementById('waterfall-code').textContent = waterfallChartCode;
  document.getElementById('radar-code').textContent = radarChartCode;
  document.getElementById('heatmap-code').textContent = heatmapChartCode;
  
  // Advanced chart code examples
  document.getElementById('sunburst-code').textContent = sunburstChartCode;
  document.getElementById('parallel-coordinates-code').textContent = parallelCoordinatesChartCode;
  document.getElementById('stream-code').textContent = streamChartCode;
  document.getElementById('violin-code').textContent = violinChartCode;
  document.getElementById('network-code').textContent = networkChartCode;
}

// Global functions for button interactions
window.updateBarChart = () => {
  barChart.updateData(generateBarData());
};

window.toggleBarOrientation = () => {
  const currentOrientation = barChart.options.orientation;
  barChart.updateOptions({ 
    orientation: currentOrientation === 'vertical' ? 'horizontal' : 'vertical' 
  });
  barChart.render();
};

window.toggleBarValues = () => {
  barChart.updateOptions({ 
    showValues: !barChart.options.showValues 
  });
  barChart.render();
};

window.updateLineChart = () => {
  if (isMultiSeries) {
    lineChart.renderMultiSeries(generateMultiSeriesData());
  } else {
    lineChart.updateData(generateLineData());
  }
};

window.toggleLinePoints = () => {
  lineChart.updateOptions({ 
    showPoints: !lineChart.options.showPoints 
  });
  lineChart.render();
};

window.addLineSeries = () => {
  isMultiSeries = !isMultiSeries;
  if (isMultiSeries) {
    lineChart.renderMultiSeries(generateMultiSeriesData());
  } else {
    lineChart.updateData(generateLineData());
  }
};

window.updatePieChart = () => {
  pieChart.updateData(generatePieData());
};

window.explodePieSlice = () => {
  const randomIndex = Math.floor(Math.random() * pieChart.data.length);
  pieChart.explodeSlice(randomIndex, 30);
};

window.resetPieSlices = () => {
  pieChart.resetSlices();
};

window.updateDonutChart = () => {
  donutChart.updateData(generatePieData());
};

window.showProgress = () => {
  const progress = Math.floor(Math.random() * 80) + 20;
  donutChart.renderProgress(progress, 100, {
    progressColor: '#3498db',
    remainingColor: '#ecf0f1',
    showPercentage: true
  });
};

window.animateProgress = () => {
  const targetProgress = Math.floor(Math.random() * 80) + 20;
  donutChart.animateProgress(targetProgress, 100, 2000, {
    progressColor: '#e74c3c',
    remainingColor: '#ecf0f1'
  });
};

window.updateScatterPlot = () => {
  scatterPlot.updateData(generateScatterData());
};

window.toggleTrendLine = () => {
  showTrendLine = !showTrendLine;
  scatterPlot.updateOptions({ showTrendLine });
  scatterPlot.render();
};

window.showBubbleChart = () => {
  const bubbleData = generateScatterData().map(d => ({
    ...d,
    size: Math.random() * 50 + 10
  }));
  scatterPlot.renderBubbleChart('size');
  scatterPlot.setData(bubbleData).render();
};

window.updateAreaChart = () => {
  areaChart.updateData(generateAreaData());
};

window.toggleAreaLine = () => {
  areaChart.updateOptions({ 
    showLine: !areaChart.options.showLine 
  });
  areaChart.render();
};

window.showStackedArea = () => {
  const stackedData = [
    {
      name: 'Layer 1',
      data: generateAreaData()
    },
    {
      name: 'Layer 2', 
      data: generateAreaData().map(d => ({ ...d, y: d.y * 0.7 }))
    },
    {
      name: 'Layer 3',
      data: generateAreaData().map(d => ({ ...d, y: d.y * 0.5 }))
    }
  ];
  areaChart.renderStacked(stackedData);
};

window.updateHistogram = () => {
  histogram.updateData(generateHistogramData());
};

window.toggleDensity = () => {
  showDensity = !showDensity;
  histogram.updateOptions({ showDensity });
  histogram.render();
};

window.changeBins = () => {
  currentBins = currentBins === 20 ? 40 : currentBins === 40 ? 10 : 20;
  histogram.updateOptions({ bins: currentBins });
  histogram.render();
};

window.updateSankeyChart = () => {
  sankeyChart.updateData(generateSankeyData());
};

window.toggleSankeyParticles = () => {
  sankeyChart.toggleParticles();
};

window.showEconomicSankey = () => {
  sankeyChart.updateData(generateAlternateSankeyData());
};

window.updateLiquidFillChart = () => {
  liquidFillChart.updateData(generateLiquidFillData());
};

window.toggleLiquidFillMode = () => {
  const isDual = liquidFillChart.options.dualGauge;
  liquidFillChart.setDualGauge(!isDual);
  if (!isDual) {
    liquidFillChart.updateData(generateLiquidFillData());
  } else {
    liquidFillChart.updateData(generateSingleLiquidFillData());
  }
  liquidFillChart.render();
};

window.showEconomicLiquidFill = () => {
  liquidFillChart.setDualGauge(true);
  liquidFillChart.updateData(generateAlternateLiquidFillData());
};

window.updateRadialRemainderChart = () => {
  radialRemainderChart.updateData(generateRadialRemainderData());
};

window.showComplexRadialRemainder = () => {
  radialRemainderChart.updateData(generateComplexRadialRemainderData());
};

window.changeRadialSpirals = () => {
  const currentRotations = radialRemainderChart.options.spiralRotations;
  const newRotations = currentRotations === 2 ? 3 : currentRotations === 3 ? 1 : 2;
  radialRemainderChart.updateOptions({ spiralRotations: newRotations });
  radialRemainderChart.render();
};

window.updateChordDiagramChart = () => {
  chordDiagramChart.updateData(generateChordDiagramData());
};

window.showComplexChordDiagram = () => {
  chordDiagramChart.updateData(generateComplexChordDiagramData());
};

window.changeChordPadding = () => {
  const currentPadding = chordDiagramChart.options.padAngle;
  const newPadding = currentPadding === 0.05 ? 0.1 : currentPadding === 0.1 ? 0.02 : 0.05;
  chordDiagramChart.updateOptions({ padAngle: newPadding });
  chordDiagramChart.render();
};

window.updateForceDirectedChart = () => {
  forceDirectedChart.updateData(generateForceDirectedData());
};

window.toggleForceParticles = () => {
  const currentParticles = forceDirectedChart.options.showParticles;
  forceDirectedChart.updateOptions({ showParticles: !currentParticles });
  forceDirectedChart.render();
};

window.toggleForceGlow = () => {
  const currentGlow = forceDirectedChart.options.showGlowEffects;
  forceDirectedChart.updateOptions({ showGlowEffects: !currentGlow });
  forceDirectedChart.render();
};

window.updateAnimatedBumpChart = () => {
  animatedBumpChart.updateData(generateAnimatedBumpData());
};

window.toggleBumpPoints = () => {
  const currentPoints = animatedBumpChart.options.showPoints;
  animatedBumpChart.updateOptions({ showPoints: !currentPoints });
  animatedBumpChart.render();
};

window.toggleBumpBars = () => {
  const currentBars = animatedBumpChart.options.showDistributionBars;
  animatedBumpChart.updateOptions({ showDistributionBars: !currentBars });
  animatedBumpChart.render();
};

window.updateRadialTimelineChart = () => {
  radialTimelineChart.updateData(generateRadialTimelineData());
};

window.toggleRadialGrid = () => {
  const currentGrid = radialTimelineChart.options.showGridLines;
  radialTimelineChart.updateOptions({ showGridLines: !currentGrid });
  radialTimelineChart.render();
};

window.toggleRadialLabels = () => {
  const currentLabels = radialTimelineChart.options.showYearLabels;
  radialTimelineChart.updateOptions({ showYearLabels: !currentLabels });
  radialTimelineChart.render();
};

window.updateFlowContainersChart = () => {
  flowContainersChart.updateData(generateFlowContainersData());
};

window.toggleFlowParticles = () => {
  const currentParticles = flowContainersChart.options.showParticles;
  flowContainersChart.updateOptions({ showParticles: !currentParticles });
  flowContainersChart.render();
};

window.toggleFlowBubbles = () => {
  const currentBubbles = flowContainersChart.options.showBubbles;
  flowContainersChart.updateOptions({ showBubbles: !currentBubbles });
  flowContainersChart.render();
};

window.startFlowAnimation = () => {
  flowContainersChart.startAnimation();
};

// Spiral Chart Functions
window.updateSpiralChart = () => {
  spiralChart.setData(generateSpiralData()).render();
};

window.toggleSpiralParticles = () => {
  const currentParticles = spiralChart.options.showParticles;
  spiralChart.options.showParticles = !currentParticles;
  spiralChart.render();
};

window.toggleSpiralFlowLines = () => {
  const currentFlowLines = spiralChart.options.showFlowLines;
  spiralChart.options.showFlowLines = !currentFlowLines;
  spiralChart.render();
};

window.startSpiralAnimation = () => {
  spiralChart.startAnimation();
};

window.changeSpiralMetric = () => {
  const metrics = ['all', 'primary', 'secondary', 'tertiary', 'quaternary'];
  const currentIndex = metrics.indexOf(spiralChart.options.selectedMetric);
  const nextIndex = (currentIndex + 1) % metrics.length;
  spiralChart.setSelectedMetric(metrics[nextIndex]);
};

// Radial Stacked Bar Chart Functions
window.updateRadialStackedBarChart = () => {
  radialStackedBarChart.setData(generateRadialStackedBarData()).render();
};

window.changeColorScheme = () => {
  const colorSchemes = ['blue', 'orange', 'green'];
  const currentIndex = colorSchemes.indexOf(radialStackedBarChart.options.colorScheme);
  const nextIndex = (currentIndex + 1) % colorSchemes.length;
  radialStackedBarChart.updateColorScheme(colorSchemes[nextIndex]);
};

window.toggleRadialAnimation = () => {
  const currentAnimated = radialStackedBarChart.options.animated;
  radialStackedBarChart.options.animated = !currentAnimated;
  radialStackedBarChart.render();
};

window.toggleRadialLegend = () => {
  const currentLegend = radialStackedBarChart.options.showLegend;
  radialStackedBarChart.options.showLegend = !currentLegend;
  radialStackedBarChart.init();
  radialStackedBarChart.render();
};

// Calendar Heatmap Chart controls
window.updateCalendarHeatmapChart = () => {
  const currentYear = calendarHeatmapChart.options.year;
  calendarHeatmapChart.setData(generateCalendarHeatmapData(currentYear)).render();
};

window.changeCalendarColorScheme = () => {
  const colorSchemes = ['green', 'blue', 'purple', 'orange'];
  const currentScheme = calendarHeatmapChart.options.colorScheme;
  const currentIndex = colorSchemes.indexOf(currentScheme);
  const nextScheme = colorSchemes[(currentIndex + 1) % colorSchemes.length];
  calendarHeatmapChart.updateColorScheme(nextScheme);
};

window.changeCalendarYear = () => {
  const years = [2020, 2021, 2022, 2023, 2024];
  const currentYear = calendarHeatmapChart.options.year;
  const currentIndex = years.indexOf(currentYear);
  const nextYear = years[(currentIndex + 1) % years.length];
  calendarHeatmapChart.updateYear(nextYear);
  calendarHeatmapChart.setData(generateCalendarHeatmapData(nextYear)).render();
};

window.toggleCalendarAnimation = () => {
  const currentAnimated = calendarHeatmapChart.options.animated;
  calendarHeatmapChart.options.animated = !currentAnimated;
  calendarHeatmapChart.render();
};

// Animated Bubble Chart controls
window.updateAnimatedBubbleChart = () => {
  const currentPeriods = 8;
  animatedBubbleChart.setData(generateAnimatedBubbleData(currentPeriods)).setPeriod(0);
};

window.nextAnimatedPeriod = () => {
  const timeField = animatedBubbleChart.options.timeField;
  const maxPeriod = d3.max(animatedBubbleChart.data, d => d[timeField]);
  const next = (animatedBubbleChart.currentPeriod + 1) % (maxPeriod + 1);
  animatedBubbleChart.setPeriod(next);
};

window.prevAnimatedPeriod = () => {
  const timeField = animatedBubbleChart.options.timeField;
  const maxPeriod = d3.max(animatedBubbleChart.data, d => d[timeField]);
  const prev = (animatedBubbleChart.currentPeriod - 1 + (maxPeriod + 1)) % (maxPeriod + 1);
  animatedBubbleChart.setPeriod(prev);
};

window.toggleAnimatedBubbleLegend = () => {
  animatedBubbleChart.options.showLegend = !animatedBubbleChart.options.showLegend;
  animatedBubbleChart.render();
};

// Animation state for bubble chart
let bubbleAnimationInterval = null;
let isBubbleAnimationPlaying = false;

window.playAnimatedBubbleChart = () => {
  if (isBubbleAnimationPlaying) return;
  
  isBubbleAnimationPlaying = true;
  const timeField = animatedBubbleChart.options.timeField;
  const maxPeriod = d3.max(animatedBubbleChart.data, d => d[timeField]);
  
  bubbleAnimationInterval = setInterval(() => {
    const next = (animatedBubbleChart.currentPeriod + 1) % (maxPeriod + 1);
    animatedBubbleChart.setPeriod(next);
  }, 1500); // Change period every 1.5 seconds
};

window.pauseAnimatedBubbleChart = () => {
  if (!isBubbleAnimationPlaying) return;
  
  isBubbleAnimationPlaying = false;
  if (bubbleAnimationInterval) {
    clearInterval(bubbleAnimationInterval);
    bubbleAnimationInterval = null;
  }
};

// Treemap Chart controls
window.updateTreemapChart = () => {
  treemapChart.setData(generateTreemapData()).render();
};

window.changeTreemapColorScheme = () => {
  const colorSchemes = ['category10', 'blues', 'greens', 'oranges', 'purples'];
  const currentScheme = treemapChart.options.colorScheme;
  const currentIndex = colorSchemes.indexOf(currentScheme);
  const nextScheme = colorSchemes[(currentIndex + 1) % colorSchemes.length];
  treemapChart.updateColorScheme(nextScheme);
};

window.toggleTreemapAnimation = () => {
  treemapChart.options.animation = !treemapChart.options.animation;
  treemapChart.render();
};

// Gauge Chart controls
window.updateGaugeChart = () => {
  gaugeChart.setData(generateGaugeData()).render();
};

window.changeGaugeColorScheme = () => {
  const colorSchemes = ['traffic', 'blue', 'purple', 'green'];
  const currentScheme = gaugeChart.options.colorScheme;
  const currentIndex = colorSchemes.indexOf(currentScheme);
  const nextScheme = colorSchemes[(currentIndex + 1) % colorSchemes.length];
  gaugeChart.updateColorScheme(nextScheme);
};

window.toggleGaugeAnimation = () => {
  gaugeChart.options.animation = !gaugeChart.options.animation;
  gaugeChart.render();
};

// Waterfall Chart controls
window.updateWaterfallChart = () => {
  waterfallChart.setData(generateWaterfallData()).render();
};

window.changeWaterfallColorScheme = () => {
  const colorSchemes = ['default', 'business', 'muted'];
  const currentScheme = waterfallChart.options.colorScheme;
  const currentIndex = colorSchemes.indexOf(currentScheme);
  const nextScheme = colorSchemes[(currentIndex + 1) % colorSchemes.length];
  waterfallChart.updateColorScheme(nextScheme);
};

window.toggleWaterfallAnimation = () => {
  waterfallChart.options.animation = !waterfallChart.options.animation;
  waterfallChart.render();
};

// Radar Chart controls
window.updateRadarChart = () => {
  radarChart.setData(generateRadarData()).render();
};

window.changeRadarColorScheme = () => {
  const colorSchemes = ['category10', 'blues', 'greens', 'oranges', 'purples'];
  const currentScheme = radarChart.options.colorScheme;
  const currentIndex = colorSchemes.indexOf(currentScheme);
  const nextScheme = colorSchemes[(currentIndex + 1) % colorSchemes.length];
  radarChart.updateColorScheme(nextScheme);
};

window.toggleRadarAnimation = () => {
  radarChart.options.animation = !radarChart.options.animation;
  radarChart.render();
};

window.toggleRadarLegend = () => {
  radarChart.options.legend = !radarChart.options.legend;
  radarChart.render();
};

// Heatmap Chart controls
window.updateHeatmapChart = () => {
  heatmapChart.setData(generateHeatmapData()).render();
};

window.changeHeatmapColorScheme = () => {
  const colorSchemes = ['blues', 'greens', 'reds', 'oranges', 'purples', 'viridis', 'plasma', 'inferno'];
  const currentScheme = heatmapChart.options.colorScheme;
  const currentIndex = colorSchemes.indexOf(currentScheme);
  const nextScheme = colorSchemes[(currentIndex + 1) % colorSchemes.length];
  heatmapChart.updateColorScheme(nextScheme);
};

window.toggleHeatmapAnimation = () => {
  heatmapChart.options.animation = !heatmapChart.options.animation;
  heatmapChart.render();
};

window.toggleHeatmapValues = () => {
  heatmapChart.options.showValues = !heatmapChart.options.showValues;
  heatmapChart.render();
};

// Copy to clipboard function
window.copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    // Show temporary feedback
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.background = '#27ae60';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 1000);
  });
};

// Make code examples available globally
window.importCode = importCode;
window.barChartCode = barChartCode;
window.lineChartCode = lineChartCode;
window.pieChartCode = pieChartCode;
window.donutChartCode = donutChartCode;
window.scatterPlotCode = scatterPlotCode;
window.areaChartCode = areaChartCode;
window.histogramCode = histogramCode;
window.sankeyChartCode = sankeyChartCode;
window.radialStackedBarChartCode = radialStackedBarChartCode;
window.calendarHeatmapChartCode = calendarHeatmapChartCode;
window.animatedBubbleChartCode = animatedBubbleChartCode;
window.treemapChartCode = treemapChartCode;
window.gaugeChartCode = gaugeChartCode;
window.waterfallChartCode = waterfallChartCode;
window.radarChartCode = radarChartCode;
window.heatmapChartCode = heatmapChartCode;

// Advanced Chart Controls

// Sunburst Chart controls
window.updateSunburstChart = () => {
  sunburstChart.setData(generateSunburstData()).render();
};

window.changeSunburstColorScheme = () => {
  const colorSchemes = ['category10', 'blues', 'greens', 'oranges', 'purples'];
  const currentScheme = sunburstChart.options.colorScheme;
  const currentIndex = colorSchemes.indexOf(currentScheme);
  const nextScheme = colorSchemes[(currentIndex + 1) % colorSchemes.length];
  sunburstChart.updateColorScheme(nextScheme);
};

window.toggleSunburstAnimation = () => {
  sunburstChart.options.animation = !sunburstChart.options.animation;
  sunburstChart.render();
};

window.resetSunburstZoom = () => {
  if (sunburstChart.resetZoom) {
    sunburstChart.resetZoom();
  }
};

// Parallel Coordinates Chart controls
window.updateParallelCoordinatesChart = () => {
  parallelCoordinatesChart.setData(generateParallelCoordinatesData()).render();
};

window.changeParallelCoordinatesColorScheme = () => {
  const colorSchemes = ['category10', 'blues', 'greens', 'oranges', 'purples'];
  const currentScheme = parallelCoordinatesChart.options.colorScheme;
  const currentIndex = colorSchemes.indexOf(currentScheme);
  const nextScheme = colorSchemes[(currentIndex + 1) % colorSchemes.length];
  parallelCoordinatesChart.updateColorScheme(nextScheme);
};

window.toggleParallelCoordinatesAnimation = () => {
  parallelCoordinatesChart.options.animation = !parallelCoordinatesChart.options.animation;
  parallelCoordinatesChart.render();
};

window.clearParallelCoordinatesBrushes = () => {
  if (parallelCoordinatesChart.clearBrushes) {
    parallelCoordinatesChart.clearBrushes();
  }
};

// Stream Chart controls
window.updateStreamChart = () => {
  streamChart.setData(generateStreamData()).render();
};

window.changeStreamColorScheme = () => {
  const colorSchemes = ['spectral', 'blues', 'greens', 'oranges', 'purples'];
  const currentScheme = streamChart.options.colorScheme;
  const currentIndex = colorSchemes.indexOf(currentScheme);
  const nextScheme = colorSchemes[(currentIndex + 1) % colorSchemes.length];
  streamChart.updateColorScheme(nextScheme);
};

window.toggleStreamAnimation = () => {
  streamChart.options.animation = !streamChart.options.animation;
  streamChart.render();
};

window.changeStreamOffset = () => {
  const offsets = ['wiggle', 'silhouette', 'expand', 'diverging'];
  const currentOffset = streamChart.options.offset;
  const currentIndex = offsets.indexOf(currentOffset);
  const nextOffset = offsets[(currentIndex + 1) % offsets.length];
  streamChart.updateOptions({ offset: nextOffset });
  streamChart.render();
};

// Violin Chart controls
window.updateViolinChart = () => {
  violinChart.setData(generateViolinData()).render();
};

window.changeViolinColorScheme = () => {
  const colorSchemes = ['category10', 'blues', 'greens', 'oranges', 'purples'];
  const currentScheme = violinChart.options.colorScheme;
  const currentIndex = colorSchemes.indexOf(currentScheme);
  const nextScheme = colorSchemes[(currentIndex + 1) % colorSchemes.length];
  violinChart.updateColorScheme(nextScheme);
};

window.toggleViolinAnimation = () => {
  violinChart.options.animation = !violinChart.options.animation;
  violinChart.render();
};

window.toggleViolinBoxPlot = () => {
  violinChart.options.showBoxPlot = !violinChart.options.showBoxPlot;
  violinChart.render();
};

// Network Chart controls
window.updateNetworkChart = () => {
  networkChart.setData(generateNetworkData()).render();
};

window.changeNetworkColorScheme = () => {
  const colorSchemes = ['category10', 'blues', 'greens', 'oranges', 'purples'];
  const currentScheme = networkChart.options.colorScheme;
  const currentIndex = colorSchemes.indexOf(currentScheme);
  const nextScheme = colorSchemes[(currentIndex + 1) % colorSchemes.length];
  networkChart.updateColorScheme(nextScheme);
};

window.toggleNetworkAnimation = () => {
  networkChart.options.animation = !networkChart.options.animation;
  networkChart.render();
};

window.toggleNetworkLabels = () => {
  networkChart.options.showLabels = !networkChart.options.showLabels;
  networkChart.render();
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Remove loading spinners
  document.querySelectorAll('.loading').forEach(loader => {
    loader.style.display = 'none';
  });
  
  // Initialize all charts
  setTimeout(initializeCharts, 100);
});

console.log('D3 Charts Viz Library Playground loaded successfully!');
