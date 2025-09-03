# PRD: Sistema de Gestión de Menús Dinámicos

## 📋 Resumen Ejecutivo

### Objetivo
Desarrollar un sistema de gestión de menús (headers, footers y sidebars) configurable por rol y equipo, reutilizando la arquitectura existente de Tags/Groups de Meet y el sistema de Control de Acceso.

### Alcance
- **Footers**: Público, privado, por rol (6 roles)
- **Headers/Navbar**: Público, privado, por rol
- **Sidebars administrativos**: Por equipo con módulos disponibles
- **Integración**: Con sistema de permisos y control de acceso existente

### Stack Tecnológico
- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Prisma ORM, MongoDB
- **Autenticación**: NextAuth.js v5 con roles existentes
- **Iconos**: Lucide React (biblioteca actual)

---

## 🎯 Objetivos del Producto

### Objetivos Primarios
1. **Centralizar la gestión de menús** en una interfaz administrativa única
2. **Reutilizar componentes existentes** (GroupsManagement, TagsManagement)
3. **Herencia configurable** de menús (público → privado → rol → equipo)
4. **Integración con control de acceso** existente para validación de permisos

### Objetivos Secundarios
- Multi-idioma (ES/EN) utilizando el sistema i18n existente
- Auditoría de cambios en menús
- Preview antes de publicar cambios

---

## 👥 Usuarios y Casos de Uso

### Usuarios
- **Super Admin**: Gestión completa de todos los menús
- **Admin**: Gestión de menús según permisos de equipo
- **Usuarios finales**: Visualización de menús según rol/equipo

### Casos de Uso Principales

#### UC1: Gestión de Footer
1. Admin accede a `/admin/menu/footer`
2. Selecciona tipo: público/privado/por rol
3. Configura items del footer con estructura jerárquica
4. Define herencia o ruptura con plantilla base
5. Guarda cambios

#### UC2: Gestión de Sidebar por Equipo
1. Admin accede a `/admin/menu/sidebar`
2. Selecciona equipo desde selector (como en Meet Groups)
3. Configura módulos disponibles desde `dashboard-routes.ts`
4. Asigna prioridad de sidebar (equipo > rol)
5. Guarda configuración

#### UC3: Herencia de Menús
1. Sistema carga menú público como base
2. Si usuario autenticado, carga menú privado (hereda o rompe)
3. Si tiene rol específico, carga menú de rol
4. Si pertenece a equipo, carga sidebar de equipo

---

## 🏗️ Arquitectura del Sistema

### Modelos de Datos (Reutilizando estructuras existentes)

