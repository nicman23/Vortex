import { IState } from '../types/IState';

import * as fs from './fs';
import lazy from './lazy';
import { log } from './log';

import * as PromiseBB from 'bluebird';
import { app as appIn, remote } from 'electron';
import * as path from 'path';
import { generate as shortid } from 'shortid';

const app = remote !== undefined ? remote.app : appIn;

const backups: { [backupId: string]: number } = {};

function makeName(time: number) {
  return `backup_${time}.json`;
}

export const backupPath = lazy(() => path.join(app.getPath('temp'), 'state_backups'));

export function createStateBackupSync(backupId: string, data: any): string {
  let existingData = {};

  if ((backupId === undefined) || (backups[backupId] === undefined)) {
    backupId = shortid();
    backups[backupId] = Date.now();
  } else {
    try {
      const oldData = fs.readFileSync(path.join(backupPath(), makeName(backups[backupId])),
                                      { encoding: 'utf-8' });
      existingData = JSON.parse(oldData);
    } catch (err) {
      log('warn', 'failed to read existing backup data', err);
    }
  }

  let backupData;

  backupData = { ...existingData, ...data };

  fs.ensureDirSync(backupPath());

  fs.writeFileSync(path.join(backupPath(), makeName(backups[backupId])),
                   JSON.stringify(backupData, undefined, 2));

  return backupId;
}

export function createFullBackup(state: IState): Promise<string> {
  const backupId = shortid();
  backups[backupId] = Date.now();

  return fs.ensureDirAsync(backupPath())
    .then(() => fs.writeFileAsync(path.join(backupPath(), makeName(backups[backupId])),
                                  JSON.stringify(state, undefined, 2)))
    .then(() => backupId);
}

export async function getListOfBackups(): Promise<string[]> {
  await fs.ensureDirAsync(backupPath());

  return (await fs.readdirAsync(backupPath()))
    .filter(fileName => fileName.startsWith('backup') && path.extname(fileName) === '.json');
}

export async function deleteBackups(files: string[]): Promise<void> {
  await PromiseBB.map(files, backupName =>
    fs.removeAsync(path.join(backupPath(), backupName))
      .catch(() => undefined))
    .then(() => null);
}
