import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomError } from '../utils/CustomError';
import User from '../models/User';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function protect(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new CustomError('Authentication token required', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'supersecretaccess') as any;
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new CustomError('User belonging to this token no longer exists', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...roles: ('student' | 'admin')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new CustomError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new CustomError(`User role '${req.user.role}' is not authorized to access this resource`, 403));
    }

    next();
  };
}
