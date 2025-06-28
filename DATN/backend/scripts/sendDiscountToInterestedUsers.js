require('dotenv').config();
const mongoose = require('mongoose');
const UserEvent = require('../models/userEventModel');
const { sendVoucherEmail, generateVoucherCode } = require('../services/emailService');
const User = require('../models/userModel');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/DB_ShopTao');
  const pipeline = [
    { "$match": { "eventType": { "$in": ["view_product", "add_to_cart"] } } },
    { "$group": {
        "_id": { "userId": "$userId", "productId": "$productId" },
        "views": { "$sum": { "$cond": [ { "$eq": [ "$eventType", "view_product" ] }, 1, 0 ] } },
        "addedToCart": { "$sum": { "$cond": [ { "$eq": [ "$eventType", "add_to_cart" ] }, 1, 0 ] } }
      }
    },
    { "$match": { "views": { "$gte": 3 }, "addedToCart": { "$gte": 1 } } }
  ];
  const results = await UserEvent.aggregate(pipeline);

  console.log('Kết quả pipeline:', results);

  if (results.length === 0) {
    console.log('Không có user nào thỏa mãn điều kiện.');
  }

  for (const r of results) {
    // Lấy email người dùng
    const user = await User.findById(r._id.userId);
    if (user && user.email) {
      console.log(`Gửi email cho: ${user.email} - sản phẩm: ${r._id.productId}`);
      const voucherCode = generateVoucherCode();
      await sendVoucherEmail(user.email, user.TenKH || user.name || 'bạn', voucherCode);
    }
  }
  mongoose.disconnect();
}

run(); 