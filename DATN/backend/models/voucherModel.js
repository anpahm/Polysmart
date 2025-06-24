const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
    ma_voucher: {
        type: String,
        required: [true, 'Mã voucher là bắt buộc'],
        unique: true,
        trim: true,
        uppercase: true
    },
    mo_ta: {
        type: String,
        required: [true, 'Mô tả là bắt buộc']
    },
    phan_tram_giam_gia: {
        type: Number,
        required: [true, 'Phần trăm giảm giá là bắt buộc'],
        min: 0,
        max: 100
    },
    giam_toi_da: {
        type: Number,
        required: [true, 'Mức giảm tối đa là bắt buộc']
    },
    don_hang_toi_thieu: {
        type: Number,
        required: [true, 'Đơn hàng tối thiểu là bắt buộc'],
        default: 0
    },
    so_luong: {
        type: Number,
        required: [true, 'Số lượng voucher là bắt buộc']
    },
    da_su_dung: {
        type: Number,
        default: 0
    },
    ngay_bat_dau: {
        type: Date,
        required: [true, 'Ngày bắt đầu là bắt buộc']
    },
    ngay_ket_thuc: {
        type: Date,
        required: [true, 'Ngày kết thúc là bắt buộc']
    },
    trang_thai: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'active'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual property to check if voucher is expired
voucherSchema.virtual('isExpired').get(function() {
    return new Date() > this.ngay_ket_thuc;
});

// Virtual property to check available quantity
voucherSchema.virtual('so_luong_con_lai').get(function() {
    return this.so_luong - this.da_su_dung;
});

// Middleware to update status based on dates and quantity
voucherSchema.pre('save', function(next) {
    if (new Date() > this.ngay_ket_thuc) {
        this.trang_thai = 'expired';
    }
    if (this.da_su_dung >= this.so_luong) {
        this.trang_thai = 'expired'; // Or a new status like 'depleted'
    }
    next();
});

module.exports = mongoose.model('Voucher', voucherSchema); 