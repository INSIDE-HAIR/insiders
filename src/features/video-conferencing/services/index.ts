/**
 * Video Conferencing Services - Main Export
 * Provides unified access to all video conferencing services
 */

// Main orchestrator service
export { VideoConferencingService } from "./VideoConferencingService";

// Provider-specific services
export { GoogleMeetService } from "./providers/GoogleMeetService";
export { ZoomService } from "./providers/ZoomService";
export { VimeoService } from "./providers/VimeoService";

// Authentication providers
export { GoogleMeetAuthProvider } from "./auth/GoogleMeetAuthProvider";
export { ZoomAuthProvider } from "./auth/ZoomAuthProvider";
export { VimeoAuthProvider } from "./auth/VimeoAuthProvider";

// Specialized services
export { AnalyticsService } from "./analytics/AnalyticsService";
export { ReportingService } from "./analytics/ReportingService";
export { WebhookService } from "./webhooks/WebhookService";

// Service interfaces and types
export type {
  IVideoConferencingService,
  IProviderService,
  IAuthProvider,
  IAnalyticsService,
  IReportingService,
  IWebhookService,
} from "./interfaces";

// Error classes
export {
  VideoConferencingError,
  ProviderAuthError,
  RoomCreationError,
  WebhookValidationError,
} from "./errors";
