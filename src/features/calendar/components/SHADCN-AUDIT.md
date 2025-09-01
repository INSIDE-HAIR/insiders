# 🔍 AUDITORÍA DE COMPONENTES SHADCN EXISTENTES

## ✅ COMPONENTES YA DISPONIBLES EN `/src/components/ui`

### **NO CREAR - YA EXISTEN:**

| **Componente Necesario** | **Componente Existente** | **Archivo** |
|---|---|---|
| ❌ ~~SearchInput~~ | ✅ `Input` + icon manual | `input.tsx` |
| ❌ ~~DateRangePicker~~ | ✅ `DatePicker` + Calendar | `date-picker.tsx` + `calendar.tsx` |
| ❌ ~~Checkbox~~ | ✅ `Checkbox` | `checkbox.tsx` |
| ❌ ~~Select/Dropdown~~ | ✅ `Select` | `select.tsx` |
| ❌ ~~Button~~ | ✅ `Button` | `button.tsx` |
| ❌ ~~Badge~~ | ✅ `Badge` | `badge.tsx` |
| ❌ ~~Spinner~~ | ✅ `Spinner` | `spinner.tsx` |
| ❌ ~~LoadingSpinner~~ | ✅ `LoadingSpinner` | `loading-spinner.tsx` |
| ❌ ~~Skeleton~~ | ✅ `Skeleton` | `skeleton.tsx` |
| ❌ ~~Table~~ | ✅ `Table` completo | `table.tsx` |
| ❌ ~~Pagination~~ | ✅ `Pagination` | `pagination.tsx` |
| ❌ ~~Dialog/Modal~~ | ✅ `Dialog` + `ResponsiveModal` | `dialog.tsx` + `responsive-modal.tsx` |
| ❌ ~~Popover~~ | ✅ `Popover` | `popover.tsx` |
| ❌ ~~Tooltip~~ | ✅ `Tooltip` | `tooltip.tsx` |
| ❌ ~~Toast~~ | ✅ `Toast` + `useToast` | `toast.tsx` + `use-toast.ts` |
| ❌ ~~Textarea~~ | ✅ `Textarea` | `textarea.tsx` |
| ❌ ~~Switch~~ | ✅ `Switch` | `switch.tsx` |
| ❌ ~~Tabs~~ | ✅ `Tabs` | `tabs.tsx` |
| ❌ ~~Card~~ | ✅ `Card` | `card.tsx` |
| ❌ ~~Avatar~~ | ✅ `Avatar` | `avatar.tsx` |
| ❌ ~~Progress~~ | ✅ `Progress` | `progress.tsx` |
| ❌ ~~Separator~~ | ✅ `Separator` | `separator.tsx` |
| ❌ ~~Label~~ | ✅ `Label` | `label.tsx` |
| ❌ ~~Form~~ | ✅ `Form` | `form.tsx` |
| ❌ ~~Command~~ | ✅ `Command` | `command.tsx` |
| ❌ ~~Combobox~~ | ✅ `Combobox` | `combobox.tsx` |

---

## 🎯 ATOMS QUE SÍ NECESITO CREAR (ESPECÍFICOS DEL DOMINIO)

### **CREAR - SON ESPECÍFICOS DE CALENDAR:**

1. **FilterButton** ✅ (YA CREADO) - Botón con indicador de filtros activos
2. **FilterCheckbox** ✅ (YA CREADO) - Checkbox específico para filtros
3. **StatusBadge** ✅ (YA CREADO) - Badge de estado de eventos
4. **SelectionIndicator** ✅ (YA CREADO) - Indicador de selección de tabla
5. **ActionButton** ✅ (YA CREADO) - Botón de acción con icono
6. **CountBadge** ✅ (YA CREADO) - Badge contador

### **ATOMS QUE NO DEBO CREAR (usar shadcn):**

❌ **SearchInput** → Usar `Input` + `MagnifyingGlassIcon`
❌ **DateRangePicker** → Usar `DatePicker` existente
❌ **SaveButton** → Usar `Button` con variant
❌ **CancelButton** → Usar `Button` con variant
❌ **TableCheckbox** → Usar `Checkbox` existente
❌ **SortButton** → Usar `Button` con icono
❌ **PaginationButton** → Usar `Pagination` existente

---

## 🔄 REFACTORING NECESARIO

### **Componentes a actualizar para usar shadcn:**

1. **SearchInput atom** → Eliminar y usar `Input` directamente
2. **SkeletonBox** → Usar `Skeleton` de shadcn
3. **Spinner atom** → Usar `Spinner` de shadcn

### **Ejemplo de uso correcto:**

```tsx
// ❌ INCORRECTO - Duplicar componente
import { SearchInput } from '../atoms/inputs/SearchInput';

// ✅ CORRECTO - Usar shadcn
import { Input } from '@/src/components/ui/input';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

<div className="relative">
  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4" />
  <Input className="pl-10" placeholder="Buscar..." />
</div>
```

---

## 📊 RESUMEN DE IMPACTO

### **Componentes a eliminar/no crear:**
- 15+ atoms que duplicarían shadcn
- Ahorro de ~1500 líneas de código duplicado
- Mejor mantenibilidad

### **Componentes a mantener:**
- 6 atoms específicos del dominio Calendar
- Molecules y organisms que componen estos atoms con shadcn

### **Beneficios:**
- ✅ No duplicación de código
- ✅ Consistencia con design system
- ✅ Menor bundle size
- ✅ Mantenimiento más fácil
- ✅ Updates automáticos de shadcn

---

## 🎯 NUEVA ESTRATEGIA

### **ATOMS (6 específicos + shadcn directo)**
```
atoms/
├── badges/StatusBadge.tsx ✅
├── buttons/
│   ├── ActionButton.tsx ✅
│   └── FilterButton.tsx ✅
├── checkboxes/FilterCheckbox.tsx ✅
├── indicators/
│   ├── SelectionIndicator.tsx ✅
│   └── CountBadge.tsx ✅
└── [NO MÁS ATOMS - usar shadcn]
```

### **MOLECULES (componer con shadcn + atoms)**
```
molecules/
├── filters/AdvancedColumnFilter.tsx ✅ (usa Input, Button, Badge de shadcn)
├── forms/EditableCalendarField.tsx ✅ (usa Select de shadcn)
└── [continuar con esta estrategia]
```

### **ORGANISMS (componer molecules + shadcn)**
```
organisms/
├── tables/EventsDataTable.tsx ✅ (usa Table de shadcn)
├── views/AllParticipantsView.tsx ✅
└── [continuar con esta estrategia]
```