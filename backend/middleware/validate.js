import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

// Runs after express-validator rules; turns errors into a consistent ApiError
const validate = (req, _res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const details = errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
    }));
    next(ApiError.badRequest('Validation failed', details));
};

export default validate;