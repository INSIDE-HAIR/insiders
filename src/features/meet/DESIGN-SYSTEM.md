# 🎨 Design System - Meet Module Component Guidelines

## 📋 Resumen Ejecutivo

Esta guía define las preferencias y estándares de diseño para todos los componentes del módulo Meet, establecidas durante la refactorización SOLID del sistema de modales. Todas las reglas aquí definidas son obligatorias para mantener consistencia visual y funcional.

## 🎯 Principios Fundamentales

### 1. **Elegancia sobre Funcionalidad**
- Preferir diseños limpios y profesionales
- Evitar elementos visuales innecesarios o llamativos
- Mantener simplicidad sin sacrificar usabilidad

### 2. **Consistencia Absoluta**
- Todos los componentes deben seguir los mismos patrones
- Colores, tipografía y spacing deben ser uniformes
- Comportamientos de hover y interacción idénticos

### 3. **Responsive First**
- Todos los componentes deben funcionar en mobile y desktop
- Usar contenido directo para secciones simples
- Accordions solo para contenido complejo que requiera organización

---

## 🏷️ Badges y Estados

### ✅ Estilo Aprobado: Badges Sólidos

**Patrón obligatorio:**
```tsx
// ✅ CORRECTO - Badge sólido con fondo oscuro
<Badge className="bg-green-900 text-green-100 hover:bg-green-800">
  Abierto
</Badge>

// ❌ INCORRECTO - Badge con fondo claro
<Badge className="bg-green-100 text-green-700">
  Abierto  
</Badge>
```

### 🎨 Paleta de Colores para Badges

#### **Estados Positivos/Abiertos**
- **Verde**: `bg-green-900 text-green-100 hover:bg-green-800`
- Uso: Estados activos, acceso abierto, confirmaciones

#### **Estados Informativos/Importantes** 
- **Azul**: `bg-blue-900 text-blue-100 hover:bg-blue-800`
- Uso: Roles importantes, identificadores, información clave

#### **Estados de Advertencia/Destacados**
- **Amarillo**: `bg-yellow-900 text-yellow-100 hover:bg-yellow-800`
- Uso: Elementos destacados, warnings, participantes top

#### **Estados Neutros**
- **Gris**: `bg-gray-900 text-gray-100 hover:bg-gray-800`
- Uso: Estados estándar, participantes regulares

#### **Estados Restrictivos/Peligrosos**
- **Rojo**: `bg-red-900 text-red-100 hover:bg-red-800`
- Uso: Acceso restringido, errores, acciones destructivas

#### **Estados Creativos/Diseño**
- **Rosa**: `bg-pink-900 text-pink-100 hover:bg-pink-800`
- **Púrpura**: `bg-purple-900 text-purple-100 hover:bg-purple-800`
- **Índigo**: `bg-indigo-900 text-indigo-100 hover:bg-indigo-800`
- Uso: Tags creativos, categorías especiales

### 📝 Nomenclatura de Badges

**✅ Formato Correcto:**
- Usar formato normal, no mayúsculas
- Ejemplos: "Abierto", "Co-anfitrión", "Participante", "Top"

**❌ Formato Incorrecto:**  
- No usar: "ABIERTO", "CO-ANFITRIÓN", "PARTICIPANTE", "TOP"

---

## 🔧 Iconos y Elementos Gráficos

### ✅ Estilo Aprobado: Iconos de Líneas

**Preferencias obligatorias:**
```tsx
// ✅ CORRECTO - Heroicons outline con stroke
<ShieldCheckIcon className="h-5 w-5 text-primary" />

// ✅ CORRECTO - SVG personalizado sin relleno
<svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
</svg>

// ❌ INCORRECTO - Iconos con relleno sólido
<svg className="h-5 w-5" fill="currentColor">
  <path d="..."/>
</svg>
```

### 🚫 Elementos Prohibidos

