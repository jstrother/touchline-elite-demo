import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestDatabase } from '../../helpers/database';
import { PlayerFactory, PlayerPosition } from '../../fixtures/PlayerFactory';

// This import will FAIL initially - that's the point of TDD!
// We'll implement this as we make tests pass
import { Player, IPlayer } from '../../../lib/schema/Player';

/**
 * TDD Phase 1: Player Entity Tests
 * 
 * These tests define the business rules and requirements for our Player entity.
 * They will FAIL initially, driving our implementation.
 */
describe('Player Entity', () => {
  // Set up isolated test database
  setupTestDatabase({ dbName: 'player-test', debug: false });

  describe('Player Creation', () => {
    describe('when creating a player with valid data', () => {
      it('should create player with all required fields', async () => {
        // Arrange
        const playerData = PlayerFactory.createMinimal({
          sportmonksId: 12345,
          name: 'Lionel Messi',
          firstName: 'Lionel',
          lastName: 'Messi'
        });

        // Act
        const player = await Player.createPlayer(playerData);

        // Assert
        expect(player).toBeValidPlayer();
        expect(player.sportmonksId).toBe(12345);
        expect(player.name).toBe('Lionel Messi');
        expect(player.firstName).toBe('Lionel');
        expect(player.lastName).toBe('Messi');
        expect(player).toHaveValidTimestamps();
      });

      it('should create player with optional fields', async () => {
        // Arrange
        const playerData = PlayerFactory.create({
          sportmonksId: 12345,
          position: PlayerPosition.FORWARD,
          height: 170,
          weight: 72,
          nationality: 'Argentina'
        });

        // Act
        const player = await Player.createPlayer(playerData);

        // Assert
        expect(player).toBeValidPlayer();
        expect(player.position).toBeValidPosition();
        expect(player.height).toBeValidHeight();
        expect(player.weight).toBeValidWeight();
        expect(player.nationality).toBe('Argentina');
      });

      it('should auto-generate display name if not provided', async () => {
        // Arrange
        const playerData = PlayerFactory.createMinimal({
          firstName: 'Cristiano',
          lastName: 'Ronaldo'
        });

        // Act
        const player = await Player.createPlayer(playerData);

        // Assert
        expect(player.displayName).toBe('C. Ronaldo');
      });

      it('should preserve provided display name', async () => {
        // Arrange
        const playerData = PlayerFactory.create({
          firstName: 'Lionel',
          lastName: 'Messi',
          displayName: 'Leo Messi'
        });

        // Act
        const player = await Player.createPlayer(playerData);

        // Assert
        expect(player.displayName).toBe('Leo Messi');
      });
    });

    describe('when creating player with invalid data', () => {
      it('should reject player without required fields', async () => {
        // Arrange
        const invalidData = {
          name: 'Test Player'
          // Missing required fields: sportmonksId, firstName, lastName
        };

        // Act & Assert
        await expect(Player.createPlayer(invalidData as any))
          .rejects
          .toThrow('sportmonksId is required');
      });

      it('should reject negative SportMonks ID', async () => {
        // Arrange
        const invalidData = PlayerFactory.createInvalid('sportmonksId');

        // Act & Assert
        await expect(Player.createPlayer(invalidData))
          .rejects
          .toThrow('SportMonks ID must be positive');
      });

      it('should reject empty name fields', async () => {
        // Arrange
        const invalidData = PlayerFactory.createInvalid('firstName');

        // Act & Assert
        await expect(Player.createPlayer(invalidData))
          .rejects
          .toThrow('First name is required');
      });

      it('should reject invalid height', async () => {
        // Arrange
        const invalidData = PlayerFactory.createInvalid('height');

        // Act & Assert
        await expect(Player.createPlayer(invalidData))
          .rejects
          .toThrow('Height must be between 100cm and 250cm');
      });

      it('should reject invalid weight', async () => {
        // Arrange
        const invalidData = PlayerFactory.createInvalid('weight');

        // Act & Assert
        await expect(Player.createPlayer(invalidData))
          .rejects
          .toThrow('Weight must be between 30kg and 200kg');
      });

      it('should reject players too young', async () => {
        // Arrange
        const invalidData = PlayerFactory.createInvalid('dateOfBirth');

        // Act & Assert
        await expect(Player.createPlayer(invalidData))
          .rejects
          .toThrow('Player must be at least 15 years old');
      });
    });
  });

  describe('Player Business Logic', () => {
    describe('age calculation', () => {
      it('should calculate correct age from date of birth', async () => {
        // Arrange
        const birthDate = new Date('1987-06-24'); // Messi's birthday
        const playerData = PlayerFactory.create({
          dateOfBirth: birthDate
        });

        // Act
        const player = await Player.createPlayer(playerData);

        // Assert
        const expectedAge = new Date().getFullYear() - 1987;
        expect(player.getAge()).toBeCloseTo(expectedAge, 0);
      });

      it('should return null for player without date of birth', async () => {
        // Arrange
        const playerData = PlayerFactory.createMinimal();

        // Act
        const player = await Player.createPlayer(playerData);

        // Assert
        expect(player.getAge()).toBeNull();
      });
    });

    describe('full name virtual', () => {
      it('should return combined first and last name', async () => {
        // Arrange
        const playerData = PlayerFactory.create({
          firstName: 'Lionel',
          lastName: 'Messi'
        });

        // Act
        const player = await Player.createPlayer(playerData);

        // Assert
        expect(player.fullName).toBe('Lionel Messi');
      });
    });
  });

  describe('Player Queries', () => {
    beforeEach(async () => {
      // Create test data for query tests
      await Player.createManyPlayers([
        PlayerFactory.createGoalkeeper({ nationality: 'Germany' }),
        PlayerFactory.createDefender({ nationality: 'Brazil' }),
        PlayerFactory.createMidfielder({ nationality: 'Spain' }),
        PlayerFactory.createForward({ nationality: 'Argentina' }),
      ]);
    });

    it('should find players by position', async () => {
      // Act
      const goalkeepers = await Player.findByPosition(PlayerPosition.GOALKEEPER);

      // Assert
      expect(goalkeepers).toHaveLength(1);
      expect(goalkeepers[0].position).toBe(PlayerPosition.GOALKEEPER);
    });

    it('should find players by nationality', async () => {
      // Act
      const brazilians = await Player.findByNationality('Brazil');

      // Assert
      expect(brazilians).toHaveLength(1);
      expect(brazilians[0].nationality).toBe('Brazil');
    });

    it('should return empty array for non-existent nationality', async () => {
      // Act
      const players = await Player.findByNationality('NonExistent');

      // Assert
      expect(players).toHaveLength(0);
    });
  });

  describe('Player Validation Rules', () => {
    it('should enforce unique SportMonks ID', async () => {
      // Arrange
      const playerData1 = PlayerFactory.create({ sportmonksId: 999 });
      const playerData2 = PlayerFactory.create({ sportmonksId: 999 });

      // Act
      await Player.createPlayer(playerData1);

      // Assert
      await expect(Player.createPlayer(playerData2))
        .rejects
        .toThrow('duplicate key error');
    });

    it('should validate position enum values', async () => {
      // Arrange
      const invalidData = PlayerFactory.create();
      (invalidData as any).position = 'InvalidPosition';

      // Act & Assert
      await expect(Player.createPlayer(invalidData))
        .rejects
        .toThrow('Position must be one of: Goalkeeper, Defender, Midfielder, Forward');
    });

    it('should validate image URL format if provided', async () => {
      // Arrange
      const invalidData = PlayerFactory.create({
        imageUrl: 'not-a-valid-url'
      });

      // Act & Assert
      await expect(Player.createPlayer(invalidData))
        .rejects
        .toThrow('Image URL must be a valid HTTP/HTTPS URL');
    });
  });

  describe('Player Updates', () => {
    it('should update player with valid data', async () => {
      // Arrange
      const originalData = PlayerFactory.create();
      const player = await Player.createPlayer(originalData);
      
      const updateData = {
        height: 180,
        weight: 75,
        position: PlayerPosition.MIDFIELDER
      };

      // Act
      const updatedPlayer = await player.update(updateData);

      // Assert
      expect(updatedPlayer.height).toBe(180);
      expect(updatedPlayer.weight).toBe(75);
      expect(updatedPlayer.position).toBe(PlayerPosition.MIDFIELDER);
      expect(updatedPlayer.updatedAt.getTime()).toBeGreaterThan(updatedPlayer.createdAt.getTime());
    });

    it('should reject invalid updates', async () => {
      // Arrange
      const player = await Player.createPlayer(PlayerFactory.create());
      const invalidUpdate = { height: -10 };

      // Act & Assert
      await expect(player.update(invalidUpdate))
        .rejects
        .toThrow('Height must be between 100cm and 250cm');
    });
  });

  describe('Player Deletion', () => {
    it('should soft delete player by default', async () => {
      // Arrange
      const player = await Player.createPlayer(PlayerFactory.create());

      // Act
      await player.delete();

      // Assert
      const foundPlayer = await Player.findById(player.id);
      expect(foundPlayer).toBeNull();
      
      const deletedPlayer = await Player.findDeleted().findById(player.id);
      expect(deletedPlayer).not.toBeNull();
    });

    it('should hard delete when specified', async () => {
      // Arrange
      const player = await Player.createPlayer(PlayerFactory.create());

      // Act
      await player.delete({ hard: true });

      // Assert
      const foundPlayer = await Player.findById(player.id);
      expect(foundPlayer).toBeNull();
      
      const deletedPlayer = await Player.findDeleted().findById(player.id);
      expect(deletedPlayer).toBeNull();
    });
  });
});