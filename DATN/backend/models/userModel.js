const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    Sdt: { type: String },
    TenKH: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    gioi_tinh: { type: String },
    sinh_nhat: { type: String },
    dia_chi: { type: String },
    username: { type: String, unique: true },
    avatar: { type: String },
},{versionKey: false});
const userModel = mongoose.model('users', userSchema, 'users');

module.exports = userModel;