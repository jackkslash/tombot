import dotenv from "dotenv";
dotenv.config();
const { CLIENTID, GUILDID, DISCORDBOTTOKEN, CHANNELID } = process.env;

if (!CLIENTID || !GUILDID || !DISCORDBOTTOKEN || !CHANNELID) {
  throw new Error("Missing .env vars");
}

const config: Record<string, string> = {
  CLIENTID,
  GUILDID,
  DISCORDBOTTOKEN,
  CHANNELID,
};

export default config;
