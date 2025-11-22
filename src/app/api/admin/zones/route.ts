import { NextResponse } from "next/server";
import { getAllZones } from "@/app/admin/actions";

export async function GET() {
  try {
    const result = await getAllZones();

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);

  } catch (error) {
    console.error("Error en API zones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
