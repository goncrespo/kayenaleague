// Script de prueba con autenticación simulada
const https = require('http');

// Simular headers de autenticación (esto es solo para pruebas)
const ADMIN_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-User-Role': 'ADMIN', // Header simulado para pruebas
  'X-User-Email': 'admin2@kayena.com'
};

function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: method,
      headers: { ...ADMIN_HEADERS, ...headers }
    };

    if (data) {
      const dataString = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(dataString);
    }

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
  console.log('🧪 Probando API de Competiciones con autenticación simulada...\n');

  try {
    // Test 1: GET competiciones
    console.log('1️⃣ GET /api/admin/competitions (con auth simulada)');
    try {
      const response = await makeRequest('/api/admin/competitions');
      console.log(`   Status: ${response.status}`);
      if (response.isHtml) {
        console.log('   ❌ Respuesta HTML');
        console.log('   HTML preview:', response.data.substring(0, 100) + '...');
      } else {
        console.log('   ✅ Respuesta JSON obtenida');
        if (response.data.success) {
          console.log(`   📊 Competiciones encontradas: ${response.data.total}`);
          response.data.competitions.forEach(comp => {
            console.log(`   - ${comp.name} (${comp.city}) - ${comp.totalPlayers} jugadores - Activa: ${comp.isActive}`);
          });
        } else {
          console.log('   ❌ Error en datos:', response.data.error);
        }
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: GET competiciones-test
    console.log('2️⃣ GET /api/admin/competitions-test (con auth simulada)');
    try {
      const response = await makeRequest('/api/admin/competitions-test');
      console.log(`   Status: ${response.status}`);
      if (response.isHtml) {
        console.log('   ❌ Respuesta HTML');
      } else {
        console.log('   ✅ Respuesta JSON obtenida');
        if (response.data.success) {
          console.log(`   📊 Competiciones encontradas: ${response.data.total}`);
        } else {
          console.log('   ❌ Error en datos:', response.data.error);
          if (response.data.details) {
            console.log('   Detalles:', response.data.details);
          }
        }
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: POST crear competición
    console.log('3️⃣ POST /api/admin/competitions (crear competición)');
    const newCompetition = {
      name: 'Liga Test 2024',
      description: 'Competición de prueba para testing',
      type: 'LEAGUE',
      startDate: '2024-06-01',
      endDate: '2024-12-31',
      price: 99.99,
      city: 'MADRID'
    };
    
    try {
      const response = await makeRequest('/api/admin/competitions', 'POST', newCompetition);
      console.log(`   Status: ${response.status}`);
      if (response.isHtml) {
        console.log('   ❌ Respuesta HTML');
      } else {
        console.log('   ✅ Respuesta JSON obtenida');
        if (response.data.success) {
          console.log('   🎉 Competición creada exitosamente!');
          console.log(`   ID: ${response.data.competition.id}`);
          console.log(`   Nombre: ${response.data.competition.name}`);
        } else {
          console.log('   ❌ Error al crear:', response.data.error);
          if (response.data.details) {
            console.log('   Detalles:', response.data.details);
          }
        }
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: GET con filtros
    console.log('4️⃣ GET /api/admin/competitions?city=MADRID&isActive=true');
    try {
      const response = await makeRequest('/api/admin/competitions?city=MADRID&isActive=true');
      console.log(`   Status: ${response.status}`);
      if (response.isHtml) {
        console.log('   ❌ Respuesta HTML');
      } else {
        console.log('   ✅ Respuesta JSON obtenida');
        if (response.data.success) {
          console.log(`   📊 Competiciones activas en Madrid: ${response.data.total}`);
        } else {
          console.log('   ❌ Error en datos:', response.data.error);
        }
      }
    } catch (error) {
      console.log('   ❌ Error:', error.message);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar prueba
testCompetitionsAPI().catch(console.error);