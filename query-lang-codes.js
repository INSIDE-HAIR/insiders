require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();

  try {
    const langCodes = await prisma.code.findMany({
      where: { type: "lang" },
    });

    console.log(JSON.stringify(langCodes, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Error querying language codes:", error);
  process.exit(1);
});
