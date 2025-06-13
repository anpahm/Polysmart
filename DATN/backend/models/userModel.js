const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    Sdt: { type: String, required: true },
    TenKH: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
},{versionKey: false});
const userModel = mongoose.model('users', userSchema, 'users');

module.exports = userModel;