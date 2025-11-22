import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    const adminUser = await getCurrentAdmin();

    if (!adminUser) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    return NextResponse.json(adminUser);

  } catch (error) {
    console.error("Error getting current admin:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
