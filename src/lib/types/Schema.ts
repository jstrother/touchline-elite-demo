/**
 * Comprehensive TypeScript types for all database schemas
 * Touchline Elite Demo - Fantasy Soccer Application
 */


// ===============================
// ENUMS
// ===============================

export enum PlayerPosition {
	GOALKEEPER = 'Goalkeeper',
	DEFENDER = 'Defender',
	MIDFIELDER = 'Midfielder',
	FORWARD = 'Forward'
}

export enum LeagueTypeEnum {
	DOMESTIC = 'domestic',
	INTERNATIONAL = 'international',
	CUP = 'cup',
	FRIENDLY = 'friendly'
}

export enum UserRole {
	USER = 'user',
	ADMIN = 'admin',
	MODERATOR = 'moderator'
}

export enum SubscriptionTier {
	FREE = 'free',
	PREMIUM = 'premium',
	PRO = 'pro'
}

export enum FantasyTeamStatus {
	ACTIVE = 'active',
	COMPLETED = 'completed',
	ABANDONED = 'abandoned'
}

export enum SeasonStatus {
	UPCOMING = 'upcoming',
	ACTIVE = 'active',
	COMPLETED = 'completed',
	CANCELLED = 'cancelled'
}

export enum MatchStatus {
	SCHEDULED = 'scheduled',
	LIVE = 'live',
	HALFTIME = 'halftime',
	FINISHED = 'finished',
	POSTPONED = 'postponed',
	CANCELLED = 'cancelled',
	SUSPENDED = 'suspended'
}

export enum MatchResult {
	HOME_WIN = 'home_win',
	AWAY_WIN = 'away_win',
	DRAW = 'draw'
}

// ===============================
// CORE ENTITY TYPES
// ===============================

export interface PlayerType {
	id: string;
	sportmonksId: number;
	name: string;
	firstName: string;
	lastName: string;
	displayName?: string;
	commonName?: string;
	dateOfBirth?: Date;
	nationality?: string;
	position?: PlayerPosition;
	detailedPosition?: string;
	height?: number;
	weight?: number;
	imageUrl?: string;
	createdAt: Date;
	updatedAt: Date;
	fullName?: string;
}

