# Technology Stack

## Framework & Runtime

- **Next.js 15.4.5**: React framework with App Router
- **React 18.3.1**: UI library
- **TypeScript 5**: Type-safe JavaScript
- **Node.js**: Server runtime

## Database & ORM

- **MongoDB**: Primary database
- **Prisma**: Database ORM with multi-schema setup
- **Prisma Client**: Type-safe database queries

## Authentication & Security

- **NextAuth.js 5.0**: Authentication framework
- **JWT**: Session management strategy
- **bcryptjs**: Password hashing
- **API Key authentication**: Custom middleware for API access

## UI & Styling

- **Tailwind CSS 4.1.11**: Utility-first CSS framework
- **Radix UI**: Headless component primitives
- **HeroUI**: Additional UI components
- **Framer Motion**: Animation library
- **Lucide React**: Icon library

## State Management & Data Fetching

- **TanStack Query (React Query)**: Server state management
- **Zustand**: Client state management
- **React Hook Form**: Form state management
- **Zod**: Schema validation

## External Integrations

- **Google APIs**: Drive, Calendar, Meet integration
- **Zoom SDK**: Video conferencing
- **Vimeo API**: Video management
- **Resend**: Email service
- **Vercel**: Deployment platform

## Development Tools

- **ESLint**: Code linting
- **Vitest**: Testing framework
- **MSW**: API mocking
- **ts-node**: TypeScript execution

## Common Commands

### Development

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Database

```bash
npm run postinstall  # Generate Prisma client
npm run seed         # Seed database
```

### API Keys Management

```bash
npm run generate-api-key  # Generate new API key
npm run list-api-keys     # List existing API keys
npm run revoke-api-key    # Revoke API key
npm run test-api-key      # Test API key functionality
```

### Testing

```bash
npm run test         # Run test suite
```

## Architecture Notes

- App Router with internationalization ([lang] dynamic routes)
- Middleware chain for auth, i18n, and route guards
- Feature-based folder structure
- Multi-schema Prisma setup
- Custom API key authentication system
