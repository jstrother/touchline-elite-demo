import { describe, it, expect } from 'vitest';
import type { 
	PlayerPosition,
	PlayerCreateInput,
	PlayerUpdateInput,
	PlayerResponse,
	PlayerListResponse,
	PlayerSearchFilters
} from '$types/Player';

describe('Player Types', () => {
	describe('PlayerPosition', () => {
		it('should accept valid position values', () => {
			const validPositions: PlayerPosition[] = [
				'Goalkeeper',
				'Defender', 
				'Midfielder',
				'Forward'
			];

			// Type check - if this compiles, the types are correct
			validPositions.forEach(position => {
				expect(typeof position).toBe('string');
				expect(['Goalkeeper', 'Defender', 'Midfielder', 'Forward']).toContain(position);
			});
		});
	});

	describe('PlayerCreateInput', () => {
		it('should require mandatory fields', () => {
			const validCreateInput: PlayerCreateInput = {
				sportmonksId: 12345,
				name: 'Lionel Messi',
				firstName: 'Lionel',
				lastName: 'Messi'
			};

			expect(validCreateInput.sportmonksId).toBe(12345);
			expect(validCreateInput.name).toBe('Lionel Messi');
			expect(validCreateInput.firstName).toBe('Lionel');
			expect(validCreateInput.lastName).toBe('Messi');
		});

		it('should allow optional fields', () => {
			const createInputWithOptionals: PlayerCreateInput = {
				sportmonksId: 12345,
				name: 'Lionel Messi',
				firstName: 'Lionel',
				lastName: 'Messi',
				displayName: 'L. Messi',
				commonName: 'Messi',
				dateOfBirth: new Date('1987-06-24'),
				nationality: 'Argentina',
				position: 'Forward',
				detailedPosition: 'Right Winger',
				height: 170,
				weight: 72,
				imageUrl: 'https://example.com/messi.jpg'
			};

			expect(createInputWithOptionals.displayName).toBe('L. Messi');
			expect(createInputWithOptionals.position).toBe('Forward');
			expect(createInputWithOptionals.height).toBe(170);
		});

		it('should work with minimal required data only', () => {
			const minimalInput: PlayerCreateInput = {
				sportmonksId: 54321,
				name: 'Test Player',
				firstName: 'Test',
				lastName: 'Player'
			};

			expect(minimalInput.sportmonksId).toBe(54321);
			expect(minimalInput.displayName).toBeUndefined();
			expect(minimalInput.position).toBeUndefined();
		});
	});

	describe('PlayerUpdateInput', () => {
		it('should make all fields optional except id', () => {
			const updateInput: PlayerUpdateInput = {
				id: 'player-id-123',
				name: 'Updated Name'
			};

			expect(updateInput.id).toBe('player-id-123');
			expect(updateInput.name).toBe('Updated Name');
			expect(updateInput.sportmonksId).toBeUndefined();
		});

		it('should allow updating any field', () => {
			const fullUpdateInput: PlayerUpdateInput = {
				id: 'player-id-123',
				name: 'Updated Name',
				displayName: 'Updated Display',
				position: 'Midfielder',
				height: 175,
				weight: 70
			};

			expect(fullUpdateInput.position).toBe('Midfielder');
			expect(fullUpdateInput.height).toBe(175);
		});
	});

	describe('PlayerResponse', () => {
		it('should include all fields with proper types', () => {
			const playerResponse: PlayerResponse = {
				id: 'player-123',
				sportmonksId: 12345,
				name: 'Lionel Messi',
				firstName: 'Lionel',
				lastName: 'Messi',
				displayName: 'L. Messi',
				commonName: 'Messi',
				dateOfBirth: new Date('1987-06-24'),
				nationality: 'Argentina',
				position: 'Forward',
				detailedPosition: 'Right Winger',
				height: 170,
				weight: 72,
				imageUrl: 'https://example.com/messi.jpg',
				createdAt: new Date(),
				updatedAt: new Date()
			};

			expect(playerResponse.id).toBe('player-123');
			expect(playerResponse.sportmonksId).toBe(12345);
			expect(playerResponse.createdAt).toBeInstanceOf(Date);
			expect(playerResponse.updatedAt).toBeInstanceOf(Date);
		});

		it('should handle optional fields being undefined', () => {
			const minimalResponse: PlayerResponse = {
				id: 'player-456',
				sportmonksId: 54321,
				name: 'Test Player',
				firstName: 'Test',
				lastName: 'Player',
				createdAt: new Date(),
				updatedAt: new Date()
			};

			expect(minimalResponse.displayName).toBeUndefined();
			expect(minimalResponse.position).toBeUndefined();
			expect(minimalResponse.height).toBeUndefined();
		});
	});

	describe('PlayerListResponse', () => {
		it('should contain array of players and pagination info', () => {
			const listResponse: PlayerListResponse = {
				players: [
					{
						id: 'player-1',
						sportmonksId: 1,
						name: 'Player One',
						firstName: 'Player',
						lastName: 'One',
						createdAt: new Date(),
						updatedAt: new Date()
					},
					{
						id: 'player-2', 
						sportmonksId: 2,
						name: 'Player Two',
						firstName: 'Player',
						lastName: 'Two',
						createdAt: new Date(),
						updatedAt: new Date()
					}
				],
				pagination: {
					page: 1,
					limit: 20,
					total: 2,
					totalPages: 1
				}
			};

			expect(listResponse.players).toHaveLength(2);
			expect(listResponse.pagination.total).toBe(2);
			expect(listResponse.pagination.page).toBe(1);
		});

		it('should work with empty results', () => {
			const emptyResponse: PlayerListResponse = {
				players: [],
				pagination: {
					page: 1,
					limit: 20,
					total: 0,
					totalPages: 0
				}
			};

			expect(emptyResponse.players).toHaveLength(0);
			expect(emptyResponse.pagination.total).toBe(0);
		});
	});

	describe('PlayerSearchFilters', () => {
		it('should allow all optional search parameters', () => {
			const searchFilters: PlayerSearchFilters = {
				name: 'Messi',
				position: 'Forward',
				nationality: 'Argentina',
				minHeight: 160,
				maxHeight: 180,
				minWeight: 60,
				maxWeight: 80,
				page: 1,
				limit: 10
			};

			expect(searchFilters.name).toBe('Messi');
			expect(searchFilters.position).toBe('Forward');
			expect(searchFilters.page).toBe(1);
		});

		it('should work with minimal filters', () => {
			const minimalFilters: PlayerSearchFilters = {
				position: 'Goalkeeper'
			};

			expect(minimalFilters.position).toBe('Goalkeeper');
			expect(minimalFilters.name).toBeUndefined();
			expect(minimalFilters.page).toBeUndefined();
		});

		it('should work with empty filters object', () => {
			const emptyFilters: PlayerSearchFilters = {};

			expect(Object.keys(emptyFilters)).toHaveLength(0);
		});
	});

	describe('Type Compatibility', () => {
		it('should allow PlayerResponse to satisfy PlayerCreateInput structure', () => {
			const playerResponse: PlayerResponse = {
				id: 'player-123',
				sportmonksId: 12345,
				name: 'Test Player',
				firstName: 'Test',
				lastName: 'Player',
				createdAt: new Date(),
				updatedAt: new Date()
			};

			// Should be able to extract create input fields from response
			const createInput: PlayerCreateInput = {
				sportmonksId: playerResponse.sportmonksId,
				name: playerResponse.name,
				firstName: playerResponse.firstName,
				lastName: playerResponse.lastName,
				displayName: playerResponse.displayName,
				commonName: playerResponse.commonName,
				dateOfBirth: playerResponse.dateOfBirth,
				nationality: playerResponse.nationality,
				position: playerResponse.position,
				detailedPosition: playerResponse.detailedPosition,
				height: playerResponse.height,
				weight: playerResponse.weight,
				imageUrl: playerResponse.imageUrl
			};

			expect(createInput.sportmonksId).toBe(12345);
		});
	});
});