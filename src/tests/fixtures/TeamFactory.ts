import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';

/**
 * Type-safe Team creation data
 */
export interface TeamCreateData {
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
 * Minimal required data for Team creation
 */
export interface TeamRequiredData {
  sportmonksId: number;
  name: string;
}

/**
 * Type-safe Team factory with realistic data generation
 */
export class TeamFactory {
  /**
   * Create a complete team with all optional fields
   */
  static create(overrides: Partial<TeamCreateData> = {}): TeamCreateData {
    const teamName = this.generateTeamName();
    const city = faker.location.city();
    const country = faker.location.country();
    
    const defaults: TeamCreateData = {
      sportmonksId: faker.number.int({ min: 1, max: 999999 }),
      name: teamName,
      shortCode: this.generateShortCode(teamName),
      logoUrl: faker.image.url(),
      foundedYear: faker.number.int({ min: 1850, max: new Date().getFullYear() - 5 }),
      country,
      city,
      venue: this.generateVenueName(city),
      leagueId: new mongoose.Types.ObjectId().toString(),
      isActive: true // Default to active unless specified otherwise
    };

    return { ...defaults, ...overrides };
  }

  /**
   * Create minimal team with only required fields
   */
  static createMinimal(overrides: Partial<TeamRequiredData> = {}): TeamRequiredData {
    const defaults: TeamRequiredData = {
      sportmonksId: faker.number.int({ min: 1, max: 999999 }),
      name: this.generateTeamName()
    };

    return { ...defaults, ...overrides };
  }

  /**
   * Create team for specific league
   */
  static createForLeague(
    leagueId: string,
    overrides: Partial<TeamCreateData> = {}
  ): TeamCreateData {
    return this.create({
      leagueId,
      isActive: true,
      ...overrides
    });
  }

  /**
   * Create team for specific country
   */
  static createForCountry(
    country: string,
    overrides: Partial<TeamCreateData> = {}
  ): TeamCreateData {
    const city = faker.location.city();
    return this.create({
      country,
      city,
      venue: this.generateVenueName(city),
      ...overrides
    });
  }

  /**
   * Create Premier League team with realistic attributes
   */
  static createPremierLeagueTeam(overrides: Partial<TeamCreateData> = {}): TeamCreateData {
    return this.create({
      country: 'England',
      city: faker.helpers.arrayElement([
        'London', 'Manchester', 'Liverpool', 'Birmingham', 'Newcastle',
        'Brighton', 'Southampton', 'Leicester', 'Leeds', 'Sheffield'
      ]),
      foundedYear: faker.number.int({ min: 1870, max: 1950 }),
      isActive: true,
      ...overrides
    });
  }

  /**
   * Create La Liga team with realistic attributes
   */
  static createLaLigaTeam(overrides: Partial<TeamCreateData> = {}): TeamCreateData {
    return this.create({
      country: 'Spain',
      city: faker.helpers.arrayElement([
        'Madrid', 'Barcelona', 'Seville', 'Valencia', 'Bilbao',
        'San Sebastián', 'Vigo', 'Pamplona', 'Getafe', 'Cádiz'
      ]),
      foundedYear: faker.number.int({ min: 1890, max: 1960 }),
      isActive: true,
      ...overrides
    });
  }

  /**
   * Create inactive team
   */
  static createInactive(overrides: Partial<TeamCreateData> = {}): TeamCreateData {
    return this.create({
      isActive: false,
      ...overrides
    });
  }

