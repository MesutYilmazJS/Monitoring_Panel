/**
 * SecurityLogger Class
 * Manages the live cyber terminal security alert feed UI, search filtering, CSV export, log clearing, and Web Desktop Notifications.
 */
class SecurityLogger {
  constructor(terminalContainerId) {
    this.containerId = terminalContainerId;
    this.container = null;
    this.alertCount = 0;
    this.logsHistory = [];
    this.currentSearchQuery = '';
    this.currentSeverityFilter = 'ALL';
    this.notificationsEnabled = false;
  }

  init() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) return;

    this._bindFilterEvents();
    this._checkNotificationPermission();
  }

  /**
   * Render a new security alert line in the terminal feed and trigger desktop notification if enabled
   */
  logAlert(alertData) {
    if (!this.container) return;

    this.alertCount++;
    this.logsHistory.unshift(alertData); // Keep newest at index 0
    this._updateAlertCountUI();

    const timestamp = new Date(alertData.created_at || Date.now()).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const isCritical = alertData.severity === 'CRITICAL';
    const badgeColorClass = isCritical 
      ? 'bg-red-950/80 text-red-400 border-red-800' 
      : 'bg-amber-950/80 text-amber-400 border-amber-800';

    const logEntry = document.createElement('div');
    logEntry.className = 'log-item font-mono text-xs p-2.5 rounded bg-gray-900/90 border border-gray-800/80 shadow-md transition-all space-y-1 text-gray-300';
    logEntry.dataset.severity = alertData.severity || 'HIGH';
    logEntry.dataset.searchtext = `${alertData.type} ${alertData.endpoint} ${alertData.payload} ${alertData.ip_address}`.toLowerCase();

    logEntry.innerHTML = `
      <div class="flex items-center justify-between text-[11px] border-b border-gray-800/60 pb-1 mb-1 text-gray-400">
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full ${isCritical ? 'bg-red-500 animate-ping' : 'bg-amber-500'}"></span>
          <span class="font-bold text-gray-200">[${timestamp}] ${alertData.type}</span>
        </span>
        <span class="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold border ${badgeColorClass}">
          ${alertData.severity}
        </span>
      </div>
      <div class="text-xs text-gray-300 space-y-0.5 pl-2 border-l-2 ${isCritical ? 'border-red-500/80' : 'border-amber-500/80'}">
        <div><span class="text-gray-400 font-semibold">Endpoint:</span> <code class="text-cyan-400">${this._escapeHTML(alertData.endpoint)}</code></div>
        ${alertData.payload ? `<div><span class="text-gray-400 font-semibold">Payload:</span> <code class="text-red-400 font-mono break-all">${this._escapeHTML(alertData.payload)}</code></div>` : ''}
        <div><span class="text-gray-400 font-semibold">IP Address:</span> <span class="text-gray-400">${this._escapeHTML(alertData.ip_address || 'Unknown')}</span></div>
      </div>
    `;

    // Apply active filter state to new element
    if (!this._matchesFilter(logEntry.dataset.searchtext, logEntry.dataset.severity)) {
      logEntry.style.display = 'none';
    }

    this.container.prepend(logEntry); // Newest alerts at top

    // Maintain max 100 entries in DOM
    if (this.container.children.length > 100) {
      this.container.removeChild(this.container.lastChild);
    }

    // Trigger Desktop Web Notification if page is hidden / background tab
    if (this.notificationsEnabled && document.hidden) {
      this._showDesktopNotification(alertData);
    }
  }

  /**
   * Clears terminal logs view and history
   */
  clearLogs() {
    this.logsHistory = [];
    this.alertCount = 0;
    if (this.container) {
      this.container.innerHTML = `
        <div class="text-xs text-gray-400 italic text-center py-16">
          Güvenlik dinleyicisi aktif. İhlal denemeleri burada görüntülenecektir...
        </div>
      `;
    }
    this._updateAlertCountUI();
  }

  /**
   * Pre-load existing logs (e.g. from initial API call)
   */
  loadInitialLogs(logsList) {
    if (!logsList || !Array.isArray(logsList)) return;
    [...logsList].reverse().forEach(log => this.logAlert(log));
  }

  /**
   * Filter visible logs by search query and severity
   */
  filterLogs(query = '', severity = 'ALL') {
    this.currentSearchQuery = query.toLowerCase().trim();
    this.currentSeverityFilter = severity;

    if (!this.container) return;

    const items = this.container.querySelectorAll('.log-item');
    items.forEach(item => {
      const searchText = item.dataset.searchtext || '';
      const itemSeverity = item.dataset.severity || 'HIGH';

      if (this._matchesFilter(searchText, itemSeverity)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  /**
   * Exports recorded security logs to CSV file and triggers download
   */
  exportToCSV() {
    if (this.logsHistory.length === 0) {
      alert('İndirilecek güvenlik kaydı bulunamadı.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,Zaman,Turu,Kritiklik,Endpoint,Payload,IP Adresi\n';

    this.logsHistory.forEach(log => {
      const time = new Date(log.created_at || Date.now()).toISOString();
      const type = `"${(log.type || '').replace(/"/g, '""')}"`;
      const severity = `"${log.severity || 'HIGH'}"`;
      const endpoint = `"${(log.endpoint || '').replace(/"/g, '""')}"`;
      const payload = `"${(log.payload || '').replace(/"/g, '""')}"`;
      const ip = `"${log.ip_address || 'Unknown'}"`;

      csvContent += `${time},${type},${severity},${endpoint},${payload},${ip}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `security_logs_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  requestNotificationPermission() {
    if (!('Notification' in window)) {
      alert('Bu tarayıcı masaüstü bildirimlerini desteklemiyor.');
      return;
    }

    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        this.notificationsEnabled = true;
        this._updateNotificationButtonUI(true);
        new Notification('🛡️ Security Monitor', { body: 'Masaüstü bildirimleri aktif edildi.' });
      } else {
        this.notificationsEnabled = false;
        this._updateNotificationButtonUI(false);
      }
    });
  }

  _checkNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'granted') {
      this.notificationsEnabled = true;
      this._updateNotificationButtonUI(true);
    }
  }

  _showDesktopNotification(alertData) {
    new Notification(`🚨 [SEC-ALERT] ${alertData.type}`, {
      body: `Endpoint: ${alertData.endpoint}\nIP: ${alertData.ip_address}`,
      icon: '/favicon.ico'
    });
  }

  _updateNotificationButtonUI(isEnabled) {
    const btn = document.getElementById('btn-toggle-notif');
    if (btn) {
      if (isEnabled) {
        btn.classList.add('bg-emerald-950/80', 'text-emerald-300', 'border-emerald-700/80');
        btn.classList.remove('bg-slate-800', 'text-gray-200');
        btn.textContent = '🔔 Bildirimler Açık';
      } else {
        btn.classList.remove('bg-emerald-950/80', 'text-emerald-300', 'border-emerald-700/80');
        btn.classList.add('bg-slate-800', 'text-gray-200');
        btn.textContent = '🔔 Bildirim İzni';
      }
    }
  }

  _bindFilterEvents() {
    const searchInput = document.getElementById('log-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterLogs(e.target.value, this.currentSeverityFilter);
      });
    }

    const exportBtn = document.getElementById('btn-export-csv');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportToCSV();
      });
    }

    const clearBtn = document.getElementById('btn-clear-logs');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearLogs();
      });
    }

    const notifBtn = document.getElementById('btn-toggle-notif');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => {
        this.requestNotificationPermission();
      });
    }
  }

  _matchesFilter(searchText, itemSeverity) {
    const matchesQuery = !this.currentSearchQuery || searchText.includes(this.currentSearchQuery);
    const matchesSeverity = this.currentSeverityFilter === 'ALL' || itemSeverity === this.currentSeverityFilter;
    return matchesQuery && matchesSeverity;
  }

  _updateAlertCountUI() {
    const badgeEl = document.getElementById('stat-threat-count');
    if (badgeEl) {
      badgeEl.textContent = `${this.alertCount}`;
    }
  }

  _escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
