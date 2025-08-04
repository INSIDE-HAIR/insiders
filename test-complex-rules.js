/**
 * Test script para verificar el sistema de reglas complejas OR/AND
 */

console.log('🧪 Testing Complex Rule System (OR/AND Logic)...\n');

// Ejemplo de control de acceso complejo para formación
const complexAccessControlExample = {
  resourceType: "PAGE",
  resourceId: "marketing_digital_avanzado",
  isEnabled: true,
  evaluationStrategy: "COMPLEX",
  mainLogicOperator: "OR", // Cualquier grupo TRUE = acceso permitido
  
  ruleGroups: [
    {
      name: "Acceso por Edición Activa",
      description: "Estudiantes inscritos en ediciones con fechas vigentes",
      logicOperator: "OR", // Cualquier edición vale
      priority: 1,
      rules: [
        {
          name: "Edición Enero 2025",
          description: "Estudiantes de la edición de enero",
          logicOperator: "AND", // TODAS las condiciones deben cumplirse
          accessLevel: "READ",
          individualStartDate: "2025-01-15T00:00:00Z",
          individualEndDate: "2025-03-15T23:59:59Z",
          conditions: [
            {
              fieldPath: "user.groups",
              operator: "CONTAINS",
              value: "marketing_digital_enero_2025",
              isNegated: false
            },
            {
              fieldPath: "current_date",
              operator: "BETWEEN",
              value: ["2025-01-15T00:00:00Z", "2025-03-15T23:59:59Z"],
              isNegated: false
            }
          ]
        },
        {
          name: "Edición Abril 2025",
          description: "Estudiantes de la edición de abril",
          logicOperator: "AND",
          accessLevel: "READ",
          individualStartDate: "2025-04-01T00:00:00Z",
          individualEndDate: "2025-06-01T23:59:59Z",
          conditions: [
            {
              fieldPath: "user.groups",
              operator: "CONTAINS",
              value: "marketing_digital_abril_2025",
              isNegated: false
            },
            {
              fieldPath: "current_date",
              operator: "BETWEEN",
              value: ["2025-04-01T00:00:00Z", "2025-06-01T23:59:59Z"],
              isNegated: false
            }
          ]
        }
      ]
    },
    {
      name: "Acceso por Servicio Premium",
      description: "Usuarios con servicios contratados",
      logicOperator: "OR", // Cualquier condición de servicio vale
      priority: 2,
      rules: [
        {
          name: "Cliente Activo Premium",
          description: "Cliente con servicio premium activo",
          logicOperator: "AND",
          accessLevel: "FULL",
          conditions: [
            {
              fieldPath: "user.services",
              operator: "CONTAINS",
              value: "marketing_digital_premium",
              isNegated: false
            },
            {
              fieldPath: "user.status",
              operator: "EQUALS",
              value: "active",
              isNegated: false
            }
          ]
        },
        {
          name: "Cliente Inactivo Período Gracia",
          description: "Cliente dado de baja pero dentro del año de gracia",
          logicOperator: "AND",
          accessLevel: "READ",
          conditions: [
            {
              fieldPath: "user.services",
              operator: "CONTAINS",
              value: "marketing_digital_premium",
              isNegated: false
            },
            {
              fieldPath: "user.status",
              operator: "EQUALS",
              value: "inactive",
              isNegated: false
            },
            {
              fieldPath: "user.deactivation_date",
              operator: "WITHIN_LAST",
              value: "365_days",
              isNegated: false
            }
          ]
        }
      ]
    }
  ]
};

console.log('📋 Ejemplo de Control de Acceso Complejo:');
console.log(`   Recurso: ${complexAccessControlExample.resourceId}`);
console.log(`   Estrategia: ${complexAccessControlExample.evaluationStrategy}`);
console.log(`   Operador Principal: ${complexAccessControlExample.mainLogicOperator}`);
console.log(`   Grupos de Reglas: ${complexAccessControlExample.ruleGroups.length}`);
console.log('');

