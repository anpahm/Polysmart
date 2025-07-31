// const express = require('express');
// const router = express.Router();
// const UserEvent = require('../models/userEventModel');
// const Product = require('../models/productModel');
// const Category = require('../models/categoryModel');
// const mongoose = require('mongoose');
// const axios = require('axios');

// const GEMINI_API_KEY = 'AIzaSyAPXEVF74zh2UgGQiBnJDbwNaZnWBUk61o';
// const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// // GET /api/recommendations/:userId
// router.get('/:userId', async (req, res) => {
//   const { userId } = req.params;

//   try {
//     // Validation
//     if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ error: 'Invalid userId' });
//     }

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
//     const viewedCategories = [...new Set(viewedProducts.map(p => p.category))].join(', ');

//     const prompt = `Dựa trên lịch sử của tôi:
// - Đã xem: ${listProductNames}
// - Danh mục quan tâm: ${viewedCategories}
// - Đã thêm vào giỏ: ${cartProductNames.join(', ') || 'Chưa có'}
// - Từ khóa tìm kiếm: ${searchKeywords.join(', ') || 'Chưa có'}

// Từ danh sách sản phẩm sau, hãy chọn ĐÚNG 16 sản phẩm phù hợp nhất. Ưu tiên sản phẩm cùng danh mục hoặc liên quan.

// QUAN TRỌNG: Chỉ trả về tên sản phẩm, mỗi tên một dòng, KHÔNG có số thứ tự, KHÔNG có giải thích.

// Danh sách sản phẩm: ${allProductNames}`;

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
//         geminiPayload,
//         { timeout: 10000 }
//       );
      
//       if (
//         geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text
//       ) {
//         reply = geminiRes.data.candidates[0].content.parts[0].text;
//       }
//     } catch (err) {
//       if (err.code === 'ECONNABORTED') {
//         console.error('Gemini API timeout');
//       } else if (err.response?.status === 429) {
//         console.error('Rate limit exceeded');
//       } else {
//         console.error('Gemini API error:', err.message);
//       }
      
//       // Fallback khi có lỗi
//       const fallbackProducts = allProducts
//         .filter(p => !viewedProductIds.includes(p._id))
//         .slice(0, 16);
      
//       return res.json(fallbackProducts);
//     }

//     // 4. Parse tên sản phẩm từ reply
//     const recommendedNames = reply
//       .split('\n')
//       .map(line => line.replace(/^[-\d.\s*]+/, '').trim())
//       .filter(Boolean);

//     // Thay thế phần matching logic để tránh trùng lặp
// const normalize = str => (str || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

// // 5. Cải thiện logic matching - tránh trùng lặp
// let recommendedProducts = [];

// // Exact match trước
// const exactMatches = allProducts.filter(p =>
//   recommendedNames.some(name => normalize(p.TenSP) === normalize(name))
// );

// // Partial match - loại trừ exact matches
// const partialMatches = allProducts.filter(p =>
//   !exactMatches.some(em => em._id.equals(p._id)) && // Loại trừ exact matches
//   recommendedNames.some(name => {
//     const normalizedProduct = normalize(p.TenSP);
//     const normalizedName = normalize(name);
//     return normalizedProduct.includes(normalizedName) || normalizedName.includes(normalizedProduct);
//   })
// );

// // Kết hợp và loại bỏ trùng lặp dựa trên _id
// const allMatches = [...exactMatches, ...partialMatches];
// const uniqueProducts = allMatches.filter((product, index, self) => 
//   index === self.findIndex(p => p._id.equals(product._id))
// );

// recommendedProducts = uniqueProducts.slice(0, 16);

// console.log('Gemini reply:', reply);
// console.log('Recommended names:', recommendedNames.length, 'items');
// console.log('Exact matches:', exactMatches.length);
// console.log('Partial matches:', partialMatches.length);
// console.log('Unique products:', uniqueProducts.length);
// console.log('Final recommended:', recommendedProducts.map(p => p.TenSP));

