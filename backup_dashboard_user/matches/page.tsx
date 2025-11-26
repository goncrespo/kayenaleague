import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import MatchList from "@/components/user/MatchList";

export default async function MatchesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(session.user as any).id) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <p className="text-lg">Debes iniciar sesión para ver tus partidos.</p>
          <Link className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" href="/signin">
            Ir a iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Partidos</h1>
            <p className="mt-2 text-lg text-gray-600">
              Gestiona todos tus partidos de la liga
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="mb-8">
        <nav className="flex space-x-8">
          <Link
            href="/dashboard/matches"
            className="px-3 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
          >
            Todos los Partidos
          </Link>
          <Link
            href="/dashboard/matches/upcoming"
            className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Próximos
          </Link>
          <Link
            href="/dashboard/matches/history"
            className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Historial
          </Link>
        </nav>
      </div>

      {/* Lista de todos los partidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Próximos Partidos</h2>
          <MatchList title="" type="upcoming" limit={10} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Últimos Partidos Jugados</h2>
          <MatchList title="" type="history" limit={10} />
        </section>
      </div>

      {/* Información adicional */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Información Importante</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Reportar Resultados</h4>
            <p className="text-gray-700">
              Puedes reportar los resultados de tus partidos pendientes. Los resultados quedarán 
              pendientes de validación por el administrador.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Contactar Oponentes</h4>
            <p className="text-gray-700">
              Usa la función de contacto para coordinar fechas y lugares de juego con tus oponentes.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Fechas Límite</h4>
            <p className="text-gray-700">
              Cada partido tiene una fecha límite para ser jugado y reportado. Asegúrate de 
              completarlos a tiempo.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Campos de Golf</h4>
            <p className="text-gray-700">
              Consulta los campos de golf disponibles en tu zona para coordinar donde jugar 
              tus partidos.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}