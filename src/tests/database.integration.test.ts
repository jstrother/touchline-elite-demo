import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { connectToDatabase, disconnectFromDatabase, getConnectionState } from '$lib/database/connection';

// This test requires a real MongoDB instance running
// Skip by default, run with: npm test -- --run src/tests/database.integration.test.ts
describe.skip('Database Integration Tests', () => {
	beforeAll(async () => {
		// Ensure we start disconnected
		if (getConnectionState() !== 0) {
			await disconnectFromDatabase();
		}
	});

	afterAll(async () => {
		// Clean up after tests
		await disconnectFromDatabase();
	});

	it('should connect to and disconnect from MongoDB', async () => {
		// Initially disconnected
		expect(getConnectionState()).toBe(0);

		// Connect
		await connectToDatabase();
		expect(getConnectionState()).toBe(1);

		// Disconnect
		await disconnectFromDatabase();
		expect(getConnectionState()).toBe(0);
	}, 10000); // 10 second timeout for real DB operations

	it('should handle multiple connection attempts gracefully', async () => {
		await connectToDatabase();
		expect(getConnectionState()).toBe(1);

		// Second connection attempt should not fail
		await connectToDatabase();
		expect(getConnectionState()).toBe(1);

		await disconnectFromDatabase();
	}, 10000);
});