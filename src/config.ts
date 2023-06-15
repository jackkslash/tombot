import dotenv from "dotenv";
dotenv.config();
const { CLIENTID, GUILDID, DISCORDBOTTOKEN, CHANNELID, MONGODB, RPCURL } =
  process.env;

if (
  !CLIENTID ||
  !GUILDID ||
  !DISCORDBOTTOKEN ||
  !CHANNELID ||
  !MONGODB ||
  !RPCURL
) {
  throw new Error("Missing .env vars");
}

const config: Record<string, string> = {
  CLIENTID,
  GUILDID,
  DISCORDBOTTOKEN,
  CHANNELID,
  MONGODB,
  RPCURL,
};

export default config;
