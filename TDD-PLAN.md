# 🧪 TDD Implementation Plan for Touchline Elite Demo

## **Current State Analysis**

- ✅ **Vitest** setup with watch mode and UI
- ✅ **Mocking strategy** for environment variables
- ✅ **Basic test structure** exists
- ✅ **TypeScript + Reflect metadata** configured
- 🔄 **Need:** Comprehensive domain-driven test suite

---

## **🎯 TDD Strategy: Fantasy Soccer Domain-First**

### **Phase 1: Core Domain Models (Week 1)**

**Goal:** Establish type-safe domain entities with business rules

#### **1.1 Player Entity Tests**

```typescript
// Business Rules to Test:
- Player creation with SportMonks data
- Position validation and constraints
- Age calculation and eligibility rules
- Name formatting and display logic
- Physical attributes validation
```

#### **1.2 Team Entity Tests**

```typescript
// Business Rules to Test:
- Team creation and league association
- Squad size and composition rules
- Active/inactive status management
- Logo and metadata validation
```

#### **1.3 League & Season Tests**

```typescript
// Business Rules to Test:
- League hierarchy and tier system
- Season lifecycle management
- Gameweek progression logic
- Transfer deadline enforcement
```

### **Phase 2: Fantasy Game Logic (Week 2)**

**Goal:** Implement core fantasy soccer mechanics

#### **2.1 Fantasy Team Tests**

```typescript
// Fantasy Rules to Test:
- Squad composition (GK, DEF, MID, FWD constraints)
- Budget management and player pricing
- Transfer system (free transfers, costs)
- Captain/Vice-captain selection
- Formation validation
```

#### **2.2 Player Statistics Tests**

```typescript
// Scoring Rules to Test:
- Fantasy points calculation algorithm
- Performance stat aggregation
- Price change mechanics
- Popularity tracking
- Form calculation
```

#### **2.3 Match & Scoring Tests**

```typescript
// Live Game Rules to Test:
- Real-time score updates
- Player performance tracking
- Fantasy point allocation
- Gameweek completion logic
```

### **Phase 3: User & Authentication (Week 3)**

**Goal:** Secure user management and authorization

#### **3.1 User Management Tests**

```typescript
// User Rules to Test:
- Registration and email verification
- Password security requirements
- Profile management
- Subscription tier enforcement
- Leaderboard ranking
```

#### **3.2 Authentication Tests**

```typescript
// Auth Rules to Test:
- Login/logout flows
- JWT token management
- Role-based access control
- Session handling
- Password reset flows
```

### **Phase 4: Integration & API (Week 4)**

**Goal:** External integrations and GraphQL API

#### **4.1 SportMonks Integration Tests**

```typescript
// API Integration Rules to Test:
- Data synchronization accuracy
- Rate limiting compliance
- Error handling and retry logic
- Data transformation and mapping
- Webhook processing
```

#### **4.2 GraphQL Schema Tests**

```typescript
// API Contract Rules to Test:
- Type-GraphQL schema generation
- Query/mutation validation
- Input/output type safety
- Error handling and formatting
- Performance and caching
```

---

## **🏗️ Test Architecture**

### **Directory Structure**

```txt
src/tests/
├── unit/                 # Pure business logic
│   ├── entities/         # Domain models
│   ├── services/         # Business services
│   └── utils/           # Helper functions
├── integration/          # Database + external APIs
│   ├── database/        # MongoDB operations
│   ├── graphql/         # GraphQL resolvers
│   └── sportmonks/      # SportMonks API
├── e2e/                 # End-to-end scenarios
│   ├── user-flows/      # Complete user journeys
│   └── admin-flows/     # Admin functionality
├── fixtures/            # Test data factories
└── helpers/             # Test utilities
```

### **Testing Stack**

- **Test Runner:** Vitest (already configured)
- **Mocking:** Vitest mocks + MSW for API mocking
- **Database:** MongoDB Memory Server for isolation
- **Type Safety:** TypeScript strict mode + custom type guards
- **Assertions:** Vitest expect + custom domain matchers

