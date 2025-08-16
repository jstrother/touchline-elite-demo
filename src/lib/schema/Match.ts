import mongoose, { Schema, Document } from 'mongoose';
import { ObjectType, Field, ID, Int, registerEnumType } from 'type-graphql';
import 'reflect-metadata';

enum MatchStatus {
	SCHEDULED = 'scheduled',
	LIVE = 'live',
	HALFTIME = 'halftime',
	FINISHED = 'finished',
	POSTPONED = 'postponed',
	CANCELLED = 'cancelled',
	SUSPENDED = 'suspended'
}

enum MatchResult {
	HOME_WIN = 'home_win',
	AWAY_WIN = 'away_win',
	DRAW = 'draw'
}

registerEnumType(MatchStatus, {
	name: 'MatchStatus',
	description: 'Match status types'
});

registerEnumType(MatchResult, {
	name: 'MatchResult',
	description: 'Match result types'
});

@ObjectType()
export class TeamScore {
	@Field(() => ID)
	teamId!: string;

	@Field(() => Int)
	goals!: number;

	@Field(() => Int, { nullable: true })
	halftimeGoals?: number;

	@Field(() => Int, { nullable: true })
	shots?: number;

	@Field(() => Int, { nullable: true })
	shotsOnTarget?: number;

	@Field(() => Int, { nullable: true })
	corners?: number;

	@Field(() => Int, { nullable: true })
	fouls?: number;

	@Field(() => Int, { nullable: true })
	yellowCards?: number;

	@Field(() => Int, { nullable: true })
	redCards?: number;

	@Field(() => Int, { nullable: true })
	possession?: number;
}

@ObjectType()
export class Match {
	@Field(() => ID)
	id!: string;

	@Field(() => Int)
	sportmonksId!: number;

	@Field(() => ID)
	seasonId!: string;

	@Field(() => ID)
	leagueId!: string;

	@Field(() => Int)
	gameweek!: number;

	@Field()
	kickoffTime!: Date;

	@Field(() => ID)
	homeTeamId!: string;

	@Field(() => ID)
	awayTeamId!: string;

	@Field(() => TeamScore, { nullable: true })
	homeTeamScore?: TeamScore;

	@Field(() => TeamScore, { nullable: true })
	awayTeamScore?: TeamScore;

	@Field(() => MatchStatus)
	status!: MatchStatus;

	@Field(() => MatchResult, { nullable: true })
	result?: MatchResult;

	@Field(() => Int, { nullable: true })
	currentMinute?: number;

	@Field({ nullable: true })
	venue?: string;

	@Field({ nullable: true })
	referee?: string;

	@Field(() => Int, { nullable: true })
	attendance?: number;

	@Field()
	isFantasyRelevant!: boolean;

	@Field({ nullable: true })
	lastUpdated?: Date;

	@Field()
	createdAt!: Date;

	@Field()
	updatedAt!: Date;
}

