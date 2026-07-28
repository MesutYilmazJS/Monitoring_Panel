const db = require('../../db');

// SQL Injection Detection Regex Patterns
const SQLI_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|TRUNCATE)\b)/i,
  /('--')|(\/\*)|(\*\/)/,
  /(\bOR\b\s+['"\d]=['"\d])/i,
  /(\bAND\b\s+['"\d]=['"\d])/i,
  /(;\s*--)/,
  /(\bUNION\b\s+\bSELECT\b)/i
];

// IDOR Suspicious Patterns & Keyword Indicators
const IDOR_PATTERNS = [
  /\.\.\//,                        // Path traversal attempt (../)
  /role\s*=\s*admin/i,            // Role escalation attempt
  /admin\s*=\s*true/i,            // Admin flag manipulation
  /user_id\s*=\s*0/i              // Root/System user ID probe
];

// XSS (Cross-Site Scripting) Patterns
const XSS_PATTERNS = [
  /<script\b[^>]*>([\s\S]*?)<\/script>/i,
  /javascript\s*:/i,
  /onerror\s*=/i,
  /onload\s*=/i,
  /<iframe\b[^>]*>/i,
  /document\.cookie/i,
  /<img\s+[^>]*src\s*=\s*['"]?javascript:/i
];

/**
 * Checks string content against a list of regex patterns.
 */
function matchesPatterns(input, patterns) {
  if (!input) return false;
  const text = typeof input === 'object' ? JSON.stringify(input) : String(input);
  return patterns.some(pattern => pattern.test(text));
}

/**
 * Express Middleware for Real-time Security Monitoring (SQLi, IDOR & XSS Detection)
 */
function createSecurityMiddleware(io) {
  return async (req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const targetEndpoint = req.originalUrl || req.url;

    // Collect inspectable parameters
    const inspectables = [
      req.query,
      req.body,
      req.params
    ];

    let detectedType = null;
    let detectedPayload = null;
    let severity = 'HIGH';

    for (const data of inspectables) {
      if (!data || Object.keys(data).length === 0) continue;

      const serialized = JSON.stringify(data);

      // 1. Check for SQL Injection
      if (matchesPatterns(serialized, SQLI_PATTERNS)) {
        detectedType = 'SQL Injection (SQLi)';
        detectedPayload = serialized;
        severity = 'CRITICAL';
        break;
      }

      // 2. Check for XSS (Cross-Site Scripting)
      if (matchesPatterns(serialized, XSS_PATTERNS)) {
        detectedType = 'Cross-Site Scripting (XSS)';
        detectedPayload = serialized;
        severity = 'HIGH';
        break;
      }

      // 3. Check for IDOR / Privilege Escalation Attempt
      if (matchesPatterns(serialized, IDOR_PATTERNS)) {
        detectedType = 'IDOR / Unauthorized Access';
        detectedPayload = serialized;
        severity = 'HIGH';
        break;
      }
    }

    // Specific IDOR Check for direct ID manipulation on sensitive endpoints
    if (!detectedType && req.path.includes('/user/')) {
      const requestedId = req.params.id || req.query.id;
      if (requestedId && (requestedId === '1' || requestedId === '0' || req.query.bypass === 'true')) {
        detectedType = 'IDOR / Unauthorized Access';
        detectedPayload = `Endpoint: ${req.path}, Query: ${JSON.stringify(req.query)}`;
        severity = 'HIGH';
      }
    }

    // If an attack pattern is detected
    if (detectedType) {
      console.warn(`🚨 [SECURITY ALERT] ${detectedType} detected on ${targetEndpoint} from ${clientIp}`);

      const alertData = {
        type: detectedType,
        severity: severity,
        endpoint: targetEndpoint,
        payload: detectedPayload,
        ip_address: clientIp,
        created_at: new Date().toISOString()
      };

      // 1. Save alert asynchronously to PostgreSQL
      try {
        await db.query(
          `INSERT INTO security_logs (type, severity, endpoint, payload, ip_address) 
           VALUES ($1, $2, $3, $4, $5)`,
          [alertData.type, alertData.severity, alertData.endpoint, alertData.payload, alertData.ip_address]
        );
      } catch (dbErr) {
        console.error('❌ Failed to log security alert to DB:', dbErr.message);
      }

      // 2. Broadcast real-time security alert via Socket.io
      if (io) {
        io.emit('security_alert', alertData);
      }

      // 3. Block request and return 403 Forbidden
      return res.status(403).json({
        error: 'Security Breach Detected',
        message: `Request blocked by Security Middleware: ${detectedType}`,
        alert: alertData
      });
    }

    next();
  };
}

module.exports = createSecurityMiddleware;
