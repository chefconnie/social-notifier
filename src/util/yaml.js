import { readFile } from 'fs';
import { promisify } from 'util';
import { safeLoad } from 'js-yaml';

const _readFile = promisify(readFile);

export async function loadFile(path) {
  return safeLoad(await _readFile(path));
}
