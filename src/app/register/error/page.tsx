export default function RegisterErrorPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-6 text-center">
      <h1 className="text-3xl font-bold mb-4 text-red-500">No se ha podido completar el pago</h1>
      <p className="text-gray-300 mb-8">Tu registro está creado, pero el pago no se realizó correctamente. Inténtalo de nuevo.</p>
      <a href="/register" className="btn-primary">Volver a intentarlo</a>
    </div>
  );
}

