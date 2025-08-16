/**
 * Comprehensive Database Indexing Strategy for Touchline Elite Demo
 * 
 * This file documents all indexes used across the MongoDB schemas
 * for optimal query performance in the fantasy soccer application.
 */

import { Player } from '../schema/Player.js';
import { TeamModel } from '../schema/Team.js';
import { LeagueModel } from '../schema/League.js';
import { UserModel } from '../schema/User.js';
import { FantasyTeamModel } from '../schema/FantasyTeam.js';
import { PlayerStatsModel } from '../schema/PlayerStats.js';
import { SeasonModel } from '../schema/Season.js';
import { MatchModel } from '../schema/Match.js';
import type { IndexSpecification } from 'mongodb';

// Type definitions for MongoDB index operations
interface IndexInfo {
	name: string;
	keys: Record<string, number | string>;
	unique?: boolean;
	sparse?: boolean;
}

interface MongoIndexInfo {
	name?: string;
	key: Record<string, number | string>;
	unique?: boolean;
	sparse?: boolean;
}

interface CollectionAnalysis {
	collection: string;
	documentCount: number;
	indexCount: number;
	totalIndexSize: number;
	avgDocumentSize: number;
	indexes: IndexInfo[];
}

interface IndexCreationResult {
	collection: string;
	success: boolean;
	indexCount?: number;
	error?: string;
}

// ===============================
// INDEX STRATEGY OVERVIEW
// ===============================

/**
 * INDEXING PRINCIPLES:
 * 
 * 1. QUERY PATTERNS FIRST: Indexes are designed based on actual query patterns
 * 2. COMPOUND INDEXES: Use compound indexes for multi-field queries
 * 3. SELECTIVE FIELDS FIRST: Most selective fields come first in compound indexes
 * 4. SORT OPTIMIZATION: Include sort fields at the end of compound indexes
 * 5. UNIQUE CONSTRAINTS: Enforce data integrity with unique indexes
 * 6. TEXT SEARCH: Full-text search indexes for name-based searches
 * 7. TTL INDEXES: Time-based data expiration where applicable
 * 8. SPARSE INDEXES: For optional fields to save space
 */

// ===============================
// PLAYER COLLECTION INDEXES
// ===============================

/**
 * PLAYER QUERY PATTERNS:
 * - Find by SportMonks ID (API sync)
 * - Search by name (autocomplete)
 * - Filter by position + price range
 * - Filter by nationality + league
 * - Sort by fantasy points/price
 * - Find by team + position
 */

export const playerIndexes: Record<string, number | string>[] = [
	// Primary lookup and uniqueness
	{ sportmonksId: 1 }, // unique: true - API sync
	
	// Search and filtering
	{ name: 'text' }, // Full-text search
	{ position: 1 }, // Position filtering
	{ nationality: 1 }, // Nationality filtering
	
	// Performance monitoring
	{ createdAt: -1 }, // Recent additions
	{ updatedAt: -1 } // Recently updated
];

// ===============================
// TEAM COLLECTION INDEXES
// ===============================

/**
 * TEAM QUERY PATTERNS:
 * - Find by SportMonks ID
 * - Search by name
 * - Filter by league + country
 * - Find active teams
 * - League standings queries
 */

export const teamIndexes: Record<string, number | string>[] = [
	// Primary lookup
	{ sportmonksId: 1 }, // unique: true
	
	// Search and filtering  
	{ name: 'text', shortCode: 'text' }, // Full-text search
	{ leagueId: 1 }, // League filtering
	{ country: 1 }, // Country filtering
	{ isActive: 1 }, // Active teams only
	
	// Compound indexes
	{ leagueId: 1, isActive: 1 }, // Active teams in league
	{ country: 1, leagueId: 1 }, // Teams by country and league
	{ sportmonksId: 1, isActive: 1 } // API sync for active teams
];

// ===============================
// LEAGUE COLLECTION INDEXES
// ===============================

