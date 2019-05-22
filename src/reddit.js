import snoowrap from 'snoowrap';
import { SubmissionStream } from 'snoostorm';

let client;

export function getResults(subredditsWithSearchTerms, callback) {
  let numSubreddits = Object.keys(subredditsWithSearchTerms).length;
  let maxRequestsPerSecond = process.env.REDDIT_MAX_REQS_PER_MINUTE / 60;
  let pollTime = maxRequestsPerSecond * numSubreddits * 1000;

  client = getClient();

  for (let subreddit in subredditsWithSearchTerms) {
    let tests = makeTestsForTokens(subredditsWithSearchTerms[subreddit]);
    let stream = new SubmissionStream(client, {
      subreddit,
      pollTime,
      limit: 100
    });

    stream.on('item', (submission) => {
      let { title, selfText, selftext } = submission;
      let matchesQuery = [title, selfText, selftext]
        .some((text) => tests.some((test) => test(text)));

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
      .map((_token) => new RegExp(`^(.*\\s+)*${_token}(\\s+.*)*$`, 'i'));

    return (text) => regExps.every((regExp) => regExp.test(text));
  });
}
