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

function getRedditBlocks({ author, selftext, title: postTitle, permalink }) {
  let title = ':reddit: New post';
  let body = `*Title:* ${postTitle}`;
  let url = `https://www.reddit.com${permalink}`;

  if (author) {
    let name = author.name || author;

    title = `${title} from <https://www.reddit.com/u/${name}|u/${name}>`;
  }

  if (selftext) {
    body = `${body}\n*Content:* ${selftext}`;
  }

  return makeNotificationBlocks({ title, body, url });
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

function makeNotificationBlocks({ title, body, url }) {
  let blocks = [];

  if (title) {
    blocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": title
      }
    })
  }

  if (body) {
    blocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": body
      }
    });
  }

  if (url) {
    blocks.push({
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Visit Post",
            "emoji": true
          },
          "url": url
        }
      ]
    });
  }

  return blocks;
}
