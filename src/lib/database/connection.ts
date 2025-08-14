import mongoose from 'mongoose';
import { MONGODB_URI } from '$env/static/private';

interface ConnectionOptions {
	bufferCommands: boolean;
	maxPoolSize: number;
	serverSelectionTimeoutMS: number;
	socketTimeoutMS: number;
}

const connectionOptions: ConnectionOptions = {
	bufferCommands: false, // Disable mongoose buffering
	maxPoolSize: 10, // Maintain up to 10 socket connections
	serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
	socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

/**
 * Connect to MongoDB database
 * @returns Promise<void>
 */
export async function connectToDatabase(): Promise<void> {
	try {
		// Check if already connected
		if (mongoose.connection.readyState === 1) {
			console.log('Already connected to MongoDB');
			return;
		}

		console.log('Connecting to MongoDB...');
		await mongoose.connect(MONGODB_URI, connectionOptions);
		console.log('Successfully connected to MongoDB');
	} catch (error) {
		console.error('MongoDB connection error:', error);
		throw error;
	}
}

/**
 * Disconnect from MongoDB database
 * @returns Promise<void>
 */
export async function disconnectFromDatabase(): Promise<void> {
	try {
		await mongoose.disconnect();
		console.log('Disconnected from MongoDB');
	} catch (error) {
		console.error('MongoDB disconnection error:', error);
		throw error;
	}
}

/**
 * Get the current connection state
 * @returns number - 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
 */
export function getConnectionState(): number {
	return mongoose.connection.readyState;
}

// Handle connection events
mongoose.connection.on('connected', () => {
	console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
	console.error('Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
	console.log('Mongoose disconnected from MongoDB');
});