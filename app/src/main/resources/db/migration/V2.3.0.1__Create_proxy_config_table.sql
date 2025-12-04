-- Create proxy_config table for storing proxy server configuration
CREATE TABLE IF NOT EXISTS proxy_config
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    enabled    BOOLEAN      NOT NULL DEFAULT FALSE,
    type       VARCHAR(10)  NOT NULL DEFAULT 'HTTP',
    host       VARCHAR(255) NOT NULL,
    port       INT          NOT NULL,
    username   VARCHAR(255),
    password   VARCHAR(255),
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on enabled for faster queries
CREATE INDEX IF NOT EXISTS idx_proxy_config_enabled ON proxy_config (enabled);
