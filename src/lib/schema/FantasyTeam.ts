import mongoose, { Schema, Document } from 'mongoose';
import { ObjectType, Field, ID, Int, Float, registerEnumType } from 'type-graphql';
import 'reflect-metadata';

enum FantasyTeamStatus {
	ACTIVE = 'active',
	COMPLETED = 'completed',
	ABANDONED = 'abandoned'
}

registerEnumType(FantasyTeamStatus, {
	name: 'FantasyTeamStatus',
	description: 'Fantasy team status types'
});

@ObjectType()
export class PlayerSelection {
	@Field(() => ID)
	playerId!: string;

	@Field(() => Float)
	purchasePrice!: number;

	@Field(() => Float, { nullable: true })
	currentValue?: number;

	@Field()
	isCaptain!: boolean;

	@Field()
	isViceCaptain!: boolean;

	@Field()
	isStarting!: boolean;

	@Field()
	addedAt!: Date;
}

@ObjectType()
export class FantasyTeam {
	@Field(() => ID)
	id!: string;

	@Field()
	name!: string;

	@Field(() => ID)
	userId!: string;

	@Field(() => ID)
	seasonId!: string;

	@Field(() => [PlayerSelection])
	players!: PlayerSelection[];

	@Field(() => Float)
	budget!: number;

	@Field(() => Float)
	remainingBudget!: number;

	@Field(() => Float)
	totalValue!: number;

	@Field(() => Int)
	totalPoints!: number;

	@Field(() => Int)
	gameweekPoints!: number;

	@Field(() => Int)
	rank!: number;

	@Field(() => Int)
	freeTransfers!: number;

	@Field(() => Int)
	usedTransfers!: number;

	@Field(() => Float)
	transferCost!: number;

	@Field(() => FantasyTeamStatus)
	status!: FantasyTeamStatus;

	@Field()
	isPublic!: boolean;

	@Field()
	createdAt!: Date;

	@Field()
	updatedAt!: Date;
}

interface IPlayerSelection {
	playerId: mongoose.Types.ObjectId;
	purchasePrice: number;
	currentValue?: number;
	isCaptain: boolean;
	isViceCaptain: boolean;
	isStarting: boolean;
	addedAt: Date;
}

export interface IFantasyTeam extends Document {
	name: string;
	userId: mongoose.Types.ObjectId;
	seasonId: mongoose.Types.ObjectId;
	players: IPlayerSelection[];
	budget: number;
	remainingBudget: number;
	totalValue: number;
	totalPoints: number;
	gameweekPoints: number;
	rank: number;
	freeTransfers: number;
	usedTransfers: number;
	transferCost: number;
	status: string;
	isPublic: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const PlayerSelectionSchema = new Schema<IPlayerSelection>({
	playerId: {
		type: Schema.Types.ObjectId,
		ref: 'Player',
		required: [true, 'Player ID is required'],
		index: true
	},
	purchasePrice: {
		type: Number,
		required: [true, 'Purchase price is required'],
		min: [0, 'Purchase price cannot be negative']
	},
	currentValue: {
		type: Number,
		min: [0, 'Current value cannot be negative']
	},
	isCaptain: {
		type: Boolean,
		default: false
	},
	isViceCaptain: {
		type: Boolean,
		default: false
	},
	isStarting: {
		type: Boolean,
		default: true
	},
	addedAt: {
		type: Date,
		default: Date.now
	}
});

const FantasyTeamSchema = new Schema<IFantasyTeam>(
	{
		name: {
			type: String,
			required: [true, 'Team name is required'],
			trim: true,
			minlength: [3, 'Team name must be at least 3 characters'],
			maxlength: [50, 'Team name cannot exceed 50 characters']
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'User ID is required'],
			index: true
		},
		seasonId: {
			type: Schema.Types.ObjectId,
			ref: 'Season',
			required: [true, 'Season ID is required'],
			index: true
		},
		players: {
			type: [PlayerSelectionSchema],
			validate: {
				validator: function(players: IPlayerSelection[]) {
					return players.length <= 15;
				},
				message: 'Cannot have more than 15 players in a squad'
			}
		},
		budget: {
			type: Number,
			required: [true, 'Budget is required'],
			default: 100.0,
			min: [0, 'Budget cannot be negative']
		},
		remainingBudget: {
			type: Number,
			required: [true, 'Remaining budget is required'],
			min: [0, 'Remaining budget cannot be negative']
		},
		totalValue: {
			type: Number,
			default: 0,
			min: [0, 'Total value cannot be negative']
		},
		totalPoints: {
			type: Number,
			default: 0,
			min: [0, 'Total points cannot be negative'],
			index: true
		},
		gameweekPoints: {
			type: Number,
			default: 0,
			min: [0, 'Gameweek points cannot be negative']
		},
		rank: {
			type: Number,
			default: 0,
			min: [0, 'Rank cannot be negative'],
			index: true
		},
		freeTransfers: {
			type: Number,
			default: 1,
			min: [0, 'Free transfers cannot be negative']
		},
		usedTransfers: {
			type: Number,
			default: 0,
			min: [0, 'Used transfers cannot be negative']
		},
		transferCost: {
			type: Number,
			default: 0,
			min: [0, 'Transfer cost cannot be negative']
		},
		status: {
			type: String,
			enum: {
				values: Object.values(FantasyTeamStatus),
				message: 'Status must be one of: active, completed, abandoned'
			},
			default: FantasyTeamStatus.ACTIVE,
			index: true
		},
		isPublic: {
			type: Boolean,
			default: false,
			index: true
		}
	},
	{
		timestamps: true,
		collection: 'fantasy_teams'
	}
);

