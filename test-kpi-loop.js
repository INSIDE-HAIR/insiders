/**
 * Script para detectar bucles infinitos en el componente KPI
 * Monitorea específicamente las llamadas relacionadas con KPIs
 */

console.log('🔍 Iniciando monitoreo de bucles infinitos en KPI...');

// Contador de llamadas KPI
let kpiCallCount = 0;
let lastKpiCallTime = Date.now();
let kpiCallLog = [];

// Interceptar console.log para detectar patrones de bucle en KPI
const originalLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');
  
  // Detectar patrones de bucle en KPI
  if (message.includes('[KPI DEBUG]') || message.includes('fetchKPIs')) {
    kpiCallCount++;
    const now = Date.now();
    const timeDiff = now - lastKpiCallTime;
    
    kpiCallLog.push({
      time: now,
      message: message,
      count: kpiCallCount
    });
    
    // Mantener solo los últimos 20 logs
    if (kpiCallLog.length > 20) {
      kpiCallLog = kpiCallLog.slice(-20);
    }
    
    if (kpiCallCount > 5 && timeDiff < 2000) {
      console.warn('🚨 POSIBLE BUCLE INFINITO EN KPI DETECTADO:');
      console.warn(`   - Llamadas KPI en 2 segundos: ${kpiCallCount}`);
      console.warn(`   - Tiempo entre llamadas: ${timeDiff}ms`);
      console.warn('   - Últimos logs:');
      kpiCallLog.slice(-5).forEach(log => {
        console.warn(`     ${new Date(log.time).toLocaleTimeString()}: ${log.message}`);
      });
    }
    
    lastKpiCallTime = now;
  }
  
  originalLog.apply(console, args);
};

// Limpiar contadores cada 10 segundos
setInterval(() => {
  if (kpiCallCount > 0) {
    console.log(`📊 Llamadas KPI en los últimos 10s: ${kpiCallCount}`);
    kpiCallCount = 0;
    kpiCallLog = [];
  }
}, 10000);

console.log('✅ Monitoreo de KPI activo. Selecciona participantes para verificar.');


