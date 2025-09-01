/**
 * Calendar Components - Main Export
 * 
 * Punto de entrada principal para todos los componentes del módulo Calendar
 * Organizado siguiendo Atomic Design Pattern - MIGRACIÓN COMPLETADA 100%
 */

// ========================================
// NAMED EXPORTS ONLY - NO CONFLICTS
// ========================================

// ========================================
// ATOMS - Componentes básicos
// ========================================

// Inputs
export { SearchInput } from './atoms/inputs/SearchInput';
export { FilterCheckbox } from './atoms/checkboxes/FilterCheckbox';

// Buttons
export { FilterButton } from './atoms/buttons/FilterButton';


// Loading
export { Spinner } from './atoms/loading/Spinner';
export { SkeletonBox } from './atoms/loading/SkeletonBox';

// Indicators
export { SelectionIndicator } from './atoms/indicators/SelectionIndicator';

// ========================================
// MOLECULES - Componentes combinados
// ========================================

// Filters
export { AttendeesFilter } from './molecules/filters/AttendeesFilter';

// Forms  
export { EditableDateTimeField } from './molecules/forms/EditableDateTimeField';
export { EditableCalendarField } from './molecules/forms/EditableCalendarField';
export { EditableAttendeesField } from './molecules/forms/EditableAttendeesField';
export { EditableDescriptionField } from './molecules/forms/EditableDescriptionField';
export { EditableTitleField } from './molecules/forms/EditableTitleField';

// Selectors
export { CalendarMultiSelect } from './molecules/selectors/CalendarMultiSelect';

// Tooltips
export { BulkActionTooltip } from './molecules/tooltips/BulkActionTooltip';

// Controls
export { ColumnController } from './molecules/tables/ColumnController';


// ========================================
// ORGANISMS - Componentes complejos
// ========================================


// Modals
export { BulkAddParticipantsModal } from './organisms/modals/BulkAddParticipantsModal';
export { BulkDateTimeModal } from './organisms/modals/BulkDateTimeModal';
export { BulkGenerateDescriptionsModal } from './organisms/modals/BulkGenerateDescriptionsModal';
export { BulkMoveCalendarModal } from './organisms/modals/BulkMoveCalendarModal';

// Nuevos modales con navegación por secciones
export { SectionNavigationModal, EventDetailsModal } from './molecules/modals';

// Secciones de modales
export { GeneralSection, EditSection, ParticipantsSection } from './organisms/sections';

// KPIs
export { CalendarKPIs } from './organisms/kpis/CalendarKPIs';

// Grids
export { ParticipantKPIGrid } from './organisms/grids/ParticipantKPIGrid';

// Bars
export { BulkActionsBar } from './organisms/bars/BulkActionsBar';


// ========================================
// BUSINESS LOGIC - Hooks y Stores
// ========================================

// Hooks específicos sin conflicto
export { useEventsStore } from './stores/useEventsStore';
export { useCalendarStore } from './stores/useCalendarStore';

// Hooks de navegación modal
export { useModalNavigation } from '../hooks';

// ========================================
// CARDS
// ========================================

// KPI Cards
export { ParticipantKPICard } from './molecules/cards/ParticipantKPICard';

// NOTA: Migración atómica 100% completada
// Todos los componentes están organizados siguiendo Atomic Design