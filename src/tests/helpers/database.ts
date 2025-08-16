import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';

let mongoServer: MongoMemoryServer;

export interface TestDatabaseConfig {
  dbName?: string;
  debug?: boolean;
}

/**
 * Set up test database with MongoDB Memory Server
 * Provides isolated database for each test suite
 */
export async function setupTestDatabase(config: TestDatabaseConfig = {}): Promise<void> {
  const { dbName = 'touchline-test', debug = false } = config;

  beforeAll(async () => {
    // Start MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName,
        port: undefined, // Random port
      },
    });

    const mongoUri = mongoServer.getUri();
    
    if (debug) {
      console.log(`Test MongoDB URI: ${mongoUri}`);
    }

    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
    
    if (debug) {
      mongoose.set('debug', true);
    }
  });

  afterAll(async () => {
    // Clean up: close connection and stop server
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear all collections before each test
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  afterEach(async () => {
    // Additional cleanup if needed
    vi?.clearAllMocks?.();
  });
}

/**
 * Get current test database connection info
 */
export function getTestDatabaseInfo(): {
  isConnected: boolean;
  dbName: string;
  collections: string[];
} {
  return {
    isConnected: mongoose.connection.readyState === 1,
    dbName: mongoose.connection.name,
    collections: Object.keys(mongoose.connection.collections),
  };
}

/**
 * Manually clear specific collections during tests
 */
export async function clearCollections(collectionNames: string[]): Promise<void> {
  const collections = mongoose.connection.collections;
  
  for (const name of collectionNames) {
    if (collections[name]) {
      await collections[name].deleteMany({});
    }
  }
}

/**
 * Create a database transaction for testing
 * Useful for testing transactional behavior
 */
export async function withTransaction<T>(
  callback: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Type-safe model creation helper for tests
 */
export async function createTestDocument<T>(
  model: mongoose.Model<T>,
  data: Partial<T>
): Promise<T> {
  const document = new model(data);
  await document.validate();
  return await document.save();
}

/**
 * Batch create test documents with validation
 */
export async function createTestDocuments<T>(
  model: mongoose.Model<T>,
  dataArray: Partial<T>[]
): Promise<T[]> {
  const documents = dataArray.map(data => new model(data));
  
  // Validate all documents first
  await Promise.all(documents.map(doc => doc.validate()));
  
  // Then save all
  return await Promise.all(documents.map(doc => doc.save()));
}