interface ITeamScore {
	teamId: mongoose.Types.ObjectId;
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

export interface IMatch extends Document {
	sportmonksId: number;
	seasonId: mongoose.Types.ObjectId;
	leagueId: mongoose.Types.ObjectId;
	gameweek: number;
	kickoffTime: Date;
	homeTeamId: mongoose.Types.ObjectId;
	awayTeamId: mongoose.Types.ObjectId;
	homeTeamScore?: ITeamScore;
	awayTeamScore?: ITeamScore;
	status: string;
	result?: string;
	currentMinute?: number;
	venue?: string;
	referee?: string;
	attendance?: number;
	isFantasyRelevant: boolean;
	lastUpdated?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const TeamScoreSchema = new Schema<ITeamScore>({
	teamId: {
		type: Schema.Types.ObjectId,
		ref: 'Team',
		required: [true, 'Team ID is required']
	},
	goals: {
		type: Number,
		default: 0,
		min: [0, 'Goals cannot be negative']
	},
	halftimeGoals: {
		type: Number,
		min: [0, 'Halftime goals cannot be negative']
	},
	shots: {
		type: Number,
		min: [0, 'Shots cannot be negative']
	},
	shotsOnTarget: {
		type: Number,
		min: [0, 'Shots on target cannot be negative']
	},
	corners: {
		type: Number,
		min: [0, 'Corners cannot be negative']
	},
	fouls: {
		type: Number,
		min: [0, 'Fouls cannot be negative']
	},
	yellowCards: {
		type: Number,
		default: 0,
		min: [0, 'Yellow cards cannot be negative']
	},
	redCards: {
		type: Number,
		default: 0,
		min: [0, 'Red cards cannot be negative']
	},
	possession: {
		type: Number,
		min: [0, 'Possession cannot be negative'],
		max: [100, 'Possession cannot exceed 100%']
	}
}, { _id: false });

const MatchSchema = new Schema<IMatch>(
	{
		sportmonksId: {
			type: Number,
			required: [true, 'SportMonks ID is required'],
			unique: true,
			index: true
		},
		seasonId: {
			type: Schema.Types.ObjectId,
			ref: 'Season',
			required: [true, 'Season ID is required'],
			index: true
		},
		leagueId: {
			type: Schema.Types.ObjectId,
			ref: 'League',
			required: [true, 'League ID is required'],
			index: true
		},
		gameweek: {
			type: Number,
			required: [true, 'Gameweek is required'],
			min: [1, 'Gameweek must be at least 1'],
			index: true
		},
		kickoffTime: {
			type: Date,
			required: [true, 'Kickoff time is required'],
			index: true
		},
		homeTeamId: {
			type: Schema.Types.ObjectId,
			ref: 'Team',
			required: [true, 'Home team ID is required'],
			index: true
		},
		awayTeamId: {
			type: Schema.Types.ObjectId,
			ref: 'Team',
			required: [true, 'Away team ID is required'],
			index: true
		},
		homeTeamScore: {
			type: TeamScoreSchema
		},
		awayTeamScore: {
			type: TeamScoreSchema
		},
		status: {
			type: String,
			enum: {
				values: Object.values(MatchStatus),
				message: 'Status must be one of: scheduled, live, halftime, finished, postponed, cancelled, suspended'
			},
			default: MatchStatus.SCHEDULED,
			index: true
		},
		result: {
			type: String,
			enum: {
				values: Object.values(MatchResult),
				message: 'Result must be one of: home_win, away_win, draw'
			}
		},
		currentMinute: {
			type: Number,
			min: [0, 'Current minute cannot be negative'],
			max: [120, 'Current minute cannot exceed 120']
		},
		venue: {
			type: String,
			trim: true,
			maxlength: [100, 'Venue cannot exceed 100 characters']
		},
		referee: {
			type: String,
			trim: true,
			maxlength: [100, 'Referee name cannot exceed 100 characters']
		},
		attendance: {
			type: Number,
			min: [0, 'Attendance cannot be negative']
		},
		isFantasyRelevant: {
			type: Boolean,
			default: true,
			index: true
		},
		lastUpdated: {
			type: Date,
			default: Date.now
		}
	},
	{
		timestamps: true,
		collection: 'matches'
	}
);

MatchSchema.index({ seasonId: 1, gameweek: 1 });
MatchSchema.index({ leagueId: 1, kickoffTime: 1 });
MatchSchema.index({ homeTeamId: 1, awayTeamId: 1, kickoffTime: 1 });
MatchSchema.index({ status: 1, kickoffTime: 1 });
MatchSchema.index({ kickoffTime: 1, isFantasyRelevant: 1 });
MatchSchema.index({ seasonId: 1, status: 1 });

MatchSchema.virtual('isUpcoming').get(function() {
	return this.status === MatchStatus.SCHEDULED && this.kickoffTime > new Date();
});

MatchSchema.virtual('isLive').get(function() {
	return [MatchStatus.LIVE, MatchStatus.HALFTIME].includes(this.status as MatchStatus);
});

MatchSchema.virtual('isFinished').get(function() {
	return this.status === MatchStatus.FINISHED;
});

MatchSchema.virtual('totalGoals').get(function() {
	const homeGoals = this.homeTeamScore?.goals || 0;
	const awayGoals = this.awayTeamScore?.goals || 0;
	return homeGoals + awayGoals;
});

MatchSchema.virtual('goalDifference').get(function() {
	const homeGoals = this.homeTeamScore?.goals || 0;
	const awayGoals = this.awayTeamScore?.goals || 0;
	return Math.abs(homeGoals - awayGoals);
});

MatchSchema.methods.updateScore = function(homeGoals: number, awayGoals: number) {
	if (!this.homeTeamScore) {
		this.homeTeamScore = {
			teamId: this.homeTeamId,
			goals: homeGoals
		};
	} else {
		this.homeTeamScore.goals = homeGoals;
	}

	if (!this.awayTeamScore) {
		this.awayTeamScore = {
			teamId: this.awayTeamId,
			goals: awayGoals
		};
	} else {
		this.awayTeamScore.goals = awayGoals;
	}

	if (homeGoals > awayGoals) {
		this.result = MatchResult.HOME_WIN;
	} else if (awayGoals > homeGoals) {
		this.result = MatchResult.AWAY_WIN;
	} else {
		this.result = MatchResult.DRAW;
	}

	this.lastUpdated = new Date();
	return this.save();
};

MatchSchema.methods.startMatch = function() {
	if (this.status === MatchStatus.SCHEDULED) {
		this.status = MatchStatus.LIVE;
		this.currentMinute = 0;
		this.lastUpdated = new Date();
		return this.save();
	}
	throw new Error('Can only start scheduled matches');
};

MatchSchema.methods.finishMatch = function() {
	if ([MatchStatus.LIVE, MatchStatus.HALFTIME].includes(this.status as MatchStatus)) {
		this.status = MatchStatus.FINISHED;
		this.currentMinute = 90;
		this.lastUpdated = new Date();
		return this.save();
	}
	throw new Error('Can only finish live matches');
};

MatchSchema.methods.postponeMatch = function() {
	if (this.status === MatchStatus.SCHEDULED) {
		this.status = MatchStatus.POSTPONED;
		this.lastUpdated = new Date();
		return this.save();
	}
	throw new Error('Can only postpone scheduled matches');
};

MatchSchema.statics.findByTeam = function(teamId: string, seasonId?: string) {
	const query: { 
		$or: Array<{ homeTeamId: string } | { awayTeamId: string }>; 
		seasonId?: string; 
	} = {
		$or: [
			{ homeTeamId: teamId },
			{ awayTeamId: teamId }
		]
	};
	if (seasonId) query.seasonId = seasonId;
	return this.find(query).sort({ kickoffTime: 1 });
};

MatchSchema.statics.findByGameweek = function(seasonId: string, gameweek: number) {
	return this.find({ seasonId, gameweek }).sort({ kickoffTime: 1 });
};

MatchSchema.statics.findUpcoming = function(limit: number = 10) {
	return this.find({
		status: MatchStatus.SCHEDULED,
		kickoffTime: { $gt: new Date() }
	})
	.sort({ kickoffTime: 1 })
	.limit(limit);
};

MatchSchema.statics.findLive = function() {
	return this.find({
		status: { $in: [MatchStatus.LIVE, MatchStatus.HALFTIME] }
	}).sort({ kickoffTime: 1 });
};

MatchSchema.statics.findRecent = function(limit: number = 10) {
	return this.find({
		status: MatchStatus.FINISHED,
		kickoffTime: { $lt: new Date() }
	})
	.sort({ kickoffTime: -1 })
	.limit(limit);
};

MatchSchema.statics.findByDateRange = function(startDate: Date, endDate: Date) {
	return this.find({
		kickoffTime: {
			$gte: startDate,
			$lte: endDate
		}
	}).sort({ kickoffTime: 1 });
};

export const MatchModel = mongoose.model<IMatch>('Match', MatchSchema);