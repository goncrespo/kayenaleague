import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as { id: string }).id) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <p>Debes iniciar sesión para acceder al dashboard.</p>
          <Link className="underline" href="/signin">Ir a iniciar sesión</Link>
        </div>
      </main>
    );
  }

  const userId = (session.user as { id: string }).id;

  const subscription = await prisma.subscription.findFirst({
    where: { userId, paid: true, startDate: { lte: new Date() }, endDate: { gte: new Date() } },
    select: { league: { select: { id: true, name: true } } },
  });

  const assignment = await prisma.playerGroupAssignment.findFirst({
    where: { playerId: userId },
    select: { group: { select: { id: true, name: true, division: { select: { id: true, name: true } } } } },
  });

  type MatchItem = { id: string; roundNumber: number; deadlineDate: Date; homePlayer: { name: string | null }; awayPlayer: { name: string | null } };

  const upcomingMatches: MatchItem[] = assignment
    ? await prisma.match.findMany({
      where: { groupId: assignment.group.id, status: "PENDING", deadlineDate: { gte: new Date() } },
      orderBy: { deadlineDate: "asc" },
      take: 5,
      select: {
        id: true,
        roundNumber: true,
        deadlineDate: true,
        homePlayer: { select: { name: true } },
        awayPlayer: { select: { name: true } },
      },
    })
    : [];

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-6 py-10 space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-gray-600">Hola, {session.user?.name ?? session.user?.email}</p>
      </header>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="border rounded-lg p-4 space-y-1">
          <h2 className="font-medium">Liga</h2>
          <p>{subscription ? subscription.league.name : "Sin suscripción activa"}</p>
        </div>
        <div className="border rounded-lg p-4 space-y-1">
          <h2 className="font-medium">División / Grupo</h2>
          {assignment ? (
            <p>{assignment.group.division.name} · {assignment.group.name}</p>
          ) : (
            <p>No asignado</p>
          )}
        </div>
        <div className="border rounded-lg p-4 space-y-1">
          <h2 className="font-medium">Acciones</h2>
          <div className="flex gap-3">
            <Link className="underline" href="/profile">Ver perfil</Link>
            <Link className="underline" href="/">Inicio</Link>
          </div>
        </div>
      </section>

      <section className="border rounded-lg p-4 space-y-3">
        <h2 className="font-medium">Próximos partidos</h2>
        {upcomingMatches?.length ? (
          <ul className="space-y-2">
            {upcomingMatches.map((m: MatchItem) => (
              <li key={m.id} className="flex justify-between border rounded-md p-3">
                <span>Jornada {m.roundNumber}: {m.homePlayer.name ?? ""} vs {m.awayPlayer.name ?? ""}</span>
                <span className="text-sm text-gray-500">Límite: {new Date(m.deadlineDate).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay partidos pendientes.</p>
        )}
      </section>
    </main>
  );
}