```prisma
// Nuevo schema: menu.prisma

model MenuConfiguration {
  id              String          @id @default(auto()) @map("_id") @db.ObjectId
  type            MenuType        // HEADER, FOOTER, SIDEBAR
  scope           MenuScope       // PUBLIC, PRIVATE, ROLE, TEAM
  scopeValue      String?         // Valor del rol o equipo
  
  // Estructura jerárquica similar a MeetTag/MeetGroup
  name            String
  slug            String          @unique
  description     String?
  
  // Configuración de herencia
  inheritsFrom    String?         @db.ObjectId
  parentMenu      MenuConfiguration? @relation("MenuInheritance", fields: [inheritsFrom], references: [id])
  childMenus      MenuConfiguration[] @relation("MenuInheritance")
  
  // Items del menú
  items           MenuItem[]
  
  // Metadata
  isActive        Boolean         @default(true)
  isPublished     Boolean         @default(false)
  publishedAt     DateTime?
  createdBy       String?
  updatedBy       String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  // Relación con control de acceso
  accessControlId String?         @db.ObjectId
  accessControl   AccessControl?  @relation(fields: [accessControlId], references: [id])
  
  @@index([type, scope, scopeValue])
  @@index([slug])
}

model MenuItem {
  id              String          @id @default(auto()) @map("_id") @db.ObjectId
  menuId          String          @db.ObjectId
  menu            MenuConfiguration @relation(fields: [menuId], references: [id], onDelete: Cascade)
  
  // Contenido
  label           Json            // { en: "Home", es: "Inicio" }
  href            String?
  icon            String?         // Nombre del icono de Lucide
  
  // Jerarquía (similar a MeetTag)
  parentId        String?         @db.ObjectId
  parent          MenuItem?       @relation("ItemHierarchy", fields: [parentId], references: [id])
  children        MenuItem[]      @relation("ItemHierarchy")
  
  // Propiedades
  type            MenuItemType    // LINK, DROPDOWN, SEPARATOR, HEADING
  target          String?         // _blank, _self
  badge           String?         // Texto del badge
  badgeVariant    String?         // default, success, warning, error
  
  // Orden y visibilidad
  order           Int             @default(0)
  isVisible       Boolean         @default(true)
  isDisabled      Boolean         @default(false)
  
  // Permisos específicos del item
  requiredRoles   String[]        @default([])
  requiredTeams   String[]        @default([])
  
  // Metadata
  customClass     String?
  customData      Json?
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@index([menuId])
  @@index([parentId])
  @@index([order])
}

model TeamSidebar {
  id              String          @id @default(auto()) @map("_id") @db.ObjectId
  teamKey         String          @unique // "gestion", "creativos", etc.
  
  // Módulos disponibles (referencias a dashboard-routes.ts)
  availableRoutes String[]        // ["admin", "dashboard", "products", ...]
  customRoutes    Json?           // Rutas personalizadas no en dashboard-routes
  
  // Configuración
  priority        Int             @default(0) // Mayor prioridad = se muestra primero
  isActive        Boolean         @default(true)
  
  // Usuarios/Grupos asignados
  userIds         String[]        @db.ObjectId
  groupIds        String[]        @db.ObjectId
  
  // Metadata
  createdBy       String?
  updatedBy       String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

enum MenuType {
  HEADER
  FOOTER
  SIDEBAR
}

enum MenuScope {
  PUBLIC
  PRIVATE
  ROLE
  TEAM
}

enum MenuItemType {
  LINK
  DROPDOWN
  SEPARATOR
  HEADING
  BUTTON
}
```

### Componentes Reutilizables

```typescript
// Basado en GroupsManagement y TagsManagement existentes

interface MenuManagementProps {
  type: MenuType;
  scope: MenuScope;
  lang: string;
}

// Componentes principales
- MenuManagement.tsx (similar a GroupsManagement)
- MenuItemBuilder.tsx (similar a ComplexRuleBuilder)
- MenuHierarchyTree.tsx (reutiliza HierarchyTree)
- MenuPreview.tsx (preview del menú)
- TeamSidebarManager.tsx (gestión de sidebars por equipo)
```

---

## ✅ Criterios de Aceptación

### CA1: Gestión de Footers
- [ ] CRUD completo de footers (público, privado, por rol)
- [ ] Herencia configurable entre niveles
- [ ] Editor jerárquico de items (drag & drop opcional)
- [ ] Multi-idioma en labels
- [ ] Preview antes de publicar

### CA2: Gestión de Headers
- [ ] CRUD completo de headers
- [ ] Soporte para dropdowns y mega-menús
- [ ] Integración con sistema de rutas existente
- [ ] Badges y notificaciones en items

### CA3: Sidebars por Equipo
- [ ] Selector de equipo (dropdown como en screenshot)
- [ ] Asignación de módulos desde dashboard-routes.ts
- [ ] Prioridad configurable
- [ ] Warning cuando usuario no tiene permisos

### CA4: Sistema de Herencia
- [ ] Público → Privado → Rol → Equipo
- [ ] Opción de romper herencia en cualquier nivel
- [ ] Merge inteligente de items heredados

### CA5: Control de Acceso
- [ ] Integración con AccessControl existente
- [ ] Validación de permisos por item
- [ ] Ocultación automática de items sin permisos
- [ ] Logs de acceso denegado

