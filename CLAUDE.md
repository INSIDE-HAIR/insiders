# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Next.js development server with Turbopack
- **Build**: `npm run build` - Creates production build
- **Start**: `npm start` - Starts production server
- **Linting**: `npm run lint` - Runs ESLint
- **Type checking**: `npm run type-check` - Runs TypeScript type checking without emitting
- **Testing**: `npm run test` - Runs Vitest tests
- **Database**: 
  - `npm run postinstall` - Generates Prisma client (runs automatically after install)
  - `npm run seed` - Seeds the database with initial data
- **API Key Management**:
  - `npm run generate-api-key` - Generates new API keys
  - `npm run list-api-keys` - Lists existing API keys
  - `npm run revoke-api-key` - Revokes API keys

## Architecture Overview

This is a Next.js 15 application with the following key architectural components:

### Tech Stack
- **Framework**: Next.js 15 with App Router and Turbopack for development
- **Database**: MongoDB with Prisma ORM (modular schema structure)
- **Authentication**: NextAuth.js v5 (JWT strategy) with multiple providers (Credentials, Google, GitHub, Resend)
- **UI**: Tailwind CSS with shadcn/ui components and Radix UI primitives
- **Rich Text**: Quill editor for rich text editing capabilities
- **File Storage**: Google Drive API integration with custom upload management
- **State Management**: Zustand for client-side state management
- **Internationalization**: Multi-language support (Spanish/English)
- **Testing**: Vitest with React Testing Library and jsdom environment

### Project Structure

- **`src/app/[lang]/`** - App Router with internationalization support
  - **`(public)/auth/`** - Public authentication pages
  - **`admin/`** - Admin-only pages (drive management, users, holded integration)
  - **`marketing-salon/`** - Marketing salon specific features
  - **`training/`** - Training modules

- **`src/features/drive/`** - Core Google Drive integration feature
  - Complete service layer for Google Drive API
  - File/folder hierarchy management and processing
  - Upload management with resumable and direct upload support
  - Custom metadata processing and file analysis

- **`src/components/`** - Reusable UI components
  - **`drive/`** - Drive-specific components (upload managers, file renderers)
  - **`ui/`** - shadcn/ui components
  - **`shared/`** - Common shared components

- **`src/config/auth/`** - Authentication configuration with NextAuth.js
- **`src/middleware/`** - Request middleware (auth, i18n)
- **`prisma/schema/`** - Modular Prisma schema files

### Key Features

1. **Google Drive Integration**: Full-featured Google Drive management with file upload, download, and organization
2. **Role-based Access Control**: Admin/User roles with different permissions
3. **Multi-tenant Architecture**: Support for different clients and campaigns
4. **File Upload System**: Multiple upload strategies (direct, resumable, enhanced)
5. **Content Management**: Dynamic component rendering system for marketing materials
6. **Holded Integration**: CRM integration for contact management

### Path Aliases

The project uses TypeScript path aliases:
- `@/*` - Root directory
- `@src/*` - Source directory
- `@drive/*` - Drive features directory (`./src/features/drive/*`)
- `@drive-components/*` - Drive UI components (`./src/app/[lang]/(marketing)/drive/components/*`)
- `@ui/*` - UI components directory (`./src/components/ui/*`)
- `@types/*` - Type definitions directory (`./src/types/*`)

### Environment Configuration

The application supports both development and production modes with specific Google Drive upload configurations based on NODE_ENV.

### Database Schema

Uses a modular Prisma schema approach with separate files for different domains:
- User management and authentication
- Drive and media management
- Forms and services
- Holded CRM integration
- Access control and permissions

## Video Conferencing Modules Integration

### 🎯 Current Development Phase: Meet, Zoom & Vimeo Integration

This project includes comprehensive video conferencing platform integrations:

#### **Phase 1: Google Meet (Active Development)**
- **Location**: `src/features/meet/` (following Drive/Calendar patterns)
- **Documentation**: `docs/meet/` - Complete types and validations
- **Integration**: Enhanced Google Calendar integration with Meet API v2
- **Features**: Space management, automated recordings, transcriptions, analytics

#### **Phase 2: Zoom & Vimeo (Prepared)**
- **Zoom**: `src/features/zoom/` - Meeting/webinar management, recording integration
- **Vimeo**: `src/features/vimeo/` - Professional video management, analytics
- **Documentation**: `docs/zoom/` and `docs/vimeo/` - Complete API coverage

#### **Path Aliases for Video Modules**
- `@meet/*` - Meet features directory (`./src/features/meet/*`)
- `@zoom/*` - Zoom features directory (`./src/features/zoom/*`)  
- `@vimeo/*` - Vimeo features directory (`./src/features/vimeo/*`)

#### **📚 Documentation Hub**
- **Main Index**: `docs/README.md` - Complete navigation guide for agents/developers
- **Architecture**: `README-MEET-ZOOM-ARCHITECTURE.md` - Technical architecture overview
- **Requirements**: `docs/prd/PRD-VIDEO-CONFERENCING-MODULES.md` - User stories and specifications
- **Development**: `docs/tickets/DEVELOPMENT-TICKETS.md` - 23 tickets across 9 sprints

#### **🔄 Development Workflow**
1. **Before starting**: Check `docs/README.md` for current phase and ticket details
2. **Implementation**: Copy types/validations from `docs/{module}/` to `src/features/{module}/`
3. **After completion**: Update tickets in `docs/tickets/DEVELOPMENT-TICKETS.md`
4. **API changes**: Update both docs and implementation, sync back to documentation

#### **🎯 Implementation Guidelines**
- Follow existing Drive/Calendar service patterns
- Use comprehensive TypeScript types and Zod validations (pre-built)
- Implement OAuth2 authentication following existing patterns  
- Build modular services with proper error handling and logging
- Maintain consistency across all video platforms

## Development Notes

- The codebase extensively uses TypeScript with strict mode enabled and `noUncheckedIndexedAccess` for enhanced type safety
- Development server uses Turbopack for faster builds and hot reloading
- All authentication flows support both OAuth providers and traditional credentials
- The Google Drive integration includes comprehensive file processing with metadata extraction
- Admin users have additional upload and management capabilities including API key management
- The application includes extensive error handling and logging for drive operations
- Calendar integration includes Google Meet functionality and bulk event management
- Rich text editing is handled via Quill editor with custom styling
- **Video conferencing modules** follow established patterns and include complete documentation in `docs/` folder