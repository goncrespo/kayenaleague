import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const leagues = await prisma.league.findMany({
      include: {
        divisions: {
          include: {
            groups: {
              include: {
                players: {
                  include: {
                    player: {
                      select: {
                        id: true,
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        subscriptions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                zone: true
              }
            }
          }
        }
      },
      orderBy: {
        startDate: "desc"
      }
    });

    return NextResponse.json(leagues);
  } catch (error) {
    console.error("Error fetching leagues:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
