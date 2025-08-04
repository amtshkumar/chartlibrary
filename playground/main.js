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
  DataUtils,
  ColorUtils
} from 'd3-charts-viz-library';

// Global chart instances
let barChart, lineChart, pieChart, donutChart, scatterPlot, areaChart, histogram, sankeyChart, liquidFillChart, radialRemainderChart;
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

// Data generators
function generateBarData() {
  const labels = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];
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
  const labels = ['Desktop', 'Mobile', 'Tablet', 'Other'];
  return labels.map(label => ({
    label,
    value: Math.floor(Math.random() * 40) + 10
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

function generateEconomicSankeyData() {
  const economicSchedule = [
    { distribution: 50000, remainder: 1000000 },
    { distribution: 55000, remainder: 950000 },
    { distribution: 60000, remainder: 890000 },
    { distribution: 65000, remainder: 825000 },
    { distribution: 70000, remainder: 755000 }
  ];

  return SankeyChart.fromEconomicSchedule(economicSchedule, {
    optimalPayout: 350000,
    charitDeduction: 300000
  });
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

function generateEconomicLiquidFillData() {
  const economicData = {
    economicSchedule: [{ beginningPrincipal: 1000000 }],
    charitDeduction: 350000
  };
  
  return LiquidFillChart.fromEconomicData(economicData);
}

function generateRadialRemainderData() {
  const years = 10;
  const initialValue = 1000000;
  const growthRate = 0.05;
  
  const economicSchedule = [];
  for (let i = 0; i < years; i++) {
    const remainder = initialValue * Math.pow(1 + growthRate, i);
    economicSchedule.push({ remainder: Math.floor(remainder) });
  }
  
  return { economicSchedule };
}

function generateComplexRadialRemainderData() {
  const years = 15;
  const initialValue = 1000000;
  
  const economicSchedule = [];
  for (let i = 0; i < years; i++) {
    // Variable growth rate with some volatility
    const baseGrowth = 0.05;
    const volatility = Math.sin(i * 0.5) * 0.02;
    const growthRate = baseGrowth + volatility;
    
    const remainder = i === 0 ? initialValue : 
      economicSchedule[i - 1].remainder * (1 + growthRate);
    
    economicSchedule.push({ 
      remainder: Math.floor(remainder),
      year: i + 1,
      growthRate: growthRate
    });
  }
  
  return { economicSchedule };
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
  sankeyChart.updateData(generateEconomicSankeyData());
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
  liquidFillChart.updateData(generateEconomicLiquidFillData());
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
