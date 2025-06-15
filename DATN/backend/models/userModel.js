const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    Sdt: { type: String, required: true, unique: true },
    TenKH: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    gender: { type: String },
    dateOfBirth: { type: Date },
    address: { type: String },
    username: { type: String, unique: true },
},{versionKey: false});
const userModel = mongoose.model('users', userSchema, 'users');

module.exports = userModel;