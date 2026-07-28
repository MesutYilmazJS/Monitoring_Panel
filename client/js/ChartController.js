/**
 * ChartController Class
 * Encapsulates Chart.js line chart instance and real-time metric visualization.
 */
class ChartController {
  constructor(canvasId, maxPoints = 25) {
    this.canvasId = canvasId;
    this.maxPoints = maxPoints;
    this.chart = null;
    this.metricsHistory = [];
    this.primaryColor = '#10B981';
  }

  /**
   * Initializes Chart.js line chart with hacker/cyberpunk dark theme styling
   */
  init() {
    const canvas = document.getElementById(this.canvasId);
    if (!canvas) {
      console.error(`❌ Canvas element #${this.canvasId} not found!`);
      return;
    }

    const ctx = canvas.getContext('2d');
    this.primaryColor = this._getThemePrimaryColor();

    // Create glowing neon gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, this._hexToRgba(this.primaryColor, 0.35));
    gradient.addColorStop(1, this._hexToRgba(this.primaryColor, 0.0));

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Gecikme (ms)',
          data: [],
          borderColor: this.primaryColor,
          borderWidth: 2.5,
          backgroundColor: gradient,
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: this.primaryColor,
          pointBorderColor: '#000000'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { family: 'Fira Code, monospace', size: 10 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { family: 'Fira Code, monospace', size: 10 } }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: this.primaryColor,
            bodyColor: '#F3F4F6',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            displayColors: false,
            callbacks: {
              label: (context) => ` Latency: ${context.parsed.y} ms`
            }
          }
        }
      }
    });
  }

  /**
   * Pushes a new performance metric point and updates chart dynamically
   */
  addMetric(metric) {
    if (!this.chart) return;

    const timeLabel = new Date(metric.created_at || Date.now()).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const latency = metric.response_time_ms;
    this.metricsHistory.push(latency);

    // Keep window bounded to maxPoints
    if (this.chart.data.labels.length >= this.maxPoints) {
      this.chart.data.labels.shift();
      this.chart.data.datasets[0].data.shift();
    }

    const currentPrimary = this._getThemePrimaryColor();

    // Color spike if latency > 300ms
    if (latency > 300) {
      this.chart.data.datasets[0].borderColor = '#EF4444'; // Red alert for latency spikes
      this.chart.data.datasets[0].pointBackgroundColor = '#EF4444';
    } else {
      this.chart.data.datasets[0].borderColor = currentPrimary;
      this.chart.data.datasets[0].pointBackgroundColor = currentPrimary;
    }

    this.chart.data.labels.push(timeLabel);
    this.chart.data.datasets[0].data.push(latency);

    this.chart.update('none'); // Silent fast update
    this._updateStatsUI();
  }

  /**
   * Re-theme chart when theme changes
   */
  updateTheme() {
    if (!this.chart) return;
    const canvas = document.getElementById(this.canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    this.primaryColor = this._getThemePrimaryColor();
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, this._hexToRgba(this.primaryColor, 0.35));
    gradient.addColorStop(1, this._hexToRgba(this.primaryColor, 0.0));

    this.chart.data.datasets[0].borderColor = this.primaryColor;
    this.chart.data.datasets[0].pointBackgroundColor = this.primaryColor;
    this.chart.data.datasets[0].backgroundColor = gradient;
    this.chart.options.plugins.tooltip.titleColor = this.primaryColor;
    this.chart.update();
  }

  /**
   * Load bulk historical metrics (e.g. from initial API fetch)
   */
  loadInitialMetrics(metricsList) {
    if (!metricsList || !Array.isArray(metricsList)) return;
    metricsList.forEach(m => this.addMetric(m));
  }

  /**
   * Private helper to update summary stat elements on UI
   */
  _updateStatsUI() {
    if (this.metricsHistory.length === 0) return;

    const lastLatency = this.metricsHistory[this.metricsHistory.length - 1];
    const avgLatency = Math.round(this.metricsHistory.reduce((a, b) => a + b, 0) / this.metricsHistory.length);
    const maxLatency = Math.max(...this.metricsHistory);

    const currentEl = document.getElementById('stat-current-latency');
    const avgEl = document.getElementById('stat-avg-latency');
    const maxEl = document.getElementById('stat-max-latency');

    if (currentEl) currentEl.textContent = `${lastLatency} ms`;
    if (avgEl) avgEl.textContent = `${avgLatency} ms`;
    if (maxEl) maxEl.textContent = `${maxLatency} ms`;
  }

  _getThemePrimaryColor() {
    const style = getComputedStyle(document.documentElement);
    const color = style.getPropertyValue('--accent-primary').trim();
    return color || '#10B981';
  }

  _hexToRgba(hex, alpha = 1) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
  }
}

/**
 * RamChartController Class
 * Encapsulates live mini line chart for server RAM telemetry visualization.
 */
class RamChartController {
  constructor(canvasId, maxPoints = 20) {
    this.canvasId = canvasId;
    this.maxPoints = maxPoints;
    this.chart = null;
  }

  init() {
    const canvas = document.getElementById(this.canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 100);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'RAM (MB)',
          data: [],
          borderColor: '#38BDF8',
          borderWidth: 2,
          backgroundColor: gradient,
          fill: true,
          tension: 0.3,
          pointRadius: 2,
          pointBackgroundColor: '#38BDF8'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 250 },
        scales: {
          x: { display: false },
          y: {
            beginAtZero: false,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 9 } }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` RAM: ${context.parsed.y} MB`
            }
          }
        }
      }
    });
  }

  addRamPoint(ramMb) {
    if (!this.chart) return;
    const timeLabel = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (this.chart.data.labels.length >= this.maxPoints) {
      this.chart.data.labels.shift();
      this.chart.data.datasets[0].data.shift();
    }

    this.chart.data.labels.push(timeLabel);
    this.chart.data.datasets[0].data.push(ramMb);
    this.chart.update('none');
  }
}
