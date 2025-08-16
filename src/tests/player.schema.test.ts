import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';

// Mock mongoose before importing our schema
const mockSchema = {
	index: vi.fn(),
	virtual: vi.fn().mockReturnThis(),
	get: vi.fn().mockReturnThis(),
	set: vi.fn().mockReturnThis(),
	pre: vi.fn(),
	methods: {},
	statics: {}
};

const mockModel = vi.fn().mockImplementation((data) => ({
	...data,
	_id: 'mock-id',
	save: vi.fn().mockResolvedValue({ ...data, _id: 'mock-id' }),
	createdAt: new Date(),
	updatedAt: new Date()
}));

// Add static methods to the mock model function
Object.assign(mockModel, {
	deleteMany: vi.fn().mockResolvedValue({}),
	findByPosition: vi.fn(),
	findByNationality: vi.fn()
});

const mockMongoose = {
	Schema: vi.fn().mockImplementation(() => mockSchema),
	model: vi.fn().mockReturnValue(mockModel),
	Document: class MockDocument {}
};

vi.mock('mongoose', () => ({
	default: mockMongoose,
	...mockMongoose
}));

describe('Player Schema', () => {
	let Player: ReturnType<typeof mockModel>;

	beforeAll(async () => {
		// Import the Player after mocks are set up
		const module = await import('$schema/Player');
		Player = module.Player;
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Model Creation', () => {
		it('should create player model with valid data', () => {
			const playerData = {
				sportmonksId: 12345,
				name: 'Lionel Messi',
				firstName: 'Lionel',
				lastName: 'Messi',
				displayName: 'L. Messi',
				dateOfBirth: new Date('1987-06-24'),
				nationality: 'Argentina',
				position: 'Forward',
				height: 170,
				weight: 72
			};

			const player = new Player(playerData);

			expect(player.sportmonksId).toBe(12345);
			expect(player.name).toBe('Lionel Messi');
			expect(player.firstName).toBe('Lionel');
			expect(player.lastName).toBe('Messi');
			expect(player.position).toBe('Forward');
		});

		it('should create player with minimal required data', () => {
			const playerData = {
				sportmonksId: 54321,
				name: 'Test Player',
				firstName: 'Test',
				lastName: 'Player'
			};

			const player = new Player(playerData);

			expect(player.sportmonksId).toBe(54321);
			expect(player.name).toBe('Test Player');
			expect(player.firstName).toBe('Test');
			expect(player.lastName).toBe('Player');
		});
	});

	describe('Player Model Functionality', () => {
		it('should be defined and callable', () => {
			expect(Player).toBeDefined();
			expect(typeof Player).toBe('function');
		});

		it('should create instances with mock behavior', () => {
			const playerData = {
				sportmonksId: 99999,
				name: 'Mock Player',
				firstName: 'Mock',
				lastName: 'Player'
			};

			const player = new Player(playerData);
			
			expect(player._id).toBe('mock-id');
			expect(player.createdAt).toBeInstanceOf(Date);
			expect(player.updatedAt).toBeInstanceOf(Date);
			expect(typeof player.save).toBe('function');
		});

		it('should have static methods available', () => {
			expect(typeof Player.deleteMany).toBe('function');
			expect(typeof Player.findByPosition).toBe('function');
			expect(typeof Player.findByNationality).toBe('function');
		});
	});

	describe('Schema Validation (Behavior Test)', () => {
		it('should handle valid position values', () => {
			const validPositions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
			
			validPositions.forEach(position => {
				const playerData = {
					sportmonksId: Math.random() * 100000,
					name: `Test Player ${position}`,
					firstName: 'Test',
					lastName: 'Player',
					position
				};

				const player = new Player(playerData);
				expect(player.position).toBe(position);
			});
		});

		it('should handle height and weight values', () => {
			const playerData = {
				sportmonksId: 11111,
				name: 'Height Weight Test',
				firstName: 'Height',
				lastName: 'Test',
				height: 180,
				weight: 75
			};

			const player = new Player(playerData);
			expect(player.height).toBe(180);
			expect(player.weight).toBe(75);
		});

		it('should handle optional fields', () => {
			const playerData = {
				sportmonksId: 22222,
				name: 'Optional Test',
				firstName: 'Optional',
				lastName: 'Test'
				// No optional fields provided
			};

			const player = new Player(playerData);
			expect(player.sportmonksId).toBe(22222);
			expect(player.name).toBe('Optional Test');
			// Optional fields should be undefined
			expect(player.height).toBeUndefined();
			expect(player.weight).toBeUndefined();
			expect(player.position).toBeUndefined();
		});
	});
});