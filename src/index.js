// system deps
import { readFile } from 'fs';
import { join } from 'path';
import { cwd } from 'process';
import { promisify } from 'util';

// app deps
import { config } from 'dotenv';
import { safeLoad} from 'js-yaml';

import { getResults } from './reddit';
import { SOURCES, notify } from './slack';

const envResult = config()

if (envResult.error) {
  throw envResult.error
}

async function init(subredditFilepath = join(cwd(), 'data', 'subreddits.yml')) {
  try {
    let subredditData = await promisify(readFile)(subredditFilepath);
    let subredditsWithSearchTerms = safeLoad(subredditData);

    getResults(subredditsWithSearchTerms, notify.bind(null, SOURCES.Reddit));
  } catch(e) {
    notify(e);
  }
}

init();
