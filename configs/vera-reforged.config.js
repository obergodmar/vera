module.exports = {
  apps: [
    {
      name: 'vera-reforged',
      cwd: '/home/deploy/vera-reforged',
      script: '/home/deploy/vera-reforged/dist/apps/backend/main.js',
      watch: ['/home/deploy/vera-reforged/dist/apps/backend/main.js'],
      interpreter: '/home/deploy/.nvm/versions/node/v16.19.0/bin/node',
    },
  ],
};
