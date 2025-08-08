# Video Conferencing Modules Documentation Index

## 📋 Navigation Guide for Development Teams

This documentation structure provides comprehensive guidance for implementing Google Meet, Zoom, and Vimeo integrations. Each module follows consistent patterns and includes complete implementation details.

---

## 🗂️ Documentation Structure

### 📁 Core Documentation
- **[README.md](README.md)** - This index file (update after major changes)
- **[README-MEET-ZOOM-ARCHITECTURE.md](../README-MEET-ZOOM-ARCHITECTURE.md)** - Main architecture overview
- **[CLAUDE.md](../CLAUDE.md)** - Main project instructions for Claude Code agents

### 📁 Product Requirements
- **[PRD-VIDEO-CONFERENCING-MODULES.md](prd/PRD-VIDEO-CONFERENCING-MODULES.md)**
  - 15 user stories across 4 epics
  - Success metrics and KPIs
  - Implementation roadmap
  - **Update when**: Adding new features, changing requirements, sprint planning

### 📁 Development Planning
- **[DEVELOPMENT-TICKETS.md](tickets/DEVELOPMENT-TICKETS.md)**
  - 23 detailed development tickets
  - 9-sprint timeline with resource allocation
  - Technical specifications and acceptance criteria
  - **Update when**: Sprint planning, ticket completion, scope changes

---

## 🎯 Module-Specific Documentation

### 🟢 Google Meet (Phase 1 - Active Development)

#### Types & Validations
- **[meet/types.ts](meet/types.ts)** - Complete TypeScript definitions
  - OAuth2 and authentication types
  - Calendar integration interfaces
  - Meet API v2 comprehensive types
  - **Update when**: API changes, new features, type refinements

- **[meet/validations.ts](meet/validations.ts)** - Zod validation schemas
  - All Meet API endpoints covered
  - Calendar integration validations
  - Advanced features and analytics schemas
  - **Update when**: Adding new endpoints, changing validation rules

#### Implementation Locations
```
src/features/meet/
├── types/           # Copy from docs/meet/types.ts
├── validations/     # Copy from docs/meet/validations.ts
├── services/
│   ├── auth/       # GoogleMeetAuthProvider
│   ├── meet/       # GoogleMeetService
│   └── recording/  # MeetRecordingService
└── components/     # Meet UI components
```

---

### 🔵 Zoom (Phase 2 - Prepared)

#### Types & Validations
- **[zoom/types.ts](zoom/types.ts)** - Complete TypeScript definitions
  - Meeting and webinar management
  - Participant and recording interfaces
  - Webhook and analytics types
  - **Update when**: Zoom API updates, new feature requirements

- **[zoom/validations.ts](zoom/validations.ts)** - Zod validation schemas
  - Meeting creation and management
  - Webinar configuration
  - Participant and recording operations
  - **Update when**: API endpoint changes, new validation needs

#### Implementation Locations (Future)
```
src/features/zoom/
├── types/           # Copy from docs/zoom/types.ts
├── validations/     # Copy from docs/zoom/validations.ts
├── services/
│   ├── auth/       # ZoomAuthProvider
│   ├── meetings/   # ZoomMeetingService
│   └── webinars/   # ZoomWebinarService
└── components/     # Zoom UI components
```

---

### 🟣 Vimeo (Phase 2 - Prepared)

#### Types & Validations
- **[vimeo/types.ts](vimeo/types.ts)** - Complete TypeScript definitions
  - Video management and upload interfaces
  - Analytics and player configuration
  - Live streaming and team collaboration
  - **Update when**: Vimeo API updates, new feature requirements

- **[vimeo/validations.ts](vimeo/validations.ts)** - Zod validation schemas
  - Video upload and management
  - Album and folder organization
  - Analytics queries and player settings
  - **Update when**: API changes, new validation requirements

#### Implementation Locations (Future)
```
src/features/vimeo/
├── types/           # Copy from docs/vimeo/types.ts
├── validations/     # Copy from docs/vimeo/validations.ts
├── services/
│   ├── auth/       # VimeoAuthProvider
│   ├── video/      # VimeoVideoService
│   └── analytics/  # VimeoAnalyticsService
└── components/     # Vimeo UI components
```

