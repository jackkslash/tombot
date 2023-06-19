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
} = process.env;

if (
  !CLIENTID ||
  !GUILDID ||
  !DISCORDBOTTOKEN ||
  !CHANNELID ||
  !MONGODB ||
  !RPCURL1 ||
  !RPCURL2
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
};

export default config;
