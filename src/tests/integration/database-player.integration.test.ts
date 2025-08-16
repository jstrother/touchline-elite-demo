import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Player, IPlayer, PlayerPosition } from '../../lib/schema/Player';
import { PlayerFactory } from '../fixtures/PlayerFactory';

/**
 * Database Integration Tests for Player Schema
 * 
 * These tests verify that our Player schema works correctly with a real MongoDB instance,
 * testing all database operations, indexes, and constraints end-to-end.
 */
describe('Player Database Integration', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Start MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    try {
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB Memory Server for testing');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }, 30000);

  afterAll(async () => {
    // Clean up and disconnect
    try {
      await mongoose.disconnect();
      await mongoServer.stop();
      console.log('Disconnected from MongoDB and stopped memory server');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }, 30000);

  beforeEach(async () => {
    // Clear the players collection before each test
    await Player.deleteMany({});
  });

  describe('Database Connection and Schema', () => {
    it('should be connected to MongoDB', () => {
      expect(mongoose.connection.readyState).toBe(1); // Connected
    });

    it('should have Player collection with correct name', () => {
      expect(Player.collection.name).toBe('players');
    });
  });

  describe('CRUD Operations', () => {
    it('should create and save a player to the database', async () => {
      // Arrange
      const playerData = PlayerFactory.create({
        sportmonksId: 12345,
        name: 'Lionel Messi',
        firstName: 'Lionel',
        lastName: 'Messi',
        position: PlayerPosition.FORWARD
      });

      // Act
      const player = await Player.createPlayer(playerData);

      // Assert
      expect(player._id).toBeDefined();
      expect(player.createdAt).toBeDefined();
      expect(player.updatedAt).toBeDefined();
      
      // Verify it's actually in the database
      const foundPlayer = await Player.findById(player._id);
      expect(foundPlayer).not.toBeNull();
      expect(foundPlayer!.name).toBe('Lionel Messi');
    });

    it('should read players from the database', async () => {
      // Arrange - Create test data
      const players = await Player.createManyPlayers([
        PlayerFactory.create({ name: 'Player 1', sportmonksId: 1 }),
        PlayerFactory.create({ name: 'Player 2', sportmonksId: 2 }),
        PlayerFactory.create({ name: 'Player 3', sportmonksId: 3 })
      ]);

      // Act
      const allPlayers = await Player.find({});

      // Assert
      expect(allPlayers).toHaveLength(3);
      expect(allPlayers.map(p => p.name)).toContain('Player 1');
      expect(allPlayers.map(p => p.name)).toContain('Player 2');
      expect(allPlayers.map(p => p.name)).toContain('Player 3');
    });

    it('should update a player in the database', async () => {
      // Arrange
      const player = await Player.createPlayer(PlayerFactory.create({
        name: 'Original Name',
        height: 175
      }));

      // Act
      const updatedPlayer = await player.update({
        name: 'Updated Name',
        height: 180
      });

      // Assert
      expect(updatedPlayer.name).toBe('Updated Name');
      expect(updatedPlayer.height).toBe(180);
      expect(updatedPlayer.updatedAt.getTime()).toBeGreaterThan(updatedPlayer.createdAt.getTime());

      // Verify in database
      const dbPlayer = await Player.findById(player._id);
      expect(dbPlayer!.name).toBe('Updated Name');
      expect(dbPlayer!.height).toBe(180);
    });

    it('should soft delete a player', async () => {
      // Arrange
      const player = await Player.createPlayer(PlayerFactory.create());

      // Act
      await player.delete();

      // Assert
      const foundPlayer = await Player.findById(player._id);
      expect(foundPlayer).toBeNull(); // Should not find via normal query

      const allPlayers = await Player.find({});
      expect(allPlayers).toHaveLength(0); // Should not appear in normal queries

      // But should be findable in deleted queries
      const deletedPlayers = await Player.findDeleted();
      expect(deletedPlayers).toHaveLength(1);
      expect(deletedPlayers[0]._id.toString()).toBe(player._id.toString());
    });

    it('should hard delete a player', async () => {
      // Arrange
      const player = await Player.createPlayer(PlayerFactory.create());

      // Act
      await player.delete({ hard: true });

      // Assert
      const foundPlayer = await Player.findById(player._id);
      expect(foundPlayer).toBeNull();

      const deletedPlayers = await Player.findDeleted();
      expect(deletedPlayers).toHaveLength(0);
    });
  });

  describe('Database Constraints and Validation', () => {
    it('should enforce unique sportmonksId constraint', async () => {
      // Arrange
      const playerData1 = PlayerFactory.create({ sportmonksId: 999 });
      const playerData2 = PlayerFactory.create({ sportmonksId: 999 });

      // Act & Assert
      await Player.createPlayer(playerData1);
      
      await expect(Player.createPlayer(playerData2))
        .rejects
        .toThrow(/duplicate key error|E11000/);
    });

    it('should validate required fields at database level', async () => {
      // Arrange
      const invalidPlayer = new Player({
        name: 'Test Player'
        // Missing required fields
      });

      // Act & Assert
      await expect(invalidPlayer.save())
        .rejects
        .toThrow(/sportmonksId is required/);
    });

    it('should validate enum constraints at database level', async () => {
      // Arrange
      const playerData = PlayerFactory.create();
      const player = new Player(playerData);
      (player as any).position = 'InvalidPosition';

      // Act & Assert
      await expect(player.save())
        .rejects
        .toThrow(/Position must be one of/);
    });
  });

  describe('Database Indexes and Performance', () => {
    it('should have required indexes created', async () => {
      // Act
      const indexes = await Player.collection.getIndexes();

      // Assert
      const indexNames = Object.keys(indexes);
      expect(indexNames).toContain('sportmonksId_1'); // Unique index
      expect(indexNames).toContain('position_1'); // Position index
      expect(indexNames).toContain('deletedAt_1'); // Soft delete index
    });

    it('should efficiently query by sportmonksId', async () => {
      // Arrange - Create multiple players
      await Player.createManyPlayers([
        PlayerFactory.create({ sportmonksId: 1 }),
        PlayerFactory.create({ sportmonksId: 2 }),
        PlayerFactory.create({ sportmonksId: 3 })
      ]);

      // Act
      const player = await Player.findOne({ sportmonksId: 2 });

      // Assert
      expect(player).not.toBeNull();
      expect(player!.sportmonksId).toBe(2);
    });

    it('should efficiently query by position', async () => {
      // Arrange
      await Player.createManyPlayers([
        PlayerFactory.createGoalkeeper(),
        PlayerFactory.createDefender(),
        PlayerFactory.createMidfielder(),
        PlayerFactory.createForward()
      ]);

      // Act
      const goalkeepers = await Player.findByPosition(PlayerPosition.GOALKEEPER);
      const defenders = await Player.findByPosition(PlayerPosition.DEFENDER);

      // Assert
      expect(goalkeepers).toHaveLength(1);
      expect(defenders).toHaveLength(1);
      expect(goalkeepers[0].position).toBe(PlayerPosition.GOALKEEPER);
      expect(defenders[0].position).toBe(PlayerPosition.DEFENDER);
    });
  });

  describe('Advanced Database Features', () => {
    it('should support text search on name field', async () => {
      // Arrange
      await Player.createManyPlayers([
        PlayerFactory.create({ name: 'Lionel Messi', sportmonksId: 1 }),
        PlayerFactory.create({ name: 'Cristiano Ronaldo', sportmonksId: 2 }),
        PlayerFactory.create({ name: 'Kylian Mbappe', sportmonksId: 3 })
      ]);

      // Act
      const searchResults = await Player.find({
        $text: { $search: 'Messi' }
      });

      // Assert
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].name).toBe('Lionel Messi');
    });

    it('should support complex queries with multiple conditions', async () => {
      // Arrange
      await Player.createManyPlayers([
        PlayerFactory.create({ 
          position: PlayerPosition.FORWARD, 
          nationality: 'Argentina',
          sportmonksId: 1 
        }),
        PlayerFactory.create({ 
          position: PlayerPosition.FORWARD, 
          nationality: 'Portugal',
          sportmonksId: 2 
        }),
        PlayerFactory.create({ 
          position: PlayerPosition.MIDFIELDER, 
          nationality: 'Argentina',
          sportmonksId: 3 
        })
      ]);

      // Act
      const argentinianForwards = await Player.find({
        position: PlayerPosition.FORWARD,
        nationality: 'Argentina'
      });

      // Assert
      expect(argentinianForwards).toHaveLength(1);
      expect(argentinianForwards[0].position).toBe(PlayerPosition.FORWARD);
      expect(argentinianForwards[0].nationality).toBe('Argentina');
    });

    it('should support aggregation operations', async () => {
      // Arrange
      await Player.createManyPlayers([
        PlayerFactory.create({ position: PlayerPosition.FORWARD, sportmonksId: 1 }),
        PlayerFactory.create({ position: PlayerPosition.FORWARD, sportmonksId: 2 }),
        PlayerFactory.create({ position: PlayerPosition.MIDFIELDER, sportmonksId: 3 }),
        PlayerFactory.create({ position: PlayerPosition.DEFENDER, sportmonksId: 4 })
      ]);

      // Act
      const positionCounts = await Player.aggregate([
        { $group: { _id: '$position', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Assert
      expect(positionCounts).toHaveLength(3);
      expect(positionCounts[0]._id).toBe(PlayerPosition.FORWARD);
      expect(positionCounts[0].count).toBe(2);
    });
  });

  describe('Schema Methods and Virtuals', () => {
    it('should calculate age correctly from database data', async () => {
      // Arrange
      const birthDate = new Date('1987-06-24'); // Messi's birthday
      const player = await Player.createPlayer(PlayerFactory.create({
        dateOfBirth: birthDate
      }));

      // Act
      const retrievedPlayer = await Player.findById(player._id);
      const age = retrievedPlayer!.getAge();

      // Assert
      const expectedAge = new Date().getFullYear() - 1987;
      expect(age).toBeCloseTo(expectedAge, 0);
    });

    it('should include virtual fields in JSON output', async () => {
      // Arrange
      const player = await Player.createPlayer(PlayerFactory.create({
        firstName: 'Lionel',
        lastName: 'Messi'
      }));

      // Act
      const playerJson = player.toJSON();

      // Assert
      expect(playerJson.fullName).toBe('Lionel Messi');
    });

    it('should auto-generate display name on save', async () => {
      // Arrange & Act
      const player = await Player.createPlayer(PlayerFactory.createMinimal({
        firstName: 'Cristiano',
        lastName: 'Ronaldo'
      }));

      // Assert
      const savedPlayer = await Player.findById(player._id);
      expect(savedPlayer!.displayName).toBe('C. Ronaldo');
    });
  });

  describe('Concurrency and Transaction Safety', () => {
    it('should handle concurrent operations safely', async () => {
      // Arrange
      const playerData = PlayerFactory.create({ sportmonksId: 12345 });

      // Act - Try to create the same player concurrently
      const promises = Array(5).fill(0).map(() => 
        Player.createPlayer(playerData).catch(err => err)
      );
      
      const results = await Promise.all(promises);

      // Assert - Only one should succeed, others should fail with duplicate key error
      const successes = results.filter(r => r instanceof Player || (r && r._id));
      const failures = results.filter(r => r instanceof Error);
      
      expect(successes).toHaveLength(1);
      expect(failures.length).toBeGreaterThan(0);
    });
  });
});