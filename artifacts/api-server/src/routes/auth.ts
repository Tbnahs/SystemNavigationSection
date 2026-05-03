import { Router, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import { db, employeesTable, enterprisesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: Router = Router();

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
    if (employee.enterpriseId) {
      const [ent] = await db
        .select({ tenHienThi: enterprisesTable.tenHienThi })
        .from(enterprisesTable)
        .where(eq(enterprisesTable.id, employee.enterpriseId));
      enterpriseName = ent?.tenHienThi ?? null;
    }

    await db
      .update(employeesTable)
      .set({ lastSeen: new Date().toISOString() })
      .where(eq(employeesTable.id, employee.id));

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
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;
