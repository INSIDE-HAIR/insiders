# Google Meet API Versions Usage

Este documento detalla qué versiones de la API de Google Meet usamos para diferentes funcionalidades.

## ✅ API v2beta

### Members Management
- **Service**: `MeetMembersService.ts`  
- **Endpoints**: 
  - `spaces/{spaceId}/members` - List, Create, Delete members
  - `spaces/{spaceId}/members/{memberId}` - Get, Update member
- **Reason**: Member management requires Developer Preview access and advanced features

### Space Configuration  
- **Service**: `MeetSpaceConfigService.ts`
- **Endpoints**:
  - `spaces` - Create space with full config
  - `spaces/{spaceId}` - Update space config
- **Reason**: Advanced configuration options and settings

### Settings/Restrictions
- **Service**: `/api/meet/rooms/[id]/settings`
- **Endpoints**:
  - `spaces/{spaceId}` - Get/Update moderationRestrictions, artifactConfig
- **Reason**: Consistency with other space configuration services

## ⚠️ Important Notes

1. **Developer Preview**: v2beta features may require Google Workspace Developer Preview enrollment
2. **Consistency**: All space-related configuration uses v2beta for feature compatibility
3. **Fallback Strategy**: Services attempt v2 first, then fallback to v2beta when needed
4. **Scopes Required**: 
   - `meetings.space.created` - For creating and full management
   - `meetings.space.settings` - For updating configurations
   - `meetings.space.readonly` - For reading configurations

## 🔄 Migration Strategy

If Google promotes v2beta features to v2 stable:
1. Update base URLs in respective services
2. Test thoroughly with existing functionality  
3. Remove fallback logic where no longer needed
4. Update documentation and comments

---
Last updated: 2024-08-23