/**
 * SocketManager Class
 * Encapsulates Socket.io client connection lifecycle and real-time event subscriptions.
 */
class SocketManager {
  constructor(serverUrl) {
    this.serverUrl = serverUrl || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '');
    this.socket = null;
    this.callbacks = {
      onConnect: null,
      onDisconnect: null,
      onSecurityAlert: null,
      onPerformanceMetric: null,
      onSystemTelemetry: null
    };
  }

  /**
   * Initializes Socket.io connection
   */
  connect() {
    if (typeof io === 'undefined') return;

    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    this._bindEvents();
  }

  /**
   * Private method to bind socket listeners
   */
  _bindEvents() {
    this.socket.on('connect', () => {
      if (this.callbacks.onConnect) this.callbacks.onConnect(this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      if (this.callbacks.onDisconnect) this.callbacks.onDisconnect(reason);
    });

    this.socket.on('security_alert', (data) => {
      if (this.callbacks.onSecurityAlert) this.callbacks.onSecurityAlert(data);
    });

    this.socket.on('performance_metric', (data) => {
      if (this.callbacks.onPerformanceMetric) this.callbacks.onPerformanceMetric(data);
    });

    this.socket.on('system_telemetry', (data) => {
      if (this.callbacks.onSystemTelemetry) this.callbacks.onSystemTelemetry(data);
    });
  }

  on(event, callback) {
    if (event === 'connect') this.callbacks.onConnect = callback;
    if (event === 'disconnect') this.callbacks.onDisconnect = callback;
    if (event === 'security_alert') this.callbacks.onSecurityAlert = callback;
    if (event === 'performance_metric') this.callbacks.onPerformanceMetric = callback;
    if (event === 'system_telemetry') this.callbacks.onSystemTelemetry = callback;
  }

  emit(event, payload) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, payload);
    }
  }
}
