const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerInfo: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: String,
    fullName: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    district: String,
    note: String
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    name: String,
    image: String,
    colorName: String
  }],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cod', 'atm'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus: { 
    type: String, 
    enum: ['confirming', 'packing', 'shipping', 'delivered', 'returned', 'cancelled'], 
    default: 'confirming' 
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

// Unique index chống trùng lặp đơn hàng khi paymentStatus là 'pending'
orderSchema.index(
  {
    'customerInfo.phone': 1,
    totalAmount: 1,
    paymentMethod: 1,
    paymentStatus: 1
  },
  { unique: true, partialFilterExpression: { paymentStatus: 'pending' } }
);

module.exports = mongoose.model('Order', orderSchema); 