---

## 🔄 Development Workflow Guide

### 📌 Before Starting a New Ticket

1. **Check Current Phase**
   - Review [DEVELOPMENT-TICKETS.md](tickets/DEVELOPMENT-TICKETS.md) for current sprint
   - Verify dependencies and prerequisites
   - Confirm acceptance criteria

2. **Reference Architecture**
   - Follow patterns from existing Drive/Calendar modules
   - Check [README-MEET-ZOOM-ARCHITECTURE.md](../README-MEET-ZOOM-ARCHITECTURE.md)
   - Use path aliases: `@meet/*`, `@zoom/*`, `@vimeo/*`

3. **Copy Documentation Assets**
   - Types: `docs/{module}/types.ts` → `src/features/{module}/types/`
   - Validations: `docs/{module}/validations.ts` → `src/features/{module}/validations/`
   - Split into logical modules as needed

### 📝 After Completing a Task

1. **Update Development Tickets**
   - Mark ticket as completed in [DEVELOPMENT-TICKETS.md](tickets/DEVELOPMENT-TICKETS.md)
   - Add any new tasks discovered during implementation
   - Update effort estimates if needed

2. **Update Types/Validations (if modified)**
   - Sync changes back to documentation files
   - Update this README.md if structure changed
   - Document any API changes or new patterns

3. **Update Architecture Documentation**
   - Add new services to [README-MEET-ZOOM-ARCHITECTURE.md](../README-MEET-ZOOM-ARCHITECTURE.md)
   - Document integration patterns
   - Update API endpoint listings

4. **Update Main Project Instructions**
   - Update [CLAUDE.md](../CLAUDE.md) if new path aliases or major changes
   - Document new development commands or workflows
   - Update architecture overview if needed

---

## 🚀 Quick Reference by Use Case

### 🔍 I need to find...

| Looking for... | Go to... |
|----------------|----------|
| **Project overview & setup** | [CLAUDE.md](../CLAUDE.md) |
| **User stories and requirements** | [prd/PRD-VIDEO-CONFERENCING-MODULES.md](prd/PRD-VIDEO-CONFERENCING-MODULES.md) |
| **Current sprint tasks** | [tickets/DEVELOPMENT-TICKETS.md](tickets/DEVELOPMENT-TICKETS.md) |
| **Meet API types** | [meet/types.ts](meet/types.ts) |
| **Meet validations** | [meet/validations.ts](meet/validations.ts) |
| **Zoom API types** | [zoom/types.ts](zoom/types.ts) |
| **Zoom validations** | [zoom/validations.ts](zoom/validations.ts) |
| **Vimeo API types** | [vimeo/types.ts](vimeo/types.ts) |
| **Vimeo validations** | [vimeo/validations.ts](vimeo/validations.ts) |
| **Overall architecture** | [README-MEET-ZOOM-ARCHITECTURE.md](../README-MEET-ZOOM-ARCHITECTURE.md) |

### 🛠️ I need to implement...

| Implementation Task | Reference Files | Implementation Path |
|-------------------|----------------|-------------------|
| **Meet authentication** | [meet/types.ts](meet/types.ts), [meet/validations.ts](meet/validations.ts) | `src/features/meet/services/auth/` |
| **Meet space management** | [meet/types.ts](meet/types.ts), [meet/validations.ts](meet/validations.ts) | `src/features/meet/services/meet/` |
| **Meet recording integration** | [meet/types.ts](meet/types.ts), [meet/validations.ts](meet/validations.ts) | `src/features/meet/services/recording/` |
| **Zoom meeting management** | [zoom/types.ts](zoom/types.ts), [zoom/validations.ts](zoom/validations.ts) | `src/features/zoom/services/meetings/` |
| **Vimeo video management** | [vimeo/types.ts](vimeo/types.ts), [vimeo/validations.ts](vimeo/validations.ts) | `src/features/vimeo/services/video/` |
| **Cross-platform analytics** | All module types | `src/features/analytics/services/` |

