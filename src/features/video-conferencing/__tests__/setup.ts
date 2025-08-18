/**
 * Test Setup Configuration
 * Global setup for video conferencing tests
 */
import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";

// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";
  process.env.REDIS_URL = "redis://localhost:6379/1";

  // Mock external services
  process.env.GOOGLE_CLIENT_ID = "test-google-client-id";
  process.env.GOOGLE_CLIENT_SECRET = "test-google-client-secret";
  process.env.ZOOM_CLIENT_ID = "test-zoom-client-id";
  process.env.ZOOM_CLIENT_SECRET = "test-zoom-client-secret";
  process.env.VIMEO_CLIENT_ID = "test-vimeo-client-id";
  process.env.VIMEO_CLIENT_SECRET = "test-vimeo-client-secret";
});

afterAll(() => {
  // Cleanup after all tests
});

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
  vi.restoreAllMocks();
});

// Global test utilities
export const createMockUser = (
  role: string = "ADMIN",
  id: string = "test-user-123"
) => ({
  id,
  email: `${role.toLowerCase()}@example.com`,
  name: `Test ${role}`,
  role,
});

export const createMockVideoSpace = (overrides: any = {}) => ({
  id: "space-123",
  title: "Test Meeting",
  description: "Test Description",
  provider: "GOOGLE_MEET",
  meetingId: "meet-123",
  meetingUrl: "https://meet.google.com/abc-defg-hij",
  status: "SCHEDULED",
  scheduledStartTime: new Date("2024-01-15T10:00:00Z"),
  scheduledEndTime: new Date("2024-01-15T12:00:00Z"),
  maxParticipants: 100,
  settings: { recording: true },
  createdById: "user-123",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockPrismaClient = () => ({
  videoSpace: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  linkAlias: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  meetingAnalytics: {
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  participantData: {
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  chatMessage: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  transcriptionSegment: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  integrationAccount: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
  $queryRaw: vi.fn(),
  $queryRawUnsafe: vi.fn(),
});

export const createMockProviderService = (provider: string) => {
  const baseService = {
    isAuthenticated: vi.fn().mockReturnValue(true),
    getAuthUrl: vi.fn(),
    handleCallback: vi.fn(),
    refreshToken: vi.fn(),
  };

  switch (provider) {
    case "GOOGLE_MEET":
      return {
        ...baseService,
        createSpace: vi.fn(),
        getSpace: vi.fn(),
        updateSpace: vi.fn(),
        deleteSpace: vi.fn(),
        listSpaces: vi.fn(),
        getSpaceAnalytics: vi.fn(),
      };

    case "ZOOM":
      return {
        ...baseService,
        createMeeting: vi.fn(),
        getMeeting: vi.fn(),
        updateMeeting: vi.fn(),
        deleteMeeting: vi.fn(),
        listMeetings: vi.fn(),
        getMeetingAnalytics: vi.fn(),
      };

    case "VIMEO":
      return {
        ...baseService,
        createLiveEvent: vi.fn(),
        getLiveEvent: vi.fn(),
        updateLiveEvent: vi.fn(),
        deleteLiveEvent: vi.fn(),
        listLiveEvents: vi.fn(),
        getEventAnalytics: vi.fn(),
      };

    default:
      return baseService;
  }
};

export const waitForAsync = (ms: number = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const expectToThrowAsync = async (
  fn: () => Promise<any>,
  expectedError?: string | RegExp
) => {
  try {
    await fn();
    throw new Error("Expected function to throw, but it did not");
  } catch (error) {
    if (expectedError) {
      if (typeof expectedError === "string") {
        expect((error as Error).message).toContain(expectedError);
      } else {
        expect((error as Error).message).toMatch(expectedError);
      }
    }
    return error;
  }
};

// Mock fetch for API tests
global.fetch = vi.fn();

// Mock window object for frontend tests
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    origin: "http://localhost:3000",
    pathname: "/",
    search: "",
    hash: "",
  },
  writable: true,
});

Object.defineProperty(window, "navigator", {
  value: {
    userAgent: "Mozilla/5.0 (Test Browser)",
  },
  writable: true,
});

// Console spy utilities
export const spyOnConsole = () => {
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
  };

  const spies = {
    log: vi.spyOn(console, "log").mockImplementation(() => {}),
    error: vi.spyOn(console, "error").mockImplementation(() => {}),
    warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
    info: vi.spyOn(console, "info").mockImplementation(() => {}),
    debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
  };

  return {
    spies,
    restore: () => {
      Object.assign(console, originalConsole);
      Object.values(spies).forEach((spy) => spy.mockRestore());
    },
  };
};

// Test data generators
export const generateTestVideoSpaces = (count: number) => {
  return Array.from({ length: count }, (_, index) =>
    createMockVideoSpace({
      id: `space-${index + 1}`,
      title: `Test Meeting ${index + 1}`,
      provider: ["GOOGLE_MEET", "ZOOM", "VIMEO"][index % 3],
      createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000), // Stagger dates
    })
  );
};

export const generateTestAnalytics = (meetingId: string) => ({
  meetingId,
  totalParticipants: Math.floor(Math.random() * 100) + 1,
  averageEngagement: Math.random(),
  totalDuration: Math.floor(Math.random() * 7200) + 1800, // 30min to 2h
  chatMessages: Math.floor(Math.random() * 50),
  recordings: [`recording-${meetingId}.mp4`],
  transcription: `Transcription for ${meetingId}`,
  participants: Array.from(
    { length: Math.floor(Math.random() * 20) + 1 },
    (_, i) => ({
      id: `participant-${i + 1}`,
      name: `Participant ${i + 1}`,
      email: `participant${i + 1}@example.com`,
      joinTime: new Date(),
      leaveTime: new Date(Date.now() + Math.random() * 3600000),
      engagementScore: Math.random(),
    })
  ),
});

// Error simulation utilities
export const simulateNetworkError = () => {
  throw new Error("Network request failed");
};

export const simulateTimeoutError = () => {
  throw new Error("Request timeout");
};

export const simulateAuthError = () => {
  throw new Error("401 Unauthorized");
};

export const simulateRateLimitError = () => {
  throw new Error("429 Too Many Requests");
};

export const simulateServerError = () => {
  throw new Error("500 Internal Server Error");
};

// Performance testing utilities
export const measureExecutionTime = async (fn: () => Promise<any>) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return {
    result,
    executionTime: end - start,
  };
};

export const expectExecutionTimeUnder = async (
  fn: () => Promise<any>,
  maxTime: number
) => {
  const { executionTime } = await measureExecutionTime(fn);
  expect(executionTime).toBeLessThan(maxTime);
};

// Memory testing utilities
export const getMemoryUsage = () => {
  if (typeof process !== "undefined" && process.memoryUsage) {
    return process.memoryUsage();
  }
  return null;
};

export const expectMemoryUsageUnder = (maxHeapUsed: number) => {
  const usage = getMemoryUsage();
  if (usage) {
    expect(usage.heapUsed).toBeLessThan(maxHeapUsed);
  }
};
