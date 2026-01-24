import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedClient: MongoClient | null = null;

export async function connectDB() {
  if (cachedClient) {
    return cachedClient.db('appointmentq');
  }

  const client = new MongoClient(MONGODB_URI as string);
  await client.connect();
  cachedClient = client;
  return client.db('appointmentq');
}

export async function getCollection(name: string) {
  const db = await connectDB();
  return db.collection(name);
}