/**
 * LEAGUE QUERY PATTERNS:
 * - Find by SportMonks ID
 * - Filter by country + type
 * - Find top tier leagues
 * - Search by name
 * - Filter active leagues
 */

export const leagueIndexes: Record<string, number | string>[] = [
	// Primary lookup
	{ sportmonksId: 1 }, // unique: true
	
	// Search and filtering
	{ name: 'text', shortName: 'text' }, // Full-text search
	{ country: 1 }, // Country filtering
	{ type: 1 }, // League type filtering
	{ isActive: 1 }, // Active leagues
	
	// Compound indexes
	{ country: 1, type: 1 }, // Country + type filtering
	{ tier: 1, country: 1 }, // Top tier by country
	{ isActive: 1, type: 1 } // Active leagues by type
];

// ===============================
// USER COLLECTION INDEXES
// ===============================

/**
 * USER QUERY PATTERNS:
 * - Authentication (email/username lookup)
 * - Leaderboards (points sorting)
 * - Admin queries (role filtering)
 * - Subscription management
 * - User search and filtering
 */

export const userIndexes: Record<string, number | string>[] = [
	// Authentication
	{ email: 1 }, // unique: true - login
	{ username: 1 }, // unique: true - login
	
	// Security and administration
	{ role: 1 }, // Role-based access
	{ isActive: 1 }, // Active users only
	{ emailVerified: 1 }, // Email verification status
	
	// Performance and analytics
	{ totalPoints: -1 }, // Leaderboards
	{ subscriptionTier: 1 }, // Subscription management
	{ createdAt: -1 }, // User registration tracking
	
	// Compound indexes
	{ email: 1, isActive: 1 }, // Active user login
	{ username: 1, isActive: 1 }, // Active user login
	{ role: 1, isActive: 1 }, // Active users by role
	{ subscriptionTier: 1, subscriptionExpiresAt: 1 } // Subscription management
];

// ===============================
// FANTASY TEAM COLLECTION INDEXES
// ===============================

/**
 * FANTASY TEAM QUERY PATTERNS:
 * - Find by user + season
 * - Leaderboards (points sorting)
 * - Player ownership analysis
 * - Public team browsing
 * - Transfer analysis
 */

export const fantasyTeamIndexes: Record<string, number | string>[] = [
	// Core relationships
	{ userId: 1 }, // User's teams
	{ seasonId: 1 }, // Season teams
	{ userId: 1, seasonId: 1 }, // unique: true - one team per user per season
	
	// Leaderboards and rankings
	{ seasonId: 1, totalPoints: -1 }, // Season leaderboards
	{ totalPoints: -1 }, // Global leaderboards
	{ rank: 1 }, // Rank-based queries
	
	// Status and visibility
	{ status: 1 }, // Active/completed teams
	{ isPublic: 1 }, // Public teams
	{ isPublic: 1, totalPoints: -1 }, // Public leaderboards
	
	// Player analysis
	{ 'players.playerId': 1 }, // Player ownership tracking
	
	// Performance tracking
	{ gameweekPoints: -1 }, // Gameweek performance
	{ userId: 1, status: 1 } // User's active teams
];

// ===============================
// PLAYER STATS COLLECTION INDEXES
// ===============================

/**
 * PLAYER STATS QUERY PATTERNS:
 * - Find by player + season
 * - Fantasy performance tracking
 * - Price change monitoring
 * - Top performers lists
 * - Gameweek analysis
 */

