import { faker } from '@faker-js/faker';

/**
 * Player Position enum for type safety
 */
export enum PlayerPosition {
  GOALKEEPER = 'Goalkeeper',
  DEFENDER = 'Defender',
  MIDFIELDER = 'Midfielder',
  FORWARD = 'Forward'
}

/**
 * Type-safe Player creation data
 */
export interface PlayerCreateData {
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
 * Minimal required data for Player creation
 */
export interface PlayerRequiredData {
  sportmonksId: number;
  name: string;
  firstName: string;
  lastName: string;
}

/**
 * Type-safe Player factory with realistic data generation
 */
export class PlayerFactory {
  /**
   * Create a complete player with all optional fields
   */
  static create(overrides: Partial<PlayerCreateData> = {}): PlayerCreateData {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    
    const defaults: PlayerCreateData = {
      sportmonksId: faker.number.int({ min: 1, max: 999999 }),
      name,
      firstName,
      lastName,
      displayName: `${firstName.charAt(0)}. ${lastName}`,
      commonName: faker.datatype.boolean(0.3) ? faker.person.firstName() : undefined,
      dateOfBirth: faker.date.birthdate({ min: 16, max: 40, mode: 'age' }),
      nationality: faker.location.countryCode('alpha-2'), // Short country codes
      position: faker.helpers.enumValue(PlayerPosition),
      detailedPosition: this.getDetailedPosition(overrides.position),
      height: faker.number.int({ min: 160, max: 210 }),
      weight: faker.number.int({ min: 55, max: 110 }),
      imageUrl: faker.image.avatar(),
    };

    return { ...defaults, ...overrides };
  }

  /**
   * Create minimal player with only required fields
   */
  static createMinimal(overrides: Partial<PlayerRequiredData> = {}): PlayerRequiredData {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    const defaults: PlayerRequiredData = {
      sportmonksId: faker.number.int({ min: 1, max: 999999 }),
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
    };

    return { ...defaults, ...overrides };
  }

  /**
   * Create player with specific position
   */
  static createByPosition(
    position: PlayerPosition,
    overrides: Partial<PlayerCreateData> = {}
  ): PlayerCreateData {
    return this.create({
      position,
      detailedPosition: this.getDetailedPosition(position),
      height: this.getHeightByPosition(position),
      weight: this.getWeightByPosition(position),
      ...overrides,
    });
  }

  /**
   * Create goalkeeper with realistic attributes
   */
  static createGoalkeeper(overrides: Partial<PlayerCreateData> = {}): PlayerCreateData {
    return this.createByPosition(PlayerPosition.GOALKEEPER, {
      height: faker.number.int({ min: 180, max: 205 }),
      weight: faker.number.int({ min: 75, max: 95 }),
      ...overrides,
    });
  }

  /**
   * Create defender with realistic attributes
   */
  static createDefender(overrides: Partial<PlayerCreateData> = {}): PlayerCreateData {
    return this.createByPosition(PlayerPosition.DEFENDER, {
      height: faker.number.int({ min: 170, max: 195 }),
      weight: faker.number.int({ min: 65, max: 90 }),
      ...overrides,
    });
  }

  /**
   * Create midfielder with realistic attributes
   */
  static createMidfielder(overrides: Partial<PlayerCreateData> = {}): PlayerCreateData {
    return this.createByPosition(PlayerPosition.MIDFIELDER, {
      height: faker.number.int({ min: 165, max: 185 }),
      weight: faker.number.int({ min: 60, max: 80 }),
      ...overrides,
    });
  }

  /**
   * Create forward with realistic attributes
   */
  static createForward(overrides: Partial<PlayerCreateData> = {}): PlayerCreateData {
    return this.createByPosition(PlayerPosition.FORWARD, {
      height: faker.number.int({ min: 170, max: 190 }),
      weight: faker.number.int({ min: 65, max: 85 }),
      ...overrides,
    });
  }

  /**
   * Create multiple players
   */
  static createMany(count: number, overrides: Partial<PlayerCreateData> = {}): PlayerCreateData[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * Create a squad with realistic position distribution
   */
  static createSquad(): PlayerCreateData[] {
    return [
      ...Array.from({ length: 2 }, () => this.createGoalkeeper()),
      ...Array.from({ length: 5 }, () => this.createDefender()),
      ...Array.from({ length: 5 }, () => this.createMidfielder()),
      ...Array.from({ length: 3 }, () => this.createForward()),
    ];
  }

  /**
   * Create invalid player data for testing validation
   */
  static createInvalid(invalidField: keyof PlayerCreateData): Partial<PlayerCreateData> {
    const validPlayer = this.create();
    
    switch (invalidField) {
      case 'sportmonksId':
        return { ...validPlayer, sportmonksId: -1 };
      case 'name':
        return { ...validPlayer, name: '' };
      case 'firstName':
        return { ...validPlayer, firstName: '' };
      case 'lastName':
        return { ...validPlayer, lastName: '' };
      case 'height':
        return { ...validPlayer, height: 50 }; // Too short
      case 'weight':
        return { ...validPlayer, weight: 20 }; // Too light
      case 'dateOfBirth':
        return { ...validPlayer, dateOfBirth: new Date('2020-01-01') }; // Too young
      default:
        return validPlayer;
    }
  }

  /**
   * Get realistic detailed position based on main position
   */
  private static getDetailedPosition(position?: PlayerPosition): string | undefined {
    if (!position) return undefined;

    const positions = {
      [PlayerPosition.GOALKEEPER]: ['Goalkeeper'],
      [PlayerPosition.DEFENDER]: ['Centre-Back', 'Left-Back', 'Right-Back', 'Wing-Back'],
      [PlayerPosition.MIDFIELDER]: ['Defensive Midfielder', 'Central Midfielder', 'Attacking Midfielder', 'Winger'],
      [PlayerPosition.FORWARD]: ['Striker', 'Centre-Forward', 'Left Winger', 'Right Winger']
    };

    return faker.helpers.arrayElement(positions[position]);
  }

  /**
   * Get realistic height range by position
   */
  private static getHeightByPosition(position: PlayerPosition): number {
    const ranges = {
      [PlayerPosition.GOALKEEPER]: { min: 180, max: 205 },
      [PlayerPosition.DEFENDER]: { min: 170, max: 195 },
      [PlayerPosition.MIDFIELDER]: { min: 165, max: 185 },
      [PlayerPosition.FORWARD]: { min: 170, max: 190 }
    };

    const range = ranges[position];
    return faker.number.int(range);
  }

  /**
   * Get realistic weight range by position
   */
  private static getWeightByPosition(position: PlayerPosition): number {
    const ranges = {
      [PlayerPosition.GOALKEEPER]: { min: 75, max: 95 },
      [PlayerPosition.DEFENDER]: { min: 65, max: 90 },
      [PlayerPosition.MIDFIELDER]: { min: 60, max: 80 },
      [PlayerPosition.FORWARD]: { min: 65, max: 85 }
    };

    const range = ranges[position];
    return faker.number.int(range);
  }
}