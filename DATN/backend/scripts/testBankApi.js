require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/DB_ShopTao")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// Import model
const BankTransaction = require('../models/bankTransactionModel');

async function testBankApi() {
  try {
    console.log('🚀 Testing Bank API...');
    
    // Thông tin từ .env
    const bankCode = process.env.BANK_PASSWORD || 'Qd96350a';
    const accountNumber = process.env.BANK_ACCOUNT_NUMBER || '17418271';
    const token = process.env.BANK_TOKEN || 'BF00AF9D-1C93-A134-679D-79DE8E43D509';
    
    console.log('📋 Configuration:');
    console.log('- Bank Code:', bankCode);
    console.log('- Account Number:', accountNumber);
    console.log('- Token:', token);
    
    // Gọi API
    const url = `https://api.web2m.com/historyapiopenacbv3/${token}`;
    console.log('🌐 Calling API:', url);
    
    const response = await axios.get(url, {
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log('📥 API Response Status:', response.status);
    console.log('📥 API Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.transactions) {
      const transactions = response.data.transactions;
      console.log(`📊 Found ${transactions.length} transactions`);
      
      // Xử lý từng giao dịch
      for (const transaction of transactions) {
        try {
          console.log(`\n🔄 Processing transaction: ${transaction.transactionID}`);
          
          // Kiểm tra xem đã tồn tại chưa
          const existing = await BankTransaction.findOne({
            transactionID: transaction.transactionID
          });
          
          if (existing) {
            console.log(`⚠️  Transaction ${transaction.transactionID} already exists`);
            continue;
          }
          
          // Parse ngày tháng
          const [day, month, year] = transaction.transactionDate.split('/');
          const transactionDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          
          // Tạo document mới
          const newTransaction = new BankTransaction({
            transactionID: transaction.transactionID,
            amount: parseInt(transaction.amount),
            description: transaction.description,
            transactionDate: transactionDate,
            type: transaction.type,
            accountNumber: accountNumber,
            bankCode: bankCode,
            status: 'pending'
          });
          
          console.log('💾 Saving transaction:', {
            transactionID: newTransaction.transactionID,
            amount: newTransaction.amount,
            description: newTransaction.description,
            transactionDate: newTransaction.transactionDate,
            type: newTransaction.type
          });
          
          const savedTransaction = await newTransaction.save();
          console.log(`✅ Successfully saved transaction: ${savedTransaction._id}`);
          
        } catch (error) {
          console.error(`❌ Error saving transaction ${transaction.transactionID}:`, error.message);
        }
      }
      
      // Kiểm tra tổng số giao dịch trong DB
      const totalInDB = await BankTransaction.countDocuments();
      console.log(`\n📈 Total transactions in database: ${totalInDB}`);
      
      // Hiển thị 5 giao dịch gần nhất
      const recentTransactions = await BankTransaction.find()
        .sort({ createdAt: -1 })
        .limit(5);
      
      console.log('\n📋 Recent transactions:');
      recentTransactions.forEach((t, index) => {
        console.log(`${index + 1}. ${t.transactionID} - ${t.amount} VND - ${t.description}`);
      });
      
    } else {
      console.log('❌ No transactions found in API response');
    }
    
  } catch (error) {
    console.error('❌ Error testing bank API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  } finally {
    // Đóng kết nối MongoDB
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Chạy test
testBankApi(); 