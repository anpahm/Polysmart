// const express = require('express');
// const router = express.Router();
// const UserEvent = require('../models/userEventModel');
// const Product = require('../models/productModel');
// const mongoose = require('mongoose');
// const axios = require('axios');

// const GEMINI_API_KEY = 'AIzaSyAPXEVF74zh2UgGQiBnJDbwNaZnWBUk61o';
// const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// // GET /api/recommendations/:userId
// router.get('/:userId', async (req, res) => {
//   const { userId } = req.params;

//   try {
//     // 1. Lấy các productId user đã xem gần đây
//     const viewedEvents = await UserEvent.find({ userId, eventType: 'view_product' })
//       .sort({ timestamp: -1 })
//       .limit(10)
//       .lean();
//     if (!viewedEvents.length) {
//       return res.json([]);
//     }
//     const viewedProductIds = [...new Set(viewedEvents.map(e => e.productId))].map(id => new mongoose.Types.ObjectId(id));
//     const viewedProducts = await Product.find({ _id: { $in: viewedProductIds } }).lean();
//     const allProducts = await Product.find({}).lean();

//     const cartEvents = await UserEvent.find({ userId, eventType: 'add_to_cart' }).lean();
//     const searchEvents = await UserEvent.find({ userId, eventType: 'search' }).lean();
//     const cartProductIds = cartEvents.map(e => e.productId).filter(Boolean);
//     const cartProducts = await Product.find({ _id: { $in: cartProductIds } }).lean();
//     const cartProductNames = cartProducts.map(p => p.TenSP);
//     const searchKeywords = searchEvents.map(e => e.searchKeyword).filter(Boolean);

//     // 2. Chuẩn bị prompt cho Gemini
//     const listProductNames = viewedProducts.map(p => p.TenSP).join(', ');
//     const allProductNames = allProducts.map(p => p.TenSP).join(', ');
//     // Lấy danh mục các sản phẩm đã xem
//     const viewedCategories = [...new Set(viewedProducts.map(p => p.category))].join(', ');

//     const prompt = `Tôi đã xem các sản phẩm: ${listProductNames} (danh mục: ${viewedCategories}). Tôi đã thêm vào giỏ: ${cartProductNames.join(', ')}. Tôi đã tìm kiếm các từ khóa: ${searchKeywords.join(', ')}. Hãy gợi ý 16 sản phẩm phù hợp nhất trong danh sách sau, ưu tiên các sản phẩm cùng danh mục (${viewedCategories}) hoặc liên quan đến các sản phẩm tôi đã xem, chỉ trả về danh sách tên sản phẩm, mỗi tên trên một dòng, không giải thích gì thêm: ${allProductNames}.`;
//     const geminiPayload = {
//       contents: [
//         { parts: [ { text: prompt } ] }
//       ]
//     };

//     // 3. Gọi Gemini API
//     let reply = '';
//     try {
//       const geminiRes = await axios.post(
//         `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
//         geminiPayload
//       );
//       if (
//         geminiRes.data &&
//         geminiRes.data.candidates &&
//         geminiRes.data.candidates[0] &&
//         geminiRes.data.candidates[0].content &&
//         geminiRes.data.candidates[0].content.parts &&
//         geminiRes.data.candidates[0].content.parts[0] &&
//         geminiRes.data.candidates[0].content.parts[0].text
//       ) {
//         reply = geminiRes.data.candidates[0].content.parts[0].text;
//       } else {
//         reply = '';
//       }
//     } catch (err) {
//       if (err.response && err.response.status === 429) {
//         // Nếu bị 429, trả về fallback luôn
//         console.error('Hết lượt rùi');
//         return res.json(fallback);
//       }
//       console.error('Bạn hết lượt rùi:', err.message);
//       return res.status(500).json({ error: 'Dùng key khác đi' });
//     }

//     // 4. Parse tên sản phẩm từ reply
//     const recommendedNames = reply
//       .split('\n')
//       .map(line => line.replace(/^[-\d.\s]+/, '').trim())
//       .filter(Boolean);

//     const normalize = str => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

//     let recommendedProducts = allProducts.filter(p =>
//       recommendedNames.some(name => 
//         normalize(p.TenSP).includes(normalize(name)) ||
//         normalize(name).includes(normalize(p.TenSP))
//       )
//     ).slice(0, 16);
    
//     console.log('Gemini reply:', reply);
//     console.log('Recommended names:', recommendedNames);
//     console.log('Matched products:', recommendedProducts.map(p => p.TenSP));
    
//     // CHỈ dùng fallback khi Gemini không có kết quả
//     if (recommendedProducts.length === 0) {
//       console.log('No Gemini results, using category-based fallback');
      
