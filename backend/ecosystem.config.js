module.exports = {
  apps: [
    {
      name: "forever-backend",
      script: "./server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4002
      }
    }
  ]
};
