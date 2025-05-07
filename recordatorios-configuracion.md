# Guía: Configuración de Recordatorios para Reportes de Errores

Esta guía explica cómo configurar recordatorios semanales para reportes de errores en estado pendiente y en progreso.

## Configuración de Recordatorios Semanales

### 1. Acceder a la sección de Recordatorios

1. Ingresa a la sección de **Gestión de Errores en Archivos** en el panel de administración
2. Haz clic en la pestaña **Recordatorios**

### 2. Crear recordatorio para reportes PENDIENTES

1. Haz clic en el botón **Nuevo recordatorio**
2. Completa el formulario con la siguiente información:
   - **Estado de reportes**: Selecciona "Pendiente"
   - **Frecuencia**: Selecciona "Días"
   - **Intervalo**: Ingresa "7" (para recordatorios semanales)
   - **Destinatarios**: Ingresa los correos separados por comas (ej: "admin@insiders.com, soporte@insiders.com")
3. Haz clic en **Guardar**

### 3. Crear recordatorio para reportes EN PROGRESO

1. Haz clic en el botón **Nuevo recordatorio**
2. Completa el formulario con la siguiente información:
   - **Estado de reportes**: Selecciona "En progreso"
   - **Frecuencia**: Selecciona "Días"
   - **Intervalo**: Ingresa "7" (para recordatorios semanales)
   - **Destinatarios**: Ingresa los correos separados por comas (ej: "admin@insiders.com, soporte@insiders.com, dev@insiders.com")
3. Haz clic en **Guardar**

## Funcionamiento

Una vez configurados los recordatorios:

- **Recordatorio de reportes PENDIENTES**: Cada 7 días, el sistema enviará un correo a los destinatarios configurados con la lista de reportes de errores que siguen en estado "pendiente".

- **Recordatorio de reportes EN PROGRESO**: Cada 7 días, el sistema enviará un correo a los destinatarios configurados con la lista de reportes de errores que siguen en estado "en progreso".

## Administración de Recordatorios

Desde la pestaña **Recordatorios**, podrás:

- **Editar** un recordatorio existente haciendo clic en el ícono de lápiz
- **Eliminar** un recordatorio existente haciendo clic en el ícono de papelera
- **Activar/Desactivar** recordatorios sin necesidad de eliminarlos

## Notas Importantes

- Los recordatorios se ejecutan automáticamente según la frecuencia configurada
- Si no hay reportes en el estado correspondiente, no se enviará ningún correo
- Se recomienda usar direcciones de correo válidas y verificadas
- Los recordatorios ayudan a evitar que reportes de errores queden olvidados
