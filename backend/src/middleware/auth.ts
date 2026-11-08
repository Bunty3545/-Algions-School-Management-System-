import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError } from '../utils/errors';
import { prisma } from '../utils/prisma';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'TEACHER' | 'GUARDIAN' | 'STUDENT';
  teacherProfileId?: string;
  guardianProfileId?: string;
  studentProfileId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed authorization token');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; role: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        teacherProfile: true,
        guardianProfile: true,
        studentProfile: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User does not exist or has been deactivated');
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      teacherProfileId: user.teacherProfile?.id,
      guardianProfileId: user.guardianProfile?.id,
      studentProfileId: user.studentProfile?.id,
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Invalid or expired token'));
    } else {
      next(error);
    }
  }
}
