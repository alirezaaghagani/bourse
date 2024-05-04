import { MongoClient } from "mongodb";

const URL = "mongodb://127.0.0.1:27017/";
const client = new MongoClient(URL, { monitorCommands: true });
const DB_NAME = "bourse";

export async function connectToDbCollection(collection: string) {
  await client.connect();
  console.log("Connected successfully to DataBase on ", URL);
  const db = client.db(DB_NAME);
  return db.collection(collection);
}
