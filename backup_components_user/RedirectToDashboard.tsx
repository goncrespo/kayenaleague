"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface RedirectToDashboardProps {
  delay?: number;
}

export default function RedirectToDashboard({ delay = 2000 }: RedirectToDashboardProps) {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [session, router, delay]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <h2 className="text-xl font-semibold text-gray-900">Redirigiendo al dashboard...</h2>
        <p className="text-gray-600">
          Serás redirigido automáticamente en unos segundos
        </p>
        <Link 
          href="/dashboard"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Ir al dashboard ahora
        </Link>
      </div>
    </div>
  );
}