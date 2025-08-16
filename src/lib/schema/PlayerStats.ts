import mongoose, { Schema, Document } from 'mongoose';
import { ObjectType, Field, ID, Int, Float } from 'type-graphql';
import 'reflect-metadata';

@ObjectType()
export class PerformanceStats {
	@Field(() => Int)
	appearances!: number;

	@Field(() => Int)
	starts!: number;

	@Field(() => Int)
	minutesPlayed!: number;

	@Field(() => Int)
	goals!: number;

	@Field(() => Int)
	assists!: number;

	@Field(() => Int)
	yellowCards!: number;

	@Field(() => Int)
	redCards!: number;

	@Field(() => Int)
	cleanSheets!: number;

	@Field(() => Int)
	saves!: number;

	@Field(() => Int)
	penaltiesSaved!: number;

	@Field(() => Int)
	penaltiesMissed!: number;

	@Field(() => Int)
	ownGoals!: number;
}

@ObjectType()
export class FantasyStats {
	@Field(() => Float)
	fantasyPoints!: number;

	@Field(() => Float)
	averagePoints!: number;

	@Field(() => Float)
	pointsPerMinute!: number;

	@Field(() => Float)
	currentPrice!: number;

	@Field(() => Float)
	priceChangeTotal!: number;

	@Field(() => Float)
	selectedByPercent!: number;

	@Field(() => Int)
	transfersIn!: number;

	@Field(() => Int)
	transfersOut!: number;

	@Field(() => Int)
	transfersInRound!: number;

	@Field(() => Int)
	transfersOutRound!: number;
}

@ObjectType()
export class PlayerStats {
	@Field(() => ID)
	id!: string;

	@Field(() => ID)
	playerId!: string;

	@Field(() => ID)
	seasonId!: string;

	@Field(() => ID, { nullable: true })
	teamId?: string;

	@Field(() => Int, { nullable: true })
	gameweek?: number;

	@Field(() => PerformanceStats)
	performance!: PerformanceStats;

	@Field(() => FantasyStats)
	fantasy!: FantasyStats;

	@Field()
	isActive!: boolean;

	@Field()
	lastUpdated!: Date;

	@Field()
	createdAt!: Date;

	@Field()
	updatedAt!: Date;
}