//     // 6. Fallback chỉ khi cần thiết
//     if (recommendedProducts.length === 0) {
//       console.log('No Gemini results, using last-viewed-category and best-seller fallback');
//       // 1. Lấy danh mục vừa xem gần nhất
//       const lastViewedCategory = viewedProducts[0]?.category;
//       let fallbackByCategory = [];
//       if (lastViewedCategory) {
//         fallbackByCategory = allProducts
//           .filter(p => p.category === lastViewedCategory && !viewedProductIds.includes(p._id))
//           .sort((a, b) => (b.ban_chay || 0) - (a.ban_chay || 0));
//       }
//       // 2. Nếu chưa đủ, bổ sung sản phẩm bán chạy toàn shop
//       if (fallbackByCategory.length < 16) {
//         const moreProducts = allProducts
//           .filter(p => !viewedProductIds.includes(p._id) && p.category !== lastViewedCategory)
//           .sort((a, b) => (b.ban_chay || 0) - (a.ban_chay || 0));
//         fallbackByCategory = [
//           ...fallbackByCategory,
//           ...moreProducts.slice(0, 16 - fallbackByCategory.length)
//         ];
//       }
//       recommendedProducts = fallbackByCategory.slice(0, 16);
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
const Category = require('../models/categoryModel');
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

    // Xác định sản phẩm và danh mục xem gần nhất
    const mostRecentProduct = viewedProducts.find(p => p._id.equals(viewedEvents[0].productId));
    const mostRecentCategory = mostRecentProduct?.category || '';
    
    // Log để debug
    console.log('Most recent product:', mostRecentProduct?.TenSP);
    console.log('Most recent category:', mostRecentCategory);

    const cartEvents = await UserEvent.find({ userId, eventType: 'add_to_cart' }).lean();
    const searchEvents = await UserEvent.find({ userId, eventType: 'search' }).lean();
    const cartProductIds = cartEvents.map(e => e.productId).filter(Boolean);
    const cartProducts = await Product.find({ _id: { $in: cartProductIds } }).lean();
    const cartProductNames = cartProducts.map(p => p.TenSP);
    const searchKeywords = searchEvents.map(e => e.searchKeyword).filter(Boolean);

    // 2. Chuẩn bị prompt cho Gemini (đồng bộ với aiAdvice.js)
    const listProductNames = viewedProducts.map(p => p.TenSP).join(', ');
    
    // Sắp xếp allProducts để ưu tiên danh mục của sản phẩm xem gần nhất
    const sortedAllProducts = allProducts.sort((a, b) => {
      if (a.category === mostRecentCategory && b.category !== mostRecentCategory) return -1;
      if (b.category === mostRecentCategory && a.category !== mostRecentCategory) return 1;
      return 0;
    });
    const allProductNames = sortedAllProducts.map(p => p.TenSP).join(', ');

    const prompt = `
Chào bạn! Mình để ý bạn vừa xem qua sản phẩm: ${mostRecentProduct?.TenSP || 'Không có'}.
Danh mục của sản phẩm này: ${mostRecentCategory || 'Không có'}.
Ngoài ra, bạn đã xem các sản phẩm: ${listProductNames}.
Bạn đã thêm vào giỏ hàng: ${cartProductNames.join(', ') || 'Chưa có'}.
Và bạn đã tìm kiếm với từ khóa: ${searchKeywords.join(', ') || 'Chưa có'}.

Từ danh sách sản phẩm sau, hãy chọn ĐÚNG 16 sản phẩm phù hợp nhất. 
Ưu tiên các sản phẩm thuộc danh mục "${mostRecentCategory}" hoặc liên quan đến "${mostRecentProduct?.TenSP || ''}".
Hãy đảm bảo các sản phẩm thuộc danh mục "${mostRecentCategory}" được liệt kê trước.

QUAN TRỌNG: Chỉ trả về tên sản phẩm, mỗi tên một dòng, KHÔNG có số thứ tự, KHÔNG có giải thích.

Danh sách sản phẩm: ${allProductNames}`;

    const geminiPayload = {
      contents: [
        { parts: [{ text: prompt }] }
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
      
      if (geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
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
      let fallbackProducts = [];
      if (mostRecentCategory) {
        fallbackProducts = allProducts
          .filter(p => p.category === mostRecentCategory && !viewedProductIds.includes(p._id))
          .sort((a, b) => (b.ban_chay || 0) - (a.ban_chay || 0));
      }
      if (fallbackProducts.length < 16) {
        const moreProducts = allProducts
          .filter(p => !viewedProductIds.includes(p._id) && p.category !== mostRecentCategory)
          .sort((a, b) => (b.ban_chay || 0) - (a.ban_chay || 0));
        fallbackProducts = [
          ...fallbackProducts,
          ...moreProducts.slice(0, 16 - fallbackProducts.length)
        ];
      }
      return res.json(fallbackProducts.slice(0, 16));
    }

    // 4. Parse tên sản phẩm từ reply
    const recommendedNames = reply
      .split('\n')
      .map(line => line.replace(/^[-\d.\s*]+/, '').trim())
      .filter(Boolean);

    // 5. Logic matching - chỉ sử dụng exact matches để giữ thứ tự từ Gemini
    const normalize = str => (str || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

    let recommendedProducts = [];

    // Exact match trước
    const exactMatches = allProducts.filter(p =>
      recommendedNames.some(name => normalize(p.TenSP) === normalize(name))
    );

    // Giữ thứ tự từ Gemini, không thêm partial matches để tránh xáo trộn
    recommendedProducts = exactMatches
      .sort((a, b) => {
        // Ưu tiên danh mục của sản phẩm xem gần nhất
        if (a.category === mostRecentCategory && b.category !== mostRecentCategory) return -1;
        if (b.category === mostRecentCategory && a.category !== mostRecentCategory) return 1;
        // Giữ thứ tự từ Gemini nếu cùng danh mục
        return recommendedNames.indexOf(a.TenSP) - recommendedNames.indexOf(b.TenSP);
      })
      .slice(0, 16);

    console.log('Gemini reply:', reply);
    console.log('Recommended names:', recommendedNames.length, 'items');
    console.log('Exact matches:', exactMatches.length);
    console.log('Final recommended:', recommendedProducts.map(p => p.TenSP));

    // 6. Fallback chỉ khi cần thiết
    if (recommendedProducts.length === 0) {
      console.log('No Gemini results, using last-viewed-category and best-seller fallback');
      let fallbackByCategory = [];
      if (mostRecentCategory) {
        fallbackByCategory = allProducts
          .filter(p => p.category === mostRecentCategory && !viewedProductIds.includes(p._id))
          .sort((a, b) => (b.ban_chay || 0) - (a.ban_chay || 0));
      }
      if (fallbackByCategory.length < 16) {
        const moreProducts = allProducts
          .filter(p => !viewedProductIds.includes(p._id) && p.category !== mostRecentCategory)
          .sort((a, b) => (b.ban_chay || 0) - (a.ban_chay || 0));
        fallbackByCategory = [
          ...fallbackByCategory,
          ...moreProducts.slice(0, 16 - fallbackByCategory.length)
        ];
      }
      recommendedProducts = fallbackByCategory.slice(0, 16);
    }

    res.json(recommendedProducts);
  } catch (err) {
    console.error('Recommendation error:', err);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

module.exports = router;