export interface TeamType {
	id: string;
	sportmonksId: number;
	name: string;
	shortCode?: string;
	logoUrl?: string;
	foundedYear?: number;
	country?: string;
	city?: string;
	venue?: string;
	leagueId?: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface LeagueType {
	id: string;
	sportmonksId: number;
	name: string;
	shortName?: string;
	type: LeagueTypeEnum;
	country?: string;
	logoUrl?: string;
	tier?: number;
	isActive: boolean;
	hasStandings: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface UserType {
	id: string;
	email: string;
	username: string;
	firstName?: string;
	lastName?: string;
	avatarUrl?: string;
	role: UserRole;
	subscriptionTier: SubscriptionTier;
	subscriptionExpiresAt?: Date;
	totalPoints: number;
	seasonsPlayed: number;
	country?: string;
	timezone?: string;
	isActive: boolean;
	emailVerified: boolean;
	lastLoginAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface SeasonType {
	id: string;
	sportmonksId: number;
	name: string;
	leagueId: string;
	startDate: Date;
	endDate: Date;
	currentGameweek: number;
	totalGameweeks: number;
	status: SeasonStatus;
	isFantasyActive: boolean;
	transferDeadline?: Date;
	createdAt: Date;
	updatedAt: Date;
}

// ===============================
// COMPLEX NESTED TYPES
// ===============================

export interface PlayerSelectionType {
	playerId: string;
	purchasePrice: number;
	currentValue?: number;
	isCaptain: boolean;
	isViceCaptain: boolean;
	isStarting: boolean;
	addedAt: Date;
}

export interface FantasyTeamType {
	id: string;
	name: string;
	userId: string;
	seasonId: string;
	players: PlayerSelectionType[];
	budget: number;
	remainingBudget: number;
	totalValue: number;
	totalPoints: number;
	gameweekPoints: number;
	rank: number;
	freeTransfers: number;
	usedTransfers: number;
	transferCost: number;
	status: FantasyTeamStatus;
	isPublic: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface PerformanceStatsType {
	appearances: number;
	starts: number;
	minutesPlayed: number;
	goals: number;
	assists: number;
	yellowCards: number;
	redCards: number;
	cleanSheets: number;
	saves: number;
	penaltiesSaved: number;
	penaltiesMissed: number;
	ownGoals: number;
}

export interface FantasyStatsType {
	fantasyPoints: number;
	averagePoints: number;
	pointsPerMinute: number;
	currentPrice: number;
	priceChangeTotal: number;
	selectedByPercent: number;
	transfersIn: number;
	transfersOut: number;
	transfersInRound: number;
	transfersOutRound: number;
}

export interface PlayerStatsType {
	id: string;
	playerId: string;
	seasonId: string;
	teamId?: string;
	gameweek?: number;
	performance: PerformanceStatsType;
	fantasy: FantasyStatsType;
	isActive: boolean;
	lastUpdated: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface TeamScoreType {
	teamId: string;
	goals: number;
	halftimeGoals?: number;
	shots?: number;
	shotsOnTarget?: number;
	corners?: number;
	fouls?: number;
	yellowCards?: number;
	redCards?: number;
	possession?: number;
}

export interface MatchType {
	id: string;
	sportmonksId: number;
	seasonId: string;
	leagueId: string;
	gameweek: number;
	kickoffTime: Date;
	homeTeamId: string;
	awayTeamId: string;
	homeTeamScore?: TeamScoreType;
	awayTeamScore?: TeamScoreType;
	status: MatchStatus;
	result?: MatchResult;
	currentMinute?: number;
	venue?: string;
	referee?: string;
	attendance?: number;
	isFantasyRelevant: boolean;
	lastUpdated?: Date;
	createdAt: Date;
	updatedAt: Date;
}

// ===============================
// INPUT TYPES (for mutations)
// ===============================

export interface PlayerCreateInput {
	sportmonksId: number;
	name: string;
	firstName: string;
	lastName: string;
	displayName?: string;
	commonName?: string;
	dateOfBirth?: Date;
	nationality?: string;
	position?: PlayerPosition;
	detailedPosition?: string;
	height?: number;
	weight?: number;
	imageUrl?: string;
}

export interface PlayerUpdateInput extends Partial<PlayerCreateInput> {
	id: string;
}

export interface TeamCreateInput {
	sportmonksId: number;
	name: string;
	shortCode?: string;
	logoUrl?: string;
	foundedYear?: number;
	country?: string;
	city?: string;
	venue?: string;
	leagueId?: string;
}

export interface UserCreateInput {
	email: string;
	username: string;
	password: string;
	firstName?: string;
	lastName?: string;
	country?: string;
	timezone?: string;
}

export interface UserUpdateInput {
	id: string;
	firstName?: string;
	lastName?: string;
	avatarUrl?: string;
	country?: string;
	timezone?: string;
}

export interface FantasyTeamCreateInput {
	name: string;
	userId: string;
	seasonId: string;
	budget?: number;
}

export interface PlayerTransferInput {
	fantasyTeamId: string;
	playerInId: string;
	playerOutId?: string;
	isFreeTranfer: boolean;
}

export interface SeasonCreateInput {
	sportmonksId: number;
	name: string;
	leagueId: string;
	startDate: Date;
	endDate: Date;
	totalGameweeks: number;
}

export interface MatchCreateInput {
	sportmonksId: number;
	seasonId: string;
	leagueId: string;
	gameweek: number;
	kickoffTime: Date;
	homeTeamId: string;
	awayTeamId: string;
	venue?: string;
	referee?: string;
}

// ===============================
// FILTER & SEARCH TYPES
// ===============================

export interface PlayerFilters {
	name?: string;
	position?: PlayerPosition;
	nationality?: string;
	teamId?: string;
	minPrice?: number;
	maxPrice?: number;
	minHeight?: number;
	maxHeight?: number;
	sortBy?: 'name' | 'price' | 'points' | 'popularity';
	sortOrder?: 'asc' | 'desc';
	page?: number;
	limit?: number;
}

export interface TeamFilters {
	name?: string;
	country?: string;
	leagueId?: string;
	isActive?: boolean;
	sortBy?: 'name' | 'founded' | 'points';
	sortOrder?: 'asc' | 'desc';
	page?: number;
	limit?: number;
}

export interface MatchFilters {
	seasonId?: string;
	leagueId?: string;
	teamId?: string;
	gameweek?: number;
	status?: MatchStatus;
	dateFrom?: Date;
	dateTo?: Date;
	sortBy?: 'kickoffTime' | 'gameweek';
	sortOrder?: 'asc' | 'desc';
	page?: number;
	limit?: number;
}

export interface LeaderboardFilters {
	seasonId: string;
	page?: number;
	limit?: number;
	country?: string;
	minPoints?: number;
}

// ===============================
// RESPONSE TYPES
// ===============================

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: PaginationMeta;
}

export interface PlayerResponse extends PlayerType {
	currentStats?: PlayerStatsType;
	currentTeam?: TeamType;
	form?: number[];
	injuryStatus?: 'fit' | 'injured' | 'doubtful' | 'suspended';
}

export interface TeamResponse extends TeamType {
	currentLeague?: LeagueType;
	players?: PlayerType[];
	upcomingMatches?: MatchType[];
	recentMatches?: MatchType[];
	currentSeasonStats?: {
		wins: number;
		draws: number;
		losses: number;
		goalsFor: number;
		goalsAgainst: number;
		points: number;
		position: number;
	};
}

export interface FantasyTeamResponse extends FantasyTeamType {
	owner?: UserType;
	season?: SeasonType;
	playersData?: PlayerResponse[];
	captain?: PlayerResponse;
	viceCaptain?: PlayerResponse;
}

export interface LeaderboardEntry {
	rank: number;
	user: UserType;
	fantasyTeam: FantasyTeamType;
	totalPoints: number;
	gameweekPoints: number;
	teamValue: number;
}

export interface GameweekSummary {
	gameweek: number;
	seasonId: string;
	matches: MatchType[];
	topPerformers: PlayerStatsType[];
	averageScore: number;
	highestScore: number;
	transferDeadline?: Date;
	isFinished: boolean;
}

// ===============================
// UTILITY TYPES
// ===============================

interface SportMonksSubscription {
	meta: {
		trial_ends_at: string | null;
		ends_at: string | null;
		current_timestamp: number;
	};
	plan: {
		name: string;
		price: string;
		request_limit: string;
	};
	add_ons: Array<{
		add_on: string;
		sport: string;
		category: string;
	}>;
	widgets: Array<{
		widget: string;
		sport: string;
	}>;
}

export interface SportMonksApiResponse<T> {
	data: T;
	subscription: SportMonksSubscription[];
	rate_limit: {
		resets_in_seconds: number;
		remaining: number;
		requested_entity: string;
	};
	timezone: string;
}

export interface DatabaseSyncResult {
	success: boolean;
	message: string;
	recordsProcessed: number;
	recordsCreated: number;
	recordsUpdated: number;
	errors: string[];
}

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings?: string[];
}

// ===============================
// TYPE GUARDS
// ===============================

export const isPlayerPosition = (value: string): value is PlayerPosition => {
	return Object.values(PlayerPosition).includes(value as PlayerPosition);
};

export const isLeagueType = (value: string): value is LeagueTypeEnum => {
	return Object.values(LeagueTypeEnum).includes(value as LeagueTypeEnum);
};

export const isUserRole = (value: string): value is UserRole => {
	return Object.values(UserRole).includes(value as UserRole);
};

export const isMatchStatus = (value: string): value is MatchStatus => {
	return Object.values(MatchStatus).includes(value as MatchStatus);
};

export const isValidObjectId = (value: string): boolean => {
	return /^[0-9a-fA-F]{24}$/.test(value);
};

export const isValidEmail = (value: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(value);
};

export const isValidUsername = (value: string): boolean => {
	const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
	return usernameRegex.test(value);
};

// ===============================
// CONSTANTS
// ===============================

export const FANTASY_CONSTRAINTS = {
	MAX_SQUAD_SIZE: 15,
	MIN_SQUAD_SIZE: 11,
	STARTING_BUDGET: 100.0,
	MAX_PLAYERS_PER_TEAM: 3,
	REQUIRED_GOALKEEPERS: { min: 1, max: 2 },
	REQUIRED_DEFENDERS: { min: 3, max: 5 },
	REQUIRED_MIDFIELDERS: { min: 3, max: 5 },
	REQUIRED_FORWARDS: { min: 1, max: 3 },
	FREE_TRANSFERS_PER_GAMEWEEK: 1,
	TRANSFER_COST: 4.0
} as const;

export const FANTASY_POINTS = {
	APPEARANCE: 1,
	GOAL_GOALKEEPER: 6,
	GOAL_DEFENDER: 6,
	GOAL_MIDFIELDER: 5,
	GOAL_FORWARD: 4,
	ASSIST: 3,
	CLEAN_SHEET_GOALKEEPER: 4,
	CLEAN_SHEET_DEFENDER: 4,
	PENALTY_SAVE: 5,
	PENALTY_MISS: -2,
	YELLOW_CARD: -1,
	RED_CARD: -3,
	OWN_GOAL: -2,
	MINUTES_PLAYED_60_PLUS: 2,
	MINUTES_PLAYED_1_TO_59: 1
} as const;