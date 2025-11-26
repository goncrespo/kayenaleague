// Script de prueba para verificar que los endpoints de competiciones funcionen
const https = require('http');

async function testCompetitionsEndpoints() {
  console.log('🧪 Probando endpoints de competiciones corregidos...\n');

  const tests = [
    {
      name: 'Competiciones Públicas',
      url: '/api/admin/competitions-public',
      method: 'GET'
    },
    {
      name: 'Competiciones Protegidas (sin auth)',
      url: '/api/admin/competitions',
      method: 'GET',
      expected: 403
    }
  ];

  for (const test of tests) {
    console.log(`📋 Test: ${test.name}`);
    console.log(`   URL: ${test.url}`);
    console.log(`   Método: ${test.method}`);
    
    try {
      const response = await makeRequest(test.url, test.method);
      console.log(`   Status: ${response.status}`);
      
      if (test.expected && response.status !== test.expected) {
        console.log(`   ⚠️  Esperado: ${test.expected}, Obtenido: ${response.status}`);
      } else if (response.isHtml) {
        console.log(`   ❌ Respuesta HTML - posible error`);
        console.log(`   Preview: ${response.data.substring(0, 100)}...`);
      } else {
        console.log(`   ✅ Respuesta JSON obtenida`);
        if (response.data.error) {
          console.log(`   ❌ Error en datos: ${response.data.error}`);
          if (response.data.details) {
            console.log(`   Detalles: ${response.data.details}`);
          }
        } else if (response.data.success) {
          console.log(`   ✅ Datos correctos`);
          if (response.data.competitions) {
            console.log(`   📊 Competiciones encontradas: ${response.data.total}`);
            response.data.competitions.slice(0, 3).forEach(comp => {
              console.log(`   - ${comp.name} (${comp.city}) - ${comp.totalPlayers} jugadores`);
            });
          }
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('='.repeat(50));
  console.log('\n🔍 DIAGNÓSTICO:');
  console.log('El error indica que el campo `_count.matches` no existe en el esquema.');
  console.log('Las competiciones tienen grupos, y los grupos tienen partidos.');
  console.log('Por eso contamos los partidos a través de los grupos manualmente.');
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

testCompetitionsEndpoints().catch(console.error);