import dotenv from "dotenv";
dotenv.config();
const {
  CLIENTID,
  GUILDID,
  DISCORDBOTTOKEN,
  CHANNELID,
  PAIRCHANNEL,
  MONGODB,
  ALCAPI,
} = process.env;

if (
  !CLIENTID ||
  !GUILDID ||
  !DISCORDBOTTOKEN ||
  !CHANNELID ||
  !PAIRCHANNEL ||
  !MONGODB ||
  !ALCAPI
) {
  throw new Error("Missing .env vars");
}

const config: Record<string, string> = {
  CLIENTID,
  GUILDID,
  DISCORDBOTTOKEN,
  CHANNELID,
  PAIRCHANNEL,
  MONGODB,
  ALCAPI,
};

export default config;
