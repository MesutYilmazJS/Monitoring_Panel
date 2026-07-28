const db = require('../../db');

/**
 * Performance Analyzer Middleware & Real-time Metrics Broadcaster
 */
function createPerformanceAnalyzer(io) {
  let trafficInterval = null;

  /**
   * Express Middleware to calculate request latency and emit metrics
   */
  const middleware = (req, res, next) => {
    const start = process.hrtime();
    const endpoint = req.originalUrl || req.url;

    // Listen for response completion
    res.on('finish', async () => {
      const diff = process.hrtime(start);
      const responseTimeMs = Math.round((diff[0] * 1e9 + diff[1]) / 1e6); // Convert nanoseconds to milliseconds
      const statusCode = res.statusCode;

      const metric = {
        response_time_ms: responseTimeMs,
        status_code: statusCode,
        endpoint: endpoint,
        created_at: new Date().toISOString()
      };

      // 1. Save metric to PostgreSQL
      try {
        await db.query(
          `INSERT INTO performance_metrics (response_time_ms, status_code, endpoint)
           VALUES ($1, $2, $3)`,
          [metric.response_time_ms, metric.status_code, metric.endpoint]
        );
      } catch (dbErr) {
        console.error('❌ Failed to log performance metric to DB:', dbErr.message);
      }

      // 2. Emit real-time performance metric via Socket.io
      if (io) {
        io.emit('performance_metric', metric);
      }
    });

    next();
  };

  /**
   * Starts periodic synthetic background traffic simulation (e.g. every 3 seconds)
   */
  const startBackgroundTraffic = (intervalMs = 3000) => {
    if (trafficInterval) return;

    trafficInterval = setInterval(async () => {
      // Generate synthetic latency between 40ms and 180ms
      const baseLatency = Math.floor(Math.random() * 140) + 40;
      const endpoints = ['/api/search', '/api/users/profile', '/api/dashboard/stats', '/api/health'];
      const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

      const metric = {
        response_time_ms: baseLatency,
        status_code: 200,
        endpoint: randomEndpoint,
        created_at: new Date().toISOString()
      };

      try {
        await db.query(
          `INSERT INTO performance_metrics (response_time_ms, status_code, endpoint)
           VALUES ($1, $2, $3)`,
          [metric.response_time_ms, metric.status_code, metric.endpoint]
        );
      } catch (err) {
        // Silently catch DB errors on background simulation if DB is offline
      }

      if (io) {
        io.emit('performance_metric', metric);
      }
    }, intervalMs);

    console.log(`⏱️ [Performance Analyzer] Background synthetic traffic generator started (${intervalMs}ms interval).`);
  };

  /**
   * Stop synthetic background traffic generator
   */
  const stopBackgroundTraffic = () => {
    if (trafficInterval) {
      clearInterval(trafficInterval);
      trafficInterval = null;
    }
  };

  return {
    middleware,
    startBackgroundTraffic,
    stopBackgroundTraffic
  };
}

module.exports = createPerformanceAnalyzer;