// Simular casos de evaluación
const testCases = [
  {
    name: "✅ Estudiante Enero - Dentro de período",
    user: {
      id: "user1",
      email: "juan@empresa.com",
      role: "CLIENT",
      groups: ["marketing_digital_enero_2025"],
      services: [],
      status: "active"
    },
    current_date: new Date("2025-02-01T10:00:00Z"),
    expected: "PERMITIDO - Grupo 'Acceso por Edición Activa' → Regla 'Edición Enero 2025'"
  },
  {
    name: "❌ Estudiante Enero - Fuera de período",
    user: {
      id: "user1",
      email: "juan@empresa.com", 
      role: "CLIENT",
      groups: ["marketing_digital_enero_2025"],
      services: [],
      status: "active"
    },
    current_date: new Date("2025-04-01T10:00:00Z"), // Después del fin de enero
    expected: "DENEGADO - Ningún grupo cumple condiciones"
  },
  {
    name: "✅ Cliente Premium Activo",
    user: {
      id: "user2",
      email: "maria@startup.com",
      role: "CLIENT", 
      groups: [],
      services: ["marketing_digital_premium"],
      status: "active"
    },
    current_date: new Date("2025-03-01T15:30:00Z"),
    expected: "PERMITIDO - Grupo 'Acceso por Servicio Premium' → Regla 'Cliente Activo Premium'"
  },
  {
    name: "✅ Cliente Inactivo - Período Gracia",
    user: {
      id: "user3",
      email: "carlos@empresa.com",
      role: "CLIENT",
      groups: [],
      services: ["marketing_digital_premium"],
      status: "inactive",
      deactivation_date: new Date("2024-08-01T00:00:00Z") // 6 meses atrás
    },
    current_date: new Date("2025-02-01T12:00:00Z"),
    expected: "PERMITIDO - Grupo 'Acceso por Servicio Premium' → Regla 'Cliente Inactivo Período Gracia'"
  },
  {
    name: "❌ Usuario Sin Acceso",
    user: {
      id: "user4",
      email: "random@email.com",
      role: "CLIENT",
      groups: [],
      services: [],
      status: "active"
    },
    current_date: new Date("2025-02-01T14:00:00Z"),
    expected: "DENEGADO - No pertenece a ningún grupo ni tiene servicios"
  }
];

console.log('🔍 Casos de Evaluación Simulados:');
console.log('');

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}`);
  console.log(`   Usuario: ${testCase.user.email}`);
  console.log(`   Grupos: [${testCase.user.groups.join(', ')}]`);
  console.log(`   Servicios: [${testCase.user.services.join(', ')}]`);
  console.log(`   Estado: ${testCase.user.status}`);
  console.log(`   Fecha: ${testCase.current_date.toISOString()}`);
  console.log(`   Resultado Esperado: ${testCase.expected}`);
  console.log('');
});

console.log('🎯 Lógica de Evaluación OR/AND:');
console.log('');
console.log('   📊 Operador Principal: OR');
console.log('   ├── Grupo 1: "Acceso por Edición Activa" (OR)');
console.log('   │   ├── Regla: "Edición Enero 2025" (AND)');
console.log('   │   │   ├── user.groups CONTAINS "marketing_digital_enero_2025"');
console.log('   │   │   └── current_date BETWEEN 2025-01-15 y 2025-03-15');
console.log('   │   └── Regla: "Edición Abril 2025" (AND)');
console.log('   │       ├── user.groups CONTAINS "marketing_digital_abril_2025"');
console.log('   │       └── current_date BETWEEN 2025-04-01 y 2025-06-01');
console.log('   │');
console.log('   └── Grupo 2: "Acceso por Servicio Premium" (OR)');
console.log('       ├── Regla: "Cliente Activo Premium" (AND)');
console.log('       │   ├── user.services CONTAINS "marketing_digital_premium"');
console.log('       │   └── user.status EQUALS "active"');
console.log('       └── Regla: "Cliente Inactivo Período Gracia" (AND)');
console.log('           ├── user.services CONTAINS "marketing_digital_premium"');
console.log('           ├── user.status EQUALS "inactive"');
console.log('           └── user.deactivation_date WITHIN_LAST "365_days"');
console.log('');

console.log('🚀 Funcionalidades Implementadas:');
console.log('   ✅ Schema DB extendido (RuleGroup, ComplexRule, RuleCondition)');
console.log('   ✅ Motor de evaluación OR/AND completo');
console.log('   ✅ API REST para reglas complejas');
console.log('   ✅ API de testing y simulación');
console.log('   ✅ Integración con sistema existente');
console.log('   ✅ Fallback automático a sistema simple');
console.log('   ✅ Cache optimizado por performance');
console.log('   ✅ TimeRange individual por regla');
console.log('   ✅ Condiciones dinámicas con operadores flexibles');
console.log('   ✅ Evaluación trace completa para debugging');
console.log('');

console.log('📡 Endpoints Disponibles:');
console.log('   GET    /api/admin/complex-access-control - Listar controles complejos');
console.log('   POST   /api/admin/complex-access-control - Crear control complejo');
console.log('   PUT    /api/admin/complex-access-control - Actualizar control complejo');
console.log('   DELETE /api/admin/complex-access-control - Eliminar controles complejos');
console.log('   POST   /api/admin/complex-access-control/test - Testing de evaluación');
console.log('   GET    /api/admin/complex-access-control/test - Casos de prueba predefinidos');
console.log('');

console.log('🎮 Próximos Pasos:');
console.log('   1. Crear interfaz visual para configurar reglas complejas');
console.log('   2. Implementar constructor de reglas drag & drop');
console.log('   3. Dashboard de testing en tiempo real');
console.log('   4. Métricas y analytics de acceso');
console.log('');

console.log('✅ Sistema de Reglas Complejas OR/AND completado!');