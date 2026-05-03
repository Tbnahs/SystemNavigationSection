import bcrypt from "bcryptjs";
import app from "./app";
import { logger } from "./lib/logger";
import { db, employeesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function seedSuperAdmin() {
  try {
    const SUPER_EMAIL = "admin@esgvalley.com";
    const SUPER_PASSWORD = "esgvalley@2025";

    const [existing] = await db
      .select({ id: employeesTable.id, passwordHash: employeesTable.passwordHash })
      .from(employeesTable)
      .where(eq(employeesTable.email, SUPER_EMAIL));

    if (!existing) {
      const passwordHash = await bcrypt.hash(SUPER_PASSWORD, 10);
      await db.insert(employeesTable).values({
        name: "ESG Valley Admin",
        email: SUPER_EMAIL,
        phone: "",
        role: "Super Admin",
        status: "active",
        avatarColor: "bg-emerald-500",
        lastSeen: "Chưa đăng nhập",
        passwordHash,
        enterpriseId: null,
      });
      logger.info("Super admin account created: " + SUPER_EMAIL);
    } else if (!existing.passwordHash) {
      const passwordHash = await bcrypt.hash(SUPER_PASSWORD, 10);
      await db.update(employeesTable)
        .set({ passwordHash })
        .where(eq(employeesTable.id, existing.id));
      logger.info("Super admin password updated: " + SUPER_EMAIL);
    }
  } catch (e) {
    logger.warn({ err: e }, "Could not seed super admin");
  }
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  await seedSuperAdmin();
});
