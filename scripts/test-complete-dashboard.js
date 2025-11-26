// Test completo del dashboard de administrador
const https = require('http');

async function testCompleteDashboard() {
  console.log('🚀 Test completo del Dashboard de Administrador\n');
  
  const tests = [
    {
      name: 'Dashboard Principal',
      type: 'page',
      url: '/admin/dashboard',
      expected: 200
    },
    {
      name: 'Competiciones',
      type: 'api',
      url: '/api/admin/competitions-public',
      method: 'GET'
    },
    {
      name: 'Jugadores',
      type: 'api',
      url: '/api/admin/players-public',
      method: 'GET'
    },
    {
      name: 'Zonas',
      type: 'api',
      url: '/api/admin/zones',
      method: 'GET'
    },
    {
      name: 'Crear Grupos (GET)',
      type: 'api',
      url: '/api/admin/create-groups',
      method: 'GET',
      expected: 405 // Solo acepta POST
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`📋 Test: ${test.name}`);
    console.log(`   URL: ${test.url}`);
    console.log(`   Método: ${test.method || 'GET'}`);
    
    try {
      const response = await makeRequest(test.url, test.method);
      
      console.log(`   Status: ${response.status}`);
      
      if (test.expected && response.status !== test.expected) {
        console.log(`   ❌ Esperado: ${test.expected}, Obtenido: ${response.status}`);
        failed++;
      } else if (response.isHtml && test.type === 'api') {
        console.log(`   ⚠️  Respuesta HTML en lugar de JSON`);
        failed++;
      } else if (response.data.error) {
        console.log(`   ❌ Error: ${response.data.error}`);
        if (response.data.details) {
          console.log(`   Detalles: ${response.data.details}`);
        }
        failed++;
      } else if (response.status >= 400) {
        console.log(`   ❌ Error HTTP ${response.status}`);
        failed++;
      } else {
        console.log(`   ✅ Test pasado`);
        passed++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      failed++;
    }
    
    console.log('');
  }

  console.log('='.repeat(50));
  console.log('\n📊 RESULTADOS DEL TEST:');
  console.log(`✅ Pasados: ${passed}`);
  console.log(`❌ Fallidos: ${failed}`);
  console.log(`📈 Porcentaje: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed > 0) {
    console.log('\n🔧 RECOMENDACIONES:');
    console.log('- Verificar los logs del servidor para errores detallados');
    console.log('- Asegurar que todos los endpoints estén correctamente configurados');
    console.log('- Verificar la autenticación y permisos');
    console.log('- Revisar el formato de las respuestas JSON');
  }
}

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3003,
      path: path,
      method: method,
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

testCompleteDashboard().catch(console.error);