interface IPerformanceStats {
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

interface IFantasyStats {
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

export interface IPlayerStats extends Document {
	playerId: mongoose.Types.ObjectId;
	seasonId: mongoose.Types.ObjectId;
	teamId?: mongoose.Types.ObjectId;
	gameweek?: number;
	performance: IPerformanceStats;
	fantasy: IFantasyStats;
	isActive: boolean;
	lastUpdated: Date;
	createdAt: Date;
	updatedAt: Date;
}

const PerformanceStatsSchema = new Schema<IPerformanceStats>({
	appearances: { type: Number, default: 0, min: [0, 'Appearances cannot be negative'] },
	starts: { type: Number, default: 0, min: [0, 'Starts cannot be negative'] },
	minutesPlayed: { type: Number, default: 0, min: [0, 'Minutes played cannot be negative'] },
	goals: { type: Number, default: 0, min: [0, 'Goals cannot be negative'] },
	assists: { type: Number, default: 0, min: [0, 'Assists cannot be negative'] },
	yellowCards: { type: Number, default: 0, min: [0, 'Yellow cards cannot be negative'] },
	redCards: { type: Number, default: 0, min: [0, 'Red cards cannot be negative'] },
	cleanSheets: { type: Number, default: 0, min: [0, 'Clean sheets cannot be negative'] },
	saves: { type: Number, default: 0, min: [0, 'Saves cannot be negative'] },
	penaltiesSaved: { type: Number, default: 0, min: [0, 'Penalties saved cannot be negative'] },
	penaltiesMissed: { type: Number, default: 0, min: [0, 'Penalties missed cannot be negative'] },
	ownGoals: { type: Number, default: 0, min: [0, 'Own goals cannot be negative'] }
}, { _id: false });

const FantasyStatsSchema = new Schema<IFantasyStats>({
	fantasyPoints: { type: Number, default: 0, min: [0, 'Fantasy points cannot be negative'] },
	averagePoints: { type: Number, default: 0, min: [0, 'Average points cannot be negative'] },
	pointsPerMinute: { type: Number, default: 0, min: [0, 'Points per minute cannot be negative'] },
	currentPrice: { type: Number, default: 4.0, min: [0, 'Current price cannot be negative'] },
	priceChangeTotal: { type: Number, default: 0 },
	selectedByPercent: { type: Number, default: 0, min: [0, 'Selected by percent cannot be negative'], max: [100, 'Selected by percent cannot exceed 100'] },
	transfersIn: { type: Number, default: 0, min: [0, 'Transfers in cannot be negative'] },
	transfersOut: { type: Number, default: 0, min: [0, 'Transfers out cannot be negative'] },
	transfersInRound: { type: Number, default: 0, min: [0, 'Transfers in round cannot be negative'] },
	transfersOutRound: { type: Number, default: 0, min: [0, 'Transfers out round cannot be negative'] }
}, { _id: false });

const PlayerStatsSchema = new Schema<IPlayerStats>(
	{
		playerId: {
			type: Schema.Types.ObjectId,
			ref: 'Player',
			required: [true, 'Player ID is required'],
			index: true
		},
		seasonId: {
			type: Schema.Types.ObjectId,
			ref: 'Season',
			required: [true, 'Season ID is required'],
			index: true
		},
		teamId: {
			type: Schema.Types.ObjectId,
			ref: 'Team',
			index: true
		},
		gameweek: {
			type: Number,
			min: [1, 'Gameweek must be at least 1'],
			max: [38, 'Gameweek cannot exceed 38'],
			index: true
		},
		performance: {
			type: PerformanceStatsSchema,
			required: [true, 'Performance stats are required']
		},
		fantasy: {
			type: FantasyStatsSchema,
			required: [true, 'Fantasy stats are required']
		},
		isActive: {
			type: Boolean,
			default: true,
			index: true
		},
		lastUpdated: {
			type: Date,
			default: Date.now,
			index: true
		}
	},
	{
		timestamps: true,
		collection: 'player_stats'
	}
);

PlayerStatsSchema.index({ playerId: 1, seasonId: 1 }, { unique: true });
PlayerStatsSchema.index({ playerId: 1, gameweek: 1, seasonId: 1 });
PlayerStatsSchema.index({ seasonId: 1, 'fantasy.fantasyPoints': -1 });
PlayerStatsSchema.index({ seasonId: 1, 'fantasy.currentPrice': 1 });
PlayerStatsSchema.index({ seasonId: 1, 'fantasy.selectedByPercent': -1 });
PlayerStatsSchema.index({ teamId: 1, seasonId: 1 });
PlayerStatsSchema.index({ lastUpdated: -1 });

PlayerStatsSchema.virtual('goalInvolvement').get(function() {
	return this.performance.goals + this.performance.assists;
});

PlayerStatsSchema.virtual('disciplinaryPoints').get(function() {
	return this.performance.yellowCards + (this.performance.redCards * 2);
});

PlayerStatsSchema.virtual('priceEfficiency').get(function() {
	if (this.fantasy.currentPrice === 0) return 0;
	return this.fantasy.fantasyPoints / this.fantasy.currentPrice;
});

PlayerStatsSchema.virtual('form').get(function() {
	if (this.performance.appearances === 0) return 0;
	return this.fantasy.fantasyPoints / this.performance.appearances;
});

PlayerStatsSchema.methods.updateFantasyPoints = function() {
	const { performance } = this;
	let points = 0;

	points += performance.appearances * 1;
	points += performance.goals * 4;
	points += performance.assists * 3;
	points += performance.cleanSheets * 4;
	points += performance.saves * 0.5;
	points += performance.penaltiesSaved * 5;
	points -= performance.penaltiesMissed * 2;
	points -= performance.yellowCards * 1;
	points -= performance.redCards * 3;
	points -= performance.ownGoals * 2;

	if (performance.minutesPlayed >= 60) {
		points += 2;
	} else if (performance.minutesPlayed >= 1) {
		points += 1;
	}

	this.fantasy.fantasyPoints = Math.max(0, points);
	this.fantasy.averagePoints = performance.appearances > 0 ? this.fantasy.fantasyPoints / performance.appearances : 0;
	this.fantasy.pointsPerMinute = performance.minutesPlayed > 0 ? this.fantasy.fantasyPoints / performance.minutesPlayed : 0;

	return this.save();
};

PlayerStatsSchema.statics.findByPlayer = function(playerId: string, seasonId?: string) {
	const query: { playerId: string; isActive: boolean; seasonId?: string } = { playerId, isActive: true };
	if (seasonId) query.seasonId = seasonId;
	return this.find(query);
};

PlayerStatsSchema.statics.findBySeason = function(seasonId: string) {
	return this.find({ seasonId, isActive: true });
};

PlayerStatsSchema.statics.getTopScorers = function(seasonId: string, limit: number = 10) {
	return this.find({ seasonId, isActive: true })
		.sort({ 'performance.goals': -1, 'performance.assists': -1 })
		.limit(limit)
		.populate('playerId', 'name position');
};

PlayerStatsSchema.statics.getTopFantasyPerformers = function(seasonId: string, limit: number = 10) {
	return this.find({ seasonId, isActive: true })
		.sort({ 'fantasy.fantasyPoints': -1 })
		.limit(limit)
		.populate('playerId', 'name position');
};

PlayerStatsSchema.statics.getBestValuePlayers = function(seasonId: string, limit: number = 10) {
	return this.aggregate([
		{ $match: { seasonId: new mongoose.Types.ObjectId(seasonId), isActive: true } },
		{
			$addFields: {
				priceEfficiency: {
					$cond: {
						if: { $eq: ['$fantasy.currentPrice', 0] },
						then: 0,
						else: { $divide: ['$fantasy.fantasyPoints', '$fantasy.currentPrice'] }
					}
				}
			}
		},
		{ $sort: { priceEfficiency: -1 } },
		{ $limit: limit },
		{
			$lookup: {
				from: 'players',
				localField: 'playerId',
				foreignField: '_id',
				as: 'player'
			}
		}
	]);
};

export const PlayerStatsModel = mongoose.model<IPlayerStats>('PlayerStats', PlayerStatsSchema);