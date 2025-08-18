# Project Structure

## Root Level Organization

- **Configuration files**: Next.js, TypeScript, Tailwind, Prisma configs at root
- **Documentation**: Multiple README files for different features and guides
- **Database**: JSON data files and Prisma schemas
- **Scripts**: Utility scripts for API keys, testing, and debugging

## Source Code Structure (`src/`)

### App Directory (`src/app/`)

Next.js App Router structure with internationalization:

```
src/app/
├── [lang]/                    # Internationalized routes
│   ├── (private)/            # Protected routes (admin, profile)
│   ├── (public)/             # Public routes (auth, marketing pages)
│   ├── [...path]/            # Dynamic catch-all routes
│   ├── marketing-salon/      # Business-specific module
│   └── unauthorized/         # Access denied page
└── api/                      # API routes
    ├── admin/               # Admin management APIs
    ├── auth/                # Authentication endpoints
    ├── calendar/            # Calendar integration APIs
    ├── drive/               # File management APIs
    ├── video-conferencing/  # Video platform APIs
    └── v1/                  # Versioned API endpoints
```

### Components (`src/components/`)

Organized by purpose and reusability:

```
src/components/
├── ui/                      # Reusable UI primitives (shadcn/ui style)
├── shared/                  # Common shared components
├── custom/                  # Business-specific components
├── drive/                   # Drive feature components
├── guards/                  # Route protection components
├── admin/                   # Admin-specific components
└── timer/                   # Timer/countdown components
```

### Features (`src/features/`)

Feature-based organization for major modules:

```
src/features/
├── calendar/               # Calendar functionality
├── drive/                  # File management
├── settings/               # Application settings
└── video-conferencing/     # Video platform integrations
```

### Core Directories

- **`src/lib/`**: Utilities, services, and business logic
- **`src/types/`**: TypeScript type definitions
- **`src/hooks/`**: Custom React hooks
- **`src/context/`**: React context providers
- **`src/middleware/`**: Next.js middleware functions
- **`src/locales/`**: Internationalization files (es/en)

## Database Structure (`prisma/`)

Multi-schema Prisma setup:

```
prisma/
├── schema/                 # Individual schema files
│   ├── schema.prisma      # Main configuration
│   ├── auth.prisma        # Authentication models
│   ├── user.prisma        # User management
│   ├── calendar-kpis.prisma
│   ├── video-conferencing.prisma
│   └── [other-schemas].prisma
└── query/                 # Database query helpers
```

## Data Storage (`db/`)

JSON-based data storage for configuration and content:

```
db/
├── insiders/              # Business data
│   ├── services-data/     # Service configurations
│   └── services-structures/
├── jsons-components/      # UI component definitions
├── marketing-salon/       # Marketing campaign data
└── translations.json      # Translation strings
```

## Path Aliases (tsconfig.json)

- `@/*`: Root directory
- `@src/*`: Source directory
- `@drive/*`: Drive feature
- `@video-conferencing/*`: Video conferencing feature
- `@ui/*`: UI components
- `@types/*`: Type definitions

## Naming Conventions

- **Files**: kebab-case for components, camelCase for utilities
- **Components**: PascalCase React components
- **API routes**: RESTful naming with HTTP methods
- **Database models**: PascalCase Prisma models
- **Types**: PascalCase interfaces and types

## Feature Organization Pattern

Each major feature follows this structure:

```
feature/
├── components/            # Feature-specific components
├── services/             # API calls and business logic
├── types/                # Feature type definitions
├── hooks/                # Feature-specific hooks
├── utils/                # Feature utilities
└── validations/          # Zod schemas for validation
```
