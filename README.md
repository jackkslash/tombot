# TomBot

A Discord bot that tracks and notifies users of activity on ethereum wallet addresses submitted by users.

## Installation

Clone the repo and install dependencies needed.

```
git clone git@github.com:jackkslash/tombot.git
npm install
```

### .env

Rename the '.env.example' file to '.env' and fill in the required environment variables. All of them are needed to run the bot.

```
DISCORDBOTTOKEN=
CLIENTID=
GUILDID=
CHANNELID=
MONGODB=
RPCURL1=
RPCURL2=
```

### NPM Scripts

```
    "build": "rimraf ./build && tsc",
    "deploy": "tsc && node build/deployCommands.js",
    "start": "npm run deploy && npm run build && node build/index.js"
```

```
npm run start
```

This command above is the only one needed to run the bot. It will deploy commands before the bot is up and running.

```
npm run deploy
```

If commands need to be deployed separately, run the command mentioned above.
