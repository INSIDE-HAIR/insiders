#!/usr/bin/env node

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function generateApiKey(userId, name = 'Test API Key') {
  try {
    // Generar clave aleatoria
    const randomBytes = crypto.randomBytes(16);
    const apiKey = `ak_dev_${randomBytes.toString('hex')}`;
    
    // Hash de la clave para almacenamiento seguro
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    // Prefijo para mostrar
    const keyPrefix = apiKey.substring(0, 12) + '...';
    
    // Crear en base de datos
    const apiKeyRecord = await prisma.apiKey.create({
      data: {
        name,
        keyHash,
        keyPrefix,
        status: 'ACTIVE',
        userId,
        totalRequests: 0,
        expiresAt: null, // Nunca expira para pruebas
      }
    });
    
    console.log('✅ API Key generada exitosamente:');
    console.log('ID:', apiKeyRecord.id);
    console.log('Nombre:', apiKeyRecord.name);
    console.log('API Key:', apiKey);
    console.log('Prefijo:', keyPrefix);
    console.log('\n📝 Para usar en requests:');
    console.log('Header: Authorization: Bearer ' + apiKey);
    console.log('Header: X-API-Key: ' + apiKey);
    console.log('Query: ?api_key=' + apiKey);
    
    return {
      id: apiKeyRecord.id,
      apiKey,
      keyPrefix,
      name: apiKeyRecord.name
    };
    
  } catch (error) {
    console.error('❌ Error generando API Key:', error);
    throw error;
  }
}

async function main() {
  const userId = process.argv[2] || 'clm_test_user';
  const name = process.argv[3] || 'Test API Key';
  
  try {
    await generateApiKey(userId, name);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
} 