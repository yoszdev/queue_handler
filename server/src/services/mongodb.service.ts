import { MongoClient } from "mongodb";
import { DB_SCHEMA, IGenericQueueRecord } from "../consts/types";

const connectionString = process.env.MONGO_URI || "";
const client = new MongoClient(connectionString);

export const mongoConnect = async (): Promise<MongoClient> => {
  try {
    return await client.connect();
  } catch (e) {
    console.error(e);
  }
};

export const mongoDisconnect = async (
  connection: MongoClient,
): Promise<void> => {
  try {
    if (connection) {
      await client.close();
    }
  } catch (e) {
    console.error(e);
  }
};

export async function initQueueMessage(
  client: MongoClient,
  genericQueueRecord: IGenericQueueRecord,
) {
  const database = client.db(DB_SCHEMA);
  const collection = database.collection(genericQueueRecord.queue_name);
  await collection.createIndex({ createdAt: 1 });
  return await collection.insertOne({
    message: genericQueueRecord.messageContent,
    createdAt: new Date(),
  });
}

export async function retrieveQueueMessage(
  client: MongoClient,
  queue_name: string,
  timeout: number,
): Promise<any> {
  const database = client.db(DB_SCHEMA);
  const collection = database.collection(queue_name);
  const endTime = Date.now() + timeout;

  const checkQueue = async (): Promise<any> => {
    while (Date.now() < endTime) {
      const message = await collection.findOneAndDelete(
        {},
        { sort: { createdAt: 1 } },
      );
      if (message && message.message) {
        console.log("Message Retrieved:", message.message);
        return message.message;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    console.log("No message found after timeout");
    return null;
  };

  return checkQueue();
}
