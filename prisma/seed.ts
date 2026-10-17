import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("password123", 10);

  await db.user.upsert({
    where: { email: "admin@procure.ai" },
    update: {},
    create: { email: "admin@procure.ai", name: "Admin", passwordHash: hash, role: "ADMIN" },
  });

  await db.user.upsert({
    where: { email: "vendor@procure.ai" },
    update: {},
    create: {
      email: "vendor@procure.ai",
      name: "Demo Vendor",
      passwordHash: hash,
      role: "VENDOR",
      vendor: { create: { company: "Demo Supplies Ltd", status: "APPROVED" } },
    },
  });
}

main().finally(() => db.$disconnect());
