import mongoose, { Schema, Document } from 'mongoose';

// Note: GraphQL decorators will be added later in Phase 4

/**
 * TypeScript interface for Team document
 */
export interface ITeam extends Document {
	sportmonksId: number;
	name: string;
	shortCode?: string;
	logoUrl?: string;
	foundedYear?: number;
	country?: string;
	city?: string;
	venue?: string;
	leagueId?: mongoose.Types.ObjectId;
	isActive: boolean;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	
	// Instance methods
	update(data: Partial<ITeamUpdate>): Promise<ITeam>;
	delete(options?: { hard?: boolean }): Promise<void>;
	activate(): Promise<ITeam>;
	deactivate(): Promise<ITeam>;
}

/**
 * Team creation input type
 */
export interface ITeamCreate {
	sportmonksId: number;
	name: string;
	shortCode?: string;
	logoUrl?: string;
	foundedYear?: number;
	country?: string;
	city?: string;
	venue?: string;
	leagueId?: string;
	isActive?: boolean;
}

/**
 * Team update input type
 */
export interface ITeamUpdate {
	name?: string;
	shortCode?: string;
	logoUrl?: string;
	foundedYear?: number;
	country?: string;
	city?: string;
	venue?: string;
	leagueId?: string;
	isActive?: boolean;
}

const TeamSchema = new Schema<ITeam>(
	{
		sportmonksId: {
			type: Number,
			required: [true, 'SportMonks ID is required'],
			unique: true,
			validate: {
				validator: (value: number): boolean => {
					return Number.isInteger(value) && value > 0;
				},
				message: 'SportMonks ID must be positive'
			}
		},
		name: {
			type: String,
			required: [true, 'Team name is required'],
			trim: true,
			maxlength: [100, 'Name cannot exceed 100 characters'],
			validate: {
				validator: (value: string): boolean => {
					return value.trim().length > 0;
				},
				message: 'Name cannot be empty'
			}
		},
		shortCode: {
			type: String,
			trim: true,
			maxlength: [10, 'Short code cannot exceed 10 characters'],
			uppercase: true,
			validate: {
				validator: (value: string): boolean => {
					if (!value) return true;
					return /^[A-Z0-9]+$/.test(value);
				},
				message: 'Short code must contain only uppercase letters and numbers'
			}
		},
		logoUrl: {
			type: String,
			trim: true,
			validate: {
				validator: function(value: string) {
					if (!value) return true;
					const urlRegex = /^https?:\/\/.+/;
					return urlRegex.test(value);
				},
				message: 'Logo URL must be a valid HTTP/HTTPS URL'
			}
		},
		foundedYear: {
			type: Number,
			min: [1800, 'Founded year must be after 1800'],
			max: [new Date().getFullYear(), 'Founded year cannot be in the future'],
			validate: {
				validator: function(value: number) {
					return Number.isInteger(value);
				},
				message: 'Founded year must be an integer'
			}
		},
		country: {
			type: String,
			trim: true,
			maxlength: [50, 'Country cannot exceed 50 characters']
		},
		city: {
			type: String,
			trim: true,
			maxlength: [50, 'City cannot exceed 50 characters']
		},
		venue: {
			type: String,
			trim: true,
			maxlength: [100, 'Venue cannot exceed 100 characters']
		},
		leagueId: {
			type: Schema.Types.ObjectId,
			ref: 'League'
		},
		isActive: {
			type: Boolean,
			default: true
		},
		deletedAt: {
			type: Date,
			default: null
		}
	},
	{
		timestamps: true,
		collection: 'teams'
	}
);

// Indexes for better query performance
TeamSchema.index({ name: 'text', shortCode: 'text' });
TeamSchema.index({ country: 1, leagueId: 1 });
TeamSchema.index({ sportmonksId: 1, isActive: 1 });
TeamSchema.index({ leagueId: 1, isActive: 1 });
TeamSchema.index({ deletedAt: 1 });
TeamSchema.index({ isActive: 1 });

// Instance Methods
TeamSchema.methods.update = async function(data: Partial<ITeamUpdate>): Promise<ITeam> {
	Object.assign(this, data);
	await this.validate();
	return await this.save();
};

TeamSchema.methods.delete = async function(options: { hard?: boolean } = {}): Promise<void> {
	if (options.hard) {
		await this.deleteOne();
	} else {
		this.deletedAt = new Date();
		this.isActive = false;
		await this.save();
	}
};

TeamSchema.methods.activate = async function(): Promise<ITeam> {
	this.isActive = true;
	this.deletedAt = null;
	return await this.save();
};

TeamSchema.methods.deactivate = async function(): Promise<ITeam> {
	this.isActive = false;
	return await this.save();
};

// Static Methods
TeamSchema.statics.findByLeague = function(leagueId: string) {
	return this.find({ leagueId, isActive: true, deletedAt: null });
};

TeamSchema.statics.findByCountry = function(country: string) {
	return this.find({ country, isActive: true, deletedAt: null });
};

TeamSchema.statics.searchByName = function(searchTerm: string) {
	return this.find({ 
		$text: { $search: searchTerm },
		isActive: true,
		deletedAt: null
	});
};

TeamSchema.statics.findDeleted = function() {
	return this.find({ deletedAt: { $ne: null } });
};

TeamSchema.statics.findInactive = function() {
	return this.find({ isActive: false, deletedAt: null });
};

// Override default find to exclude soft-deleted documents
TeamSchema.pre(/^find/, function(this: mongoose.Query<ITeam[], ITeam>): void {
	// Only apply soft delete filter if deletedAt is not explicitly queried
	const query = this.getQuery();
	if (!query.deletedAt) {
		this.where({ deletedAt: null });
	}
});

/**
 * Team Model with enhanced static methods
 */
interface ITeamModel extends mongoose.Model<ITeam> {
	createTeam(data: ITeamCreate): Promise<ITeam>;
	createManyTeams(dataArray: ITeamCreate[]): Promise<ITeam[]>;
	findByLeague(leagueId: string): mongoose.Query<ITeam[], ITeam>;
	findByCountry(country: string): mongoose.Query<ITeam[], ITeam>;
	searchByName(searchTerm: string): mongoose.Query<ITeam[], ITeam>;
	findDeleted(): mongoose.Query<ITeam[], ITeam>;
	findInactive(): mongoose.Query<ITeam[], ITeam>;
}

// Enhanced create method with validation
TeamSchema.statics.createTeam = async function(data: ITeamCreate): Promise<ITeam> {
	const team = new this(data);
	await team.validate();
	return await team.save();
};

// Enhanced createMany method
TeamSchema.statics.createManyTeams = async function(dataArray: ITeamCreate[]): Promise<ITeam[]> {
	const teams = dataArray.map((data: ITeamCreate) => new this(data));
	
	// Validate all teams first
	await Promise.all(teams.map((team: ITeam) => team.validate()));
	
	// Then save all
	return await Promise.all(teams.map((team: ITeam) => team.save()));
};

export const TeamModel = mongoose.model<ITeam, ITeamModel>('Team', TeamSchema);