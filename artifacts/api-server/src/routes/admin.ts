import { Router, type Request, type Response, type NextFunction } from "express";
import {
  db, enterprisesTable, facilitiesTable,
  facilityEmployeesTable, employeesTable,
} from "@workspace/db";
import { eq, inArray } from "drizzle-orm";

const router: Router = Router();

router.get("/admin-tree", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const enterprises = await db
      .select({
        id: enterprisesTable.id,
        tenHienThi: enterprisesTable.tenHienThi,
        ten: enterprisesTable.ten,
        email: enterprisesTable.email,
        logoColor: enterprisesTable.logoColor,
        logoUrl: enterprisesTable.logoUrl,
        status: enterprisesTable.status,
        modules: enterprisesTable.modules,
      })
      .from(enterprisesTable);

    const facilities = await db
      .select({
        id: facilitiesTable.id,
        enterpriseId: facilitiesTable.enterpriseId,
        name: facilitiesTable.name,
        code: facilitiesTable.code,
        type: facilitiesTable.type,
        status: facilitiesTable.status,
        address: facilitiesTable.address,
        phone: facilitiesTable.phone,
      })
      .from(facilitiesTable);

    const employees = await db
      .select({
        id: employeesTable.id,
        enterpriseId: employeesTable.enterpriseId,
        name: employeesTable.name,
        role: employeesTable.role,
        status: employeesTable.status,
        avatarColor: employeesTable.avatarColor,
        email: employeesTable.email,
      })
      .from(employeesTable);

    const facilityIds = facilities.map((f) => f.id);
    let assignments: { facilityId: number; employeeId: number }[] = [];
    if (facilityIds.length > 0) {
      assignments = await db
        .select({
          facilityId: facilityEmployeesTable.facilityId,
          employeeId: facilityEmployeesTable.employeeId,
        })
        .from(facilityEmployeesTable)
        .where(inArray(facilityEmployeesTable.facilityId, facilityIds));
    }

    const assignedEmployeeIds = new Set(assignments.map((a) => a.employeeId));

    const result = enterprises.map((dn) => {
      const dnFacilities = facilities
        .filter((f) => f.enterpriseId === dn.id)
        .map((f) => {
          const userIds = assignments
            .filter((a) => a.facilityId === f.id)
            .map((a) => a.employeeId);
          const users = employees.filter((e) => userIds.includes(e.id));
          return { ...f, users };
        });

      const adminUsers = employees.filter(
        (e) =>
          e.enterpriseId === dn.id &&
          !assignedEmployeeIds.has(e.id),
      );

      return { ...dn, facilities: dnFacilities, adminUsers };
    });

    const unassignedEnterprises = employees.filter(
      (e) => e.enterpriseId === null && !assignedEmployeeIds.has(e.id),
    );

    res.json({ tree: result, superAdmins: unassignedEnterprises });
  } catch (e) {
    next(e);
  }
});

export default router;
