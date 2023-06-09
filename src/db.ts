import { MongoClient, ServerApiVersion } from "mongodb";
import config from "./config";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
export const clientdb = new MongoClient(config.MONGODB, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
