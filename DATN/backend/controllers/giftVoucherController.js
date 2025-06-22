const GiftVoucher = require('../models/giftVoucherModel');
const { sendVoucherEmail } = require('../services/emailService');

// Hàm tạo mã voucher random
function generateVoucherCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'POLY-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Tạo gift voucher và gửi email
exports.createGiftVoucher = async (req, res) => {
  try {
    const { name, phone, email, selectedGift } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existingVoucher = await GiftVoucher.findOne({ email });
    if (existingVoucher) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được sử dụng để nhận voucher'
      });
    }

    // Tạo mã voucher mới
    let voucherCode;
    let isUnique = false;
    while (!isUnique) {
      voucherCode = generateVoucherCode();
      const existingCode = await GiftVoucher.findOne({ voucherCode });
      if (!existingCode) {
        isUnique = true;
      }
    }

    // Tạo gift voucher mới
    const giftVoucher = new GiftVoucher({
      name,
      phone,
      email,
      voucherCode,
      selectedGift
    });

    await giftVoucher.save();

    // Gửi email voucher
    const emailResult = await sendVoucherEmail(email, name, voucherCode);
    
    if (emailResult.success) {
      // Cập nhật trạng thái đã gửi email
      await GiftVoucher.findByIdAndUpdate(giftVoucher._id, {
        emailSent: true,
        emailSentAt: new Date()
      });
    } else {
      // Log the detailed error from Nodemailer
      console.error('Nodemailer failed to send email. Reason:', emailResult.error);
    }

    res.status(201).json({
      success: true,
      data: {
        voucherCode,
        emailSent: emailResult.success,
        message: emailResult.success 
          ? 'Voucher đã được tạo và gửi email thành công!' 
          : 'Voucher đã được tạo nhưng gửi email thất bại. Vui lòng liên hệ hỗ trợ.'
      }
    });

  } catch (error) {
    console.error('Error creating gift voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi tạo voucher'
    });
  }
};

// Lấy thông tin voucher theo email
exports.getVoucherByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const voucher = await GiftVoucher.findOne({ email });
    
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy voucher cho email này'
      });
    }

    res.json({
      success: true,
      data: voucher
    });

  } catch (error) {
    console.error('Error getting voucher by email:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy thông tin voucher'
    });
  }
};

// Lấy thông tin voucher theo mã
exports.getVoucherByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const voucher = await GiftVoucher.findOne({ voucherCode: code });
    
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Mã voucher không hợp lệ'
      });
    }

    res.json({
      success: true,
      data: voucher
    });

  } catch (error) {
    console.error('Error getting voucher by code:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy thông tin voucher'
    });
  }
};

// Gửi lại email voucher
exports.resendVoucherEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const voucher = await GiftVoucher.findOne({ email });
    
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy voucher cho email này'
      });
    }

    // Gửi lại email
    const emailResult = await sendVoucherEmail(voucher.email, voucher.name, voucher.voucherCode);
    
    if (emailResult.success) {
      // Cập nhật trạng thái đã gửi email
      await GiftVoucher.findByIdAndUpdate(voucher._id, {
        emailSent: true,
        emailSentAt: new Date()
      });
    }

    res.json({
      success: emailResult.success,
      message: emailResult.success 
        ? 'Email đã được gửi lại thành công!' 
        : 'Gửi email thất bại. Vui lòng thử lại sau.'
    });

  } catch (error) {
    console.error('Error resending voucher email:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi gửi lại email'
    });
  }
};

// Lấy tất cả gift vouchers (cho admin)
exports.getAllGiftVouchers = async (req, res) => {
  try {
    const vouchers = await GiftVoucher.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: vouchers
    });
  } catch (error) {
    console.error('Error getting all gift vouchers:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy danh sách voucher'
    });
  }
}; 