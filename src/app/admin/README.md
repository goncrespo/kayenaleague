# Panel de Administración - Kayena League

Este panel permite a los administradores gestionar la competición de golf de manera eficiente.

## Funcionalidades

### 1. Crear Grupos (`createGroups`)

**Propósito:** Agrupa automáticamente a los usuarios suscritos por zona y crea grupos de 4 jugadores cada uno.

**Proceso:**
1. Obtiene todos los usuarios suscritos y pagados de la liga
2. Filtra usuarios que tengan zona asignada
3. Agrupa usuarios por zona (NOROESTE, NORESTE, SUROESTE, SURESTE)
4. Crea grupos de 4 jugadores por zona
5. Asigna jugadores a grupos de forma aleatoria

**Requisitos:**
- La liga debe existir
- Debe haber usuarios suscritos con zona definida
- Los usuarios deben tener el campo `paid: true` en su suscripción

### 2. Generar Partidos de Grupo (`generateGroupMatches`)

**Propósito:** Crea los enfrentamientos de todos contra todos para un grupo específico.

**Proceso:**
1. Verifica que el grupo tenga exactamente 4 jugadores
2. Genera 6 partidos (todos contra todos)
3. Asigna aleatoriamente quién es local y quién visitante
4. Establece fecha límite de 7 días para jugar

**Requisitos:**
- El grupo debe existir
- El grupo debe tener exactamente 4 jugadores
- No deben existir partidos previos para el grupo

### 3. Crear Fase de Eliminatorias (`createKnockoutStage`)

**Propósito:** Crea la fase de eliminatorias basada en la clasificación final de los grupos.

**Proceso:**
1. Calcula la clasificación de cada grupo basada en:
   - Puntos (3 por victoria, 1 por empate)
   - Diferencia de hoyos en caso de empate
2. Crea una ronda de "Octavos de Final"
3. Genera cruces en espejo:
   - 1º Grupo A vs 4º Grupo B
   - 2º Grupo A vs 3º Grupo B
   - etc.
4. Establece fecha límite de 14 días para los partidos

**Requisitos:**
- La liga debe existir
- Deben existir grupos con partidos completados
- No debe existir una fase de eliminatorias previa

## Criterios de Clasificación

### Fase de Grupos
1. **Puntos:** 3 por victoria, 1 por empate, 0 por derrota
2. **Diferencia de hoyos:** En caso de empate en puntos
3. **Hoyos ganados:** En caso de empate en diferencia

### Fase de Eliminatorias
- Se crean cruces en espejo entre grupos
- Los partidos se asignan aleatoriamente como local/visitante
- El ganador avanza a la siguiente ronda

## Uso del Panel

1. **Acceder al panel:** Navega a `/admin`
2. **Ver información:** El panel muestra todas las ligas y grupos existentes
3. **Ejecutar acciones:** Usa los IDs mostrados para ejecutar las funciones
4. **Monitorear resultados:** Los mensajes de éxito/error aparecen en tiempo real

## Estructura de Datos

### Modelos Principales
- `League`: Liga de competición
- `Division`: División dentro de una liga
- `Group`: Grupo de 4 jugadores
- `PlayerGroupAssignment`: Asignación de jugador a grupo
- `Match`: Partido entre dos jugadores
- `KnockoutRound`: Ronda de eliminatorias

### Tipos de Partidos
- `GROUP_STAGE`: Partidos de fase de grupos
- `KNOCKOUT`: Partidos de eliminatorias

### Estados de Partidos
- `PENDING`: Partido pendiente de jugar
- `COMPLETED`: Partido completado
- `CANCELLED`: Partido cancelado

## Consideraciones Técnicas

- Todas las acciones son **Server Actions** de Next.js
- Se usa **Prisma** para las operaciones de base de datos
- Los datos se revalidan automáticamente después de cada acción
- Se incluye manejo completo de errores
- La interfaz es responsive y accesible

## Seguridad

- Solo usuarios con rol de administrador pueden acceder
- Todas las operaciones se validan en el servidor
- Los IDs se validan antes de ejecutar acciones
- Se previenen operaciones duplicadas
