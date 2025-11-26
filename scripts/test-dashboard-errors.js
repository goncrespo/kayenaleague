// Script para identificar errores en el dashboard
const https = require('http');

async function testDashboardEndpoints() {
  console.log('🔍 Probando endpoints del dashboard de administrador...\n');

  const endpoints = [
    { name: 'Competiciones', path: '/api/admin/competitions-public' },
    { name: 'Jugadores', path: '/api/admin/players' },
    { name: 'Crear Grupos', path: '/api/admin/create-groups' },
    { name: 'Zonas', path: '/api/admin/zones' }
  ];

  for (const endpoint of endpoints) {
    console.log(`📡 Testeando: ${endpoint.name} (${endpoint.path})`);
    
    try {
      const response = await makeRequest(endpoint.path);
      console.log(`   ✅ Status: ${response.status}`);
      
      if (response.isHtml) {
        console.log(`   ⚠️  Respuesta HTML - posible error`);
        console.log(`   Preview: ${response.data.substring(0, 100)}...`);
      } else {
        console.log(`   ✅ JSON válido`);
        if (response.data.error) {
          console.log(`   ❌ Error en datos: ${response.data.error}`);
        } else if (response.data.success) {
          console.log(`   ✅ Datos correctos`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('🔍 Análisis de problemas comunes:');
  console.log('1. Verificar CORS y headers');
  console.log('2. Verificar autenticación');
  console.log('3. Verificar formato de respuesta JSON');
  console.log('4. Verificar imports y dependencias');
}

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3003,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const contentType = res.headers['content-type'];
          if (contentType && contentType.includes('application/json')) {
            const parsedData = JSON.parse(responseData);
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: parsedData
            });
          } else {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: responseData,
              isHtml: true
            });
          }
        } catch (error) {
          reject(new Error(`Error parsing JSON: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Test específico para problemas de CORS y headers
testDashboardEndpoints().catch(console.error);