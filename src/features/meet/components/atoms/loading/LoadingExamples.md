# Loading Components - Todas las Variantes

## Spinner Component

### Tamaños disponibles
```tsx
<Spinner size="sm" variant="primary" />   // 12px (w-3 h-3)
<Spinner size="md" variant="primary" />   // 16px (w-4 h-4) - Default
<Spinner size="lg" variant="primary" />   // 24px (w-6 h-6)
<Spinner size="xl" variant="primary" />   // 32px (w-8 h-8)
```

### Variantes de color
```tsx
<Spinner variant="primary" />   // Verde lima (var(--primary) del CSS)
<Spinner variant="secondary" /> // Color secondary del sistema (var(--secondary))
<Spinner variant="success" />   // Verde success del sistema (var(--success))
<Spinner variant="warning" />   // Amarillo warning del sistema (var(--warning))
<Spinner variant="error" />     // Rojo destructive del sistema (var(--destructive))
<Spinner variant="muted" />     // Gris muted del sistema (var(--muted))
```

## LoadingMessage Component

### Variantes básicas
```tsx
<LoadingMessage message="Cargando datos..." />
<LoadingMessage message="Procesando información..." variant="primary" />
<LoadingMessage message="Operación completada" variant="success" />
<LoadingMessage message="Advertencia importante" variant="warning" />
<LoadingMessage message="Error al procesar" variant="error" />
<LoadingMessage message="Información secundaria" variant="muted" />
```

### Tamaños
```tsx
<LoadingMessage message="Pequeño" size="sm" />     // text-xs, gap-1.5
<LoadingMessage message="Mediano" size="md" />     // text-sm, gap-2 - Default  
<LoadingMessage message="Grande" size="lg" />      // text-base, gap-2.5
```

### Sin spinner
```tsx
<LoadingMessage message="Solo mensaje" showSpinner={false} />
```

### Spinner personalizado
```tsx
<LoadingMessage 
  message="Spinner grande"
  spinnerSize="lg"
  spinnerVariant="error"
/>
```

### Combinaciones avanzadas
```tsx
<LoadingMessage 
  message="Cargando archivo grande..."
  variant="primary"
  size="lg" 
  spinnerSize="xl"
  spinnerVariant="primary"
/>
```

## Colores disponibles (CSS Variables del Sistema)

### Primary (Verde lima del sistema)
- **Spinner**: `border-t-primary` (var(--primary) = oklch(0.9343 0.1915 125.4475))
- **Texto**: `text-primary`

### Secondary (Color secundario del sistema)  
- **Spinner**: `border-t-secondary` (var(--secondary))
- **Texto**: `text-muted-foreground`

### Success (Verde del sistema)
- **Spinner**: `border-t-success` (var(--success))
- **Texto**: `text-success`

### Warning (Amarillo del sistema)
- **Spinner**: `border-t-warning` (var(--warning))
- **Texto**: `text-warning`

### Error (Rojo destructive del sistema)
- **Spinner**: `border-t-destructive` (var(--destructive))
- **Texto**: `text-destructive`

### Muted (Gris del sistema)
- **Spinner**: `border-t-muted` (var(--muted))
- **Texto**: `text-muted-foreground`

## Casos de uso comunes

### Loading de datos
```tsx
<LoadingMessage 
  message="Cargando datos de organización..."
  variant="primary"
  size="md"
/>
```

### Proceso exitoso
```tsx
<LoadingMessage 
  message="Datos guardados correctamente"
  variant="success"
  showSpinner={false}
/>
```

### Estado de error
```tsx
<LoadingMessage 
  message="Error al conectar con el servidor"
  variant="error"
  size="lg"
  spinnerSize="lg"
/>
```

### Proceso largo
```tsx
<LoadingMessage 
  message="Procesando archivo... esto puede tomar unos minutos"
  variant="warning"
  size="lg"
  spinnerSize="xl"
/>
```