import User from '../models/User.js';
import { verifyToken } from '../utils/token.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Requires a valid JWT; attaches the user to req.user
export const protect = asyncHandler(async(req, _res, next) => {
    const header = req.headers.authorization;
    const token = header && header.startsWith('Bearer ') ? header.split(' ')[1] : null;

    if (!token) throw ApiError.unauthorized('Please log in to continue');

    let decoded;
    try {
        decoded = verifyToken(token);
    } catch {
        throw ApiError.unauthorized('Invalid or expired session, please log in again');
    }

    const user = await User.findById(decoded.id);
    if (!user) throw ApiError.unauthorized('User no longer exists');
    if (user.isSuspended) throw ApiError.forbidden('Your account has been suspended');

    req.user = user;
    next();
});

// Attaches req.user if a valid token is present, but never blocks the request
export const attachUserIfPresent = asyncHandler(async(req, _res, next) => {
    const header = req.headers.authorization;
    const token = header && header.startsWith('Bearer ') ? header.split(' ')[1] : null;
    if (!token) return next();

    try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);
        if (user && !user.isSuspended) req.user = user;
    } catch {
        /* ignore invalid token for optional auth */
    }
    next();
});

// Usage: restrictTo('OWNER', 'ADMIN')
export const restrictTo =
    (...roles) =>
    (req, _res, next) => {
        if (!req.user) return next(ApiError.unauthorized('Please log in to continue'));
        if (!roles.includes(req.user.role)) {
            return next(ApiError.forbidden('You do not have permission to perform this action'));
        }
        next();
    };