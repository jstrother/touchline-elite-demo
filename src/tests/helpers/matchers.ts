import { expect } from 'vitest';
import { PlayerPosition } from '../fixtures/PlayerFactory';

/**
 * Custom matcher interface for TypeScript
 */
interface CustomMatchers<R = unknown> {
  toBeValidPlayer(): R;
  toBeValidPosition(): R;
  toBeValidAge(): R;
  toBeValidHeight(): R;
  toBeValidWeight(): R;
  toBeValidSportMonksId(): R;
  toBeValidEmail(): R;
  toBeValidUrl(): R;
  toHaveValidTimestamps(): R;
  toBeWithinBudget(budget: number): R;
  toHaveValidSquadComposition(): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

/**
 * Domain-specific matchers for fantasy soccer entities
 */
export function setupCustomMatchers(): void {
  expect.extend({
    /**
     * Check if object is a valid player
     */
    toBeValidPlayer(received: any) {
      const required = ['sportmonksId', 'name', 'firstName', 'lastName'];
      const missing = required.filter(field => !received[field]);
      
      if (missing.length > 0) {
        return {
          message: () => `Player is missing required fields: ${missing.join(', ')}`,
          pass: false,
        };
      }

      if (typeof received.sportmonksId !== 'number' || received.sportmonksId <= 0) {
        return {
          message: () => 'Player sportmonksId must be a positive number',
          pass: false,
        };
      }

      if (received.name.trim().length === 0) {
        return {
          message: () => 'Player name cannot be empty',
          pass: false,
        };
      }

      return {
        message: () => 'Player is valid',
        pass: true,
      };
    },

    /**
     * Check if position is valid
     */
    toBeValidPosition(received: any) {
      const validPositions = Object.values(PlayerPosition);
      const isValid = validPositions.includes(received);
      
      return {
        message: () => isValid 
          ? `Position ${received} is valid`
          : `Position ${received} is not valid. Must be one of: ${validPositions.join(', ')}`,
        pass: isValid,
      };
    },

    /**
     * Check if age is within valid range for football player
     */
    toBeValidAge(received: Date) {
      const today = new Date();
      const age = today.getFullYear() - received.getFullYear();
      const monthDiff = today.getMonth() - received.getMonth();
      
      let actualAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < received.getDate())) {
        actualAge--;
      }

      const isValid = actualAge >= 15 && actualAge <= 45;
      
      return {
        message: () => isValid
          ? `Age ${actualAge} is valid for a football player`
          : `Age ${actualAge} is not valid. Must be between 15 and 45 years old`,
        pass: isValid,
      };
    },

    /**
     * Check if height is realistic for football player
     */
    toBeValidHeight(received: number) {
      const isValid = received >= 150 && received <= 220;
      
      return {
        message: () => isValid
          ? `Height ${received}cm is valid`
          : `Height ${received}cm is not realistic. Must be between 150-220cm`,
        pass: isValid,
      };
    },

    /**
     * Check if weight is realistic for football player
     */
    toBeValidWeight(received: number) {
      const isValid = received >= 50 && received <= 120;
      
      return {
        message: () => isValid
          ? `Weight ${received}kg is valid`
          : `Weight ${received}kg is not realistic. Must be between 50-120kg`,
        pass: isValid,
      };
    },

    /**
     * Check if SportMonks ID is valid
     */
    toBeValidSportMonksId(received: number) {
      const isValid = Number.isInteger(received) && received > 0;
      
      return {
        message: () => isValid
          ? `SportMonks ID ${received} is valid`
          : `SportMonks ID ${received} is not valid. Must be a positive integer`,
        pass: isValid,
      };
    },

    /**
     * Check if email is valid format
     */
    toBeValidEmail(received: string) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(received);
      
      return {
        message: () => isValid
          ? `Email ${received} is valid`
          : `Email ${received} is not a valid email format`,
        pass: isValid,
      };
    },

