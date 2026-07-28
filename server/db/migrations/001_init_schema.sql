-- Monitoring Panel Database Schema Migration 001

-- 1. Security Logs Table
CREATE TABLE IF NOT EXISTS security_logs (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,          -- e.g. 'SQLi', 'IDOR'
    severity VARCHAR(20) NOT NULL,      -- e.g. 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    endpoint VARCHAR(255) NOT NULL,     -- e.g. '/api/users/1'
    payload TEXT,                       -- The malicious payload or parameters
    ip_address VARCHAR(45),             -- IPv4 / IPv6 address
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id BIGSERIAL PRIMARY KEY,
    response_time_ms INTEGER NOT NULL,  -- Latency in milliseconds
    status_code INTEGER NOT NULL,       -- HTTP Status Code (200, 500, etc.)
    endpoint VARCHAR(255) NOT NULL,     -- Target endpoint measured
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Indexes for Optimized Time-Series & Filter Queries
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs (severity);
CREATE INDEX IF NOT EXISTS idx_perf_metrics_created_at ON performance_metrics (created_at DESC);
