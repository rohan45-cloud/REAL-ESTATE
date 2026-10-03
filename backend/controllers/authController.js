import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { signToken } from '../utils/token.js';

const ALLOWED_SELF_REGISTER_ROLES = ['USER', 'OWNER'];

export const register = asyncHandler(async(req, res) => {
    const { name, email, password, phone, role } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw ApiError.badRequest('An account with this email already exists');

    const safeRole = ALLOWED_SELF_REGISTER_ROLES.includes(role) ? role : 'USER';

    const user = await User.create({ name, email, password, phone, role: safeRole });
    const token = signToken(user._id);

    res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: { user: user.toSafeObject(), token },
    });
});

export const login = asyncHandler(async(req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) throw ApiError.unauthorized('Invalid email or password');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw ApiError.unauthorized('Invalid email or password');

    if (user.isSuspended) throw ApiError.forbidden('Your account has been suspended');

    const token = signToken(user._id);

    res.json({
        success: true,
        message: 'Logged in successfully',
        data: { user: user.toSafeObject(), token },
    });
});

export const getMe = asyncHandler(async(req, res) => {
    res.json({ success: true, data: { user: req.user.toSafeObject() } });
});

export const updateMe = asyncHandler(async(req, res) => {
    const { name, phone } = req.body;

    if (name !== undefined) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;

    await req.user.save();

    res.json({
        success: true,
        message: 'Profile updated',
        data: { user: req.user.toSafeObject() },
    });
});

export const changePassword = asyncHandler(async(req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
});