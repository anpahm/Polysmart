const express = require('express');
const router = express.Router();
const UserEvent = require('../models/userEventModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');
const axios = require('axios');

const GEMINI_API_KEY = 'AIzaSyAPXEVF74zh2UgGQiBnJDbwNaZnWBUk61o';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const recommendationCache = {}; // userId: { data, timestamp }
const CACHE_TTL = 2 * 60 * 1000; // 2 phút

// GET /api/recommendations/:userId
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  // 1. Kiểm tra cache
  const cache = recommendationCache[userId];
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return res.json(cache.data);
  }

  try {
    // 1. Lấy các productId user đã xem gần đây
    const viewedEvents = await UserEvent.find({ userId, eventType: 'view_product' })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();
    if (!viewedEvents.length) {
      return res.json([]);
    }
    const viewedProductIds = [...new Set(viewedEvents.map(e => e.productId))].map(id => new mongoose.Types.ObjectId(id));
    const viewedProducts = await Product.find({ _id: { $in: viewedProductIds } }).lean();
    const allProducts = await Product.find({}).lean();

    const cartEvents = await UserEvent.find({ userId, eventType: 'add_to_cart' }).lean();
    const searchEvents = await UserEvent.find({ userId, eventType: 'search' }).lean();
    const cartProductIds = cartEvents.map(e => e.productId).filter(Boolean);
    const cartProducts = await Product.find({ _id: { $in: cartProductIds } }).lean();
    const cartProductNames = cartProducts.map(p => p.TenSP);
    const searchKeywords = searchEvents.map(e => e.searchKeyword).filter(Boolean);

    // 2. Chuẩn bị prompt cho Gemini
    const listProductNames = viewedProducts.map(p => p.TenSP).join(', ');
    const allProductNames = allProducts.map(p => p.TenSP).join(', ');
    const prompt = `Tôi đã xem các sản phẩm: ${listProductNames}. Tôi đã thêm vào giỏ: ${cartProductNames.join(', ')}. Tôi đã tìm kiếm các từ khóa: ${searchKeywords.join(', ')}. Bạn hãy gợi ý 8 sản phẩm phù hợp nhất trong danh sách sau phù hợp với nhu cầu của tôi chỉ trả về một câu tóm tắt, không liệt kê sản phẩm: ${allProductNames}. Với mỗi sản phẩm gợi ý, hãy ghi rõ lý do tại sao bạn chọn sản phẩm đó cho tôi. Trả về theo dạng: Tên sản phẩm: Lý do gợi ý.`;
    const geminiPayload = {
      contents: [
        { parts: [ { text: prompt } ] }
      ]
    };

    // 3. Gọi Gemini API
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
      if (err.response && err.response.status === 429) {
        // Nếu bị 429, trả về fallback luôn
        console.error('Hết lượt rùi');
        const fallback = allProducts.filter(p => !viewedProductIds.includes(p._id)).slice(0, 8);
        // Lưu cache fallback
        recommendationCache[userId] = {
          data: fallback,
          timestamp: Date.now()
        };
        return res.json(fallback);
      }
      console.error('Bạn hết lượt rùi:', err.message);
      return res.status(500).json({ error: 'Dùng key khác đi' });
    }

    // 4. Parse tên sản phẩm từ reply
    const recommendedNames = reply
      .split('\n')
      .map(line => line.replace(/^[-\d.\s]+/, '').trim())
      .filter(Boolean);

    const normalize = str => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    let recommendedProducts = allProducts.filter(p =>
      recommendedNames.some(name => 
        normalize(p.TenSP).includes(normalize(name)) ||
        normalize(name).includes(normalize(p.TenSP))
      )
    ).slice(0, 8);

    console.log('Gemini reply:', reply);
    console.log('Recommended names:', recommendedNames);
    console.log('Matched products:', recommendedProducts.map(p => p.TenSP));

    // Fallback nếu không có sản phẩm nào match
    if (recommendedProducts.length === 0) {
      recommendedProducts = allProducts.filter(p => !viewedProductIds.includes(p._id)).slice(0, 8);
      console.log('Fallback recommended products:', recommendedProducts.map(p => p.TenSP));
    }

    // Lưu cache kết quả
    recommendationCache[userId] = {
      data: recommendedProducts,
      timestamp: Date.now()
    };
    res.json(recommendedProducts);
  } catch (err) {
    console.error('Recommendation error:', err);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

module.exports = router;
