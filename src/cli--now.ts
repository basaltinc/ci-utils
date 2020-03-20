#!/usr/bin/env node
import program from 'commander';
import fs from 'fs';
import { join } from 'path';
import { getLatestDeploy } from './now';

const { version } = JSON.parse(
  fs.readFileSync(join(__dirname, '../package.json'), 'utf8'),
);

program.version(version, '-v, --version');

program
  .command('get-latest-deploy')
  .description('Get Latest Now.sh deploy')

  .option('-n, --name [name]', 'Name')
  .option('-t, --team [team]', 'Team')
  .action(cmd => {
    const { name, team } = cmd;

    return getLatestDeploy({ projectId: name, teamId: team })
      .then(({ url }) => {
        process.stdout.write(url);
      })
      .catch(error => {
        process.stderr.write(error.message);
        process.exit(1);
      });
  });

program.parse(process.argv);
