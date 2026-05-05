import { Router, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import { db, employeesTable, enterprisesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: Router = Router();

const ALL_MODULES = ["portal", "erp", "txng", "vung_trong", "iot"];

function deriveModules(enterpriseModules: string[] | null | undefined): string[] {
  if (!enterpriseModules || enterpriseModules.length === 0) {
    return ALL_MODULES;
  }
  const result: string[] = ["portal"];
  if (enterpriseModules.includes("ERP"))  result.push("erp");
  if (enterpriseModules.includes("TXNG")) result.push("txng");
  if (enterpriseModules.includes("VT"))   { result.push("vung_trong"); result.push("iot"); }
  return result;
}

router.post("/auth/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ error: "Email và mật khẩu bắt buộc" });
    }

    const [employee] = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.email, email.trim().toLowerCase()));

    if (!employee) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    }

    if (employee.status === "locked") {
      return res.status(403).json({ error: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên." });
    }

    if (!employee.passwordHash) {
      return res.status(401).json({ error: "Tài khoản chưa được thiết lập mật khẩu" });
    }

    const valid = await bcrypt.compare(password, employee.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    }

    let enterpriseName: string | null = null;
    let enterpriseModules: string[] = [];

    if (employee.enterpriseId) {
      const [ent] = await db
        .select({ tenHienThi: enterprisesTable.tenHienThi, modules: enterprisesTable.modules })
        .from(enterprisesTable)
        .where(eq(enterprisesTable.id, employee.enterpriseId));
      enterpriseName = ent?.tenHienThi ?? null;
      enterpriseModules = ent?.modules ?? [];
    }

    await db
      .update(employeesTable)
      .set({ lastSeen: new Date().toISOString() })
      .where(eq(employeesTable.id, employee.id));

    const modules = deriveModules(employee.enterpriseId ? enterpriseModules : null);

    res.json({
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        enterpriseId: employee.enterpriseId,
        enterpriseName,
        avatarUrl: employee.avatarUrl,
        avatarColor: employee.avatarColor,
        modules,
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;
