# social-notifier
## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/)
* [Yarn](https://yarnpkg.com/)

In addition, new projects will also need to set up:

* A [Reddit API client](https://www.reddit.com/prefs/apps)
    * You may use the simpler "script" app type, unless you have additional reasons not to
    * Recommend you follow the "first steps" from [Reddit's quickstart](https://github.com/reddit-archive/reddit/wiki/OAuth2-Quick-Start-Example#first-steps)
    * For more, see Reddit's [API wiki](https://github.com/reddit-archive/reddit/wiki/API)
* A [Slack app](https://api.slack.com/apps)
    * You will need to configure the "Post to specific channels" (`incoming-webgook`) scope
    * You may also need to configure the "Send messages as..." (`chat:write:bot`) scope

## Installation

* `git clone <repository-url>` this repository
* `cd social-notifier`
* `yarn install`
* `cp .env.example .env`
    * Make sure to replace all sample values with the relevant credentials and config variables

## Running / Development
### Developing
* `yarn run build`
* `yarn run start` (iff already built)

### Building
* `yarn run build`

### Deploying
Followed [CertSimple guide](https://certsimple.com/blog/deploy-node-on-linux) and cloned to `/var/local/social-notifier` to init; for subsequent changes:

* `ssh user@sub.host.com`
* `cd /var/local/social-notifier`
* `git pull`
* `yarn run build`
* `sudo systemctl restart notifier`

**NOTES:**
* Since `.env` is gitignored, you will need to set production environment variables manually, e.g. by
    * Configuring them natively on the server;
    * Using `scp` or `rsync` to publish your `.env` file to the server separately; or
    * Copying values into a server-side `.env` file manually
* To view server logs: `sudo journalctl --follow -u notifier`