export const playerStatsIndexes: Record<string, number | string>[] = [
	// Core relationships
	{ playerId: 1 }, // Player's stats
	{ seasonId: 1 }, // Season stats
	{ playerId: 1, seasonId: 1 }, // unique: true - one stat per player per season
	
	// Fantasy performance
	{ seasonId: 1, 'fantasy.fantasyPoints': -1 }, // Top performers
	{ seasonId: 1, 'fantasy.currentPrice': 1 }, // Price filtering
	{ seasonId: 1, 'fantasy.selectedByPercent': -1 }, // Most popular
	
	// Team analysis
	{ teamId: 1 }, // Team players
	{ teamId: 1, seasonId: 1 }, // Team stats by season
	
	// Gameweek tracking
	{ gameweek: 1 }, // Gameweek stats
	{ playerId: 1, gameweek: 1, seasonId: 1 }, // Player gameweek performance
	
	// Data freshness
	{ lastUpdated: -1 }, // Recently updated stats
	{ isActive: 1 }, // Active stats only
	
	// Performance metrics
	{ 'performance.goals': -1 }, // Top scorers
	{ 'performance.assists': -1 }, // Top assists
	{ 'fantasy.priceChangeTotal': -1 } // Biggest price changes
];

// ===============================
// SEASON COLLECTION INDEXES
// ===============================

/**
 * SEASON QUERY PATTERNS:
 * - Find by league + year
 * - Current active seasons
 * - Fantasy active seasons
 * - Season timeline queries
 */

export const seasonIndexes: Record<string, number | string>[] = [
	// Primary lookup
	{ sportmonksId: 1 }, // unique: true
	
	// Core relationships
	{ leagueId: 1 }, // League seasons
	{ leagueId: 1, startDate: -1 }, // Recent league seasons
	
	// Status filtering
	{ status: 1 }, // Season status
	{ isFantasyActive: 1 }, // Fantasy seasons
	{ status: 1, isFantasyActive: 1 }, // Active fantasy seasons
	
	// Timeline queries
	{ startDate: 1 }, // Season chronology
	{ endDate: 1 }, // Season endings
	{ startDate: 1, endDate: 1 }, // Date range queries
	
	// Search
	{ name: 'text' }, // Season name search
	
	// Current season tracking
	{ currentGameweek: 1 } // Gameweek-based queries
];

// ===============================
// MATCH COLLECTION INDEXES
// ===============================

/**
 * MATCH QUERY PATTERNS:
 * - Find by teams (fixtures/results)
 * - Gameweek fixtures
 * - Live match tracking
 * - Date-based queries
 * - League fixtures
 */

export const matchIndexes: Record<string, number | string>[] = [
	// Primary lookup
	{ sportmonksId: 1 }, // unique: true
	
	// Core relationships
	{ seasonId: 1 }, // Season matches
	{ leagueId: 1 }, // League matches
	{ seasonId: 1, gameweek: 1 }, // Gameweek fixtures
	
	// Team-based queries
	{ homeTeamId: 1 }, // Home fixtures
	{ awayTeamId: 1 }, // Away fixtures
	{ homeTeamId: 1, awayTeamId: 1, kickoffTime: 1 }, // Head-to-head
	
	// Time-based queries
	{ kickoffTime: 1 }, // Chronological order
	{ kickoffTime: 1, status: 1 }, // Time + status filtering
	{ kickoffTime: 1, isFantasyRelevant: 1 }, // Fantasy matches by time
	
	// Status tracking
	{ status: 1 }, // Match status filtering
	{ status: 1, kickoffTime: 1 }, // Live/upcoming matches
	
	// League scheduling
	{ leagueId: 1, kickoffTime: 1 }, // League fixtures chronologically
	{ seasonId: 1, status: 1 } // Season match status
];

// ===============================
// INDEX CREATION UTILITY
// ===============================

/**
 * Utility function to create all indexes across collections
 * Should be run during database initialization or migration
 */
