# Marketing Salon Drive Tests

Este directorio contiene pruebas para la funcionalidad Marketing Salon Drive, con enfoque en la nueva estructura de sidebar y organización de contenido.

## Estructura de Datos

La API y el frontend utilizan la siguiente estructura jerárquica:

```
SidebarItem
  └─ tabs[]
      └─ TabItem
          └─ content
              ├─ files[]         (Archivos directos del tab)
              ├─ subTabs[]       (Pestañas secundarias dentro del tab)
              └─ groups[]        (Grupos dentro del tab)
                  └─ GroupItem
                      └─ content
                          ├─ files[]    (Archivos del grupo)
                          ├─ subTabs[]  (Subtabs dentro del grupo)
                          └─ groups[]   (Grupos anidados)
```

### Relación Tabs vs Grupos

Los grupos NO son tabs independientes, sino que son elementos contenidos dentro de un tab padre.
La diferencia clave es:

1. **Tabs**: Se muestran como pestañas navegables en la parte superior del contenido
2. **Grupos**: Se muestran como secciones dentro del contenido de un tab

Esto permite una estructura más organizada donde:

- Los archivos pueden estar directamente en un tab
- Los archivos pueden estar dentro de un grupo que está contenido en un tab
- Los archivos pueden estar dentro de subtabs de un grupo

## Estructura de Pruebas

Las pruebas están organizadas por tipo de componente:

- `hooks/`: Pruebas para hooks personalizados como `useDriveCards`
- `components/`: Pruebas para componentes de UI como `DriveSidebar` y `DriveContentArea`

## Ejecutar Pruebas

Para ejecutar todas las pruebas de esta característica:

```bash
npx vitest run src/features/marketing-salon-drive/__tests__
```

Para ejecutar una prueba específica:

```bash
npx vitest run src/features/marketing-salon-drive/__tests__/hooks/useDriveCards.test.tsx
```

## Cobertura de Pruebas

Los siguientes componentes y hooks están cubiertos por pruebas:

1. **useDriveCards Hook**

   - Obtiene correctamente los datos de Drive
   - Maneja errores adecuadamente
   - Construye URLs de API correctas

2. **DriveSidebar Component**

   - Renderiza elementos de la barra lateral correctamente
   - Aplica estilos de selección a los elementos activos
   - Maneja eventos de clic y cambios de selección
   - Maneja estados vacíos

3. **DriveContentArea Component**

   - Renderiza correctamente el contenido según el elemento de la barra lateral
   - Muestra pestañas y maneja la selección de pestañas
   - **Filtra los grupos para que no aparezcan como tabs**
   - **Renderiza grupos como secciones dentro del contenido del tab**
   - Renderiza diferentes tipos de contenido (archivos, grupos, subtabs)
   - Maneja estados vacíos

4. **DriveMarketingContent Component**
   - Integra todos los componentes
   - Maneja estados de carga, error y vacío
   - Administra el estado de selección entre la barra lateral y las áreas de contenido

## Enfoque de Mocking

Estas pruebas utilizan varias estrategias de mocking:

1. **API Mocking**: Simulamos la API `fetch` para simular respuestas del servidor
2. **Component Mocking**: Componentes de UI como `Tabs` son simulados para evitar dependencias complejas
3. **Hook Mocking**: Para pruebas de integración, simulamos los hooks para controlar su salida

## Configuración de Pruebas

Las pruebas utilizan:

- Vitest como ejecutor de pruebas
- React Testing Library para pruebas de componentes
- JSDOM para simular un entorno de navegador

La configuración se gestiona a través de:

- `vitest.config.ts` para configuración global
- `setup.ts` para extender comportamientos de prueba
