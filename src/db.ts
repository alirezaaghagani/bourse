import { MongoClient } from "mongodb";

// * checks env to connect to main database or test
const isEnvServer = process.env.ENV === "server";
const URL = isEnvServer
  ? "mongodb://root:2630236374@127.0.0.1:27017/"
  : "mongodb://127.0.0.1:27017/";

const client = new MongoClient(URL);
const DB_NAME = "bourse";

export async function connectToDbCollection(collection: string) {
  console.log("running on server:", isEnvServer);
  await client.connect();
  console.log("Connected successfully to DataBase on ", URL);
  const db = client.db(DB_NAME);
  return db.collection(collection);
}
