import { NextRequest, NextResponse } from "next/server";
import { getUsersByZone } from "@/app/admin/actions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get("leagueId");

    if (!leagueId) {
      return NextResponse.json(
        { error: "leagueId es requerido" },
        { status: 400 }
      );
    }

    const result = await getUsersByZone(leagueId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);

  } catch (error) {
    console.error("Error en API users-by-zone:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
