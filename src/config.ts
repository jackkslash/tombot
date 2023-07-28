import dotenv from "dotenv";
dotenv.config();
const {
  CLIENTID,
  GUILDID,
  DISCORDBOTTOKEN,
  CHANNELID,
  MONGODB,
  RPCURL1,
  RPCURL2,
  ALCAPI,
} = process.env;

if (
  !CLIENTID ||
  !GUILDID ||
  !DISCORDBOTTOKEN ||
  !CHANNELID ||
  !MONGODB ||
  !RPCURL1 ||
  !RPCURL2 ||
  !ALCAPI
) {
  throw new Error("Missing .env vars");
}

const config: Record<string, string> = {
  CLIENTID,
  GUILDID,
  DISCORDBOTTOKEN,
  CHANNELID,
  MONGODB,
  RPCURL1,
  RPCURL2,
  ALCAPI,
};

export default config;
