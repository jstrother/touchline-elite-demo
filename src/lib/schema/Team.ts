import mongoose, { Schema, Document } from 'mongoose';
import { ObjectType, Field, ID, Int } from 'type-graphql';
import 'reflect-metadata';

@ObjectType()
export class Team {
	@Field(() => ID)
	id!: string;

	@Field(() => Int)
	sportmonksId!: number;

	@Field()
	name!: string;

	@Field({ nullable: true })
	shortCode?: string;

	@Field({ nullable: true })
	logoUrl?: string;

	@Field({ nullable: true })
	foundedYear?: number;

	@Field({ nullable: true })
	country?: string;

	@Field({ nullable: true })
	city?: string;

	@Field({ nullable: true })
	venue?: string;

	@Field(() => ID, { nullable: true })
	leagueId?: string;

	@Field({ nullable: true })
	isActive!: boolean;

	@Field()
	createdAt!: Date;

	@Field()
	updatedAt!: Date;
}

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
	createdAt: Date;
	updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
	{
		sportmonksId: {
			type: Number,
			required: [true, 'SportMonks ID is required'],
			unique: true,
			index: true
		},
		name: {
			type: String,
			required: [true, 'Team name is required'],
			trim: true,
			maxlength: [100, 'Name cannot exceed 100 characters'],
			index: true
		},
		shortCode: {
			type: String,
			trim: true,
			maxlength: [10, 'Short code cannot exceed 10 characters'],
			uppercase: true
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
			maxlength: [50, 'Country cannot exceed 50 characters'],
			index: true
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
			ref: 'League',
			index: true
		},
		isActive: {
			type: Boolean,
			default: true,
			index: true
		}
	},
	{
		timestamps: true,
		collection: 'teams'
	}
);

TeamSchema.index({ name: 'text', shortCode: 'text' });
TeamSchema.index({ country: 1, leagueId: 1 });
TeamSchema.index({ sportmonksId: 1, isActive: 1 });

TeamSchema.statics.findByLeague = function(leagueId: string) {
	return this.find({ leagueId, isActive: true });
};

TeamSchema.statics.findByCountry = function(country: string) {
	return this.find({ country, isActive: true });
};

TeamSchema.statics.searchByName = function(searchTerm: string) {
	return this.find({ 
		$text: { $search: searchTerm },
		isActive: true 
	});
};

export const TeamModel = mongoose.model<ITeam>('Team', TeamSchema);