const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');
const { argv } = require('node:process');
const { NodeSSH } = require('node-ssh');

const [, , app] = argv;
const appDist = `dist${app ? `/apps/${app}` : ''}`;

const localDistPath = path.join(`${__dirname}/../${appDist}`);
if (isDirEmpty(localDistPath)) {
  throw Error('dist directory is empty');
}
const remotePath = '/home/deploy/vera-reforged';
const remoteDistPath = `${remotePath}/${appDist}`;

const vera = {
  name: 'Vera',
  host: 'vera.example.com',
  username: 'deploy',
  port: 22,
  privateKeyPath: `${os.homedir()}/.ssh/id_example`,
};

deploy(vera)
  .then(() => {
    console.log('\nDeploy completed');
  })
  .catch((e) => console.error(e));

async function deploy({ name, ...options }) {
  const ssh = new NodeSSH();

  const failedTransfers = [];

  return new Promise(async (resolve, reject) => {
    try {
      await ssh.connect(options);

      await ssh.execCommand(`rm -rf ${appDist}`, { cwd: remotePath });
      console.log(`[${name}] Dist directory has been cleared`);

      const status = await ssh.putDirectory(localDistPath, remoteDistPath, {
        recursive: true,
        concurrency: 10,
        tick: (localPath, remotePath, error) => {
          if (error) {
            console.log(`[${name}] Failed transfer: ${localPath}`);

            failedTransfers.push(localPath);
          } else {
            console.log(`[${name}] Success transfer: ${localPath}`);
          }
        },
      });

      console.log(
        `[${name}] Deployment is ${status ? 'successful' : 'unsuccessful'}`,
      );

      if (!status) {
        console.log(
          `[${name}] Failed transfers:\n\n${failedTransfers.join('\n')}`,
        );
      }

      ssh.dispose();
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}

function isDirEmpty(dirname) {
  const filesArray = fs.readdirSync(dirname);

  return filesArray.length === 0;
}