    /**
     * Check if URL is valid format
     */
    toBeValidUrl(received: string) {
      try {
        new URL(received);
        return {
          message: () => `URL ${received} is valid`,
          pass: true,
        };
      } catch {
        return {
          message: () => `URL ${received} is not a valid URL format`,
          pass: false,
        };
      }
    },

    /**
     * Check if entity has valid timestamps
     */
    toHaveValidTimestamps(received: any) {
      const hasCreatedAt = received.createdAt instanceof Date;
      const hasUpdatedAt = received.updatedAt instanceof Date;
      
      if (!hasCreatedAt || !hasUpdatedAt) {
        return {
          message: () => 'Entity must have valid createdAt and updatedAt timestamps',
          pass: false,
        };
      }

      const isChronological = received.createdAt <= received.updatedAt;
      
      return {
        message: () => isChronological
          ? 'Timestamps are valid and chronological'
          : 'updatedAt must be >= createdAt',
        pass: isChronological,
      };
    },

    /**
     * Check if fantasy team value is within budget
     */
    toBeWithinBudget(received: number, budget: number) {
      const isValid = received <= budget;
      
      return {
        message: () => isValid
          ? `Team value £${received}m is within budget of £${budget}m`
          : `Team value £${received}m exceeds budget of £${budget}m`,
        pass: isValid,
      };
    },

    /**
     * Check if squad has valid composition
     */
    toHaveValidSquadComposition(received: any[]) {
      const positionCounts = {
        [PlayerPosition.GOALKEEPER]: 0,
        [PlayerPosition.DEFENDER]: 0,
        [PlayerPosition.MIDFIELDER]: 0,
        [PlayerPosition.FORWARD]: 0,
      };

      received.forEach(player => {
        if (player.position && positionCounts.hasOwnProperty(player.position)) {
          positionCounts[player.position]++;
        }
      });

      const rules = {
        [PlayerPosition.GOALKEEPER]: { min: 1, max: 2 },
        [PlayerPosition.DEFENDER]: { min: 3, max: 5 },
        [PlayerPosition.MIDFIELDER]: { min: 3, max: 5 },
        [PlayerPosition.FORWARD]: { min: 1, max: 3 },
      };

      for (const [position, count] of Object.entries(positionCounts)) {
        const rule = rules[position as PlayerPosition];
        if (count < rule.min || count > rule.max) {
          return {
            message: () => `Squad composition invalid: ${position} count ${count} not within ${rule.min}-${rule.max}`,
            pass: false,
          };
        }
      }

      const totalPlayers = Object.values(positionCounts).reduce((sum, count) => sum + count, 0);
      if (totalPlayers < 11 || totalPlayers > 15) {
        return {
          message: () => `Squad size ${totalPlayers} not within 11-15 players`,
          pass: false,
        };
      }

      return {
        message: () => 'Squad composition is valid',
        pass: true,
      };
    },
  });
}

/**
 * Assertion helpers for common test patterns
 */
export const assertions = {
  /**
   * Assert that all items in array are valid
   */
  allValid<T>(items: T[], validator: (item: T) => boolean, message: string): void {
    const invalid = items.filter(item => !validator(item));
    if (invalid.length > 0) {
      throw new Error(`${message}. Invalid items: ${invalid.length}/${items.length}`);
    }
  },

  /**
   * Assert that async operation throws specific error
   */
  async throwsError(fn: () => Promise<any>, expectedMessage: string): Promise<void> {
    try {
      await fn();
      throw new Error('Expected function to throw an error');
    } catch (error) {
      if (error instanceof Error && !error.message.includes(expectedMessage)) {
        throw new Error(`Expected error message to include "${expectedMessage}", got "${error.message}"`);
      }
    }
  },

  /**
   * Assert that value is within percentage range
   */
  withinPercentage(actual: number, expected: number, percentage: number): void {
    const tolerance = expected * (percentage / 100);
    const diff = Math.abs(actual - expected);
    
    if (diff > tolerance) {
      throw new Error(`Expected ${actual} to be within ${percentage}% of ${expected} (tolerance: ±${tolerance})`);
    }
  },
};