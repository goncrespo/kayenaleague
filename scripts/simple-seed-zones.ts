// Script simple para pobrar las zonas de Madrid
// Este script puede ser ejecutado directamente con tsx sin depender del cliente de Prisma

const MADRID_ZONES = [
  {
    name: 'NORTE',
    description: 'Zona Norte de Madrid - Chamartín, Tetuán, Chamberí, Salamanca',
    districts: [
      'Chamartín',
      'Tetuán', 
      'Chamberí',
      'Salamanca',
      'Fuencarral-El Pardo',
      'San Blas-Canillejas'
    ],
    coordinates: '40.4529,-3.6903',
    maxCapacity: 120
  },
  {
    name: 'SUR',
    description: 'Zona Sur de Madrid - Usera, Puente de Vallecas, Villaverde, Carabanchel',
    districts: [
      'Usera',
      'Puente de Vallecas',
      'Villaverde',
      'Carabanchel',
      'Villa de Vallecas',
      'Vicálvaro'
    ],
    coordinates: '40.3568,-3.7226',
    maxCapacity: 130
  },
  {
    name: 'CENTRO',
    description: 'Zona Centro de Madrid - Sol, Palacio, Embajadores, Cortes',
    districts: [
      'Centro',
      'Retiro',
      'Arganzuela'
    ],
    coordinates: '40.4168,-3.7038',
    maxCapacity: 80
  },
  {
    name: 'ESTE',
    description: 'Zona Este de Madrid - Ciudad Lineal, Moratalaz, San Blas',
    districts: [
      'Ciudad Lineal',
      'Moratalaz',
      'San Blas-Canillejas',
      'Barajas'
    ],
    coordinates: '40.4237,-3.6381',
    maxCapacity: 100
  },
  {
    name: 'OESTE',
    description: 'Zana Oeste de Madrid - Moncloa, Fuencarral, Latina, Hortaleza',
    districts: [
      'Moncloa-Aravaca',
      'Fuencarral-El Pardo',
      'Latina',
      'Hortaleza',
      'Tetuán'
    ],
    coordinates: '40.4354,-3.7486',
    maxCapacity: 110
  }
];

const MADRID_VENUES = [
  // Zona Norte
  { name: "Club de Golf Chamartín", address: "C. de Princesa 2, Madrid", zoneName: 'NORTE' },
  { name: "Golf Santander", address: "Av. de Cantabria s/n, Madrid", zoneName: 'NORTE' },
  { name: "Centro de Golf Lomas", address: "C. de la Princesa 31, Madrid", zoneName: 'NORTE' },
  
  // Zona Sur
  { name: "Golf Vallecas", address: "C. de Alcalá 100, Madrid", zoneName: 'SUR' },
  { name: "Campo de Golf Carabanchel", address: "C. de la Peseta 20, Madrid", zoneName: 'SUR' },
  { name: "Golf Villaverde", address: "C. de Villaverde 15, Madrid", zoneName: 'SUR' },
  
  // Zona Centro
  { name: "Centro de Golf Madrid", address: "C. de Atocha 25, Madrid", zoneName: 'CENTRO' },
  { name: "Golf Retiro", address: "Paseo del Prado 10, Madrid", zoneName: 'CENTRO' },
  { name: "PractiGolf Centro", address: "C. de Alcalá 45, Madrid", zoneName: 'CENTRO' },
  
  // Zona Este
  { name: "Golf Ciudad Lineal", address: "C. de Arturo Soria 100, Madrid", zoneName: 'ESTE' },
  { name: "Campo de Golf San Blas", address: "C. de la Alhóndiga 50, Madrid", zoneName: 'ESTE' },
  { name: "Golf Barajas", address: "Av. de la Hispanidad 20, Madrid", zoneName: 'ESTE' },
  
  // Zona Oeste
  { name: "Club de Golf Moncloa", address: "C. de Princesa 5, Madrid", zoneName: 'OESTE' },
  { name: "Golf Latina", address: "C. de Toledo 50, Madrid", zoneName: 'OESTE' },
  { name: "Centro de Golf Hortaleza", address: "C. de Hortaleza 75, Madrid", zoneName: 'OESTE' }
];

// Función para ejecutar SQL directamente
async function seedZonesSQL() {
  console.log("🌱 Iniciando seed de zonas de Madrid con SQL directo...");

  try {
    // Aquí iría el código SQL directo para insertar las zonas
    // Por ahora, vamos a crear un archivo SQL que puedas ejecutar manualmente
    
    let sql = `-- SQL para insertar zonas de Madrid\n`;
    sql += `-- Ejecutar este script en tu base de datos PostgreSQL\n\n`;
    
    // Limpiar zonas existentes
    sql += `-- Limpiar datos existentes\n`;
    sql += `DELETE FROM "PartnerVenue" WHERE 1=1;\n`;
    sql += `DELETE FROM "ZonePreference" WHERE 1=1;\n`;
    sql += `DELETE FROM "Zone" WHERE 1=1;\n\n`;
    
    // Insertar zonas
    sql += `-- Insertar zonas de Madrid\n`;
    for (const zone of MADRID_ZONES) {
      sql += `INSERT INTO "Zone" (id, name, description, "isActive", coordinates, districts, "maxCapacity", "createdAt", "updatedAt") VALUES (\n`;
      sql += `  gen_random_uuid(),\n`;
      sql += `  '${zone.name}',\n`;
      sql += `  '${zone.description}',\n`;
      sql += `  true,\n`;
      sql += `  '${zone.coordinates}',\n`;
      sql += `  ARRAY[${zone.districts.map(d => `'${d}'`).join(', ')}],\n`;
      sql += `  ${zone.maxCapacity},\n`;
      sql += `  NOW(),\n`;
      sql += `  NOW()\n`;
      sql += `);\n\n`;
    }
    
    // Insertar campos de golf
    sql += `-- Insertar campos de golf por zona\n`;
    for (const venue of MADRID_VENUES) {
      sql += `INSERT INTO "PartnerVenue" (id, name, address, "zoneId", "createdAt", "updatedAt") VALUES (\n`;
      sql += `  gen_random_uuid(),\n`;
      sql += `  '${venue.name}',\n`;
      sql += `  '${venue.address}',\n`;
      sql += `  (SELECT id FROM "Zone" WHERE name = '${venue.zoneName}' LIMIT 1),\n`;
      sql += `  NOW(),\n`;
      sql += `  NOW()\n`;
      sql += `);\n`;
    }

    console.log("📄 Script SQL generado:");
    console.log(sql);
    
    // Guardar el script en un archivo
    const fs = require('fs');
    fs.writeFileSync('seed-zones.sql', sql);
    
    console.log("✅ Script SQL guardado en 'seed-zones.sql'");
    console.log("📋 Para aplicar los cambios, ejecuta en tu base de datos PostgreSQL:");
    console.log("psql -U postgres -d kayenaleague -f seed-zones.sql");

  } catch (error) {
    console.error("❌ Error generando script SQL:", error);
  }
}

// Ejecutar
if (require.main === module) {
  seedZonesSQL()
    .then(() => {
      console.log("✅ Proceso completado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error:", error);
      process.exit(1);
    });
}

export { seedZonesSQL };