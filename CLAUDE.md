# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Next.js development server
- **Build**: `npm run build` - Creates production build
- **Start**: `npm start` - Starts production server
- **Linting**: `npm run lint` - Runs ESLint
- **Testing**: `npm run test` - Runs Vitest tests
- **Database**: 
  - `npm run postinstall` - Generates Prisma client (runs automatically after install)
  - `npm run seed` - Seeds the database with initial data

## Architecture Overview

This is a Next.js 14 application with the following key architectural components:

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Database**: MongoDB with Prisma ORM (modular schema structure)
- **Authentication**: NextAuth.js v5 (JWT strategy) with multiple providers (Credentials, Google, GitHub, Resend)
- **UI**: Tailwind CSS with shadcn/ui components and Radix UI primitives
- **File Storage**: Google Drive API integration with custom upload management
- **Internationalization**: Multi-language support (Spanish/English)
- **Testing**: Vitest with React Testing Library

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
- `@drive/*` - Drive features directory
- `@drive-components/*` - Drive UI components
- `@ui/*` - UI components directory

### Environment Configuration

The application supports both development and production modes with specific Google Drive upload configurations based on NODE_ENV.

### Database Schema

Uses a modular Prisma schema approach with separate files for different domains:
- User management and authentication
- Drive and media management
- Forms and services
- Holded CRM integration
- Access control and permissions

## Development Notes

- The codebase extensively uses TypeScript with strict mode enabled
- All authentication flows support both OAuth providers and traditional credentials
- The Google Drive integration includes comprehensive file processing with metadata extraction
- Admin users have additional upload and management capabilities
- The application includes extensive error handling and logging for drive operations