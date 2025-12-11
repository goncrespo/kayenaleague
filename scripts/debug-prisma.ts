import { prisma } from "../src/lib/prisma";

async function main() {
    console.log("Debug Script Started");
    console.log("Prisma Keys:", Object.keys(prisma));

    // @ts-ignore
    if (prisma.competition) {
        console.log("Competition model exists!");
        // @ts-ignore
        const count = await prisma.competition.count();
        console.log("Competition count:", count);
    } else {
        console.error("Competition model is MISSING!");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
