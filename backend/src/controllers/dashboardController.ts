import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboardService';

export async function getDashboardData(req: Request, res: Response, next: NextFunction) {
  try {
    const userRole = req.user!.role;

    if (userRole === 'ADMIN') {
      const data = await dashboardService.getAdminDashboardMetrics();
      return res.status(200).json({ success: true, role: 'ADMIN', data });
    }

    if (userRole === 'TEACHER') {
      const teacherProfileId = req.user!.teacherProfileId;
      if (!teacherProfileId) {
        return res.status(200).json({ success: true, role: 'TEACHER', data: { assignedClasses: [] } });
      }
      const data = await dashboardService.getTeacherDashboardMetrics(teacherProfileId);
      return res.status(200).json({ success: true, role: 'TEACHER', data });
    }

    if (userRole === 'GUARDIAN') {
      const guardianProfileId = req.user!.guardianProfileId;
      if (!guardianProfileId) {
        return res.status(200).json({ success: true, role: 'GUARDIAN', data: { children: [] } });
      }
      const data = await dashboardService.getGuardianDashboardMetrics(guardianProfileId);
      return res.status(200).json({ success: true, role: 'GUARDIAN', data });
    }

    return res.status(200).json({
      success: true,
      role: userRole,
      data: { message: 'Student portal active' },
    });
  } catch (error) {
    next(error);
  }
}
