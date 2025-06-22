const express = require('express');
const router = express.Router();
const axios = require('axios');
const Product = require('../models/productModel');
const Variant = require('../models/variantModel');
const Category = require('../models/categoryModel');

// Cấu hình model - dễ dàng thay đổi
const OLLAMA_MODEL = 'openhermes';

// Thông tin cửa hàng
const STORE_INFO = {
  name: "Poly Smart",
  description: "Cửa hàng chuyên bán điện thoại chính hãng, uy tín, chất lượng cao",
  policies: [
    "Bảo hành chính hãng 12 tháng",
    "Giao hàng toàn quốc, thanh toán khi nhận hàng",
    "Đổi trả trong 7 ngày nếu có lỗi từ nhà sản xuất",
    "Hỗ trợ trả góp 0% lãi suất"
  ],
  contact: "Hotline: 1900-xxxx, Email: info@polysmart.com"
};

const SMART_KEYWORDS = {
  brands: ['iphone', 'ipad', 'macbook', 'airpod', 'apple watch'],
  features: ['camera', 'pin', 'ram', 'rom', 'chip', 'màn hình', 'màn hình', 'tốc độ', 'hiệu năng', 'gaming', 'chụp ảnh', 'quay video'],
  price_ranges: ['rẻ', 'giá rẻ', 'tầm trung', 'cao cấp', 'premium', 'đắt', 'giá cao'],
  conditions: ['mới', 'cũ', 'refurbished', 'đã qua sử dụng'],
  colors: ['đen', 'trắng', 'xanh', 'đỏ', 'vàng', 'tím', 'hồng', 'xám', 'bạc', 'vàng'],
  storage: ['64gb', '128gb', '256gb', '512gb', '1tb', '64 gb', '128 gb', '256 gb', '512 gb', '1 tb']
};

// Hàm trích xuất từ khóa - Phiên bản ổn định nhất
const PRICE_KEYWORDS = {
  cheap: ['rẻ', 'giá rẻ', 'thấp'],
  expensive: ['cao cấp', 'premium', 'đắt', 'giá cao'],
};
const STOP_WORDS = [
    'là', 'có', 'của', 'và', 'em', 'anh', 'chị', 'giá', 'mua', 'bán', 'bao', 'nhiêu', 
    'không', 'ạ', 'tôi', 'cửa', 'hàng', 'shop', 'mình', 'nào', 'điện', 'thoại',
    'cho', 'xem', 'tiền', 'về', 'con', 'tư', 'vấn'
];

const extractKeywords = (message) => {
  // Chuẩn hóa message: chữ thường, bỏ ký tự đặc biệt, thay thế 'ip' bằng 'iphone', tách số khỏi chữ
  const normalizedMessage = message.toLowerCase()
    .replace(/([a-zA-Z]+)(\d+)/g, '$1 $2') // iphone11 -> iphone 11
    .replace(/(\d+)([a-zA-Z]+)/g, '$1 $2') // 128gb -> 128 gb
    .replace(/[.,?]/g, '')
    .replace(/\bip\b/g, 'iphone');
    
  const words = normalizedMessage.split(/\s+/);
  
  const allPriceKeywords = [...PRICE_KEYWORDS.cheap, ...PRICE_KEYWORDS.expensive];

  const nameAndFeatureKeywords = words.filter(word => word.length > 0 && !STOP_WORDS.includes(word) && !allPriceKeywords.includes(word));
  const priceKeywords = words.filter(word => allPriceKeywords.includes(word));

  return { nameAndFeatureKeywords, priceKeywords };
};

// Hàm tìm kiếm sản phẩm - Logic AND
const searchProducts = async ({ nameAndFeatureKeywords, priceKeywords }) => {
  if (nameAndFeatureKeywords.length === 0) return [];

  const matchConditions = {};

  // Tất cả các từ khóa phải xuất hiện trong một trong các trường được chỉ định
  matchConditions.$and = nameAndFeatureKeywords.map(keyword => ({
      $or: [
          { TenSP: { $regex: keyword, $options: 'i' } },
          { 'thong_so_ky_thuat.CPU': { $regex: keyword, $options: 'i' } },
          { 'thong_so_ky_thuat.Camera': { $regex: keyword, $options: 'i' } },
          { 'variants.dung_luong': { $regex: keyword, $options: 'i' } },
          { 'variants.ram': { $regex: keyword, $options: 'i' } },
      ]
  }));
  
  // Sắp xếp theo giá
  let sortCondition = { ban_chay: -1, 'variants.gia': 1 };
  if (priceKeywords.some(k => PRICE_KEYWORDS.cheap.includes(k))) {
    sortCondition = { 'variants.gia': 1 };
  } else if (priceKeywords.some(k => PRICE_KEYWORDS.expensive.includes(k))) {
    sortCondition = { 'variants.gia': -1 };
  }

  const aggregationPipeline = [
    {
      $lookup: {
        from: 'variants',
        let: { product_id_str: { $toString: "$_id" } },
        pipeline: [
          { $match: { $expr: { $eq: ["$id_san_pham", "$$product_id_str"] }, an_hien: true } },
          { $sort: { gia: 1 } }
        ],
        as: 'variants'
      }
    },
    { $match: { 'variants.0': { $exists: true }, an_hien: true } },
    { $match: matchConditions },
    { $lookup: { from: "categories", localField: "id_danhmuc", foreignField: "_id", as: "id_danhmuc" } },
    { $unwind: { path: "$id_danhmuc", preserveNullAndEmptyArrays: true } },
    { $sort: sortCondition },
    { $limit: 3 } // Giới hạn 3 sản phẩm để câu trả lời không quá dài
  ];

  try {
    const products = await Product.aggregate(aggregationPipeline);
    console.log(`[DEBUG] Final search found ${products.length} products with keywords: ${nameAndFeatureKeywords.join(', ')}`);
    return products;
  } catch (error) {
    console.error("Lỗi khi thực hiện aggregation:", error);
    return [];
  }
};


