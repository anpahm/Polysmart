const mongoose = require('mongoose');
const userModel = require('../models/userModel');

// Kết nối database
mongoose.connect('mongodb://localhost:27017/polysmart', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const updateUsers = async () => {
  try {
    console.log('Đang cập nhật trạng thái active cho tất cả user...');
    
    // Cập nhật tất cả user chưa có trường active thành active = true
    const result = await userModel.updateMany(
      { active: { $exists: false } },
      { $set: { active: true } }
    );
    
    console.log(`Đã cập nhật ${result.modifiedCount} user`);
    
    // Hiển thị tổng số user
    const totalUsers = await userModel.countDocuments();
    console.log(`Tổng số user trong database: ${totalUsers}`);
    
    // Hiển thị danh sách user và trạng thái
    const users = await userModel.find({}, 'TenKH email role active lastLogin');
    console.log('\nDanh sách user:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.TenKH} (${user.email}) - Role: ${user.role} - Active: ${user.active} - LastLogin: ${user.lastLogin || 'Chưa đăng nhập'}`);
    });
    
  } catch (error) {
    console.error('Lỗi khi cập nhật user:', error);
  } finally {
    mongoose.connection.close();
    console.log('Đã đóng kết nối database');
  }
};

updateUsers(); 