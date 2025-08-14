import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose, { type Mongoose } from 'mongoose';
import { connectToDatabase, disconnectFromDatabase } from '$lib/database/connection';

// Mock mongoose
vi.mock('mongoose', () => {
	const mockConnection = {
		readyState: 0, // Start disconnected
		on: vi.fn()
	};
	
	return {
		default: {
			connect: vi.fn(),
			disconnect: vi.fn(),
			connection: mockConnection
		}
	};
});

describe('Database Connection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset connection state to disconnected
		Object.defineProperty(mongoose.connection, 'readyState', {
			value: 0,
			writable: true,
			configurable: true
		});
	});

	// Remove the problematic afterEach hook since we're using mocks
	// afterEach is not needed when everything is mocked

	describe('connectToDatabase', () => {
		it('should connect to MongoDB with correct URI', async () => {
			const mockConnect = vi.mocked(mongoose.connect);
			mockConnect.mockResolvedValueOnce(mongoose as Mongoose);

			await connectToDatabase();

			expect(mockConnect).toHaveBeenCalledWith(
				'mongodb://localhost:27017/touchline-elite-test',
				expect.objectContaining({
					bufferCommands: false,
					maxPoolSize: 10,
					serverSelectionTimeoutMS: 5000,
					socketTimeoutMS: 45000
				})
			);
		});

		it('should handle connection errors', async () => {
			const mockConnect = vi.mocked(mongoose.connect);
			const connectionError = new Error('Connection failed');
			mockConnect.mockRejectedValueOnce(connectionError);

			await expect(connectToDatabase()).rejects.toThrow('Connection failed');
		});

		it('should not reconnect if already connected', async () => {
			const mockConnect = vi.mocked(mongoose.connect);
			
			// Mock that we're already connected
			Object.defineProperty(mongoose.connection, 'readyState', {
				value: 1,
				writable: true,
				configurable: true
			});

			await connectToDatabase();

			expect(mockConnect).not.toHaveBeenCalled();
		});
	});

	describe('disconnectFromDatabase', () => {
		it('should disconnect from MongoDB', async () => {
			const mockDisconnect = vi.mocked(mongoose.disconnect);
			mockDisconnect.mockResolvedValueOnce();

			await disconnectFromDatabase();

			expect(mockDisconnect).toHaveBeenCalledOnce();
		});

		it('should handle disconnection errors', async () => {
			const mockDisconnect = vi.mocked(mongoose.disconnect);
			const disconnectionError = new Error('Disconnection failed');
			mockDisconnect.mockRejectedValueOnce(disconnectionError);

			await expect(disconnectFromDatabase()).rejects.toThrow('Disconnection failed');
		});
	});
});