import snoowrap from 'snoowrap';
import { SubmissionStream } from 'snoostorm';

import { asToken } from './util/regexp';

let client;

export function getResults(config, callback) {
  let numSubreddits = Object.keys(config).length;
  let maxRequestsPerSecond = process.env.REDDIT_MAX_REQS_PER_MINUTE / 60;
  let pollTime = maxRequestsPerSecond * numSubreddits * 1000;

  client = getClient();

  for (let subreddit in config) {
    let tests = makeTestsForTokens(config[subreddit]);
    let stream = new SubmissionStream(client, {
      subreddit,
      pollTime,
      limit: 100
    });

    stream.on('item', (submission) => {
      let { title, selfText, selftext, permalink } = submission;
      let matchesQuery = [title, selfText, selftext]
        .some((text) => tests.some((test) => test(text)));

      console.log(`[REDDIT:${subreddit.toUpperCase()}] - testing https://www.reddit.com${permalink}`);

      if (matchesQuery) {
        callback(submission);
      }
    });
  }
}

function getClient() {
  return client || new snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT,
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD
  });
}

function makeTestsForTokens(tokens) {
  return tokens.map((token) => {
    let regExps = token.split(',')
      .map((_token) => asToken(_token));

    return (text) => regExps.every((regExp) => regExp.test(text));
  });
}

function log(subreddit, text) {
  console.log(`[REDDIT:${subreddit.toUpperCase()}] - ${text}`);
}
