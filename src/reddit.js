import snoowrap from 'snoowrap';
import { SubmissionStream } from 'snoostorm';

let client;

export function getResults(subredditsWithSearchTerms, callback) {
  let numSubreddits = Object.keys(subredditsWithSearchTerms).length;
  let pollTime = process.env.REDDIT_MAX_REQS_PER_MINUTE / numSubreddits * 1000;

  client = getClient();

  for (let subreddit in subredditsWithSearchTerms) {
    let tokens = subredditsWithSearchTerms[subreddit];
    let stream = new SubmissionStream(client, {
      subreddit,
      pollTime,
      limit: 100
    });

    stream.on('item', (submission) => {
      let { title, selfText } = submission;
      let matchesQuery = tokens.some((token) => {
        return (title && title.includes(token)) ||
          (selfText && selfText.includes(token));
      });

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