  /**
   * Create multiple teams
   */
  static createMany(count: number, overrides: Partial<TeamCreateData> = {}): TeamCreateData[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  /**
   * Create teams for a complete league (20 teams)
   */
  static createLeague(leagueId?: string): TeamCreateData[] {
    const actualLeagueId = leagueId || new mongoose.Types.ObjectId().toString();
    return Array.from({ length: 20 }, () => this.createForLeague(actualLeagueId));
  }

  /**
   * Create teams with different countries for international competition
   */
  static createInternationalTeams(count: number = 8): TeamCreateData[] {
    const countries = [
      'England', 'Spain', 'Germany', 'France', 'Italy', 'Netherlands',
      'Portugal', 'Brazil', 'Argentina', 'Belgium', 'Croatia', 'Denmark'
    ];

    return Array.from({ length: count }, (_, index) => {
      const country = countries[index % countries.length];
      return this.createForCountry(country);
    });
  }

  /**
   * Create invalid team data for testing validation
   */
  static createInvalid(invalidField: keyof TeamCreateData): Partial<TeamCreateData> {
    const validTeam = this.create();
    
    switch (invalidField) {
      case 'sportmonksId':
        return { ...validTeam, sportmonksId: -1 };
      case 'name':
        return { ...validTeam, name: '' };
      case 'shortCode':
        return { ...validTeam, shortCode: 'invalid-code' }; // lowercase not allowed
      case 'foundedYear':
        return { ...validTeam, foundedYear: 1700 }; // too early
      case 'logoUrl':
        return { ...validTeam, logoUrl: 'not-a-url' };
      default:
        return validTeam;
    }
  }

  /**
   * Generate realistic team name
   */
  private static generateTeamName(): string {
    const prefixes = ['FC', 'AFC', 'CF', 'AC', 'Real', 'Athletic', 'Sporting'];
    const suffixes = ['United', 'City', 'Town', 'FC', 'CF', 'Athletic', 'Rovers', 'Wanderers'];
    const cities = faker.location.city();
    
    const usePrefix = faker.datatype.boolean(0.4);
    const useSuffix = faker.datatype.boolean(0.6);
    
    let name = cities;
    
    if (usePrefix) {
      const prefix = faker.helpers.arrayElement(prefixes);
      name = `${prefix} ${name}`;
    }
    
    if (useSuffix) {
      const suffix = faker.helpers.arrayElement(suffixes);
      name = `${name} ${suffix}`;
    }
    
    return name;
  }

  /**
   * Generate team short code from name
   */
  private static generateShortCode(teamName: string): string {
    // Remove common prefixes/suffixes and extract meaningful letters
    const cleanName = teamName
      .replace(/^(FC|AFC|CF|AC|Real|Athletic|Sporting)\s+/i, '')
      .replace(/\s+(United|City|Town|FC|CF|Athletic|Rovers|Wanderers)$/i, '');
    
    const words = cleanName.split(' ').filter(word => word.length > 0);
    
    let shortCode = '';
    
    if (words.length === 1) {
      // Single word: take first 3 letters
      shortCode = words[0].substring(0, 3);
    } else if (words.length === 2) {
      // Two words: take first 2 letters of each
      shortCode = words[0].substring(0, 2) + words[1].substring(0, 2);
    } else {
      // Multiple words: take first letter of each up to 4 letters
      shortCode = words
        .slice(0, 4)
        .map(word => word.charAt(0))
        .join('');
    }
    
    // Clean up the short code to only contain alphanumeric characters
    shortCode = shortCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    // Ensure it's not empty and not too long
    if (shortCode.length === 0) {
      shortCode = 'TEAM';
    } else if (shortCode.length > 10) {
      shortCode = shortCode.substring(0, 10);
    }
    
    return shortCode;
  }

  /**
   * Generate realistic venue name
   */
  private static generateVenueName(city: string): string {
    const venueTypes = [
      'Stadium', 'Arena', 'Ground', 'Park', 'Field', 'Centre'
    ];
    
    const useCity = faker.datatype.boolean(0.6);
    const venueType = faker.helpers.arrayElement(venueTypes);
    
    if (useCity) {
      return `${city} ${venueType}`;
    } else {
      const sponsorName = faker.company.name().split(' ')[0];
      return `${sponsorName} ${venueType}`;
    }
  }
}