import mongoose, { Schema, Document } from 'mongoose';
import { ObjectType, Field, ID, Int, registerEnumType } from 'type-graphql';
import 'reflect-metadata';

enum SeasonStatus {
	UPCOMING = 'upcoming',
	ACTIVE = 'active',
	COMPLETED = 'completed',
	CANCELLED = 'cancelled'
}

registerEnumType(SeasonStatus, {
	name: 'SeasonStatus',
	description: 'Season status types'
});

@ObjectType()
export class Season {
	@Field(() => ID)
	id!: string;

	@Field(() => Int)
	sportmonksId!: number;

	@Field()
	name!: string;

	@Field(() => ID)
	leagueId!: string;

	@Field()
	startDate!: Date;

	@Field()
	endDate!: Date;

	@Field(() => Int)
	currentGameweek!: number;

	@Field(() => Int)
	totalGameweeks!: number;

	@Field(() => SeasonStatus)
	status!: SeasonStatus;

	@Field()
	isFantasyActive!: boolean;

	@Field({ nullable: true })
	transferDeadline?: Date;

	@Field()
	createdAt!: Date;

	@Field()
	updatedAt!: Date;
}

export interface ISeason extends Document {
	sportmonksId: number;
	name: string;
	leagueId: mongoose.Types.ObjectId;
	startDate: Date;
	endDate: Date;
	currentGameweek: number;
	totalGameweeks: number;
	status: string;
	isFantasyActive: boolean;
	transferDeadline?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const SeasonSchema = new Schema<ISeason>(
	{
		sportmonksId: {
			type: Number,
			required: [true, 'SportMonks ID is required'],
			unique: true,
			index: true
		},
		name: {
			type: String,
			required: [true, 'Season name is required'],
			trim: true,
			maxlength: [100, 'Name cannot exceed 100 characters'],
			index: true
		},
		leagueId: {
			type: Schema.Types.ObjectId,
			ref: 'League',
			required: [true, 'League ID is required'],
			index: true
		},
		startDate: {
			type: Date,
			required: [true, 'Start date is required'],
			validate: {
				validator: function(value: Date) {
					return value instanceof Date && !isNaN(value.getTime());
				},
				message: 'Start date must be a valid date'
			}
		},
		endDate: {
			type: Date,
			required: [true, 'End date is required'],
			validate: {
				validator: function(this: ISeason, value: Date) {
					return value instanceof Date && !isNaN(value.getTime()) && value > this.startDate;
				},
				message: 'End date must be a valid date and after start date'
			}
		},
		currentGameweek: {
			type: Number,
			default: 1,
			min: [1, 'Current gameweek must be at least 1'],
			validate: {
				validator: function(this: ISeason, value: number) {
					return value <= this.totalGameweeks;
				},
				message: 'Current gameweek cannot exceed total gameweeks'
			},
			index: true
		},
		totalGameweeks: {
			type: Number,
			required: [true, 'Total gameweeks is required'],
			min: [1, 'Total gameweeks must be at least 1'],
			max: [50, 'Total gameweeks cannot exceed 50']
		},
		status: {
			type: String,
			enum: {
				values: Object.values(SeasonStatus),
				message: 'Status must be one of: upcoming, active, completed, cancelled'
			},
			default: SeasonStatus.UPCOMING,
			index: true
		},
		isFantasyActive: {
			type: Boolean,
			default: false,
			index: true
		},
		transferDeadline: {
			type: Date,
			validate: {
				validator: function(this: ISeason, value: Date) {
					if (!value) return true;
					return value >= this.startDate && value <= this.endDate;
				},
				message: 'Transfer deadline must be within the season dates'
			}
		}
	},
	{
		timestamps: true,
		collection: 'seasons'
	}
);

SeasonSchema.index({ leagueId: 1, startDate: -1 });
SeasonSchema.index({ status: 1, isFantasyActive: 1 });
SeasonSchema.index({ name: 'text' });
SeasonSchema.index({ startDate: 1, endDate: 1 });

SeasonSchema.virtual('isActive').get(function() {
	const now = new Date();
	return this.status === SeasonStatus.ACTIVE && 
		   this.startDate <= now && 
		   this.endDate >= now;
});

SeasonSchema.virtual('isUpcoming').get(function() {
	const now = new Date();
	return this.status === SeasonStatus.UPCOMING && this.startDate > now;
});

SeasonSchema.virtual('isCompleted').get(function() {
	const now = new Date();
	return this.status === SeasonStatus.COMPLETED || this.endDate < now;
});

SeasonSchema.virtual('daysRemaining').get(function() {
	const now = new Date();
	const diffTime = this.endDate.getTime() - now.getTime();
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

SeasonSchema.virtual('progress').get(function() {
	if (this.totalGameweeks === 0) return 0;
	return Math.round((this.currentGameweek / this.totalGameweeks) * 100);
});

SeasonSchema.methods.advanceGameweek = function() {
	if (this.currentGameweek < this.totalGameweeks) {
		this.currentGameweek += 1;
		return this.save();
	}
	throw new Error('Cannot advance beyond total gameweeks');
};

SeasonSchema.methods.activateSeason = function() {
	if (this.status === SeasonStatus.UPCOMING) {
		this.status = SeasonStatus.ACTIVE;
		this.isFantasyActive = true;
		return this.save();
	}
	throw new Error('Can only activate upcoming seasons');
};

SeasonSchema.methods.completeSeason = function() {
	if (this.status === SeasonStatus.ACTIVE) {
		this.status = SeasonStatus.COMPLETED;
		this.isFantasyActive = false;
		return this.save();
	}
	throw new Error('Can only complete active seasons');
};

SeasonSchema.methods.setTransferDeadline = function(deadline: Date) {
	if (deadline < this.startDate || deadline > this.endDate) {
		throw new Error('Transfer deadline must be within season dates');
	}
	this.transferDeadline = deadline;
	return this.save();
};

SeasonSchema.statics.findByLeague = function(leagueId: string) {
	return this.find({ leagueId }).sort({ startDate: -1 });
};

SeasonSchema.statics.findActive = function() {
	return this.find({ status: SeasonStatus.ACTIVE });
};

SeasonSchema.statics.findCurrent = function() {
	const now = new Date();
	return this.findOne({
		status: SeasonStatus.ACTIVE,
		startDate: { $lte: now },
		endDate: { $gte: now }
	});
};

SeasonSchema.statics.findByYear = function(year: number) {
	const startOfYear = new Date(year, 0, 1);
	const endOfYear = new Date(year, 11, 31);
	
	return this.find({
		$or: [
			{ startDate: { $gte: startOfYear, $lte: endOfYear } },
			{ endDate: { $gte: startOfYear, $lte: endOfYear } },
			{ 
				startDate: { $lte: startOfYear }, 
				endDate: { $gte: endOfYear } 
			}
		]
	});
};

SeasonSchema.statics.findFantasyActive = function() {
	return this.find({ 
		isFantasyActive: true,
		status: { $in: [SeasonStatus.UPCOMING, SeasonStatus.ACTIVE] }
	});
};

SeasonSchema.pre('save', function(next) {
	const now = new Date();
	
	if (this.status === SeasonStatus.UPCOMING && this.startDate <= now && this.endDate >= now) {
		this.status = SeasonStatus.ACTIVE;
	} else if (this.status === SeasonStatus.ACTIVE && this.endDate < now) {
		this.status = SeasonStatus.COMPLETED;
		this.isFantasyActive = false;
	}
	
	next();
});

export const SeasonModel = mongoose.model<ISeason>('Season', SeasonSchema);