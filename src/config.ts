import dotenv from "dotenv";
dotenv.config();
const { CLIENTID, GUILDID, DISCORDBOTTOKEN, CHANNELID, MONGODB } = process.env;

if (!CLIENTID || !GUILDID || !DISCORDBOTTOKEN || !CHANNELID || !MONGODB) {
  throw new Error("Missing .env vars");
}

const config: Record<string, string> = {
  CLIENTID,
  GUILDID,
  DISCORDBOTTOKEN,
  CHANNELID,
  MONGODB,
};

export default config;
