import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
	sportmonksId: number;
	name: string;
	firstName: string;
	lastName: string;
	displayName?: string;
	commonName?: string;
	dateOfBirth?: Date;
	nationality?: string;
	position?: string;
	detailedPosition?: string;
	height?: number;
	weight?: number;
	imageUrl?: string;
	createdAt: Date;
	updatedAt: Date;
}

const PlayerSchema = new Schema<IPlayer>(
	{
		sportmonksId: {
			type: Number,
			required: [true, 'SportMonks ID is required'],
			unique: true,
			index: true
		},
		name: {
			type: String,
			required: [true, 'Player name is required'],
			trim: true,
			maxlength: [100, 'Name cannot exceed 100 characters']
		},
		firstName: {
			type: String,
			required: [true, 'First name is required'],
			trim: true,
			maxlength: [50, 'First name cannot exceed 50 characters']
		},
		lastName: {
			type: String,
			required: [true, 'Last name is required'],
			trim: true,
			maxlength: [50, 'Last name cannot exceed 50 characters']
		},
		displayName: {
			type: String,
			trim: true,
			maxlength: [50, 'Display name cannot exceed 50 characters']
		},
		commonName: {
			type: String,
			trim: true,
			maxlength: [50, 'Common name cannot exceed 50 characters']
		},
		dateOfBirth: {
			type: Date,
			validate: {
				validator: function(value: Date) {
					// Player must be at least 15 years old and not born in the future
					const today = new Date();
					const fifteenYearsAgo = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
					return value <= fifteenYearsAgo && value >= new Date('1950-01-01');
				},
				message: 'Date of birth must be valid and player must be at least 15 years old'
			}
		},
		nationality: {
			type: String,
			trim: true,
			maxlength: [50, 'Nationality cannot exceed 50 characters']
		},
		position: {
			type: String,
			trim: true,
			enum: {
				values: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
				message: 'Position must be one of: Goalkeeper, Defender, Midfielder, Forward'
			}
		},
		detailedPosition: {
			type: String,
			trim: true,
			maxlength: [30, 'Detailed position cannot exceed 30 characters']
		},
		height: {
			type: Number,
			min: [100, 'Height must be at least 100cm'],
			max: [250, 'Height cannot exceed 250cm'],
			validate: {
				validator: function(value: number) {
					return value > 0;
				},
				message: 'Height must be a positive number'
			}
		},
		weight: {
			type: Number,
			min: [30, 'Weight must be at least 30kg'],
			max: [200, 'Weight cannot exceed 200kg'],
			validate: {
				validator: function(value: number) {
					return value > 0;
				},
				message: 'Weight must be a positive number'
			}
		},
		imageUrl: {
			type: String,
			trim: true,
			validate: {
				validator: function(value: string) {
					// Basic URL validation if provided
					if (!value) return true;
					const urlRegex = /^https?:\/\/.+/;
					return urlRegex.test(value);
				},
				message: 'Image URL must be a valid HTTP/HTTPS URL'
			}
		}
	},
	{
		timestamps: true, // Automatically adds createdAt and updatedAt
		collection: 'players'
	}
);

// Indexes for better query performance
PlayerSchema.index({ name: 'text' }); // For text search
PlayerSchema.index({ position: 1 }); // For filtering by position
PlayerSchema.index({ nationality: 1 }); // For filtering by nationality

// Virtual for full name display
PlayerSchema.virtual('fullName').get(function() {
	return `${this.firstName} ${this.lastName}`;
});

// Method to get player age
PlayerSchema.methods.getAge = function(): number | null {
	if (!this.dateOfBirth) return null;
	const today = new Date();
	const birthDate = new Date(this.dateOfBirth);
	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}
	return age;
};

// Static method to find players by position
PlayerSchema.statics.findByPosition = function(position: string) {
	return this.find({ position });
};

// Static method to find players by nationality
PlayerSchema.statics.findByNationality = function(nationality: string) {
	return this.find({ nationality });
};

// Pre-save middleware to ensure displayName defaults to common name format
PlayerSchema.pre('save', function(next) {
	if (!this.displayName && this.firstName && this.lastName) {
		// Create a display name like "L. Messi" from "Lionel Messi"
		this.displayName = `${this.firstName.charAt(0)}. ${this.lastName}`;
	}
	next();
});

export const Player = mongoose.model<IPlayer>('Player', PlayerSchema);