### CA6: Interfaz de Usuario
- [ ] UI consistente con Tags/Groups Management
- [ ] Tabs para diferentes tipos de menú
- [ ] Accordions para secciones complejas
- [ ] Alerts para feedback de usuario

---

## 🎫 Tickets de Desarrollo Frontend

### Sprint 1: Configuración Base (1 semana)

#### TICKET-01: Setup de Esquema y Modelos
**Prioridad**: Alta
**Estimación**: 4h
**Tareas**:
- [ ] Crear `prisma/schema/menu.prisma`
- [ ] Definir modelos MenuConfiguration, MenuItem, TeamSidebar
- [ ] Crear migraciones
- [ ] Generar tipos TypeScript

#### TICKET-02: Página Base de Gestión de Menús
**Prioridad**: Alta
**Estimación**: 6h
**Tareas**:
- [ ] Crear `/admin/menu/page.tsx`
- [ ] Implementar layout con Tabs (Footer, Header, Sidebar)
- [ ] Configurar rutas en dashboard-routes.ts
- [ ] Agregar permisos de acceso

#### TICKET-03: API Routes para Menús
**Prioridad**: Alta
**Estimación**: 8h
**Tareas**:
- [ ] `/api/admin/menu/[type]/route.ts` (GET, POST, PUT, DELETE)
- [ ] `/api/admin/menu/items/route.ts`
- [ ] `/api/admin/menu/publish/route.ts`
- [ ] Validación con Zod

### Sprint 2: Gestión de Footers (1 semana)

#### TICKET-04: Footer Management Component
**Prioridad**: Alta
**Estimación**: 12h
**Tareas**:
- [ ] Crear `FooterManagement.tsx` basado en GroupsManagement
- [ ] Implementar selector de scope (público/privado/rol)
- [ ] CRUD de configuraciones de footer
- [ ] Sistema de herencia

#### TICKET-05: Footer Item Builder
**Prioridad**: Alta
**Estimación**: 10h
**Tareas**:
- [ ] Crear `FooterItemBuilder.tsx`
- [ ] Editor jerárquico de items
- [ ] Soporte multi-idioma
- [ ] Iconos con selector de Lucide

#### TICKET-06: Footer Preview
**Prioridad**: Media
**Estimación**: 6h
**Tareas**:
- [ ] Componente `FooterPreview.tsx`
- [ ] Vista previa en tiempo real
- [ ] Toggle desktop/mobile view
- [ ] Simulación de diferentes roles

### Sprint 3: Gestión de Headers (1 semana)

#### TICKET-07: Header Management Component
**Prioridad**: Alta
**Estimación**: 12h
**Tareas**:
- [ ] Crear `HeaderManagement.tsx`
- [ ] Soporte para mega-menús
- [ ] Configuración de dropdowns
- [ ] Sistema de badges

#### TICKET-08: Header Navigation Builder
**Prioridad**: Alta
**Estimación**: 10h
**Tareas**:
- [ ] Crear `HeaderNavBuilder.tsx`
- [ ] Editor de items con niveles
- [ ] Configuración de acciones (CTA buttons)
- [ ] Mobile menu configuration

### Sprint 4: Sidebars por Equipo (1 semana)

#### TICKET-09: Team Sidebar Manager
**Prioridad**: Alta
**Estimación**: 14h
**Tareas**:
- [ ] Crear `TeamSidebarManager.tsx`
- [ ] Selector de equipo (dropdown)
- [ ] Lista de módulos disponibles desde dashboard-routes
- [ ] Asignación drag & drop

#### TICKET-10: Module Permission Checker
**Prioridad**: Alta
**Estimación**: 8h
**Tareas**:
- [ ] Validación de permisos por módulo
- [ ] Warning component para acceso denegado
- [ ] Integración con AccessControl
- [ ] Logs de intentos de acceso

