// Agregar al final del archivo schema.prisma existente

// Enums nuevos
enum CompetitionStatus {
  DRAFT
  ACTIVE
  COMPLETED
  CANCELLED
}

enum CompetitionType {
  WINTER
  SPRING
  SUMMER
  AUTUMN
  ANNUAL
}

// Modelos nuevos para ligas/competiciones por ciudad
model Competition {
  id          String              @id @default(cuid())
  name        String
  description String?
  type        CompetitionType     @default(ANNUAL)
  status      CompetitionStatus   @default(DRAFT)
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean             @default(false)
  price       Float               @default(0)
  city        City
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt
  
  // Relaciones
  players     CompetitionPlayer[]
  groups      Group[]
  matches     Match[]
  
  @@index([city, isActive])
  @@index([startDate, endDate])
  @@unique([name, city, startDate])
}

model CompetitionPlayer {
  id            String        @id @default(cuid())
  competitionId String
  competition   Competition   @relation(fields: [competitionId], references: [id], onDelete: Cascade)
  playerId      String
  player        User          @relation(fields: [playerId], references: [id], onDelete: Cascade)
  registeredAt  DateTime      @default(now())
  isActive      Boolean       @default(true)
  
  @@unique([competitionId, playerId])
  @@index([competitionId, isActive])
  @@index([playerId, isActive])
}

// Actualizar modelos existentes para incluir competición
model User {
  // ... (campos existentes) ...
  
  // Nuevos campos para competiciones
  competitions CompetitionPlayer[]
  
  // ... (resto del modelo) ...
}

model Match {
  // ... (campos existentes) ...
  
  // Nuevos campos
  competitionId String?
  competition   Competition?  @relation(fields: [competitionId], references: [id])
  
  // ... (resto del modelo) ...
  
  @@index([competitionId])
}