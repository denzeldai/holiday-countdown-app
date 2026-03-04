module.exports = {
  apps: [
    {
      name: "holiday-app",
      script: "api/server.js",
      cwd: "/var/www/holiday-countdown-app",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      max_memory_restart: "300M",
      autorestart: true
    }
  ]
};
