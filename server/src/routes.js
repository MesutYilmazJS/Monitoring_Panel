const express = require('express');
const router = express.Router();
const db = require('../db');

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// GET /api/metrics - Retrieve latest 50 performance metrics
router.get('/api/metrics', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, response_time_ms, status_code, endpoint, created_at 
       FROM performance_metrics 
       ORDER BY created_at DESC 
       LIMIT 50`
    );
    res.json(result.rows.reverse()); // Chronological order for charts
  } catch (err) {
    console.error('Error fetching performance metrics:', err.message);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

// GET /api/logs - Retrieve latest 50 security logs
router.get('/api/logs', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, type, severity, endpoint, payload, ip_address, created_at 
       FROM security_logs 
       ORDER BY created_at DESC 
       LIMIT 50`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching security logs:', err.message);
    res.status(500).json({ error: 'Failed to fetch security logs' });
  }
});

// --- ATTACK & LATENCY SIMULATION ENDPOINTS ---

// 1. SQL Injection Simulation Target Endpoint
router.get('/api/test/sqli', (req, res) => {
  res.json({
    message: 'Normal query executed successfully',
    query: req.query
  });
});

// 2. IDOR Simulation Target Endpoint
router.get('/api/test/idor', (req, res) => {
  res.json({
    message: 'User data fetched successfully',
    params: req.query
  });
});

// 3. XSS (Cross-Site Scripting) Simulation Target Endpoint
router.get('/api/test/xss', (req, res) => {
  res.json({
    message: 'Comment processed successfully',
    input: req.query
  });
});

// 3. High Latency (Bottleneck) Performance Simulation Target Endpoint
router.get('/api/test/latency', (req, res) => {
  const delayMs = parseInt(req.query.delay || '1200', 10);
  setTimeout(() => {
    res.json({
      message: `Simulated high latency response after ${delayMs}ms`,
      delayMs
    });
  }, delayMs);
});

module.exports = router;
