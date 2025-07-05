require('dotenv').config();
const mongoose = require('mongoose');
const autoPaymentProcessor = require('./autoPaymentProcessor');

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/DB_ShopTao")
  .then(() => console.log("✅ MongoDB connected for cron manager"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

class CronManager {
  constructor() {
    this.processor = autoPaymentProcessor;
    this.cronConfigs = {
      // Các cấu hình cron job khác nhau
      '20sec': {
        name: '20 giây',
        interval: 20 * 1000,
        description: 'Chạy mỗi 20 giây - Tần suất cực cao (real-time)'
      },
      '1min': {
        name: '1 phút',
        interval: 1 * 60 * 1000,
        description: 'Chạy mỗi 1 phút - Tần suất cao nhất'
      },
      '2min': {
        name: '2 phút',
        interval: 2 * 60 * 1000,
        description: 'Chạy mỗi 2 phút - Tần suất cao'
      },
      '5min': {
        name: '5 phút',
        interval: 5 * 60 * 1000,
        description: 'Chạy mỗi 5 phút - Tần suất trung bình'
      },
      '10min': {
        name: '10 phút',
        interval: 10 * 60 * 1000,
        description: 'Chạy mỗi 10 phút - Tần suất thấp'
      },
      '30min': {
        name: '30 phút',
        interval: 30 * 60 * 1000,
        description: 'Chạy mỗi 30 phút - Tần suất rất thấp'
      }
    };
  }

  // Hiển thị thông tin cron job hiện tại
  showCurrentStatus() {
    const status = this.processor.getStatus();
    console.log('\n📊 TRẠNG THÁI CRON JOB HIỆN TẠI:');
    console.log('=====================================');
    console.log(`🔄 Đang chạy: ${status.isRunning ? '✅ Có' : '❌ Không'}`);
    
    if (status.isRunning) {
      const currentInterval = status.config.fetchInterval;
      const intervalInMinutes = currentInterval / (60 * 1000);
      console.log(`⏰ Tần suất: ${intervalInMinutes} phút/lần`);
      console.log(`🕐 Lần chạy cuối: ${status.lastRun || 'Chưa có'}`);
    }
    
    console.log('\n📋 CÁC TÙY CHỌN TẦN SUẤT:');
    console.log('==========================');
    Object.entries(this.cronConfigs).forEach(([key, config]) => {
      const isCurrent = status.config.fetchInterval === config.interval;
      console.log(`${isCurrent ? '✅' : '  '} ${key}: ${config.name} - ${config.description}`);
    });
  }

  // Thay đổi tần suất cron job
  changeInterval(intervalKey) {
    const config = this.cronConfigs[intervalKey];
    if (!config) {
      console.log(`❌ Không tìm thấy cấu hình cho: ${intervalKey}`);
      console.log('Các tùy chọn có sẵn:', Object.keys(this.cronConfigs).join(', '));
      return;
    }

    console.log(`\n🔄 Đang thay đổi tần suất sang: ${config.name}`);
    
    // Dừng processor hiện tại nếu đang chạy
    if (this.processor.isRunning) {
      this.processor.stop();
    }

    // Cập nhật cấu hình
    this.processor.updateConfig({
      fetchInterval: config.interval,
      matchInterval: Math.min(config.interval / 2, 60 * 1000) // Match interval = 1/2 fetch interval, tối đa 1 phút
    });

    // Khởi động lại với cấu hình mới
    this.processor.start();
    
    console.log(`✅ Đã thay đổi tần suất thành: ${config.name}`);
    console.log(`📝 Mô tả: ${config.description}`);
  }

  // Khởi động cron job
  start() {
    console.log('\n🚀 KHỞI ĐỘNG CRON JOB...');
    this.processor.start();
    this.showCurrentStatus();
  }

  // Dừng cron job
  stop() {
    console.log('\n⏹️ DỪNG CRON JOB...');
    this.processor.stop();
    this.showCurrentStatus();
  }

  // Chạy một lần (không lặp)
  runOnce() {
    console.log('\n▶️ CHẠY MỘT LẦN...');
    this.processor.processAllAccounts();
  }

  // Hiển thị menu tương tác
  showMenu() {
    console.log('\n🎛️ MENU QUẢN LÝ CRON JOB:');
    console.log('==========================');
    console.log('1. Hiển thị trạng thái hiện tại');
    console.log('2. Khởi động cron job');
    console.log('3. Dừng cron job');
    console.log('4. Chạy một lần');
    console.log('5. Thay đổi tần suất');
    console.log('6. Thoát');
    console.log('==========================');
  }

  // Xử lý lựa chọn từ menu
  async handleChoice(choice) {
    switch (choice) {
      case '1':
        this.showCurrentStatus();
        break;
      case '2':
        this.start();
        break;
      case '3':
        this.stop();
        break;
      case '4':
        await this.runOnce();
        break;
      case '5':
        console.log('\n📋 Chọn tần suất:');
        Object.entries(this.cronConfigs).forEach(([key, config]) => {
          console.log(`${key}: ${config.name} - ${config.description}`);
        });
        console.log('\nNhập key (ví dụ: 2min):');
        // Trong thực tế, bạn có thể sử dụng readline hoặc process.argv
        break;
      case '6':
        console.log('👋 Tạm biệt!');
        process.exit(0);
        break;
      default:
        console.log('❌ Lựa chọn không hợp lệ');
    }
  }
}

// Tạo instance
const cronManager = new CronManager();

// Xử lý tham số dòng lệnh
const args = process.argv.slice(2);
const command = args[0];

if (command) {
  switch (command) {
    case 'status':
      cronManager.showCurrentStatus();
      break;
    case 'start':
      cronManager.start();
      break;
    case 'stop':
      cronManager.stop();
      break;
    case 'once':
      cronManager.runOnce();
      break;
    case 'interval':
      const intervalKey = args[1];
      if (intervalKey) {
        cronManager.changeInterval(intervalKey);
      } else {
        console.log('❌ Vui lòng chỉ định tần suất (ví dụ: node cronManager.js interval 2min)');
      }
      break;
    default:
      console.log('❌ Lệnh không hợp lệ');
      console.log('Các lệnh có sẵn: status, start, stop, once, interval');
  }
} else {
  // Hiển thị trạng thái mặc định
  cronManager.showCurrentStatus();
}

// Xử lý tín hiệu dừng
process.on('SIGINT', () => {
  console.log('\n🛑 Nhận tín hiệu dừng...');
  cronManager.stop();
  mongoose.connection.close(() => {
    console.log('🔌 Đã đóng kết nối MongoDB');
    process.exit(0);
  });
});

module.exports = cronManager; 