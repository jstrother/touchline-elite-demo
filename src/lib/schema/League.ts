import mongoose, { Schema, Document } from 'mongoose';
import { ObjectType, Field, ID, Int, registerEnumType } from 'type-graphql';
import 'reflect-metadata';

enum LeagueType {
	DOMESTIC = 'domestic',
	INTERNATIONAL = 'international',
	CUP = 'cup',
	FRIENDLY = 'friendly'
}

registerEnumType(LeagueType, {
	name: 'LeagueType',
	description: 'Type of league or competition'
});

@ObjectType()
export class League {
	@Field(() => ID)
	id!: string;

	@Field(() => Int)
	sportmonksId!: number;

	@Field()
	name!: string;

	@Field({ nullable: true })
	shortName?: string;

	@Field(() => LeagueType)
	type!: LeagueType;

	@Field({ nullable: true })
	country?: string;

	@Field({ nullable: true })
	logoUrl?: string;

	@Field(() => Int, { nullable: true })
	tier?: number;

	@Field({ nullable: true })
	isActive!: boolean;

	@Field({ nullable: true })
	hasStandings?: boolean;

	@Field()
	createdAt!: Date;

	@Field()
	updatedAt!: Date;
}

export interface ILeague extends Document {
	sportmonksId: number;
	name: string;
	shortName?: string;
	type: string;
	country?: string;
	logoUrl?: string;
	tier?: number;
	isActive: boolean;
	hasStandings: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const LeagueSchema = new Schema<ILeague>(
	{
		sportmonksId: {
			type: Number,
			required: [true, 'SportMonks ID is required'],
			unique: true,
			index: true
		},
		name: {
			type: String,
			required: [true, 'League name is required'],
			trim: true,
			maxlength: [100, 'Name cannot exceed 100 characters'],
			index: true
		},
		shortName: {
			type: String,
			trim: true,
			maxlength: [20, 'Short name cannot exceed 20 characters']
		},
		type: {
			type: String,
			required: [true, 'League type is required'],
			enum: {
				values: Object.values(LeagueType),
				message: 'Type must be one of: domestic, international, cup, friendly'
			},
			index: true
		},
		country: {
			type: String,
			trim: true,
			maxlength: [50, 'Country cannot exceed 50 characters'],
			index: true
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
		tier: {
			type: Number,
			min: [1, 'Tier must be at least 1'],
			max: [10, 'Tier cannot exceed 10'],
			validate: {
				validator: function(value: number) {
					return Number.isInteger(value);
				},
				message: 'Tier must be an integer'
			}
		},
		isActive: {
			type: Boolean,
			default: true,
			index: true
		},
		hasStandings: {
			type: Boolean,
			default: true
		}
	},
	{
		timestamps: true,
		collection: 'leagues'
	}
);

LeagueSchema.index({ name: 'text', shortName: 'text' });
LeagueSchema.index({ country: 1, type: 1 });
LeagueSchema.index({ tier: 1, country: 1 });
LeagueSchema.index({ isActive: 1, type: 1 });

LeagueSchema.statics.findByCountry = function(country: string) {
	return this.find({ country, isActive: true });
};

LeagueSchema.statics.findByType = function(type: string) {
	return this.find({ type, isActive: true });
};

LeagueSchema.statics.findTopTier = function(country?: string) {
	const query: { tier: number; isActive: boolean; country?: string } = { tier: 1, isActive: true };
	if (country) query.country = country;
	return this.find(query);
};

LeagueSchema.statics.searchByName = function(searchTerm: string) {
	return this.find({ 
		$text: { $search: searchTerm },
		isActive: true 
	});
};

export const LeagueModel = mongoose.model<ILeague>('League', LeagueSchema);