#### **❌ Emojis**
- Nunca usar emojis en interfaces de producción
- Reemplazar siempre por iconos de Heroicons o SVG personalizados
- Los emojis solo se permiten en documentación y comentarios

#### **❌ Círculos y Cuadrados Decorativos**
```tsx
// ❌ INCORRECTO - Elementos gráficos innecesarios
<div className="h-3 w-3 rounded-full bg-blue-500"></div>
<div className="h-4 w-4 rounded bg-red-500"></div>

// ✅ CORRECTO - Badge directo con color de fondo
<Badge className="bg-blue-900 text-blue-100">Marketing</Badge>
```

#### **❌ Iconos de Relleno Sólido**
- Preferir siempre outline icons sobre solid icons
- Usar `strokeWidth="2"` para consistencia visual

### 🎯 Color de Iconos

**Regla universal:**
```tsx
// ✅ Siempre usar text-primary para iconos principales
<UsersIcon className="h-5 w-5 text-primary" />

// ❌ No usar colores específicos a menos que sea contextual
<UsersIcon className="h-5 w-5 text-blue-500" />
```

---

## 🎯 Botones y Elementos Interactivos

### ✅ Cursors y Feedback Visual

**Obligatorio en todos los elementos interactivos:**
```tsx
// ✅ CORRECTO - Cursor pointer explícito
<button className="... cursor-pointer">Acción</button>
<div className="... cursor-pointer hover:cursor-pointer" onClick={...}>
  Elemento clickeable
</div>

// ❌ INCORRECTO - Sin cursor pointer
<button className="...">Acción</button>
```

### 🎨 Botones de Acción Unificados

#### **❌ Botón X (Desasignar/Quitar)**
```tsx
// ✅ Patrón estándar para botones X
<Button 
  size="sm" 
  variant="ghost" 
  className="h-4 w-4 p-0 hover:bg-[color]-700 hover:text-[color]-100 cursor-pointer"
>
  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
</Button>
```

#### **➕ Botón Plus (Agregar)**
```tsx
// ✅ Patrón estándar para botones +
<svg className="h-4 w-4 cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
</svg>
```

#### **🗑️ Botón Trash (Eliminar Permanente)**
- Solo usar para eliminaciones permanentes (ej: eliminar miembros)
- No usar para desasignaciones (usar X)

### 🎨 Hover States Consistentes

**Reglas obligatorias:**
1. Los hover colors deben ser versiones más oscuras del color base
2. Mantener texto legible en estado hover
3. Transiciones suaves implícitas

```tsx
// ✅ Ejemplo de hover correcto
className="bg-blue-900 text-blue-100 hover:bg-blue-800"
```

---

## 📐 Layout y Organización

### 🗂️ Patrón Accordion vs Contenido Directo

#### **✅ Usar Accordions para:**
- Contenido complejo con múltiples sub-elementos
- Secciones que requieren organización jerárquica
- Listas largas que necesitan ser colapsables

**Ejemplos apropiados:**
- Referencias (Tags + Grupos)
- Sesiones (múltiples sesiones con detalles)
- Estadísticas (ranking de participantes)

#### **✅ Usar Contenido Directo para:**
- Información simple y directa
- Formularios básicos
- Configuraciones que deben estar siempre visibles

**Ejemplos apropiados:**
- General (información básica)
- Configuración (toggles y selects)
- Miembros (formulario + lista directa)

### 📱 Responsive Design

#### **Reglas obligatorias:**
1. **Mobile First**: Diseñar primero para mobile
2. **Spacing Consistente**: Usar `space-y-4` y `space-y-6` principalmente
3. **Breakpoints**: Usar Tailwind breakpoints estándar (`sm:`, `md:`, `lg:`)

### 📄 Headers y Títulos

```tsx
// ✅ Patrón estándar para headers de sección
<div className="flex items-center gap-2 mb-4">
  <IconComponent className="h-5 w-5 text-primary" />
  <h3 className="font-medium text-base">Título de Sección</h3>
</div>
```

---

## 🏗️ Arquitectura de Componentes

