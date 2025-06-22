const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/datn', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Create PaymentConfig model
const paymentConfigSchema = new mongoose.Schema({
  bankName: String,
  accountNumber: String,
  accountName: String,
  branch: String,
  isActive: Boolean
});

const PaymentConfig = mongoose.model('PaymentConfig', paymentConfigSchema);

// Seed data
async function seedPaymentData() {
  try {
    // Clear existing data
    await PaymentConfig.deleteMany({});

    // Add new payment configuration
    const paymentConfig = new PaymentConfig({
      bankName: 'BIDV',
      accountNumber: '31410003159758',
      accountName: 'NGUYEN VAN A',
      branch: 'Ha Noi',
      isActive: true
    });

    await paymentConfig.save();
    console.log('Payment configuration data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding payment data:', error);
    process.exit(1);
  }
}

seedPaymentData(); 