export async function createAllIndexes(): Promise<IndexCreationResult[]> {
	const collections = [
		{ model: Player, indexes: playerIndexes, name: 'Player' },
		{ model: TeamModel, indexes: teamIndexes, name: 'Team' },
		{ model: LeagueModel, indexes: leagueIndexes, name: 'League' },
		{ model: UserModel, indexes: userIndexes, name: 'User' },
		{ model: FantasyTeamModel, indexes: fantasyTeamIndexes, name: 'FantasyTeam' },
		{ model: PlayerStatsModel, indexes: playerStatsIndexes, name: 'PlayerStats' },
		{ model: SeasonModel, indexes: seasonIndexes, name: 'Season' },
		{ model: MatchModel, indexes: matchIndexes, name: 'Match' }
	];

	const results: IndexCreationResult[] = [];

	for (const collection of collections) {
		try {
			console.log(`Creating indexes for ${collection.name}...`);
			
			// Create each index
			for (const index of collection.indexes) {
				await collection.model.collection.createIndex(index as IndexSpecification);
			}
			
			results.push({
				collection: collection.name,
				success: true,
				indexCount: collection.indexes.length
			});
			
			console.log(`✅ Created ${collection.indexes.length} indexes for ${collection.name}`);
		} catch (error) {
			console.error(`❌ Error creating indexes for ${collection.name}:`, error);
			results.push({
				collection: collection.name,
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}

	return results;
}

/**
 * Utility function to analyze index usage
 * Useful for optimization and monitoring
 */
export async function analyzeIndexUsage(): Promise<CollectionAnalysis[]> {
	const collections = [
		Player, TeamModel, LeagueModel, UserModel,
		FantasyTeamModel, PlayerStatsModel, SeasonModel, MatchModel
	];

	const analysis: CollectionAnalysis[] = [];

	for (const model of collections) {
		try {
			const statsResult = await model.collection.aggregate([
				{ $collStats: { count: {} } }
			]).toArray();
			const indexes = await model.collection.indexes();
			const stats = statsResult[0] || { count: 0 };
			
			analysis.push({
				collection: model.collection.name,
				documentCount: stats.count || 0,
				indexCount: indexes.length,
				totalIndexSize: 0, // Would need admin privileges to get this
				avgDocumentSize: 0, // Would need admin privileges to get this
				indexes: indexes.map((index: MongoIndexInfo) => ({
					name: index.name || 'unknown',
					keys: index.key,
					unique: index.unique || false,
					sparse: index.sparse || false
				}))
			});
		} catch (error) {
			console.error(`Error analyzing ${model.collection.name}:`, error);
		}
	}

	return analysis;
}

// ===============================
// PERFORMANCE MONITORING QUERIES
// ===============================

/**
 * Queries to monitor index effectiveness
 * Run these periodically to ensure optimal performance
 */
export const performanceQueries = {
	// Check for queries not using indexes
	slowQueries: `db.runCommand({profile: 2, slowms: 100})`,
	
	// Most expensive queries
	expensiveQueries: `db.system.profile.find().sort({ts: -1}).limit(10)`,
	
	// Index usage statistics
	indexStats: `db.runCommand({collStats: "collection_name", indexDetails: true})`,
	
	// Query execution plans
	explainQuery: (collection: string, query: object) => 
		`db.${collection}.find(${JSON.stringify(query)}).explain("executionStats")`
};

// ===============================
// INDEX MAINTENANCE SCHEDULE
// ===============================

/**
 * RECOMMENDED MAINTENANCE SCHEDULE:
 * 
 * DAILY:
 * - Monitor slow query log
 * - Check index hit ratios
 * 
 * WEEKLY:
 * - Analyze query patterns
 * - Review index usage statistics
 * 
 * MONTHLY:
 * - Reindex collections if needed
 * - Evaluate new index requirements
 * - Remove unused indexes
 * 
 * QUARTERLY:
 * - Full performance review
 * - Schema optimization analysis
 * - Index strategy refinement
 */

export default {
	createAllIndexes,
	analyzeIndexUsage,
	performanceQueries,
	playerIndexes,
	teamIndexes,
	leagueIndexes,
	userIndexes,
	fantasyTeamIndexes,
	playerStatsIndexes,
	seasonIndexes,
	matchIndexes
};