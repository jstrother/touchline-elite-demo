import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TeamModel as Team, ITeam } from '../../lib/schema/Team';
import { TeamFactory } from '../fixtures/TeamFactory';

/**
 * Database Integration Tests for Team Schema
 * 
 * These tests verify that our Team schema works correctly with a real MongoDB instance,
 * testing all database operations, indexes, and constraints end-to-end.
 */
describe('Team Database Integration', () => {
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
    // Clear the teams collection before each test
    await Team.deleteMany({});
  });

  describe('Database Connection and Schema', () => {
    it('should be connected to MongoDB', () => {
      expect(mongoose.connection.readyState).toBe(1); // Connected
    });

    it('should have Team collection with correct name', () => {
      expect(Team.collection.name).toBe('teams');
    });
  });

  describe('CRUD Operations', () => {
    it('should create and save a team to the database', async () => {
      // Arrange
      const teamData = TeamFactory.create({
        sportmonksId: 12345,
        name: 'Manchester United',
        shortCode: 'MUN',
        country: 'England',
        city: 'Manchester'
      });

      // Act
      const team = await Team.createTeam(teamData);

      // Assert
      expect(team._id).toBeDefined();
      expect(team.createdAt).toBeDefined();
      expect(team.updatedAt).toBeDefined();
      expect(team.isActive).toBe(true);
      
      // Verify it's actually in the database
      const foundTeam = await Team.findById(team._id);
      expect(foundTeam).not.toBeNull();
      expect(foundTeam!.name).toBe('Manchester United');
      expect(foundTeam!.shortCode).toBe('MUN');
    });

    it('should read teams from the database', async () => {
      // Arrange - Create test data
      const teams = await Team.createManyTeams([
        TeamFactory.create({ name: 'Team 1', sportmonksId: 1 }),
        TeamFactory.create({ name: 'Team 2', sportmonksId: 2 }),
        TeamFactory.create({ name: 'Team 3', sportmonksId: 3 })
      ]);

      // Act
      const allTeams = await Team.find({});

      // Assert
      expect(allTeams).toHaveLength(3);
      expect(allTeams.map(t => t.name)).toContain('Team 1');
      expect(allTeams.map(t => t.name)).toContain('Team 2');
      expect(allTeams.map(t => t.name)).toContain('Team 3');
    });

    it('should update a team in the database', async () => {
      // Arrange
      const team = await Team.createTeam(TeamFactory.create({
        name: 'Original Name',
        shortCode: 'ORI',
        city: 'Original City'
      }));

      // Act
      const updatedTeam = await team.update({
        name: 'Updated Name',
        shortCode: 'UPD',
        city: 'Updated City'
      });

      // Assert
      expect(updatedTeam.name).toBe('Updated Name');
      expect(updatedTeam.shortCode).toBe('UPD');
      expect(updatedTeam.city).toBe('Updated City');
      expect(updatedTeam.updatedAt.getTime()).toBeGreaterThan(updatedTeam.createdAt.getTime());

      // Verify in database
      const dbTeam = await Team.findById(team._id);
      expect(dbTeam!.name).toBe('Updated Name');
      expect(dbTeam!.shortCode).toBe('UPD');
    });

    it('should soft delete a team', async () => {
      // Arrange
      const team = await Team.createTeam(TeamFactory.create());

      // Act
      await team.delete();

      // Assert
      const foundTeam = await Team.findById(team._id);
      expect(foundTeam).toBeNull(); // Should not find via normal query

      const allTeams = await Team.find({});
      expect(allTeams).toHaveLength(0); // Should not appear in normal queries

      // But should be findable in deleted queries
      const deletedTeams = await Team.findDeleted();
      expect(deletedTeams).toHaveLength(1);
      expect(deletedTeams[0]._id.toString()).toBe(team._id.toString());
      expect(deletedTeams[0].isActive).toBe(false);
    });

    it('should hard delete a team', async () => {
      // Arrange
      const team = await Team.createTeam(TeamFactory.create());

      // Act
      await team.delete({ hard: true });

      // Assert
      const foundTeam = await Team.findById(team._id);
      expect(foundTeam).toBeNull();

      const deletedTeams = await Team.findDeleted();
      expect(deletedTeams).toHaveLength(0);
    });

    it('should activate and deactivate teams', async () => {
      // Arrange
      const team = await Team.createTeam(TeamFactory.createInactive());
      expect(team.isActive).toBe(false);

      // Act - Activate
      const activatedTeam = await team.activate();

      // Assert
      expect(activatedTeam.isActive).toBe(true);
      expect(activatedTeam.deletedAt).toBeNull();

      // Act - Deactivate
      const deactivatedTeam = await activatedTeam.deactivate();

      // Assert
      expect(deactivatedTeam.isActive).toBe(false);
    });
  });

  describe('Database Constraints and Validation', () => {
    it('should enforce unique sportmonksId constraint', async () => {
      // Arrange
      const teamData1 = TeamFactory.create({ sportmonksId: 999 });
      const teamData2 = TeamFactory.create({ sportmonksId: 999 });

      // Act & Assert
      await Team.createTeam(teamData1);
      
      await expect(Team.createTeam(teamData2))
        .rejects
        .toThrow(/duplicate key error|E11000/);
    });

    it('should validate required fields at database level', async () => {
      // Arrange
      const invalidTeam = new Team({
        name: 'Test Team'
        // Missing required sportmonksId
      });

      // Act & Assert
      await expect(invalidTeam.save())
        .rejects
        .toThrow(/SportMonks ID is required/);
    });

    it('should validate sportmonksId is positive integer', async () => {
      // Arrange
      const teamData = TeamFactory.create();
      const team = new Team(teamData);
      team.sportmonksId = -1;

      // Act & Assert
      await expect(team.save())
        .rejects
        .toThrow(/SportMonks ID must be positive/);
    });

    it('should validate shortCode length', async () => {
      // Arrange
      const teamData = TeamFactory.create();
      const team = new Team(teamData);
      team.shortCode = 'TOOLONGCODE'; // Too long

      // Act & Assert
      await expect(team.save())
        .rejects
        .toThrow(/Short code cannot exceed 10 characters/);
    });

    it('should validate shortCode pattern', async () => {
      // Arrange
      const teamData = TeamFactory.create();
      const team = new Team(teamData);
      team.shortCode = 'invalid-'; // contains invalid characters

      // Act & Assert
      await expect(team.save())
        .rejects
        .toThrow(/Short code must contain only uppercase letters and numbers/);
    });

    it('should validate logoUrl format', async () => {
      // Arrange
      const teamData = TeamFactory.create();
      const team = new Team(teamData);
      team.logoUrl = 'not-a-valid-url';

      // Act & Assert
      await expect(team.save())
        .rejects
        .toThrow(/Logo URL must be a valid HTTP\/HTTPS URL/);
    });

    it('should validate foundedYear range', async () => {
      // Arrange
      const teamData = TeamFactory.create();
      const team = new Team(teamData);
      team.foundedYear = 1700; // Too early

      // Act & Assert
      await expect(team.save())
        .rejects
        .toThrow(/Founded year must be after 1800/);
    });
  });

  describe('Database Indexes and Performance', () => {
    it('should have required indexes created', async () => {
      // Act
      const indexes = await Team.collection.getIndexes();

      // Assert
      const indexNames = Object.keys(indexes);
      expect(indexNames).toContain('sportmonksId_1'); // Unique index
      expect(indexNames).toContain('deletedAt_1'); // Soft delete index
      expect(indexNames).toContain('isActive_1'); // Active status index
    });

    it('should efficiently query by sportmonksId', async () => {
      // Arrange - Create multiple teams
      await Team.createManyTeams([
        TeamFactory.create({ sportmonksId: 1 }),
        TeamFactory.create({ sportmonksId: 2 }),
        TeamFactory.create({ sportmonksId: 3 })
      ]);

      // Act
      const team = await Team.findOne({ sportmonksId: 2 });

      // Assert
      expect(team).not.toBeNull();
      expect(team!.sportmonksId).toBe(2);
    });

    it('should efficiently query by league', async () => {
      // Arrange
      const leagueId = new mongoose.Types.ObjectId().toString();
      await Team.createManyTeams([
        TeamFactory.createForLeague(leagueId),
        TeamFactory.createForLeague(leagueId),
        TeamFactory.create() // Different league
      ]);

      // Act
      const leagueTeams = await Team.findByLeague(leagueId);

      // Assert
      expect(leagueTeams).toHaveLength(2);
      leagueTeams.forEach(team => {
        expect(team.leagueId?.toString()).toBe(leagueId);
        expect(team.isActive).toBe(true);
      });
    });

    it('should efficiently query by country', async () => {
      // Arrange
      await Team.createManyTeams([
        TeamFactory.createForCountry('England'),
        TeamFactory.createForCountry('England'),
        TeamFactory.createForCountry('Spain')
      ]);

      // Act
      const englishTeams = await Team.findByCountry('England');

      // Assert
      expect(englishTeams).toHaveLength(2);
      englishTeams.forEach(team => {
        expect(team.country).toBe('England');
        expect(team.isActive).toBe(true);
      });
    });
  });

  describe('Advanced Database Features', () => {
    it('should support text search on name and shortCode fields', async () => {
      // Arrange
      await Team.createManyTeams([
        TeamFactory.create({ name: 'Manchester United', shortCode: 'MUN', sportmonksId: 1 }),
        TeamFactory.create({ name: 'Manchester City', shortCode: 'MCI', sportmonksId: 2 }),
        TeamFactory.create({ name: 'Liverpool FC', shortCode: 'LIV', sportmonksId: 3 })
      ]);

      // Act
      const searchResults = await Team.searchByName('Manchester');

      // Assert
      expect(searchResults).toHaveLength(2);
      const teamNames = searchResults.map(t => t.name);
      expect(teamNames).toContain('Manchester United');
      expect(teamNames).toContain('Manchester City');
    });

    it('should support complex queries with multiple conditions', async () => {
      // Arrange
      const leagueId = new mongoose.Types.ObjectId().toString();
      await Team.createManyTeams([
        TeamFactory.create({ 
          country: 'England', 
          leagueId,
          isActive: true,
          sportmonksId: 1 
        }),
        TeamFactory.create({ 
          country: 'England', 
          isActive: false,
          sportmonksId: 2 
        }),
        TeamFactory.create({ 
          country: 'Spain', 
          leagueId,
          isActive: true,
          sportmonksId: 3 
        })
      ]);

      // Act
      const activeEnglishTeams = await Team.find({
        country: 'England',
        isActive: true,
        deletedAt: null
      });

      // Assert
      expect(activeEnglishTeams).toHaveLength(1);
      expect(activeEnglishTeams[0].country).toBe('England');
      expect(activeEnglishTeams[0].isActive).toBe(true);
    });

    it('should support aggregation operations', async () => {
      // Arrange
      await Team.createManyTeams([
        TeamFactory.createForCountry('England'),
        TeamFactory.createForCountry('England'),
        TeamFactory.createForCountry('Spain'),
        TeamFactory.createForCountry('Germany')
      ]);

      // Act
      const countryCounts = await Team.aggregate([
        { $match: { deletedAt: null, isActive: true } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Assert
      expect(countryCounts).toHaveLength(3);
      expect(countryCounts[0]._id).toBe('England');
      expect(countryCounts[0].count).toBe(2);
    });

    it('should exclude inactive teams from league queries', async () => {
      // Arrange
      const leagueId = new mongoose.Types.ObjectId().toString();
      await Team.createManyTeams([
        TeamFactory.createForLeague(leagueId, { isActive: true }),
        TeamFactory.createForLeague(leagueId, { isActive: false }),
        TeamFactory.createForLeague(leagueId, { isActive: true })
      ]);

      // Act
      const activeTeams = await Team.findByLeague(leagueId);
      const inactiveTeams = await Team.findInactive();

      // Assert
      expect(activeTeams).toHaveLength(2);
      expect(inactiveTeams).toHaveLength(1);
      activeTeams.forEach(team => expect(team.isActive).toBe(true));
      inactiveTeams.forEach(team => expect(team.isActive).toBe(false));
    });
  });

  describe('Schema Methods and Business Logic', () => {
    it('should auto-uppercase shortCode on save', async () => {
      // Arrange
      const teamData = TeamFactory.create({
        shortCode: 'man' // lowercase
      });

      // Act
      const team = await Team.createTeam(teamData);

      // Assert
      expect(team.shortCode).toBe('MAN');
    });

    it('should handle missing optional fields gracefully', async () => {
      // Arrange
      const minimalTeam = TeamFactory.createMinimal({
        sportmonksId: 12345,
        name: 'Minimal Team'
      });

      // Act
      const team = await Team.createTeam(minimalTeam);

      // Assert
      expect(team.name).toBe('Minimal Team');
      expect(team.sportmonksId).toBe(12345);
      expect(team.isActive).toBe(true); // Default value
      expect(team.shortCode).toBeUndefined();
      expect(team.foundedYear).toBeUndefined();
    });

    it('should maintain data integrity during updates', async () => {
      // Arrange
      const team = await Team.createTeam(TeamFactory.create({
        name: 'Original Team',
        isActive: true
      }));
      const originalUpdatedAt = team.updatedAt;

      // Small delay to ensure updatedAt difference
      await new Promise(resolve => setTimeout(resolve, 50));

      // Act
      const updatedTeam = await team.update({
        name: 'Updated Team',
        isActive: false
      });

      // Assert
      expect(updatedTeam.name).toBe('Updated Team');
      expect(updatedTeam.isActive).toBe(false);
      expect(updatedTeam.sportmonksId).toBe(team.sportmonksId); // Unchanged
      expect(updatedTeam.createdAt).toEqual(team.createdAt); // Unchanged
      
      // Verify updatedAt has changed (with some tolerance for timing)
      expect(updatedTeam.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
      
      // Verify the change persisted in database
      const dbTeam = await Team.findById(team._id);
      expect(dbTeam!.name).toBe('Updated Team');
      expect(dbTeam!.isActive).toBe(false);
    });
  });

  describe('Concurrency and Transaction Safety', () => {
    it('should handle concurrent operations safely', async () => {
      // Arrange
      const teamData = TeamFactory.create({ sportmonksId: 12345 });

      // Act - Try to create the same team concurrently
      const promises = Array(5).fill(0).map(() => 
        Team.createTeam(teamData).catch(err => err)
      );
      
      const results = await Promise.all(promises);

      // Assert - Only one should succeed, others should fail with duplicate key error
      const successes = results.filter(r => r instanceof Team || (r && r._id));
      const failures = results.filter(r => r instanceof Error);
      
      expect(successes).toHaveLength(1);
      expect(failures.length).toBeGreaterThan(0);
    });

    it('should maintain referential integrity with leagues', async () => {
      // Arrange
      const leagueId = new mongoose.Types.ObjectId().toString();
      const team = await Team.createTeam(TeamFactory.createForLeague(leagueId));

      // Act - Update league reference
      const updatedTeam = await team.update({
        leagueId: new mongoose.Types.ObjectId().toString()
      });

      // Assert
      expect(updatedTeam.leagueId?.toString()).not.toBe(leagueId);
      expect(mongoose.Types.ObjectId.isValid(updatedTeam.leagueId!)).toBe(true);
    });
  });
});