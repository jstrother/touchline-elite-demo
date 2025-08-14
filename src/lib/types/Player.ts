/**
 * Player position enum - matches the positions in our Mongoose schema
 */
export type PlayerPosition = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';

/**
 * Data required to create a new player
 * Explicitly defines which fields are required vs optional
 */
export interface PlayerCreateInput {
	// Required fields
	sportmonksId: number;
	name: string;
	firstName: string;
	lastName: string;
	
	// Optional fields
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

/**
 * Data for updating an existing player
 * All fields are optional except id
 */
export interface PlayerUpdateInput extends Partial<PlayerCreateInput> {
	id: string;
}

/**
 * Complete player data with database fields
 */
export interface PlayerResponse extends PlayerCreateInput {
	id: string;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Pagination metadata
 */
export interface Pagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

/**
 * Paginated list of players
 */
export interface PlayerListResponse {
	players: PlayerResponse[];
	pagination: Pagination;
}

/**
 * Search and filter parameters for player queries
 */
export interface PlayerSearchFilters {
	name?: string;
	position?: PlayerPosition;
	nationality?: string;
	minHeight?: number;
	maxHeight?: number;
	minWeight?: number;
	maxWeight?: number;
	page?: number;
	limit?: number;
}

/**
 * Player statistics for fantasy soccer
 */
export interface PlayerStats {
	playerId: string;
	season: string;
	appearances: number;
	goals: number;
	assists: number;
	yellowCards: number;
	redCards: number;
	minutesPlayed: number;
	fantasyPoints: number;
}

/**
 * Player form and performance data
 */
export interface PlayerForm {
	playerId: string;
	lastFiveGames: {
		goals: number;
		assists: number;
		minutesPlayed: number;
		fantasyPoints: number;
	};
	currentSeason: {
		totalGoals: number;
		totalAssists: number;
		averageFantasyPoints: number;
	};
	injuryStatus: 'fit' | 'injured' | 'doubtful' | 'suspended';
}

/**
 * Player value and cost for fantasy teams
 */
export interface PlayerValue {
	playerId: string;
	currentValue: number;
	previousValue: number;
	valueChange: number;
	valueChangePercentage: number;
	popularity: number; // Percentage of teams that own this player
}

/**
 * Utility type for player selection in fantasy teams
 */
export interface PlayerSelection {
	player: PlayerResponse;
	cost: number;
	isCaptain?: boolean;
	isViceCaptain?: boolean;
}

/**
 * Team squad with position constraints
 */
export interface FantasySquad {
	goalkeepers: PlayerSelection[];
	defenders: PlayerSelection[];
	midfielders: PlayerSelection[];
	forwards: PlayerSelection[];
	totalCost: number;
	remainingBudget: number;
}

/**
 * Player comparison data
 */
export interface PlayerComparison {
	players: PlayerResponse[];
	stats: {
		[playerId: string]: PlayerStats;
	};
	form: {
		[playerId: string]: PlayerForm;
	};
}

/**
 * Type guards for runtime type checking
 */
export const isValidPlayerPosition = (position: string): position is PlayerPosition => {
	return ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].includes(position);
};

export const isPlayerCreateInput = (data: unknown): data is PlayerCreateInput => {
	if (typeof data !== 'object' || data === null) return false;
	
	const player = data as Record<string, unknown>;
	
	return (
		typeof player.sportmonksId === 'number' &&
		typeof player.name === 'string' &&
		typeof player.firstName === 'string' &&
		typeof player.lastName === 'string'
	);
};

export const isPlayerResponse = (data: unknown): data is PlayerResponse => {
	if (!isPlayerCreateInput(data)) return false;
	
	const player = data as unknown as Record<string, unknown>;
	
	return (
		typeof player.id === 'string' &&
		player.createdAt instanceof Date &&
		player.updatedAt instanceof Date
	);
};