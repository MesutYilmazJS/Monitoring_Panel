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

    // Create glowing neon gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)'); // Neon Emerald
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Gecikme (ms)',
          data: [],
          borderColor: '#10B981', // Emerald Neon
          borderWidth: 2,
          backgroundColor: gradient,
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#064E3B'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#9CA3AF', font: { family: 'Fira Code, monospace', size: 10 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#9CA3AF', font: { family: 'Fira Code, monospace', size: 10 } }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111827',
            titleColor: '#10B981',
            bodyColor: '#F3F4F6',
            borderColor: '#374151',
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

    // Color spike if latency > 300ms
    if (latency > 300) {
      this.chart.data.datasets[0].borderColor = '#EF4444'; // Red alert for latency spikes
    } else {
      this.chart.data.datasets[0].borderColor = '#10B981'; // Green normal
    }

    this.chart.data.labels.push(timeLabel);
    this.chart.data.datasets[0].data.push(latency);

    this.chart.update('none'); // Silent fast update
    this._updateStatsUI();
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
}
