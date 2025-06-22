const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerInfo: {
    email: String,
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: String,
    note: String
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    name: String,
    image: String,
    colorName: String
  }],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cod', 'atm'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus: { 
    type: String, 
    enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  transferContent: String, // Mã giao dịch
  bankInfo: {
    bankName: String,
    accountNumber: String,
    accountName: String,
    branch: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema); 