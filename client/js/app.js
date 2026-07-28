/**
 * Main Application Orchestrator Class
 * Manages lifecycle and strict inter-class data flow.
 */
class App {
  constructor() {
    const serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'http://localhost:3001' 
      : ''; // Canlı ortama geçtiğinde göreceli (relative) veya sabit URL kullanır

    this.serverUrl = serverUrl;
    this.socketManager = new SocketManager(serverUrl);
    this.chartController = new ChartController('latencyChart', 30);
    this.securityLogger = new SecurityLogger('terminal-logs');
    this.attackSimulator = new AttackSimulator(serverUrl);
  }

  /**
   * Initializes all application modules and establishes event bindings
   */
  async init() {
    console.log('🚀 Initializing Monitoring Panel Application...');

    // 1. Initialize Components
    this.chartController.init();
    this.securityLogger.init();
    this.attackSimulator.init();

    // 2. Load Historical Data via REST API
    await this._fetchInitialData();

    // 3. Connect Real-time Sockets and Bind Handlers
    this._setupSocketListeners();
    this.socketManager.connect();
  }

  /**
   * Fetches initial historical metrics & security logs on page boot
   */
  async _fetchInitialData() {
    try {
      // Fetch recent metrics
      const metricsRes = await fetch(`${this.serverUrl}/api/metrics`);
      if (metricsRes.ok) {
        const metrics = await metricsRes.json();
        this.chartController.loadInitialMetrics(metrics);
      }
    } catch (err) {
      console.warn('⚠️ Could not fetch initial metrics from API:', err.message);
    }

    try {
      // Fetch recent logs
      const logsRes = await fetch(`${this.serverUrl}/api/logs`);
      if (logsRes.ok) {
        const logs = await logsRes.json();
        this.securityLogger.loadInitialLogs(logs);
      }
    } catch (err) {
      console.warn('⚠️ Could not fetch initial security logs from API:', err.message);
    }
  }

  /**
   * Routes socket events to respective controllers
   */
  _setupSocketListeners() {
    // Socket Connection Status Updates UI
    this.socketManager.on('connect', () => {
      this._updateConnectionBadge(true);
    });

    this.socketManager.on('disconnect', () => {
      this._updateConnectionBadge(false);
    });

    // Real-time Performance Metric -> Route to ChartController
    this.socketManager.on('performance_metric', (metric) => {
      this.chartController.addMetric(metric);
    });

    // Real-time Security Alert -> Route to SecurityLogger
    this.socketManager.on('security_alert', (alert) => {
      this.securityLogger.logAlert(alert);
    });
  }

  _updateConnectionBadge(isConnected) {
    const badge = document.getElementById('status-badge');
    const badgeText = document.getElementById('status-text');
    const badgeDot = document.getElementById('status-dot');

    if (!badge || !badgeText || !badgeDot) return;

    if (isConnected) {
      badgeText.textContent = 'ONLINE (SOCKET ACTIVE)';
      badgeText.className = 'text-xs font-mono font-bold text-emerald-400';
      badgeDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]';
      badge.className = 'flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/80';
    } else {
      badgeText.textContent = 'DISCONNECTED';
      badgeText.className = 'text-xs font-mono font-bold text-red-400';
      badgeDot.className = 'w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#EF4444]';
      badge.className = 'flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/80';
    }
  }
}

// Instantiate and start app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
