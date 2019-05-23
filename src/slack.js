import { WebClient } from '@slack/web-api';

let client;

export const SOURCES = {
  Error: 0,
  Reddit: 1,
  Twitter: 2
};

export async function notify(type, payload) {
  try {
    let blocks = getBlocks(type, payload);
    let text = blocks[0] && blocks[0].text && blocks[0].text.text;

    client = getClient();

    await client.chat.postMessage({
      blocks: getBlocks(type, payload),
      channel: process.env.SLACK_CHANNEL_ID,
      text
    });
  } catch(err) {
    console.error(err);
  }
}

function getClient() {
  return client || new WebClient(process.env.SLACK_CLIENT_TOKEN);
}

function getBlocks(type, payload) {
  if (payload === undefined) {
    payload = type;
    type === undefined;
  }

  if (payload instanceof Error) {
    type === SOURCES.Error;
  }

  switch(type) {
    case SOURCES.Reddit: return getRedditBlocks(payload);
    case SOURCES.Twitter: return getTwitterBlocks(payload);
    case SOURCES.Error:
    default: return getErrorBlocks(payload);
  }
}

function getRedditBlocks({ author, selftext, title, permalink }) {
  let titleBlockText = [':reddit: New post'];
  let bodyBlockText = [`*Title:* ${title}`];

  if (author) {
    let name = author.name || author;

    titleBlockText.push(`from <https://www.reddit.com/u/${name}|u/${name}>`);
  }

  if (selftext) {
    bodyBlockText.push(`*Content:* ${selftext}`);
  }

  return [{
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": titleBlockText.join(' ')
    }
  }, {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": bodyBlockText.join('\n')
    }
  }, {
    "type": "actions",
    "elements": [
      {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "Visit Post",
          "emoji": true
        },
        "url": `https://www.reddit.com${permalink}`
      }
    ]
  }]
}

function getTwitterBlocks({ }) {
}

function getErrorBlocks({ message, stack }) {
  let blocks = [{
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": `*:warning: Error:* ${message}`
    }
  }];

  if (stack) {
    blocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": stack
      }
    });
  }

  return blocks;
}
