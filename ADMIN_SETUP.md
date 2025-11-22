# Configuración del Panel de Administración

## Variables de Entorno Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos
DATABASE_URL="postgresql://username:password@localhost:5432/kayena_league"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# JWT para administradores
JWT_SECRET="your-jwt-secret-key-here"

# Credenciales del administrador inicial
ADMIN_EMAIL="admin@kayena.com"
ADMIN_PASSWORD="admin123"
ADMIN_NAME="Administrador"
```

## Instalación y Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Base de Datos

```bash
# Generar el cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma db push
```

### 3. Crear Usuario Administrador

```bash
# Crear el primer usuario administrador
npm run create-admin
```

Este comando creará un usuario administrador con las credenciales especificadas en las variables de entorno.

### 4. Iniciar el Servidor

```bash
npm run dev
```

## Acceso al Panel de Administración

1. Navega a `http://localhost:3000/admin/login`
2. Usa las credenciales del administrador creado
3. Accede al panel en `http://localhost:3000/admin`

## Seguridad

### Recomendaciones Importantes

1. **Cambiar contraseña por defecto**: Después del primer login, cambia la contraseña del administrador
2. **Variables de entorno seguras**: Usa claves JWT y NextAuth secretas y únicas
3. **HTTPS en producción**: Asegúrate de usar HTTPS en el entorno de producción
4. **Backup de base de datos**: Realiza backups regulares de la base de datos

### Configuración de Producción

Para producción, asegúrate de:

- Usar una base de datos PostgreSQL segura
- Configurar variables de entorno en tu plataforma de hosting
- Usar claves JWT y NextAuth secretas y únicas
- Habilitar HTTPS
- Configurar un dominio personalizado

## Funcionalidades del Panel

### Gestión de Competición

1. **Crear Grupos**: Agrupa usuarios por zona en grupos de 4
2. **Generar Partidos**: Crea enfrentamientos de todos contra todos
3. **Eliminatorias**: Genera la fase de eliminatorias basada en clasificaciones

### Monitoreo

- Vista de todas las ligas y grupos
- Información de suscriptores
- Estados de partidos y competiciones

## Solución de Problemas

### Error de Autenticación

Si tienes problemas para acceder al panel:

1. Verifica que las variables de entorno estén configuradas correctamente
2. Asegúrate de que el usuario administrador existe en la base de datos
3. Revisa los logs del servidor para errores específicos

### Error de Base de Datos

Si hay problemas con la base de datos:

1. Verifica la conexión a PostgreSQL
2. Ejecuta `npx prisma db push` para sincronizar el esquema
3. Verifica que las migraciones se hayan aplicado correctamente

### Error de JWT

Si hay problemas con la autenticación JWT:

1. Verifica que `JWT_SECRET` esté configurado
2. Asegúrate de que la clave sea lo suficientemente segura
3. Reinicia el servidor después de cambiar variables de entorno