### 📊 I need to update...

| After completing... | Update these files... |
|-------------------|---------------------|
| **Sprint planning** | [tickets/DEVELOPMENT-TICKETS.md](tickets/DEVELOPMENT-TICKETS.md) |
| **New requirements** | [prd/PRD-VIDEO-CONFERENCING-MODULES.md](prd/PRD-VIDEO-CONFERENCING-MODULES.md) |
| **API changes** | Module-specific types.ts and validations.ts |
| **New services** | [README-MEET-ZOOM-ARCHITECTURE.md](../README-MEET-ZOOM-ARCHITECTURE.md) |
| **Path aliases or major changes** | [CLAUDE.md](../CLAUDE.md) |
| **Documentation structure** | [docs/README.md](README.md) (this file) |

---

## 📋 Implementation Checklist Template

### ✅ Starting a New Ticket
- [ ] Check project overview in [CLAUDE.md](../CLAUDE.md)
- [ ] Read ticket specifications in [DEVELOPMENT-TICKETS.md](tickets/DEVELOPMENT-TICKETS.md)
- [ ] Copy relevant types from `docs/{module}/types.ts`
- [ ] Copy relevant validations from `docs/{module}/validations.ts`
- [ ] Review existing patterns in Drive/Calendar modules
- [ ] Set up proper path aliases and imports

### ✅ During Implementation
- [ ] Follow TypeScript strict mode requirements
- [ ] Use existing authentication patterns
- [ ] Implement proper error handling
- [ ] Add comprehensive logging
- [ ] Write unit tests (>90% coverage)

### ✅ Completing a Ticket
- [ ] Mark ticket complete in [DEVELOPMENT-TICKETS.md](tickets/DEVELOPMENT-TICKETS.md)
- [ ] Update types/validations if modified
- [ ] Run linting and type checking
- [ ] Update architecture docs if new services added
- [ ] Update [CLAUDE.md](../CLAUDE.md) if path aliases or major changes
- [ ] Update this README.md if structure changed

---

## 🎯 Phase Implementation Status

### Phase 1: Google Meet Integration (In Progress)
- ✅ Types and validations prepared
- 🟡 Authentication service (Ticket #4)
- 🔲 Core Meet service (Ticket #5)
- 🔲 API endpoints (Ticket #7)
- 🔲 Calendar integration enhancement (Ticket #8)

### Phase 2: Vimeo & Zoom Integration (Prepared)
- ✅ Types and validations prepared
- 🔲 Authentication services
- 🔲 Core API services
- 🔲 Advanced features

### Phase 3: Unified Platform Features (Planned)
- 🔲 Cross-platform analytics
- 🔲 Automated workflows
- 🔲 Mobile optimization

---

## 📞 Support and Maintenance

### 🔧 When API Changes Occur
1. Update module-specific types.ts file
2. Update module-specific validations.ts file
3. Test all affected services
4. Update implementation code if needed
5. Update [CLAUDE.md](../CLAUDE.md) if major changes
6. Update this documentation index

### 📚 When Adding New Features
1. Add user story to [PRD](prd/PRD-VIDEO-CONFERENCING-MODULES.md)
2. Create development ticket in [DEVELOPMENT-TICKETS.md](tickets/DEVELOPMENT-TICKETS.md)
3. Update relevant types and validations
4. Update [CLAUDE.md](../CLAUDE.md) if new path aliases needed
5. Follow implementation workflow above

### 🚨 Emergency Updates
For critical API changes or security updates, prioritize:
1. Authentication services first
2. Core functionality second  
3. Advanced features third
4. Update [CLAUDE.md](../CLAUDE.md) for critical changes
5. Update documentation last

---

**Last Updated**: 2025-01-08  
**Next Review**: Weekly during sprint planning  
**Maintained By**: Development Team  
**Agent Instructions**: Always check [CLAUDE.md](../CLAUDE.md) for project overview, then this index for specific documentation. Update relevant sections after completing tasks.