// Settings Feature Types - Using Zod validations for consistency

import {
  ApiKeyStatus,
  ApiKey,
  CreateApiKeyRequest,
  CreateApiKeyRequestInput,
  UpdateApiKeyRequest,
  ApiKeysListResponse as ApiKeysResponse,
  CreateApiKeyResponse,
  ApiKeyStats,
  ApiKeyQueryParams,
  BulkDeleteApiKeys
} from '../validations/api-keys';

// Re-export types and constants from Zod validations to maintain backward compatibility
export {
  ApiKeyStatus,
};

export type {
  ApiKey,
  CreateApiKeyRequest,
  CreateApiKeyRequestInput,
  UpdateApiKeyRequest,
  ApiKeysResponse,
  CreateApiKeyResponse,
  ApiKeyStats,
  ApiKeyQueryParams,
  BulkDeleteApiKeys
};

// Additional utility types for the UI components
export interface ApiKeyCardProps {
  apiKey: ApiKey;
  onEdit?: (apiKey: ApiKey) => void;
  onRevoke?: (keyId: string) => void;
  onRegenerate?: (keyId: string) => void;
}

export interface CreateApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (response: CreateApiKeyResponse) => void;
}

export interface ApiKeySuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey?: ApiKey;
  generatedKey?: string;
  message?: string;
}