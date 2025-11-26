// Script de prueba para verificar que las competiciones funcionen correctamente
const https = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          // Verificar si la respuesta es JSON
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
          reject(new Error(`Error parsing JSON: ${error.message}. Response: ${responseData.substring(0, 200)}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testCompetitionsAPI() {
  console.log('🧪 Probando API de Competiciones...\n');

  try {
    // Test 1: GET competiciones (sin autenticación)
    console.log('1️⃣ GET /api/admin/competitions (sin auth)');
    try {
      const response = await makeRequest('/api/admin/competitions');
      console.log(`   Status: ${response.status}`);
      if (response.isHtml) {
        console.log('   ❌ Respuesta HTML (probablemente página de login)');
        console.log('   HTML preview:', response.data.substring(0, 100) + '...');
      } else {
        console.log('   ✅ Respuesta JSON:', response.data);
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: GET competiciones-test (sin autenticación)
    console.log('2️⃣ GET /api/admin/competitions-test (sin auth)');
    try {
      const response = await makeRequest('/api/admin/competitions-test');
      console.log(`   Status: ${response.status}`);
      if (response.isHtml) {
        console.log('   ❌ Respuesta HTML');
      } else {
        console.log('   ✅ Respuesta JSON:', JSON.stringify(response.data, null, 2));
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: POST crear competición (sin autenticación)
    console.log('3️⃣ POST /api/admin/competitions (sin auth)');
    const newCompetition = {
      name: 'Test Competition',
      description: 'Competición de prueba',
      type: 'LEAGUE',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      price: 100.00,
      city: 'MADRID'
    };
    
    try {
      const response = await makeRequest('/api/admin/competitions', 'POST', newCompetition);
      console.log(`   Status: ${response.status}`);
      if (response.isHtml) {
        console.log('   ❌ Respuesta HTML');
      } else {
        console.log('   ✅ Respuesta JSON:', JSON.stringify(response.data, null, 2));
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Verificar tipos de contenido
    console.log('4️⃣ Análisis de respuestas');
    console.log('   Los errores de JSON parsing generalmente ocurren cuando:');
    console.log('   - El servidor retorna HTML en lugar de JSON');
    console.log('   - Hay un error de autenticación');
    console.log('   - El endpoint no existe (404)');
    console.log('   - Hay un error en el servidor (500)');

    console.log('\n💡 Recomendaciones:');
    console.log('   1. Verificar que el usuario esté autenticado como ADMIN');
    console.log('   2. Verificar que el session esté correctamente configurado');
    console.log('   3. Verificar logs del servidor para errores detallados');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar prueba
testCompetitionsAPI().catch(console.error);