### ⚛️ Principios SOLID Obligatorios

#### **1. Single Responsibility Principle**
- Cada componente tiene UNA sola responsabilidad
- Separar UI de lógica de negocio

#### **2. Component Composition**
```tsx
// ✅ CORRECTO - Composición de componentes
const TagsSection = () => (
  <div className="space-y-4">
    <TagsAssigned />
    <TagsAvailable />
  </div>
);

// ❌ INCORRECTO - Todo en un componente monolítico
const TagsSection = () => (
  <div>
    {/* 200 líneas de código mezclado */}
  </div>
);
```

### 🔗 Lazy Loading Obligatorio

```tsx
// ✅ Todos los componentes de sección deben ser lazy
const GeneralSection = lazy(() => Promise.resolve({
  default: ({ navigation }: any) => (
    // Componente aquí
  )
}));
```

### 🎣 Hooks Pattern

```tsx
// ✅ Separar lógica en hooks personalizados
const useModalNavigation = ({ sections, initialSectionId }) => {
  // Lógica de navegación
  return { currentSectionId, goToSection, canGoPrevious, canGoNext };
};

// ✅ Usar el hook en el componente
const Modal = () => {
  const navigation = useModalNavigation({ sections, initialSectionId });
  return <SectionComponent navigation={navigation} />;
};
```

---

## 🎭 Estados y Feedback

### ⏳ Loading States

```tsx
// ✅ Loading con Skeleton de shadcn/ui
<Suspense fallback={<Skeleton className="h-6 w-3/4" />}>
  <ComponenteContenido />
</Suspense>
```

### ⚠️ Estados de Error

```tsx
// ✅ Error handling elegante
{error ? (
  <div className="text-center py-12">
    <div className="text-muted-foreground">
      <div className="text-lg font-medium mb-2">Error</div>
      <p className="text-sm">No se pudo cargar la información</p>
    </div>
  </div>
) : (
  <ContenidoNormal />
)}
```

---

## 📚 Componentes Base Obligatorios

### 🧱 Siempre Usar shadcn/ui

```tsx
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
```

### 🎯 Heroicons para Iconos

```tsx
import {
  InformationCircleIcon,
  UsersIcon,
  TagIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  // ... otros iconos outline
} from "@heroicons/react/24/outline";
```

---

## 📝 Convenciones de Código

### 🏷️ Naming Conventions

#### **Componentes:**
- Átomos: `[Descripción][Tipo]` → `AccessTypeBadge`
- Moléculas: `[Función][Componente]` → `ModerationToggle`
- Organismos: `[Contexto]Section` → `MembersSection`

#### **Props:**
```tsx
// ✅ Interfaces con sufijo Props
interface AccessTypeBadgeProps {
  type: "OPEN" | "TRUSTED" | "RESTRICTED";
  className?: string;
}
```

#### **Hooks:**
```tsx
// ✅ Patrón use[Recurso][Acción]
const useModalNavigation = () => {};
const useRoomSettings = () => {};
const useTagsManagement = () => {};
```

### 📁 Estructura de Archivos

```
components/
├── atoms/
│   ├── badges/
│   │   ├── AccessTypeBadge.tsx
│   │   └── index.ts
│   └── buttons/
├── molecules/
│   ├── modals/
│   └── forms/
└── organisms/
    ├── sections/
    └── lists/
```

### 🎨 Clases CSS

```tsx
// ✅ Order: Layout → Spacing → Colors → Effects
className="flex items-center gap-2 px-3 py-1 bg-blue-900 text-blue-100 hover:bg-blue-800 rounded cursor-pointer"
```

---

## ✅ Checklist de Componente

Antes de considerar un componente "terminado", debe cumplir:

### 🎨 **Visual**
- [ ] Usa badges sólidos oscuros con texto claro
- [ ] Iconos de líneas (outline) únicamente
- [ ] Sin emojis ni elementos gráficos decorativos
- [ ] Hover states consistentes
- [ ] Cursor pointer en elementos interactivos

