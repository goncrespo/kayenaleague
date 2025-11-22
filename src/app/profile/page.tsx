import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !(session.user as any).id) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <p>Debes iniciar sesión para ver tu perfil.</p>
          <Link className="underline" href="/signin">Ir a iniciar sesión</Link>
        </div>
      </main>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id as string },
    select: {
      id: true,
      name: true,
      email: true,
      handicap: true,
      handicapVerified: true,
      licenseNumber: true,
      assignments: {
        select: { group: { select: { id: true, name: true, division: { select: { name: true } } } } },
      },
    },
  });

  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId: (session.user as any).id as string,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
      paid: true,
    },
    select: { id: true, league: { select: { id: true, name: true } } },
  });

  type AssignmentItem = { group: { id: string; name: string; division: { name: string } } };

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-10 space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">Mi perfil</h1>
        <p className="text-gray-600">Bienvenido, {user?.name ?? session.user?.email}</p>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4 space-y-2">
          <h2 className="font-medium">Datos</h2>
          <p><span className="text-gray-500">Email:</span> {user?.email}</p>
          <p><span className="text-gray-500">Hándicap:</span> {user?.handicap}</p>
          <p><span className="text-gray-500">Verificado:</span> {user?.handicapVerified ? "Sí" : "No"}</p>
          {user?.licenseNumber && <p><span className="text-gray-500">Licencia:</span> {user.licenseNumber}</p>}
        </div>

        <div className="border rounded-lg p-4 space-y-2">
          <h2 className="font-medium">Suscripción</h2>
          {activeSubscription ? (
            <p>Tienes suscripción activa a la liga <strong>{activeSubscription.league.name}</strong></p>
          ) : (
            <p>No tienes suscripción activa.</p>
          )}
        </div>
      </section>

      <section className="border rounded-lg p-4 space-y-2">
        <h2 className="font-medium">Mi grupo</h2>
        {user?.assignments?.length ? (
          <ul className="list-disc pl-5">
            {(user.assignments as AssignmentItem[]).map((a: AssignmentItem, i: number) => (
              <li key={i}>Grupo {a.group.name} ({a.group.division.name})</li>
            ))}
          </ul>
        ) : (
          <p>No perteneces a ningún grupo actualmente.</p>
        )}
      </section>

      <div className="flex gap-4">
        <Link className="underline" href="/dashboard">Ir al dashboard</Link>
        <Link className="underline" href="/">Volver al inicio</Link>
      </div>
    </main>
  );
} 