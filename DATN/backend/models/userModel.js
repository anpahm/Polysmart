const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    TenKH: { type: String, required: true },
    Email: { type: String, required: true },
    Sdt: { type: String },
    Dia_chi: { type: String },
    Diem_tich_luy: { type: Number, default: 0 },
    Vai_tro: { type: String, default: 'user' },
},{versionKey: false});
const userModel = mongoose.model('users', userSchema);

module.exports = userModel;