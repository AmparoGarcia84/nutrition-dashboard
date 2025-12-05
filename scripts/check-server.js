#!/usr/bin/env node

/**
 * Script para verificar si el servidor de desarrollo está corriendo y respondiendo correctamente
 * Uso: node scripts/check-server.js
 */

const http = require('http');

const url = 'http://localhost:3000';
const timeout = 5000;

console.log(`Verificando servidor en ${url}...`);

const request = http.get(url, { timeout }, (res) => {
  console.log(`✅ Servidor respondiendo: ${res.statusCode} ${res.statusMessage}`);
  console.log(`   Headers:`, res.headers);
  process.exit(0);
});

request.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    console.log('❌ Servidor no está corriendo en el puerto 3000');
    console.log('   Ejecuta: npm run dev');
  } else if (err.code === 'ETIMEDOUT') {
    console.log('⏱️  Timeout: El servidor no respondió a tiempo');
  } else {
    console.log('❌ Error:', err.message);
  }
  process.exit(1);
});

request.on('timeout', () => {
  request.destroy();
  console.log('⏱️  Timeout: El servidor no respondió a tiempo');
  process.exit(1);
});

