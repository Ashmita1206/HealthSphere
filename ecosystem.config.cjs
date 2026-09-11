/**
 * HealthSphere PM2 Cluster Configuration
 * Process manager configuration for production bare-metal and VM deployments
 */

module.exports = {
  apps: [
    {
      name: 'healthsphere-api',
      cwd: './server',
      script: 'index.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      kill_timeout: 10000,
      listen_timeout: 15000,
    },
  ],
};