---

## **📋 Implementation Steps**

### **Step 1: Test Foundation (Day 1)**

1. **Set up test database** (MongoDB Memory Server)
2. **Create test data factories** (typed fixtures)
3. **Configure domain-specific matchers**
4. **Establish testing utilities**

### **Step 2: Player Entity TDD (Days 2-3)**

1. **Write failing tests** for Player business rules
2. **Implement minimal Player entity** (type-safe)
3. **Add validation logic** driven by tests
4. **Refactor with proper types**

### **Step 3: Team & League TDD (Days 4-5)**

1. **Write failing tests** for Team/League relationships
2. **Implement entities** with proper associations
3. **Add business rule validation**
4. **Test league hierarchy logic**

### **Step 4: Fantasy Logic TDD (Days 6-8)**

1. **Write failing tests** for fantasy team rules
2. **Implement squad constraints** and validation
3. **Add scoring algorithm** with comprehensive tests
4. **Test transfer system** mechanics

### **Step 5: Integration Testing (Days 9-10)**

1. **Mock SportMonks API** responses
2. **Test data synchronization** flows
3. **Validate GraphQL schema** generation
4. **End-to-end user scenarios**

---

## **🎨 Example Test Structure**

```typescript
// Example: Fantasy Team Budget Tests
describe('FantasyTeam Budget Management', () => {
  describe('when creating a new fantasy team', () => {
    it('should start with standard budget of £100m', () => {
      const team = FantasyTeam.create({
        name: 'Test Team',
        userId: 'user-123',
        seasonId: 'season-456'
      });
      
      expect(team.budget).toBe(100.0);
      expect(team.remainingBudget).toBe(100.0);
    });
  });

  describe('when adding players to squad', () => {
    it('should deduct player cost from remaining budget', () => {
      const team = createFantasyTeam();
      const player = createPlayer({ price: 8.5 });
      
      team.addPlayer(player);
      
      expect(team.remainingBudget).toBe(91.5);
      expect(team.totalValue).toBe(8.5);
    });

    it('should prevent adding player if insufficient budget', () => {
      const team = createFantasyTeam({ remainingBudget: 5.0 });
      const expensivePlayer = createPlayer({ price: 8.5 });
      
      expect(() => team.addPlayer(expensivePlayer))
        .toThrow('Insufficient budget');
    });
  });
});
```

---

## **🚀 Benefits of This TDD Approach**

1. **Type Safety First:** Every test forces proper TypeScript usage
2. **Domain-Driven:** Tests reflect real fantasy soccer rules
3. **Incremental:** Build complexity gradually with confidence
4. **Regression Prevention:** Comprehensive test coverage
5. **Documentation:** Tests serve as living specifications
6. **Refactoring Safety:** Change code with confidence

---

## **📊 Success Metrics**

- **100% TypeScript strict compliance** (no 'any' types)
- **90%+ test coverage** on business logic
- **Zero regression bugs** in fantasy scoring
- **Fast feedback loop** (<30s test runs)
- **Clear domain boundaries** and responsibilities

---

## **🔄 Current Progress**

### **Completed:**

- [x] Project analysis and TDD plan creation
- [x] Test foundation analysis
- [x] Domain modeling strategy

### **Next Steps:**

1. **Start with Step 1: Test Foundation**
   - Set up MongoDB Memory Server
   - Create test data factories
   - Configure domain-specific matchers

2. **Begin Player Entity TDD Cycle**
   - Write failing tests for Player business rules
   - Implement type-safe Player entity
   - Add validation driven by tests

### **Decision Points:**

- Which phase to tackle first?
- Preferred test granularity level?
- Integration test scope and timing?

---

**Last Updated:** 2025-08-16  
**Status:** Ready to begin implementation  
**Next Session:** Start with Test Foundation setup