#### TICKET-11: Sidebar Priority System
**Prioridad**: Media
**Estimación**: 6h
**Tareas**:
- [ ] Sistema de prioridades
- [ ] Resolver conflictos equipo vs rol
- [ ] UI para gestionar prioridades
- [ ] Testing de casos edge

### Sprint 5: Integración y Polish (1 semana)

#### TICKET-12: Menu Inheritance System
**Prioridad**: Alta
**Estimación**: 10h
**Tareas**:
- [ ] Implementar lógica de herencia
- [ ] UI para romper/restaurar herencia
- [ ] Merge de items heredados
- [ ] Diff viewer de cambios

#### TICKET-13: Access Control Integration
**Prioridad**: Alta
**Estimación**: 8h
**Tareas**:
- [ ] Hook useMenuAccess
- [ ] Filtrado automático de items
- [ ] Integración con ComplexAccessControl
- [ ] Testing de permisos

#### TICKET-14: Menu Publishing System
**Prioridad**: Media
**Estimación**: 6h
**Tareas**:
- [ ] Sistema de draft/published
- [ ] Historial de versiones
- [ ] Rollback capability
- [ ] Notificaciones de publicación

#### TICKET-15: Testing y Documentación
**Prioridad**: Media
**Estimación**: 8h
**Tareas**:
- [ ] Tests unitarios componentes
- [ ] Tests de integración
- [ ] Documentación de uso
- [ ] Guía de migración

---

## 📊 Métricas de Éxito

### KPIs Técnicos
- **Performance**: Carga de menú < 100ms
- **Cache hit rate**: > 90% para menús estáticos
- **Error rate**: < 0.1% en operaciones CRUD

### KPIs de Negocio
- **Tiempo de configuración**: -50% vs sistema actual
- **Tickets de soporte**: -30% relacionados con permisos
- **Adopción**: 100% equipos usando el sistema en 30 días

---

## 🔄 Fases de Implementación

### Fase 1: MVP (Sprints 1-2)
- Footer management básico
- Sistema de herencia
- Integración con roles existentes

### Fase 2: Headers y Navigation (Sprint 3)
- Header management
- Mega-menús y dropdowns
- Mobile navigation

### Fase 3: Team Sidebars (Sprint 4)
- Gestión por equipos
- Prioridades y conflictos
- Warnings de permisos

### Fase 4: Polish y Optimización (Sprint 5)
- Publishing system
- Testing completo
- Documentación

---

## 🚀 Consideraciones de Implementación

### Reutilización de Código
1. **Componentes UI**: Usar los mismos de Meet (Cards, Dialogs, Tabs)
2. **Lógica de jerarquía**: Adaptar de MeetTag/MeetGroup
3. **Control de acceso**: Integrar con sistema existente
4. **Validaciones**: Reutilizar esquemas Zod existentes

### Performance
- Implementar cache de menús en Redis/Memory
- Lazy loading de items complejos
- Optimistic updates en UI

### Seguridad
- Validación de permisos server-side
- Sanitización de inputs
- Rate limiting en APIs
- Audit logs de cambios

### Migración
- Script para migrar menús actuales
- Mantener backwards compatibility
- Feature flags para rollout gradual

---

## 📝 Notas Adicionales

### Decisiones Técnicas
- **No drag & drop inicial**: Implementar orden manual primero
- **No versionado inicial**: Solo draft/published states
- **Cache simple**: In-memory cache antes de Redis

### Riesgos y Mitigaciones
- **Riesgo**: Complejidad de herencia
  - **Mitigación**: UI clara con preview y diff

- **Riesgo**: Performance con muchos items
  - **Mitigación**: Paginación y lazy loading

- **Riesgo**: Conflictos de permisos
  - **Mitigación**: Sistema de prioridades claro

### Dependencias
- Sistema de autenticación funcionando
- Dashboard routes actualizadas
- Roles y equipos configurados
- i18n configurado para multi-idioma