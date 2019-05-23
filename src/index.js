import { join } from 'path';
import { cwd } from 'process';
import { config } from 'dotenv';

import { getResults } from './reddit';
import { SOURCES, notify } from './slack';
import { loadFile } from './util/yaml';

const envResult = config()

if (envResult.error) {
  throw envResult.error
}

async function initReddit(configPath = join(cwd(), 'data', 'subreddits.yml')) {
  try {
    let config = await loadFile(configPath);

    getResults(config, notify.bind(null, SOURCES.Reddit));

  } catch(e) {
    notify(e);
  }
}

initReddit();
