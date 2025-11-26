// Script de prueba para crear grupos
const https = require('http');

async function testGroupCreation() {
  console.log('🎯 Probando creación de grupos...\n');

  // Primero obtener jugadores disponibles
  console.log('1️⃣ Obteniendo jugadores disponibles...');
  
  try {
    const playersResponse = await makeRequest('/api/admin/players-public?competitionId=cmid48nzo0000ufe0sq8is1tr');
    console.log(`   Status: ${playersResponse.status}`);
    
    if (playersResponse.data.success && playersResponse.data.players) {
      console.log(`   ✅ Jugadores encontrados: ${playersResponse.data.players.length}`);
      
      if (playersResponse.data.players.length >= 3) {
        // Tomar los primeros 4 jugadores para crear un grupo
        const playerIds = playersResponse.data.players.slice(0, 4).map(p => p.id);
        console.log(`   📝 Creando grupo con jugadores: ${playerIds.join(', ')}`);
        
        // Crear el grupo
        console.log('\n2️⃣ Creando grupo...');
        const createData = {
          playerIds: playerIds,
          groupSize: 4,
          competitionId: 'cmid48nzo0000ufe-0sq8is1tr'
        };
        
        const createResponse = await makeRequest('/api/admin/create-groups', 'POST', createData);
        console.log(`   Status: ${createResponse.status}`);
        
        if (createResponse.data.success) {
          console.log(`   ✅ ${createResponse.data.message}`);
          console.log(`   📊 Grupos creados: ${createResponse.data.groupsCreated}`);
        } else {
          console.log(`   ❌ Error: ${createResponse.data.error}`);
          if (createResponse.data.details) {
            console.log(`   Detalles: ${createResponse.data.details}`);
          }
        }
      } else {
        console.log('   ⚠️  No hay suficientes jugadores (mínimo 3)');
      }
    } else {
      console.log('   ❌ Error al obtener jugadores:', playersResponse.data.error);
    }
    
  } catch (error) {
    console.log(`   ❌ Error general: ${error.message}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n💡 NOTAS:');
  console.log('- Se requieren al menos 3 jugadores para crear grupos');
  console.log('- Los jugadores deben estar registrados en la competición');
  console.log('- Los jugadores no deben estar ya en grupos de esa competición');
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

testGroupCreation().catch(console.error);