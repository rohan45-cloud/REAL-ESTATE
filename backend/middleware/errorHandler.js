// Central error handler: converts every error into a consistent JSON shape.
const errorHandler = (err, _req, res, _next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Something went wrong';
    let details = err.details || null;

    if (err.name === 'ValidationError' && err.errors) {
        statusCode = 400;
        message = 'Validation failed';
        details = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
    }

    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}`;
    }

    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        message = `${field} already exists`;
    }

    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired, please login again';
    }

    if (statusCode >= 500) console.error('🔥', err);

    res.status(statusCode).json({
        success: false,
        message,
        ...(details && { details }),
        ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack }),
    });
};

export default errorHandler;