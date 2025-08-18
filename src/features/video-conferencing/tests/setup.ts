/**
 * Test setup for Video Conferencing feature tests
 */
import { vi } from "vitest";

// Mock global objects
Object.defineProperty(global, "fetch", {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(global, "Request", {
  value: class MockRequest {
    constructor(
      public url: string,
      public init?: RequestInit
    ) {}
  },
  writable: true,
});

Object.defineProperty(global, "Response", {
  value: class MockResponse {
    constructor(
      public body?: BodyInit | null,
      public init?: ResponseInit
    ) {}

    ok = true;
    status = 200;
    statusText = "OK";

    async json() {
      return JSON.parse(this.body as string);
    }

    async text() {
      return this.body as string;
    }
  },
  writable: true,
});

// Mock Next.js modules
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    entries: vi.fn(),
    forEach: vi.fn(),
    toString: vi.fn(),
  }),
  usePathname: () => "/admin/video-conferencing/spaces",
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: {
      user: {
        id: "test-user-1",
        email: "test@example.com",
        role: "ADMIN",
      },
    },
    status: "authenticated",
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock toast hook
vi.mock("@/src/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock Prisma client
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    videoSpace: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    integrationAccount: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    meetingRecord: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    participant: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    chatMessage: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    linkAlias: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $transaction: vi.fn(),
  })),
}));

// Mock video conferencing services
vi.mock("@/src/features/video-conferencing/services/GoogleMeetService", () => ({
  GoogleMeetService: vi.fn().mockImplementation(() => ({
    createSpace: vi.fn(),
    getSpace: vi.fn(),
    updateSpace: vi.fn(),
    deleteSpace: vi.fn(),
    getMeetingRecords: vi.fn(),
    getParticipants: vi.fn(),
  })),
}));

vi.mock("@/src/features/video-conferencing/services/ZoomService", () => ({
  ZoomService: vi.fn().mockImplementation(() => ({
    createMeeting: vi.fn(),
    getMeeting: vi.fn(),
    updateMeeting: vi.fn(),
    deleteMeeting: vi.fn(),
    getMeetingReports: vi.fn(),
    getParticipants: vi.fn(),
  })),
}));

vi.mock("@/src/features/video-conferencing/services/VimeoService", () => ({
  VimeoService: vi.fn().mockImplementation(() => ({
    createLiveEvent: vi.fn(),
    getLiveEvent: vi.fn(),
    updateLiveEvent: vi.fn(),
    deleteLiveEvent: vi.fn(),
    getAnalytics: vi.fn(),
  })),
}));

// Mock middleware
vi.mock("@/src/features/video-conferencing/middleware/authMiddleware", () => ({
  getCurrentUser: vi.fn().mockResolvedValue({
    id: "test-user-1",
    email: "test@example.com",
    role: "ADMIN",
  }),
}));

vi.mock(
  "@/src/features/video-conferencing/middleware/globalErrorHandler",
  () => ({
    createGlobalErrorHandler: vi.fn().mockReturnValue({
      wrapApiHandler: (handler: Function) => handler,
    }),
  })
);

// Mock React Hook Form
vi.mock("react-hook-form", () => ({
  useForm: () => ({
    register: vi.fn(),
    handleSubmit: vi.fn((fn) => fn),
    formState: { errors: {} },
    reset: vi.fn(),
    setValue: vi.fn(),
    getValues: vi.fn(),
    watch: vi.fn(),
    control: {},
  }),
  Controller: ({ render }: any) =>
    render({ field: {}, fieldState: {}, formState: {} }),
}));

// Mock Zod resolver
vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: vi.fn(),
}));

// Setup console mocks for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  vi.clearAllMocks();
});

// Global test utilities
export const createMockVideoSpace = (overrides = {}) => ({
  id: "test-space-1",
  title: "Test Video Space",
  description: "Test description",
  provider: "GOOGLE_MEET",
  status: "ACTIVE",
  maxParticipants: 100,
  joinUrl: "https://meet.google.com/test-meeting",
  requiresAuth: false,
  recordingEnabled: true,
  chatEnabled: true,
  screenShareEnabled: true,
  waitingRoomEnabled: false,
  integrationAccountId: "integration-1",
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
  _count: { meetingRecords: 0 },
  ...overrides,
});

export const createMockIntegrationAccount = (overrides = {}) => ({
  id: "integration-1",
  provider: "GOOGLE_MEET",
  accountName: "Test Account",
  accountEmail: "test@example.com",
  status: "ACTIVE",
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
  ...overrides,
});

export const createMockMeetingRecord = (overrides = {}) => ({
  id: "meeting-1",
  videoSpaceId: "test-space-1",
  title: "Test Meeting",
  status: "COMPLETED",
  participantCount: 5,
  duration: 3600, // 1 hour in seconds
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
  ...overrides,
});

export const waitForNextTick = () =>
  new Promise((resolve) => setTimeout(resolve, 0));
