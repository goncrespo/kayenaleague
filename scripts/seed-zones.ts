import { PrismaClient, ZoneName } from "@prisma/client";

const prisma = new PrismaClient();

const MADRID_ZONES = [
  {
    name: ZoneName.NORTE,
    description: "Zona Norte de Madrid - Chamartín, Tetuán, Chamberí, Salamanca",
    districts: [
      "Chamartín",
      "Tetuán", 
      "Chamberí",
      "Salamanca",
      "Fuencarral-El Pardo",
      "San Blas-Canillejas"
    ],
    coordinates: "40.4529,-3.6903", // Centro aproximado
    maxCapacity: 120
  },
  {
    name: ZoneName.SUR,
    description: "Zona Sur de Madrid - Usera, Puente de Vallecas, Villaverde, Carabanchel",
    districts: [
      "Usera",
      "Puente de Vallecas",
      "Villaverde",
      "Carabanchel",
      "Villa de Vallecas",
      "Vicálvaro"
    ],
    coordinates: "40.3568,-3.7226",
    maxCapacity: 130
  },
  {
    name: ZoneName.CENTRO,
    description: "Zona Centro de Madrid - Sol, Palacio, Embajadores, Cortes",
    districts: [
      "Centro",
      "Retiro",
      "Arganzuela"
    ],
    coordinates: "40.4168,-3.7038",
    maxCapacity: 80
  },
  {
    name: ZoneName.ESTE,
    description: "Zona Este de Madrid - Ciudad Lineal, Moratalaz, San Blas",
    districts: [
      "Ciudad Lineal",
      "Moratalaz",
      "San Blas-Canillejas",
      "Barajas"
    ],
    coordinates: "40.4237,-3.6381",
    maxCapacity: 100
  },
  {
    name: ZoneName.OESTE,
    description: "Zana Oeste de Madrid - Moncloa, Fuencarral, Latina, Hortaleza",
    districts: [
      "Moncloa-Aravaca",
      "Fuencarral-El Pardo",
      "Latina",
      "Hortaleza",
      "Tetuán"
    ],
    coordinates: "40.4354,-3.7486",
    maxCapacity: 110
  }
];

const MADRID_VENUES = [
  // Zona Norte
  { name: "Club de Golf Chamartín", address: "C. de Princesa 2, Madrid", zoneName: ZoneName.NORTE },
  { name: "Golf Santander", address: "Av. de Cantabria s/n, Madrid", zoneName: ZoneName.NORTE },
  { name: "Centro de Golf Lomas", address: "C. de la Princesa 31, Madrid", zoneName: ZoneName.NORTE },
  
  // Zona Sur
  { name: "Golf Vallecas", address: "C. de Alcalá 100, Madrid", zoneName: ZoneName.SUR },
  { name: "Campo de Golf Carabanchel", address: "C. de la Peseta 20, Madrid", zoneName: ZoneName.SUR },
  { name: "Golf Villaverde", address: "C. de Villaverde 15, Madrid", zoneName: ZoneName.SUR },
  
  // Zona Centro
  { name: "Centro de Golf Madrid", address: "C. de Atocha 25, Madrid", zoneName: ZoneName.CENTRO },
  { name: "Golf Retiro", address: "Paseo del Prado 10, Madrid", zoneName: ZoneName.CENTRO },
  { name: "PractiGolf Centro", address: "C. de Alcalá 45, Madrid", zoneName: ZoneName.CENTRO },
  
  // Zona Este
  { name: "Golf Ciudad Lineal", address: "C. de Arturo Soria 100, Madrid", zoneName: ZoneName.ESTE },
  { name: "Campo de Golf San Blas", address: "C. de la Alhóndiga 50, Madrid", zoneName: ZoneName.ESTE },
  { name: "Golf Barajas", address: "Av. de la Hispanidad 20, Madrid", zoneName: ZoneName.ESTE },
  
  // Zona Oeste
  { name: "Club de Golf Moncloa", address: "C. de Princesa 5, Madrid", zoneName: ZoneName.OESTE },
  { name: "Golf Latina", address: "C. de Toledo 50, Madrid", zoneName: ZoneName.OESTE },
  { name: "Centro de Golf Hortaleza", address: "C. de Hortaleza 75, Madrid", zoneName: ZoneName.OESTE }
];

async function seedZones() {
  try {
    console.log("🌱 Iniciando seed de zonas de Madrid...");

    // Limpiar zonas existentes
    await prisma.matchResult.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.playerGroupAssignment.deleteMany({});
    await prisma.group.deleteMany({});
    await prisma.division.deleteMany({});
    await prisma.season.deleteMany({});
    await prisma.leagueZone.deleteMany({});
    await prisma.subscription.deleteMany({});
    await prisma.zonePreference.deleteMany({});
    await prisma.playerStats.deleteMany({});
    await prisma.partnerVenue.deleteMany({});
    await prisma.zone.deleteMany({});

    console.log("🧹 Zonas existentes eliminadas");

    // Crear nuevas zonas
    for (const zoneData of MADRID_ZONES) {
      const zone = await prisma.zone.create({
        data: {
          name: zoneData.name,
          description: zoneData.description,
          districts: zoneData.districts,
          coordinates: zoneData.coordinates,
          maxCapacity: zoneData.maxCapacity,
          isActive: true
        }
      });
      console.log(`✅ Creada zona: ${zone.name}`);
    }

    // Crear campos de golf asociados
    for (const venueData of MADRID_VENUES) {
      const zone = await prisma.zone.findUnique({
        where: { name: venueData.zoneName }
      });

      if (zone) {
        await prisma.partnerVenue.create({
          data: {
            name: venueData.name,
            address: venueData.address,
            zoneId: zone.id
          }
        });
        console.log(`⛳ Creado campo: ${venueData.name} en zona ${zone.name}`);
      }
    }

    console.log("✨ Seed completado exitosamente!");
    
    // Mostrar resumen
    const zones = await prisma.zone.findMany({
      include: { venues: true }
    });
    
    console.log("\n📊 RESUMEN:");
    zones.forEach(zone => {
      console.log(`${zone.name}: ${zone.venues.length} campos de golf`);
    });

  } catch (error) {
    console.error("❌ Error en el seed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el seed
if (require.main === module) {
  seedZones()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedZones };