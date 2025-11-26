// Script de prueba directo para crear grupos
const https = require('http');

async function testCreateGroupsDirect() {
  console.log('🚀 Probando creación de grupos directamente...\n');

  const testData = {
    playerIds: ["cmicztl6x000fufq0l4yjbbbj", "cmicztl2g0009ufq0n86sm59i", "cmicztl5h000dufq03qfooaoq"],
    groupSize: 3,
    competitionId: "cmid48nzo0000ufe0sq8is1tr"
  };

  console.log('📤 Enviando datos:', JSON.stringify(testData, null, 2));

  try {
    const response = await makeRequest('/api/admin/create-groups-public', 'POST', testData);
    console.log(`   Status: ${response.status}`);
    
    if (response.isHtml) {
      console.log('   ❌ Respuesta HTML - error del servidor');
      console.log('   HTML:', response.data.substring(0, 200));
    } else {
      console.log('   ✅ Respuesta JSON obtenida');
      console.log('   Datos:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        console.log(`   🎉 ${response.data.message}`);
      } else {
        console.log(`   ❌ Error: ${response.data.error}`);
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Error general: ${error.message}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n🔍 Si el error persiste, verificar:');
  console.log('1. Que el endpoint /api/admin/create-groups-public exista');
  console.log('2. Que no haya errores de sintaxis en el código');
  console.log('3. Que la carpeta del endpoint esté correctamente creada');
  console.log('4. Reiniciar el servidor de desarrollo');
}

function makeRequest(path, method = 'GET', data = null) {
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
          reject(new Error(`Error parsing JSON: ${error.message}`));
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

testCreateGroupsDirect().catch(console.error);