### 🏗️ **Arquitectura**
- [ ] Lazy loading implementado
- [ ] Props interface bien definida
- [ ] Separación de lógica en hooks si es complejo
- [ ] Uso exclusivo de shadcn/ui components

### 📱 **Responsive**
- [ ] Funciona en mobile y desktop
- [ ] Spacing consistente (space-y-4, space-y-6)
- [ ] Text sizes apropiados (text-sm, text-base)

### 🔧 **Funcionalidad**
- [ ] Estados de loading/error manejados
- [ ] TypeScript estricto sin `any`
- [ ] Props opcionales con defaults sensatos

---

## 🚀 Ejemplos de Referencia

### ✅ Componente Perfecto: AccessTypeBadge

```tsx
import React from "react";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";

export interface AccessTypeBadgeProps {
  type: "OPEN" | "TRUSTED" | "RESTRICTED";
  className?: string;
}

export const AccessTypeBadge: React.FC<AccessTypeBadgeProps> = ({ 
  type, 
  className 
}) => {
  const variants = {
    OPEN: "bg-green-900 text-green-100 hover:bg-green-800",
    TRUSTED: "bg-yellow-900 text-yellow-100 hover:bg-yellow-800",
    RESTRICTED: "bg-red-900 text-red-100 hover:bg-red-800"
  };
  
  const labels = {
    OPEN: "Abierto",
    TRUSTED: "Organizacional", 
    RESTRICTED: "Solo Invitados"
  };
  
  return (
    <Badge className={cn(variants[type], className)}>
      {labels[type]}
    </Badge>
  );
};
```

### ✅ Sección Perfecta: Contenido Directo

```tsx
const GeneralSection = lazy(() => Promise.resolve({
  default: ({ navigation }: any) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <InformationCircleIcon className="h-5 w-5 text-primary" />
        <h3 className="font-medium text-base">Información General</h3>
      </div>
      
      {/* Contenido directo sin accordion */}
      <div className="space-y-3">
        {/* Campos de información */}
      </div>
    </div>
  )
}));
```

### ✅ Sección Perfecta: Con Accordions

```tsx
const ReferencesSection = lazy(() => Promise.resolve({
  default: ({ navigation }: any) => (
    <div className="space-y-4">
      <details className="group border border-border rounded-lg">
        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
          <div className="flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-primary" />
            <span className="font-medium">Tags</span>
            <Badge variant="outline">3 asignados</Badge>
          </div>
          <ChevronRightIcon className="h-4 w-4 transition-transform group-open:rotate-90" />
        </summary>
        
        <div className="px-4 pb-4">
          {/* Contenido del accordion */}
        </div>
      </details>
    </div>
  )
}));
```

---

## ⚠️ Errores Comunes a Evitar

### ❌ **Antipatrones Prohibidos**

1. **Emojis en UI de producción**
2. **Badges con fondos claros**
3. **Iconos de relleno sólido**
4. **Elementos gráficos decorativos innecesarios**
5. **Text en mayúsculas en badges**
6. **Componentes monolíticos > 200 líneas**
7. **Lógica de negocio mezclada con UI**
8. **Props drilling excesivo**
9. **Missing cursor pointer en interactivos**
10. **Inconsistencia en hover states**

---

## 🎯 Conclusión

Este design system garantiza:

1. **🎨 Consistencia Visual** - Todos los componentes siguen las mismas reglas
2. **✨ Elegancia** - Diseño limpio y profesional
3. **🔧 Mantenibilidad** - Código predecible y estándar
4. **📱 Responsiveness** - Funciona en todos los dispositivos
5. **🚀 Escalabilidad** - Fácil agregar nuevos componentes

**Regla de oro**: Antes de crear algo nuevo, revisar si ya existe un patrón establecido en este documento y seguirlo religiosamente.

---

**Documento vivo**: Este design system debe actualizarse cuando se establezcan nuevos patrones o se refinan los existentes durante el desarrollo.