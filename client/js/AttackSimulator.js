/**
 * AttackSimulator Class
 * Handles user interactions with simulation attack trigger buttons on UI.
 */
class AttackSimulator {
  constructor(serverUrl) {
    this.serverUrl = serverUrl || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '');
  }

  init() {
    this._bindButtonEvents();
  }

  _bindButtonEvents() {
    const btnSqli = document.getElementById('btn-sim-sqli');
    const btnIdor = document.getElementById('btn-sim-idor');
    const btnLatency = document.getElementById('btn-sim-latency');

    if (btnSqli) {
      btnSqli.addEventListener('click', () => {
        this.triggerSqliAttack(btnSqli);
      });
    }

    if (btnIdor) {
      btnIdor.addEventListener('click', () => {
        this.triggerIdorProbe(btnIdor);
      });
    }

    if (btnLatency) {
      btnLatency.addEventListener('click', () => {
        this.triggerLatencySpike(btnLatency);
      });
    }
  }

  async triggerSqliAttack(btnElement) {
    this._setButtonState(btnElement, true, '⚡ SQLi Saldırısı Atılıyor...');
    try {
      const maliciousPayload = encodeURIComponent("1' OR '1'='1'; DROP TABLE security_logs; --");
      await fetch(`${this.serverUrl}/api/test/sqli?q=${maliciousPayload}`);
    } catch (err) {
      console.error('SQLi Attack Simulation Error:', err);
    } finally {
      this._setButtonState(btnElement, false, '💥 SQL Injection Saldırısı');
    }
  }

  async triggerIdorProbe(btnElement) {
    this._setButtonState(btnElement, true, '⚡ IDOR Taraması Yapılıyor...');
    try {
      await fetch(`${this.serverUrl}/api/test/idor?id=0&bypass=true&role=admin`);
    } catch (err) {
      console.error('IDOR Probe Simulation Error:', err);
    } finally {
      this._setButtonState(btnElement, false, '🛡️ IDOR Yetki İhlali');
    }
  }

  async triggerLatencySpike(btnElement) {
    this._setButtonState(btnElement, true, '⚡ Darboğaz Yaratılıyor (2s)...');
    try {
      await fetch(`${this.serverUrl}/api/test/latency?delay=2000`);
    } catch (err) {
      console.error('Latency Spike Simulation Error:', err);
    } finally {
      this._setButtonState(btnElement, false, '⏱️ Performans Darboğazı');
    }
  }

  _setButtonState(btn, isLoading, text) {
    if (!btn) return;
    btn.disabled = isLoading;
    if (isLoading) {
      btn.classList.add('opacity-75', 'cursor-not-allowed', 'animate-pulse');
    } else {
      btn.classList.remove('opacity-75', 'cursor-not-allowed', 'animate-pulse');
    }
    btn.querySelector('.btn-label').textContent = text;
  }
}
