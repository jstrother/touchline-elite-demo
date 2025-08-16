import mongoose, { Schema, Document } from 'mongoose';
import { ObjectType, Field, ID, Int, registerEnumType } from 'type-graphql';
import 'reflect-metadata';

enum UserRole {
	USER = 'user',
	ADMIN = 'admin',
	MODERATOR = 'moderator'
}

enum SubscriptionTier {
	FREE = 'free',
	PREMIUM = 'premium',
	PRO = 'pro'
}

registerEnumType(UserRole, {
	name: 'UserRole',
	description: 'User role types'
});

registerEnumType(SubscriptionTier, {
	name: 'SubscriptionTier',
	description: 'User subscription tiers'
});

@ObjectType()
export class User {
	@Field(() => ID)
	id!: string;

	@Field()
	email!: string;

	@Field()
	username!: string;

	@Field({ nullable: true })
	firstName?: string;

	@Field({ nullable: true })
	lastName?: string;

	@Field({ nullable: true })
	avatarUrl?: string;

	@Field(() => UserRole)
	role!: UserRole;

	@Field(() => SubscriptionTier)
	subscriptionTier!: SubscriptionTier;

	@Field({ nullable: true })
	subscriptionExpiresAt?: Date;

	@Field(() => Int)
	totalPoints!: number;

	@Field(() => Int)
	seasonsPlayed!: number;

	@Field({ nullable: true })
	country?: string;

	@Field({ nullable: true })
	timezone?: string;

	@Field()
	isActive!: boolean;

	@Field()
	emailVerified!: boolean;

	@Field({ nullable: true })
	lastLoginAt?: Date;

	@Field()
	createdAt!: Date;

	@Field()
	updatedAt!: Date;
}

export interface IUser extends Document {
	email: string;
	username: string;
	passwordHash: string;
	firstName?: string;
	lastName?: string;
	avatarUrl?: string;
	role: string;
	subscriptionTier: string;
	subscriptionExpiresAt?: Date;
	totalPoints: number;
	seasonsPlayed: number;
	country?: string;
	timezone?: string;
	isActive: boolean;
	emailVerified: boolean;
	emailVerificationToken?: string;
	passwordResetToken?: string;
	passwordResetExpiresAt?: Date;
	lastLoginAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
	{
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			lowercase: true,
			trim: true,
			maxlength: [255, 'Email cannot exceed 255 characters'],
			validate: {
				validator: function(value: string) {
					const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
					return emailRegex.test(value);
				},
				message: 'Please provide a valid email address'
			},
			index: true
		},
		username: {
			type: String,
			required: [true, 'Username is required'],
			unique: true,
			trim: true,
			minlength: [3, 'Username must be at least 3 characters'],
			maxlength: [30, 'Username cannot exceed 30 characters'],
			validate: {
				validator: function(value: string) {
					const usernameRegex = /^[a-zA-Z0-9_-]+$/;
					return usernameRegex.test(value);
				},
				message: 'Username can only contain letters, numbers, underscores, and hyphens'
			},
			index: true
		},
		passwordHash: {
			type: String,
			required: [true, 'Password hash is required'],
			select: false
		},
		firstName: {
			type: String,
			trim: true,
			maxlength: [50, 'First name cannot exceed 50 characters']
		},
		lastName: {
			type: String,
			trim: true,
			maxlength: [50, 'Last name cannot exceed 50 characters']
		},
		avatarUrl: {
			type: String,
			trim: true,
			validate: {
				validator: function(value: string) {
					if (!value) return true;
					const urlRegex = /^https?:\/\/.+/;
					return urlRegex.test(value);
				},
				message: 'Avatar URL must be a valid HTTP/HTTPS URL'
			}
		},
		role: {
			type: String,
			enum: {
				values: Object.values(UserRole),
				message: 'Role must be one of: user, admin, moderator'
			},
			default: UserRole.USER,
			index: true
		},
		subscriptionTier: {
			type: String,
			enum: {
				values: Object.values(SubscriptionTier),
				message: 'Subscription tier must be one of: free, premium, pro'
			},
			default: SubscriptionTier.FREE,
			index: true
		},
		subscriptionExpiresAt: {
			type: Date,
			validate: {
				validator: function(value: Date) {
					if (!value) return true;
					return value > new Date();
				},
				message: 'Subscription expiry date must be in the future'
			}
		},
		totalPoints: {
			type: Number,
			default: 0,
			min: [0, 'Total points cannot be negative'],
			index: true
		},
		seasonsPlayed: {
			type: Number,
			default: 0,
			min: [0, 'Seasons played cannot be negative']
		},
		country: {
			type: String,
			trim: true,
			maxlength: [50, 'Country cannot exceed 50 characters']
		},
		timezone: {
			type: String,
			trim: true,
			maxlength: [50, 'Timezone cannot exceed 50 characters']
		},
		isActive: {
			type: Boolean,
			default: true,
			index: true
		},
		emailVerified: {
			type: Boolean,
			default: false,
			index: true
		},
		emailVerificationToken: {
			type: String,
			select: false
		},
		passwordResetToken: {
			type: String,
			select: false
		},
		passwordResetExpiresAt: {
			type: Date,
			select: false
		},
		lastLoginAt: {
			type: Date
		}
	},
	{
		timestamps: true,
		collection: 'users'
	}
);

UserSchema.index({ email: 1, isActive: 1 });
UserSchema.index({ username: 1, isActive: 1 });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ subscriptionTier: 1, subscriptionExpiresAt: 1 });
UserSchema.index({ totalPoints: -1 });
UserSchema.index({ createdAt: -1 });

UserSchema.virtual('fullName').get(function() {
	if (this.firstName && this.lastName) {
		return `${this.firstName} ${this.lastName}`;
	}
	return this.username;
});

UserSchema.virtual('displayName').get(function() {
	return this.firstName || this.username;
});

UserSchema.virtual('isSubscriptionActive').get(function() {
	if (this.subscriptionTier === SubscriptionTier.FREE) return true;
	return this.subscriptionExpiresAt && this.subscriptionExpiresAt > new Date();
});

UserSchema.methods.updateLastLogin = function() {
	this.lastLoginAt = new Date();
	return this.save();
};

UserSchema.statics.findByEmail = function(email: string) {
	return this.findOne({ email: email.toLowerCase(), isActive: true });
};

UserSchema.statics.findByUsername = function(username: string) {
	return this.findOne({ username, isActive: true });
};

UserSchema.statics.findActiveSubscribers = function() {
	return this.find({
		subscriptionTier: { $ne: SubscriptionTier.FREE },
		subscriptionExpiresAt: { $gt: new Date() },
		isActive: true
	});
};

UserSchema.statics.getLeaderboard = function(limit: number = 10) {
	return this.find({ isActive: true })
		.sort({ totalPoints: -1 })
		.limit(limit)
		.select('username totalPoints avatarUrl');
};

export const UserModel = mongoose.model<IUser>('User', UserSchema);