//       const fallbackByCategory = allProducts.filter(
//         p => viewedProducts.some(vp => vp.category === p.category) && 
//              !viewedProductIds.includes(p._id)
//       ).slice(0, 16);
      
//       if (fallbackByCategory.length > 0) {
//         recommendedProducts = fallbackByCategory;
//       } else {
//         // Fallback cuối cùng: random products
//         recommendedProducts = allProducts
//           .filter(p => !viewedProductIds.includes(p._id))
//           .slice(0, 16);
//       }
//     }
    
//     res.json(recommendedProducts);
//   } catch (err) {
//     console.error('Recommendation error:', err);
//     res.status(500).json({ error: 'Failed to get recommendations' });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const UserEvent = require('../models/userEventModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');
const axios = require('axios');

const GEMINI_API_KEY = 'AIzaSyAPXEVF74zh2UgGQiBnJDbwNaZnWBUk61o';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// GET /api/recommendations/:userId
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Validation
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

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
    const viewedCategories = [...new Set(viewedProducts.map(p => p.category))].join(', ');

    const prompt = `Dựa trên lịch sử của tôi:
- Đã xem: ${listProductNames}
- Danh mục quan tâm: ${viewedCategories}
- Đã thêm vào giỏ: ${cartProductNames.join(', ') || 'Chưa có'}
- Từ khóa tìm kiếm: ${searchKeywords.join(', ') || 'Chưa có'}

Từ danh sách sản phẩm sau, hãy chọn ĐÚNG 16 sản phẩm phù hợp nhất. Ưu tiên sản phẩm cùng danh mục hoặc liên quan.

QUAN TRỌNG: Chỉ trả về tên sản phẩm, mỗi tên một dòng, KHÔNG có số thứ tự, KHÔNG có giải thích.

Danh sách sản phẩm: ${allProductNames}`;

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
        geminiPayload,
        { timeout: 10000 }
      );
      
      if (
        geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text
      ) {
        reply = geminiRes.data.candidates[0].content.parts[0].text;
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        console.error('Gemini API timeout');
      } else if (err.response?.status === 429) {
        console.error('Rate limit exceeded');
      } else {
        console.error('Gemini API error:', err.message);
      }
      
      // Fallback khi có lỗi
      const fallbackProducts = allProducts
        .filter(p => !viewedProductIds.includes(p._id))
        .slice(0, 16);
      
      return res.json(fallbackProducts);
    }

    // 4. Parse tên sản phẩm từ reply
    const recommendedNames = reply
      .split('\n')
      .map(line => line.replace(/^[-\d.\s*]+/, '').trim())
      .filter(Boolean);

    // Thay thế phần matching logic để tránh trùng lặp
const normalize = str => (str || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

// 5. Cải thiện logic matching - tránh trùng lặp
let recommendedProducts = [];

// Exact match trước
const exactMatches = allProducts.filter(p =>
  recommendedNames.some(name => normalize(p.TenSP) === normalize(name))
);

// Partial match - loại trừ exact matches
const partialMatches = allProducts.filter(p =>
  !exactMatches.some(em => em._id.equals(p._id)) && // Loại trừ exact matches
  recommendedNames.some(name => {
    const normalizedProduct = normalize(p.TenSP);
    const normalizedName = normalize(name);
    return normalizedProduct.includes(normalizedName) || normalizedName.includes(normalizedProduct);
  })
);

// Kết hợp và loại bỏ trùng lặp dựa trên _id
const allMatches = [...exactMatches, ...partialMatches];
const uniqueProducts = allMatches.filter((product, index, self) => 
  index === self.findIndex(p => p._id.equals(product._id))
);

recommendedProducts = uniqueProducts.slice(0, 16);

console.log('Gemini reply:', reply);
console.log('Recommended names:', recommendedNames.length, 'items');
console.log('Exact matches:', exactMatches.length);
console.log('Partial matches:', partialMatches.length);
console.log('Unique products:', uniqueProducts.length);
console.log('Final recommended:', recommendedProducts.map(p => p.TenSP));

    // 6. Fallback chỉ khi cần thiết
    if (recommendedProducts.length === 0) {
      console.log('No Gemini results, using category-based fallback');
      
      const fallbackByCategory = allProducts.filter(
        p => viewedProducts.some(vp => vp.category === p.category) && 
             !viewedProductIds.includes(p._id)
      ).slice(0, 16);
      
      if (fallbackByCategory.length > 0) {
        recommendedProducts = fallbackByCategory;
      } else {
        recommendedProducts = allProducts
          .filter(p => !viewedProductIds.includes(p._id))
          .slice(0, 16);
      }
    }

    res.json(recommendedProducts);
  } catch (err) {
    console.error('Recommendation error:', err);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

module.exports = router;