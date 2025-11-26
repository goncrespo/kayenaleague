import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DashboardStats from "@/components/user/DashboardStats";
import MatchList from "@/components/user/MatchList";
import ZoneInfo from "@/components/user/ZoneInfo";
import DashboardNav from "@/components/user/DashboardNav";
import DashboardHero from "@/components/user/DashboardHero";
import DashboardInfoCard from "@/components/user/DashboardInfoCard";
import DashboardQuickActions from "@/components/user/DashboardQuickActions";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(session.user as any).id) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl mb-4">🏌️</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-200 bg-clip-text text-transparent">
            Bienvenido a Kayena League
          </h2>
          <p className="text-lg text-gray-300">
            Debes iniciar sesión para acceder a tu dashboard personal
          </p>
          <Link 
            className="inline-flex items-center justify-center rounded-lg bg-emerald-400 text-black px-8 py-3 font-semibold shadow-xl hover:bg-emerald-300 transition-all duration-200"
            href="/signin"
          >
            Iniciar Sesión
          </Link>
        </div>
      </main>
    );
  }

  const userId = (session.user as any).id as string;

  // Obtener información del usuario
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      zone: true,
      playerStats: true,
      zonePreference: {
        include: {
          homeZone: true
        }
      }
    }
  });

  // Obtener suscripción activa
  const subscription = await prisma.subscription.findFirst({
    where: { 
      userId, 
      paid: true, 
      startDate: { lte: new Date() }, 
      endDate: { gte: new Date() } 
    },
    select: { 
      league: { 
        select: { 
          id: true, 
          name: true,
          startDate: true,
          endDate: true 
        } 
      } 
    },
  });

  // Obtener asignación actual
  const assignment = await prisma.playerGroupAssignment.findFirst({
    where: { playerId: userId },
    select: { 
      group: { 
        select: { 
          id: true, 
          name: true, 
          division: { 
            select: { 
              id: true, 
              name: true 
            } 
          } 
        } 
      } 
    },
  });

  // Obtener estadísticas de zona
  const zoneStats = user?.zone ? await calculateZoneStats(user.zone.id) : null;

  // Preparar datos para los componentes
  const zoneInfo = {
    userZone: user?.zone,
    zonePreference: user?.zonePreference,
    userStats: user?.playerStats,
    playersInZone: zoneStats?.totalPlayers || 0,
    zoneStats,
    availableVenues: user?.zone ? await getAvailableVenues(user.zone.id) : [],
    recentMatches: user?.zone ? await getZoneMatches(user.zone.id) : [],
    canChangeZone: !user?.zonePreference
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navegación superior con estilo de landing */}
      <DashboardNav userName={session.user?.name || session.user?.email} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Encabezado con estilo Hero - Componente del cliente */}
        <DashboardHero userName={session.user?.name || session.user?.email} />

        {/* Información de la liga con estilo de cards - Componente del cliente */}
        <DashboardInfoCard 
          subscription={subscription}
          assignment={assignment}
          userZone={user?.zone}
        />

        {/* Accesos rápidos con estilo de botones Hero - Componente del cliente */}
        <DashboardQuickActions />

        {/* Estadísticas del jugador - Componente del cliente */}
        <section className="mb-8">
          <DashboardStats 
            stats={user?.playerStats || undefined} 
            isLoading={false}
          />
        </section>

        {/* Grid principal con estilo de cards - Componentes del cliente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Partidos pendientes */}
          <section>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Próximos Partidos</h2>
                <Link 
                  href="/dashboard/matches"
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Ver todos →
                </Link>
              </div>
              <MatchList title="" type="upcoming" limit={3} />
            </div>
          </section>

          {/* Historial reciente */}
          <section>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Últimos Partidos</h2>
                <Link 
                  href="/dashboard/matches"
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Ver todos →
                </Link>
              </div>
              <MatchList title="" type="history" limit={3} />
            </div>
          </section>
        </div>

        {/* Información de zona */}
        <section>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Mi Zona: {user?.zone?.name}</h2>
              <Link 
                href="/dashboard/zone"
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Ver detalles →
              </Link>
            </div>
            <ZoneInfo zoneInfo={zoneInfo} isLoading={false} />
          </div>
        </section>
      </main>
    </div>
  );
}

// Funciones auxiliares (sin cambios)
async function calculateZoneStats(zoneId: string) {
  const zoneUsers = await prisma.user.findMany({
    where: { zoneId },
    include: {
      playerStats: true,
      matchesAsHomePlayer: {
        where: { status: "COMPLETED" }
      },
      matchesAsAwayPlayer: {
        where: { status: "COMPLETED" }
      }
    }
  });

  const totalPlayers = zoneUsers.length;
  const activePlayers = zoneUsers.filter(u => u.playerStats && u.playerStats.totalMatches > 0).length;
  
  const totalMatches = zoneUsers.reduce((acc, user) => {
    return acc + user.matchesAsHomePlayer.length + user.matchesAsAwayPlayer.length;
  }, 0);

  const avgHandicap = totalPlayers > 0 
    ? zoneUsers.reduce((acc, user) => acc + (user.handicap || 0), 0) / totalPlayers
    : 0;

  return {
    totalPlayers,
    activePlayers,
    totalMatches,
    avgHandicap: Math.round(avgHandicap * 10) / 10,
    activityRate: totalPlayers > 0 ? Math.round((activePlayers / totalPlayers) * 100) : 0
  };
}

async function getAvailableVenues(zoneId: string) {
  return await prisma.partnerVenue.findMany({
    where: { zoneId }
  });
}

async function getZoneMatches(zoneId: string) {
  const users = await prisma.user.findMany({
    where: { zoneId },
    select: { id: true }
  });

  const userIds = users.map(u => u.id);

  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { homePlayerId: { in: userIds } },
        { awayPlayerId: { in: userIds } }
      ],
      status: "COMPLETED"
    },
    include: {
      homePlayer: {
        select: { name: true, lastName: true, zone: true }
      },
      awayPlayer: {
        select: { name: true, lastName: true, zone: true }
      },
      winner: {
        select: { name: true, lastName: true }
      }
    },
    orderBy: { matchDate: "desc" },
    take: 5
  });

  return matches.map(match => ({
    id: match.id,
    roundNumber: match.roundNumber,
    matchDate: match.matchDate,
    homePlayer: match.homePlayer,
    awayPlayer: match.awayPlayer,
    winner: match.winner,
    status: match.status
  }));
}