import mongoose, { Schema, Document } from 'mongoose';

/**
 * Player position enum for type safety
 */
export enum PlayerPosition {
  GOALKEEPER = 'Goalkeeper',
  DEFENDER = 'Defender',
  MIDFIELDER = 'Midfielder',
  FORWARD = 'Forward'
}

// Note: GraphQL decorators will be added later in Phase 4

/**
 * TypeScript interface for Player document
 */
export interface IPlayer extends Document {
  sportmonksId: number;
  name: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  commonName?: string;
  dateOfBirth?: Date;
  nationality?: string;
  position?: PlayerPosition;
  detailedPosition?: string;
  height?: number;
  weight?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Virtual fields
  fullName: string;
  
  // Instance methods
  getAge(): number | null;
  update(data: Partial<IPlayerUpdate>): Promise<IPlayer>;
  delete(options?: { hard?: boolean }): Promise<void>;
}

/**
 * Player creation input type
 */
export interface IPlayerCreate {
  sportmonksId: number;
  name: string;
  firstName: string;
  lastName: string;
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
 * Player update input type
 */
export interface IPlayerUpdate {
  name?: string;
  firstName?: string;
  lastName?: string;
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

// Note: GraphQL types will be added later in Phase 4

/**
 * Mongoose Player Schema with strict validation
 */
const PlayerSchema = new Schema<IPlayer>(
  {
    sportmonksId: {
      type: Number,
      required: [true, 'sportmonksId is required'],
      unique: true,
      index: true,
      validate: {
        validator: (value: number): boolean => {
          return Number.isInteger(value) && value > 0;
        },
        message: 'SportMonks ID must be positive'
      }
    },
    name: {
      type: String,
      required: [true, 'Player name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
      validate: {
        validator: (value: string): boolean => {
          return value.trim().length > 0;
        },
        message: 'Name cannot be empty'
      }
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
      validate: {
        validator: (value: string): boolean => {
          return value.trim().length > 0;
        },
        message: 'First name cannot be empty'
      }
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
      validate: {
        validator: (value: string): boolean => {
          return value.trim().length > 0;
        },
        message: 'Last name cannot be empty'
      }
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
        validator: function(value: Date): boolean {
          if (!value) return true;
          const today = new Date();
          const fifteenYearsAgo = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
          return value <= fifteenYearsAgo && value >= new Date('1950-01-01');
        },
        message: 'Player must be at least 15 years old'
      }
    },
    nationality: {
      type: String,
      trim: true,
      maxlength: [50, 'Nationality cannot exceed 50 characters']
    },
    position: {
      type: String,
      enum: {
        values: Object.values(PlayerPosition),
        message: 'Position must be one of: Goalkeeper, Defender, Midfielder, Forward'
      },
      index: true
    },
    detailedPosition: {
      type: String,
      trim: true,
      maxlength: [30, 'Detailed position cannot exceed 30 characters']
    },
    height: {
      type: Number,
      min: [100, 'Height must be between 100cm and 250cm'],
      max: [250, 'Height must be between 100cm and 250cm'],
      validate: {
        validator: (value: number): boolean => {
          return !value || (value > 0 && Number.isInteger(value));
        },
        message: 'Height must be a positive integer'
      }
    },
    weight: {
      type: Number,
      min: [30, 'Weight must be between 30kg and 200kg'],
      max: [200, 'Weight must be between 30kg and 200kg'],
      validate: {
        validator: (value: number): boolean => {
          return !value || (value > 0 && Number.isInteger(value));
        },
        message: 'Weight must be a positive integer'
      }
    },
    imageUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (value: string): boolean => {
          if (!value) return true;
          const urlRegex = /^https?:\/\/.+/;
          return urlRegex.test(value);
        },
        message: 'Image URL must be a valid HTTP/HTTPS URL'
      }
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'players'
  }
);

// Indexes for better query performance
PlayerSchema.index({ name: 'text' });
PlayerSchema.index({ position: 1 });
PlayerSchema.index({ nationality: 1 });
PlayerSchema.index({ deletedAt: 1 });

// Virtual for full name
PlayerSchema.virtual('fullName').get(function(): string {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
PlayerSchema.set('toJSON', { virtuals: true });

// Pre-save middleware to auto-generate display name
PlayerSchema.pre<IPlayer>('save', function(next): void {
  if (!this.displayName && this.firstName && this.lastName) {
    this.displayName = `${this.firstName.charAt(0)}. ${this.lastName}`;
  }
  next();
});

// Instance Methods
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

PlayerSchema.methods.update = async function(data: Partial<IPlayerUpdate>): Promise<IPlayer> {
  Object.assign(this, data);
  await this.validate();
  return await this.save();
};

PlayerSchema.methods.delete = async function(options: { hard?: boolean } = {}): Promise<void> {
  if (options.hard) {
    await this.deleteOne();
  } else {
    this.deletedAt = new Date();
    await this.save();
  }
};

// Static Methods
PlayerSchema.statics.findByPosition = function(position: PlayerPosition) {
  return this.find({ position, deletedAt: null });
};

PlayerSchema.statics.findByNationality = function(nationality: string) {
  return this.find({ nationality, deletedAt: null });
};

PlayerSchema.statics.findDeleted = function() {
  return this.find({ deletedAt: { $ne: null } });
};

// Override default find to exclude soft-deleted documents
PlayerSchema.pre(/^find/, function(this: mongoose.Query<IPlayer[], IPlayer>): void {
  // Only apply soft delete filter if deletedAt is not explicitly queried
  const query = this.getQuery();
  if (!query.deletedAt) {
    this.where({ deletedAt: null });
  }
});

/**
 * Player Model with enhanced static methods
 */
interface IPlayerModel extends mongoose.Model<IPlayer> {
  createPlayer(data: IPlayerCreate): Promise<IPlayer>;
  createManyPlayers(dataArray: IPlayerCreate[]): Promise<IPlayer[]>;
  findByPosition(position: PlayerPosition): mongoose.Query<IPlayer[], IPlayer>;
  findByNationality(nationality: string): mongoose.Query<IPlayer[], IPlayer>;
  findDeleted(): mongoose.Query<IPlayer[], IPlayer>;
}

// Enhanced create method with validation
PlayerSchema.statics.createPlayer = async function(data: IPlayerCreate): Promise<IPlayer> {
  const player = new this(data);
  await player.validate();
  return await player.save();
};

// Enhanced createMany method
PlayerSchema.statics.createManyPlayers = async function(dataArray: IPlayerCreate[]): Promise<IPlayer[]> {
  const players = dataArray.map((data: IPlayerCreate) => new this(data));
  
  // Validate all players first
  await Promise.all(players.map((player: IPlayer) => player.validate()));
  
  // Then save all
  return await Promise.all(players.map((player: IPlayer) => player.save()));
};

export const Player = mongoose.model<IPlayer, IPlayerModel>('Player', PlayerSchema);