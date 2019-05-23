import fetch from 'node-fetch';
import Twit from 'twit';

import { asToken } from './util/regexp';

const QUESTION_WORDS = ['who', 'what', 'where', 'when', 'why', 'how'];
let client;

export async function getTweets(config, callback) {
  let track = makeTrackString(config);
  let tests = makeTestsForConfig(config);
  let stream;

  client = await getClient();
  stream = client.stream('statuses/filter', { track });

  stream.on('tweet', (json) => {
    let { extended_tweet, id_str, retweeted_status, truncated, text } = json;
    let isOriginalTweet = id_str && !retweeted_status;
    let body = truncated ? extended_tweet.full_text : text;

    if (isOriginalTweet && tests.some((test) => test(body))) {
      callback(json);
    }
  });

  stream.on('disconnect', () => getTweets(config, callback));
  stream.on('error', ({ message, statusCode, code }) => {
    callback(new Error(`${message} (${code}; status ${statusCode})`));
  });
}

async function getClient() {
  return client || new Twit({
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_SECRET
  });
}

function makeTrackString(config) {
  if (config instanceof Array) {
    return config.map(makeTrackString).join(',');
  } else {
    let { terms } = config;

    return terms instanceof Array ?
      terms.map((term) => trimTerms(term)).join(',') :
      trimTerms(terms);
  }
}

function makeTestsForConfig(config) {
  if (config instanceof Array) {
    return config.map((queryObject) => makeTestsForConfig(queryObject));
  } else {
    let { terms, is_question = false } = config;
    let regExps = [];

    if (terms instanceof Array) {
      for (let termCombination of terms) {
        regExps.push(asToken(trimTerms(termCombination, '|')));
      }
    } else {
      regExps.push(asToken(trimTerms(terms, '|')));
    }

    return (text) => {
      let isQuestion = false;

      if (is_question) {
        isQuestion = text.includes('?') ||
          asToken(QUESTION_WORDS.join('|')).test(text);
      }

      for (let regExp of regExps) {
        if (regExp.test(text)) {
          console.log(regExp);
          console.log(text);
        }
      }

      return is_question === isQuestion &&
        regExps.every((regExp) => regExp.test(text));
    };
  }
}

function trimTerms(terms, joiner = ',') {
  return terms.split(',')
    .map((term) => term.trim())
    .join(joiner)
    .trim();
}