FantasyTeamSchema.index({ userId: 1, seasonId: 1 }, { unique: true });
FantasyTeamSchema.index({ seasonId: 1, totalPoints: -1 });
FantasyTeamSchema.index({ userId: 1, status: 1 });
FantasyTeamSchema.index({ isPublic: 1, totalPoints: -1 });
FantasyTeamSchema.index({ 'players.playerId': 1 });

FantasyTeamSchema.virtual('squadCount').get(function() {
	return this.players.length;
});

FantasyTeamSchema.virtual('startingLineupCount').get(function() {
	return this.players.filter((p: IPlayerSelection) => p.isStarting).length;
});

FantasyTeamSchema.virtual('benchCount').get(function() {
	return this.players.filter((p: IPlayerSelection) => !p.isStarting).length;
});

FantasyTeamSchema.virtual('captain').get(function() {
	return this.players.find((p: IPlayerSelection) => p.isCaptain);
});

FantasyTeamSchema.virtual('viceCaptain').get(function() {
	return this.players.find((p: IPlayerSelection) => p.isViceCaptain);
});

FantasyTeamSchema.methods.addPlayer = function(playerId: string, price: number, isStarting: boolean = true) {
	if (this.players.length >= 15) {
		throw new Error('Squad is full. Cannot add more players.');
	}
	
	if (this.remainingBudget < price) {
		throw new Error('Insufficient budget to add this player.');
	}

	const existingPlayer = this.players.find((p: IPlayerSelection) => p.playerId.toString() === playerId);
	if (existingPlayer) {
		throw new Error('Player is already in the squad.');
	}

	this.players.push({
		playerId: new mongoose.Types.ObjectId(playerId),
		purchasePrice: price,
		isCaptain: false,
		isViceCaptain: false,
		isStarting,
		addedAt: new Date()
	});

	this.remainingBudget -= price;
	this.totalValue += price;
	
	return this.save();
};

FantasyTeamSchema.methods.removePlayer = function(playerId: string) {
	const playerIndex = this.players.findIndex((p: IPlayerSelection) => p.playerId.toString() === playerId);
	if (playerIndex === -1) {
		throw new Error('Player not found in squad.');
	}

	const player = this.players[playerIndex];
	this.remainingBudget += player.purchasePrice;
	this.totalValue -= player.purchasePrice;
	
	this.players.splice(playerIndex, 1);
	
	return this.save();
};

FantasyTeamSchema.methods.setCaptain = function(playerId: string) {
	this.players.forEach((p: IPlayerSelection) => {
		p.isCaptain = p.playerId.toString() === playerId;
		if (p.isCaptain) p.isViceCaptain = false;
	});
	
	return this.save();
};

FantasyTeamSchema.methods.setViceCaptain = function(playerId: string) {
	this.players.forEach((p: IPlayerSelection) => {
		p.isViceCaptain = p.playerId.toString() === playerId;
		if (p.isViceCaptain) p.isCaptain = false;
	});
	
	return this.save();
};

FantasyTeamSchema.statics.findByUser = function(userId: string) {
	return this.find({ userId });
};

FantasyTeamSchema.statics.findBySeason = function(seasonId: string) {
	return this.find({ seasonId, status: FantasyTeamStatus.ACTIVE });
};

FantasyTeamSchema.statics.getLeaderboard = function(seasonId: string, limit: number = 100) {
	return this.find({ seasonId, status: FantasyTeamStatus.ACTIVE })
		.sort({ totalPoints: -1, name: 1 })
		.limit(limit)
		.populate('userId', 'username');
};

export const FantasyTeamModel = mongoose.model<IFantasyTeam>('FantasyTeam', FantasyTeamSchema);