// Hàm tạo bản tin tóm tắt cho AI
const buildProductInfoForAI = (products) => {
  let productInfo = `Tìm thấy ${products.length} sản phẩm phù hợp:\n`;
  
  products.forEach((product) => {
    const variantsInfo = product.variants.map(v => 
        `${v.dung_luong || ''} ${v.ram || ''} ${v.mau || ''}`.trim()
      ).join(', ');
      
    productInfo += `- Tên: ${product.TenSP}. Giá từ ${product.variants[0].gia.toLocaleString('vi-VN')} VNĐ. Các phiên bản: ${variantsInfo}.\n`;
  });
  
  return productInfo;
};


router.post('/chat-ai', async (req, res) => {
  const { message, history } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    // 1. Trích xuất từ khóa, có xử lý ngữ cảnh
    let { nameAndFeatureKeywords, priceKeywords } = extractKeywords(message);

    if (nameAndFeatureKeywords.length === 0 && history && history.length > 0) {
        const lastUserMessage = [...history].reverse().find(h => h.role === 'user');
        if (lastUserMessage) {
            const previousKeywords = extractKeywords(lastUserMessage.content);
            if(previousKeywords.nameAndFeatureKeywords.length > 0) {
                console.log(`[DEBUG] Reusing keywords from: "${lastUserMessage.content}"`);
                nameAndFeatureKeywords = previousKeywords.nameAndFeatureKeywords;
            }
        }
    }
    
    // 2. Tìm kiếm sản phẩm
    const products = await searchProducts({ nameAndFeatureKeywords, priceKeywords });

    // 3. Trả lời cứng nếu không có sản phẩm
    if (products.length === 0) {
      res.write("Dạ, cửa hàng Poly Smart hiện không có sản phẩm phù hợp với yêu cầu của anh/chị ạ. Anh/chị có thể tham khảo các sản phẩm khác nhé!");
      res.end();
      return;
    }
    
    // 4. Chuẩn bị dữ liệu và prompt cho AI "Biên tập viên"
    const productDataForAI = buildProductInfoForAI(products);
    
    const prompt = `
<<SYS>>
Bạn là trợ lý AI của cửa hàng điện thoại "Poly Smart".
Nhiệm vụ của bạn là đọc "DỮ LIỆU" và viết lại thành một câu trả lời tư vấn ngắn gọn, thân thiện bằng tiếng Việt.
**QUY TẮC:**
- Giữ lại đúng tên sản phẩm và giá.
- Không thêm bất kỳ thông tin nào không có trong "DỮ LIỆU".
- Giọng văn tự nhiên, chuyên nghiệp.
<<SYS>>

**DỮ LIỆU:**
---
${productDataForAI}
---

Hãy viết lại dữ liệu trên thành một câu trả lời thân thiện cho khách hàng.
`;

    // 5. Gọi Ollama
    const ollamaRes = await axios.post(
      'http://localhost:11434/api/generate',
      {
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: true,
      },
      { responseType: 'stream' }
    );

    ollamaRes.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      lines.forEach((line) => {
        if (line.trim() !== '') {
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              res.write(`${parsed.response}`);
            }
            if (parsed.done) {
              res.end();
            }
          } catch (e) {
            // Bỏ qua lỗi parse JSON
          }
        }
      });
    });

    ollamaRes.data.on('error', (err) => {
      console.error('Lỗi stream từ Ollama:', err);
      if (!res.headersSent) {
        res.status(500).end('Lỗi stream từ Ollama');
      } else {
        res.end();
      }
    });

    req.on('close', () => {
      console.log('[DEBUG] Kết nối bị đóng bởi client');
    });

  } catch (err) {
    console.error('Lỗi khi xử lý chat:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Lỗi khi xử lý yêu cầu chat' });
    }
  }
});

module.exports = router; 