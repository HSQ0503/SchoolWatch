import { PrismaClient } from "../lib/generated/prisma/client";
import config from "../school.config";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.schoolEvent.deleteMany();

  const result = await prisma.schoolEvent.createMany({
    data: config.calendar.events.map((e) => ({
      date: e.date,
      name: e.name,
      type: e.type,
      endDate: e.endDate ?? null,
    })),
  });

  console.log(`Seeded ${result.count} events`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
