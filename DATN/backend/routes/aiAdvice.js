const express = require('express');
const router = express.Router();
const UserEvent = require('../models/userEventModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');
const axios = require('axios');

const GEMINI_API_KEY = 'AIzaSyAXCsDf7oThw2rjMy6XckdJ3LKPWftYQGk';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// GET /api/ai-advice?userId=...
router.get('/', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: 'Missing userId' });
  try {
    // Lấy các productId user đã xem gần đây
    const viewedEvents = await UserEvent.find({ userId, eventType: 'view_product' })
      .sort({ timestamp: -1 })
      .limit(1)
      .lean();
    if (!viewedEvents.length) {
      return res.json({ message: 'Hãy xem một số sản phẩm để được tư vấn!' });
    }
    const viewedProductIds = [...new Set(viewedEvents.map(e => e.productId))].map(id => new mongoose.Types.ObjectId(id));
    const viewedProducts = await Product.find({ _id: { $in: viewedProductIds }, an_hien: true }).lean();
    const allProducts = await Product.find({ an_hien: true }).lean();

    const cartEvents = await UserEvent.find({ userId, eventType: 'add_to_cart' }).lean();
    const searchEvents = await UserEvent.find({ userId, eventType: 'search' }).lean();
    const cartProductIds = cartEvents.map(e => e.productId).filter(Boolean);
    const cartProducts = await Product.find({ _id: { $in: cartProductIds }, an_hien: true }).lean();
    const cartProductNames = cartProducts.map(p => p.TenSP);
    const searchKeywords = searchEvents.map(e => e.searchKeyword).filter(Boolean);

    // Chuẩn bị prompt cho Gemini
    const listProductNames = viewedProducts.map(p => p.TenSP).join(', ');
    const allProductNames = allProducts.map(p => p.TenSP).join(', ');
    const prompt = `
    Chào bạn! Mình để ý bạn vừa xem qua sản phẩm: ${listProductNames}.
    Ngoài ra, bạn đã thêm vào giỏ hàng các sản phẩm: ${cartProductNames.join(', ')}.
    Và bạn cũng đã từng tìm kiếm với những từ khóa như: ${searchKeywords.join(', ')}.
    
    Dựa vào những điều đó, hãy trò chuyện với người dùng như một người bạn am hiểu sản phẩm Apple. Gợi ý một vài sản phẩm có thể phù hợp với họ — đừng nói chính xác số lượng sản phẩm, và đừng liệt kê máy móc.
    
    Hãy bắt đầu bằng một câu nói tự nhiên như: "Mình sẽ gợi ý bạn một số sản phẩm Apple có lẽ sẽ phù hợp với nhu cầu của bạn...", sau đó đưa ra các sản phẩm phù hợp, kèm theo lý do nhẹ nhàng, thân thiện và dễ hiểu.
    
    Bạn có thể chọn bất kỳ sản phẩm nào trong danh sách sau: ${allProductNames}.
    
    Đừng trả lời theo dạng bảng, chỉ cần viết như một đoạn hội thoại tự nhiên.
    `;
        const geminiPayload = {
      contents: [
        { parts: [ { text: prompt } ] }
      ]
    };

    // Gọi Gemini API
    let reply = '';
    try {
      const geminiRes = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        geminiPayload
      );
      if (
        geminiRes.data &&
        geminiRes.data.candidates &&
        geminiRes.data.candidates[0] &&
        geminiRes.data.candidates[0].content &&
        geminiRes.data.candidates[0].content.parts &&
        geminiRes.data.candidates[0].content.parts[0] &&
        geminiRes.data.candidates[0].content.parts[0].text
      ) {
        reply = geminiRes.data.candidates[0].content.parts[0].text;
      } else {
        reply = '';
      }
    } catch (err) {
      console.error('Gemini API error:', err.message);
      return res.status(500).json({ message: 'Gemini AI error' });
    }

    // Trả về message tư vấn AI động
    res.json({ message: reply });
  } catch (err) {
    console.error('AI advice error:', err);
    res.status(500).json({ message: 'Failed to get AI advice' });
  }
});

module.exports = router; 