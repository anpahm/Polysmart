const Voucher = require('../models/voucherModel');
const UserVoucher = require('../models/userVoucherModel');

// @desc    Lấy tất cả voucher (cho admin, có phân trang)
// @route   GET /api/vouchers
// @access  Private/Admin
exports.getAllVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.find({}).sort({ createdAt: -1 });
        res.json({ success: true, count: vouchers.length, data: vouchers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// @desc    Lấy một voucher bằng ID
// @route   GET /api/vouchers/:id
// @access  Private/Admin
exports.getVoucherById = async (req, res) => {
    try {
        const voucher = await Voucher.findById(req.params.id);
        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy voucher' });
        }
        res.json({ success: true, data: voucher });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// @desc    Tạo voucher mới
// @route   POST /api/vouchers
// @access  Private/Admin
exports.createVoucher = async (req, res) => {
    try {
        const { ma_voucher, mo_ta, phan_tram_giam_gia, giam_toi_da, don_hang_toi_thieu, so_luong, ngay_bat_dau, ngay_ket_thuc, trang_thai } = req.body;

        const upper_ma_voucher = ma_voucher.toUpperCase();
        const voucherExists = await Voucher.findOne({ ma_voucher: upper_ma_voucher });

        if (voucherExists) {
            return res.status(400).json({ success: false, message: 'Mã voucher này đã tồn tại' });
        }

        const voucher = new Voucher({
            ma_voucher: upper_ma_voucher,
            mo_ta,
            phan_tram_giam_gia,
            giam_toi_da,
            don_hang_toi_thieu,
            so_luong,
            ngay_bat_dau,
            ngay_ket_thuc,
            trang_thai,
        });

        const createdVoucher = await voucher.save();
        res.status(201).json({ success: true, data: createdVoucher });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: `Dữ liệu không hợp lệ: ${messages.join(', ')}`,
                errors: messages,
            });
        } else {
             console.error('Lỗi khi tạo voucher:', error);
             res.status(500).json({ success: false, message: 'Lỗi server khi tạo voucher.', error: error.message });
        }
    }
};

// @desc    Cập nhật voucher
// @route   PUT /api/vouchers/:id
// @access  Private/Admin
exports.updateVoucher = async (req, res) => {
    try {
        // Nếu cập nhật mã voucher, cũng nên chuyển thành chữ hoa
        if(req.body.ma_voucher) {
            req.body.ma_voucher = req.body.ma_voucher.toUpperCase();
        }

        const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy voucher' });
        }

        res.json({ success: true, data: voucher });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: `Dữ liệu không hợp lệ: ${messages.join(', ')}`,
                errors: messages,
            });
        } else if (error.code === 11000) { // Lỗi trùng key (E11000)
            return res.status(400).json({ success: false, message: 'Mã voucher này đã tồn tại.' });
        }
        else {
            console.error(`Lỗi khi cập nhật voucher ${req.params.id}:`, error);
            res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật voucher.', error: error.message });
        }
    }
};

// @desc    Xóa voucher
// @route   DELETE /api/vouchers/:id
// @access  Private/Admin
exports.deleteVoucher = async (req, res) => {
    try {
        const voucher = await Voucher.findByIdAndDelete(req.params.id);

        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy voucher' });
        }

        res.json({ success: true, message: 'Voucher đã được xóa' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// Tạo user voucher mới khi user quay trúng
exports.createUserVoucher = async (req, res) => {
  try {
    const { user_email, voucher_id, ma_voucher, expired_at } = req.body;
    // Kiểm tra đã phát voucher này cho user chưa
    const existed = await UserVoucher.findOne({ user_email, voucher_id });
    if (existed) {
      return res.status(400).json({ success: false, message: 'User already received this voucher' });
    }
    const userVoucher = new UserVoucher({
      user_email,
      voucher_id,
      ma_voucher,
      expired_at
    });
    await userVoucher.save();
    res.status(201).json({ success: true, data: userVoucher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Lấy danh sách voucher của user
exports.getUserVouchers = async (req, res) => {
  try {
    const { user_email } = req.params;
    const vouchers = await UserVoucher.find({ user_email }).populate('voucher_id');
    res.json({ success: true, data: vouchers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Đánh dấu voucher đã sử dụng
exports.useUserVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const userVoucher = await UserVoucher.findByIdAndUpdate(id, { used: true }, { new: true });
    if (!userVoucher) return res.status(404).json({ success: false, message: 'User voucher not found' });
    res.json({ success: true, data: userVoucher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Áp dụng voucher (cho người dùng ở trang thanh toán)
// @route   GET /api/vouchers/apply/:code
// @access  Public
exports.applyVoucher = async (req, res) => {
    try {
        const { code } = req.params;
        const voucher = await Voucher.findOne({ ma_voucher: code.toUpperCase() });

        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Mã giảm giá không hợp lệ.' });
        }

        const now = new Date();
        if (voucher.trang_thai !== 'active') {
            return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết hiệu lực.' });
        }
        if (now < voucher.ngay_bat_dau) {
            return res.status(400).json({ success: false, message: 'Mã giảm giá chưa đến ngày sử dụng.' });
        }
        if (now > voucher.ngay_ket_thuc) {
            return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết hạn.' });
        }
        if (voucher.da_su_dung >= voucher.so_luong) {
            return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết lượt sử dụng.' });
        }

        res.json({ success: true, data: voucher });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi áp dụng voucher', error: error.message });
    }
}; 