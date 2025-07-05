require('dotenv').config();
const mongoose = require('mongoose');
const bankApiService = require('../services/bankApiService');
const orderController = require('../controllers/orderController');
const fetch = require('node-fetch');

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/DB_ShopTao")
  .then(() => console.log("MongoDB connected for auto payment processor"))
  .catch((err) => console.log(err));

class AutoPaymentProcessor {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.config = {
      // Cấu hình tài khoản ngân hàng
      bankAccounts: [
        {
          bankCode: 'mkbank', // Mã ngân hàng
          accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1770260769', // Số tài khoản
          token: process.env.BANK_TOKEN || 'your_token_here', // Token API
          name: 'Main Account'
        }
        // Có thể thêm nhiều tài khoản khác
      ],
      // Cấu hình thời gian chạy
      fetchInterval: 20 * 1000, // 20 giây (thay đổi từ 2 phút xuống 20 giây)
      matchInterval: 10 * 1000, // 10 giây (thay đổi từ 1 phút xuống 10 giây)
      retryAttempts: 3,
      retryDelay: 30 * 1000 // 30 giây
    };
  }

  // Bắt đầu xử lý tự động
  async start() {
    if (this.isRunning) {
      console.log('Auto payment processor is already running');
      return;
    }

    console.log('Starting auto payment processor...');
    this.isRunning = true;

    // Chạy lần đầu ngay lập tức
    await this.processAllAccounts();

    // Thiết lập interval để chạy định kỳ
    this.interval = setInterval(async () => {
      await this.processAllAccounts();
    }, this.config.fetchInterval);

    console.log(`Auto payment processor started. Fetch interval: ${this.config.fetchInterval / 1000}s`);
  }

  // Dừng xử lý tự động
  stop() {
    if (!this.isRunning) {
      console.log('Auto payment processor is not running');
      return;
    }

    console.log('Stopping auto payment processor...');
    this.isRunning = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    console.log('Auto payment processor stopped');
  }

  // Xử lý tất cả tài khoản
  async processAllAccounts() {
    console.log(`[${new Date().toISOString()}] Processing all bank accounts...`);

    for (const account of this.config.bankAccounts) {
      try {
        await this.processAccount(account);
      } catch (error) {
        console.error(`Error processing account ${account.name}:`, error.message);
      }
    }

    // Chạy auto match sau khi fetch xong
    await this.runAutoMatch();

    // Tích hợp đối soát đơn hàng tự động
    try {
      console.log('Running auto confirm orders...');
      const res = await fetch('http://localhost:3000/api/orders/auto-confirm', { method: 'POST' });
      const data = await res.json();
      console.log('Auto confirm orders result:', data);
    } catch (err) {
      console.error('Error calling auto-confirm orders API:', err);
    }
  }

  // Xử lý một tài khoản cụ thể
  async processAccount(account) {
    console.log(`Processing account: ${account.name} (${account.accountNumber})`);

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        // Fetch giao dịch từ API
        const transactions = await bankApiService.fetchTransactionHistory(
          account.bankCode,
          account.accountNumber,
          account.token
        );

        console.log(`Fetched ${transactions.length} transactions from ${account.name}`);

        // Xử lý và lưu giao dịch
        const result = await bankApiService.processTransactions(
          transactions,
          account.accountNumber,
          account.bankCode
        );

        console.log(`Processed ${result.processed.length} new transactions from ${account.name}`);
        
        if (result.errors.length > 0) {
          console.warn(`Errors processing ${account.name}:`, result.errors);
        }

        // Thành công, thoát khỏi vòng lặp retry
        break;

      } catch (error) {
        console.error(`Attempt ${attempt}/${this.config.retryAttempts} failed for ${account.name}:`, error.message);
        
        if (attempt === this.config.retryAttempts) {
          throw error; // Ném lỗi nếu đã hết số lần thử
        }

        // Chờ trước khi thử lại
        await this.delay(this.config.retryDelay);
      }
    }
  }

  // Chạy auto match
  async runAutoMatch() {
    try {
      console.log('Running auto match...');
      const result = await bankApiService.autoMatchTransactions();
      
      if (result.matchedCount > 0) {
        console.log(`Auto matched ${result.matchedCount} transactions with orders`);
        console.log('Matched transactions:', result.results);
      } else {
        console.log('No new transactions matched');
      }
    } catch (error) {
      console.error('Error in auto match:', error.message);
    }
  }

  // Delay helper
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Lấy trạng thái processor
  getStatus() {
    return {
      isRunning: this.isRunning,
      config: this.config,
      lastRun: this.lastRun
    };
  }

  // Cập nhật cấu hình
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('Configuration updated:', this.config);
  }
}

// Export instance
const autoPaymentProcessor = new AutoPaymentProcessor();

// Xử lý tín hiệu dừng
process.on('SIGINT', () => {
  console.log('Received SIGINT, stopping auto payment processor...');
  autoPaymentProcessor.stop();
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, stopping auto payment processor...');
  autoPaymentProcessor.stop();
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

// Export để sử dụng trong app chính
module.exports = autoPaymentProcessor;

// Chạy trực tiếp nếu file được gọi trực tiếp
if (require.main === module) {
  console.log('Starting auto payment processor as standalone script...');
  autoPaymentProcessor.start();
} 