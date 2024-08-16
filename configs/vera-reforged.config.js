const fs = require('node:fs');

const cwd = '/home/deploy/vera-reforged';
const script = `${cwd}/dist/apps/backend/main.js`;

const nodeVersion = fs.readFileSync(`${cwd}/.nvmrc`, 'utf8');

module.exports = {
  apps: [
    {
      name: 'vera-reforged',
      cwd,
      script,
      watch: [script],
      interpreter: `/home/deploy/.nvm/versions/node/${nodeVersion}/bin/node`,
    },
  ],
};
