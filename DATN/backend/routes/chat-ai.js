const express = require('express');
const router = express.Router();
const axios = require('axios');
const Product = require('../models/productModel');
const Variant = require('../models/variantModel');
const Category = require('../models/categoryModel');

const GEMINI_API_KEY = 'AIzaSyAPXEVF74zh2UgGQiBnJDbwNaZnWBUk61o';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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
  contact: "Hotline: 1900-1234, Email: polysmart79@gmail.com"
};

const SMART_KEYWORDS = {
  brands: ['iphone', 'ipad', 'macbook', 'airpod', 'apple watch'],
  features: ['camera', 'pin', 'ram', 'rom', 'chip', 'màn hình', 'tốc độ', 'hiệu năng', 'gaming', 'chụp ảnh', 'quay video'],
  price_ranges: ['rẻ', 'giá rẻ', 'tầm trung', 'cao cấp', 'premium', 'đắt', 'giá cao'],
  conditions: ['mới', 'cũ', 'refurbished', 'đã qua sử dụng'],
  colors: ['đen', 'trắng', 'xanh', 'đỏ', 'vàng', 'tím', 'hồng', 'xám', 'bạc', 'vàng'],
  storage: ['64gb', '128gb', '256gb', '512gb', '1tb', '64 gb', '128 gb', '256 gb', '512 gb', '1 tb']
};
const PRICE_KEYWORDS = {
  cheap: ['rẻ', 'giá rẻ', 'thấp'],
  expensive: ['cao cấp', 'premium', 'đắt', 'giá cao'],
};
const STOP_WORDS = [
    'là', 'có', 'của', 'và', 'em', 'anh', 'chị', 'không', 'ạ', 'tôi', 'cửa', 'hàng', 'shop', 'mình', 'nào', 'cho', 'về', 'con', 'tư'
];

// Bản đồ mã màu sang tên màu tiếng Việt
const COLOR_MAP = {
  '000000': 'Đen',
  'ffffff': 'Trắng',
  'bfa48f': 'Vàng',
  'c2bcb2': 'Bạc',
  '1e90ff': 'Xanh',
  'ff69b4': 'Hồng',
};
function getColorName(mau) {
  if (!mau) return '';
  const hex = mau.replace('#', '').toLowerCase();
  return COLOR_MAP[hex] || mau;
}

const normalizeString = (str) => (str || '').toLowerCase().replace(/\s+/g, '');

const extractKeywords = (message) => {
  const normalizedMessage = message.toLowerCase()
    .replace(/([a-zA-Z]+)(\d+)/g, '$1 $2')
    .replace(/(\d+)([a-zA-Z]+)/g, '$1 $2')
    .replace(/[.,?]/g, '')
    .replace(/\bip\b/g, 'iphone');
  const words = normalizedMessage.split(/\s+/);
  const allPriceKeywords = [...PRICE_KEYWORDS.cheap, ...PRICE_KEYWORDS.expensive];
  let nameAndFeatureKeywords = words.filter(word => {
    if (!word || STOP_WORDS.includes(word) || allPriceKeywords.includes(word)) return false;
    if (/^\d+$/.test(word)) return true;
    for (const key in SMART_KEYWORDS) {
      if (SMART_KEYWORDS[key].some(k => k === word)) return true;
    }
    if (word.length > 2) return true;
    return false;
  });
  if (nameAndFeatureKeywords.length === 0) {
    nameAndFeatureKeywords = words.filter(word => {
      if (!word) return false;
      if (/^\d+$/.test(word)) return true;
      for (const key in SMART_KEYWORDS) {
        if (SMART_KEYWORDS[key].some(k => k === word)) return true;
      }
      return false;
    });
  }
  const priceKeywords = words.filter(word => allPriceKeywords.includes(word));
  return { nameAndFeatureKeywords, priceKeywords };
};

function extractCompareProducts(message) {
  // Tìm các cụm "so sánh X và Y" hoặc "compare X vs Y"
  const compareRegex = /so sánh\s+(.+?)\s+(và|vs|với)\s+(.+)/i;
  const match = message.match(compareRegex);
  if (match) {
    const name1 = match[1].trim();
    const name2 = match[3].trim();
    return [name1, name2];
  }
  return null;
}

function extractProductNameFromMessage(message) {
  // Ưu tiên lấy cụm từ sau các từ khóa mua hàng
  const buyRegex = /(mua|giá|cần|tìm|có|bán)\s+(.+)$/i;
  const match = message.match(buyRegex);
  if (match) {
    return match[2].trim();
  }
  return null;
}

// Hàm tách từ khóa quan trọng từ câu hỏi tự nhiên
function extractImportantKeywords(message) {
  let normalized = (message || '').toLowerCase()
    .replace(/([a-zA-Z]+)(\d+)/g, '$1 $2')
    .replace(/(\d+)([a-zA-Z]+)/g, '$1 $2')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  let words = normalized.split(' ').filter(w => w && !STOP_WORDS.includes(w));
  return words;
}

const searchProducts = async ({ nameAndFeatureKeywords, priceKeywords, compareNames, message }) => {
  if (compareNames && compareNames.length === 2) {
    // Tìm chính xác hai sản phẩm này
    const allProducts = await Product.find({ an_hien: true }).lean();
    const found = compareNames.map(name => {
      return allProducts.find(p => normalizeString(p.TenSP) === normalizeString(name));
    }).filter(Boolean);
    // Lấy variants cho từng sản phẩm
    for (const p of found) {
      p.variants = await Variant.find({ id_san_pham: p._id.toString(), an_hien: true }).lean();
    }
    if (found.length === 2) return found;
    // Nếu không đủ 2 sản phẩm, fallback về logic cũ
  }
  if (nameAndFeatureKeywords.length === 0) return [];
  const keywordFull = nameAndFeatureKeywords.join(' ').toLowerCase().trim();
  const allProducts = await Product.find({ an_hien: true }).lean();
  const exactMatch = allProducts.find(p => normalizeString(p.TenSP) === normalizeString(keywordFull));
  if (exactMatch) {
    // Lấy variants cho sản phẩm này
    const variants = await Variant.find({ id_san_pham: exactMatch._id.toString(), an_hien: true }).lean();
    exactMatch.variants = variants;
    return [exactMatch];
  }
  // Fuzzy AND match với nameAndFeatureKeywords
  const fuzzyAndMatch = allProducts.filter(p => {
    const normName = normalizeString(p.TenSP);
    return nameAndFeatureKeywords.every(kw => normName.includes(normalizeString(kw)));
  });
  for (const p of fuzzyAndMatch) {
    p.variants = await Variant.find({ id_san_pham: p._id.toString(), an_hien: true }).lean();
  }
  if (fuzzyAndMatch.length > 0) return fuzzyAndMatch;
  // Fuzzy match với các từ khóa quan trọng từ câu hỏi tự nhiên
  if (message) {
    const importantKeywords = extractImportantKeywords(message);
    const MIN_KEYWORD_MATCH = 2;
    const MAIN_KEYWORDS = ['iphone', 'ipad', 'macbook', 'airpod', 'apple'];
    const mainKeyword = importantKeywords.find(kw => MAIN_KEYWORDS.includes(kw));
    // Sắp xếp sản phẩm theo số lượng từ khóa khớp giảm dần
    const scoredProducts = allProducts.map(p => {
      const normName = normalizeString(p.TenSP);
      let score = 0;
      importantKeywords.forEach(kw => {
        if (normName.includes(normalizeString(kw))) score++;
      });
      // Nếu có mainKeyword, sản phẩm phải chứa mainKeyword
      const hasMain = mainKeyword ? normName.includes(normalizeString(mainKeyword)) : true;
      return { ...p, _score: score, _hasMain: hasMain };
    }).filter(p => p._score >= MIN_KEYWORD_MATCH && p._hasMain);
    scoredProducts.sort((a, b) => b._score - a._score);
    for (const p of scoredProducts) {
      p.variants = await Variant.find({ id_san_pham: p._id.toString(), an_hien: true }).lean();
    }
    if (scoredProducts.length > 0) return scoredProducts;
  }
  // Nếu không có match AND, dùng logic cũ (aggregation)
  const matchConditions = {};
  matchConditions.$and = nameAndFeatureKeywords.map(keyword => ({
    $or: [
      { TenSP: { $regex: keyword, $options: 'i' } },
      { 'variants.dung_luong': { $regex: keyword, $options: 'i' } },
    ]
  }));
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
        let: { product_id_str: { $toString: "$ _id" } },
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
    { $limit: 4 }
  ];
  try {
    let products = await Product.aggregate(aggregationPipeline);
    if (products.length === 0 && nameAndFeatureKeywords.length > 1) {
      const strongKeywords = nameAndFeatureKeywords.filter(word => {
        if (/^\d+$/.test(word)) return true;
        if (SMART_KEYWORDS.brands.includes(word)) return true;
        return false;
      });
      if (strongKeywords.length > 0) {
        const orMatch = {
          $or: strongKeywords.map(keyword => ({
            TenSP: { $regex: keyword, $options: 'i' }
          }))
        };
        const fallbackPipeline = [
          aggregationPipeline[0],
          aggregationPipeline[1],
          { $match: orMatch },
          aggregationPipeline[3],
          aggregationPipeline[4],
          aggregationPipeline[5],
          aggregationPipeline[6],
        ];
        products = await Product.aggregate(fallbackPipeline);
      }
    }
    return products;
  } catch (error) {
    return [];
  }
};

const buildProductInfoForAI = (products) => {
  let productInfo = `Tìm thấy ${products.length} sản phẩm phù hợp:\n`;
  products.forEach((product) => {
    const variants = Array.isArray(product.variants) ? product.variants : [];
    const variantsInfo = variants.map(v =>
      `${v.dung_luong || ''} ${getColorName(v.mau)}`.trim()
    ).join(', ');
    const gia = variants[0]?.gia ? variants[0].gia.toLocaleString('vi-VN') : 'N/A';
    productInfo += `- Tên: ${product.TenSP}. Giá từ ${gia} VNĐ. Các phiên bản: ${variantsInfo}.\n`;
  });
  return productInfo;
};

// Hàm tách tên sản phẩm từ câu trả lời AI
function extractProductNamesFromAIReply(reply) {
  // Tìm tất cả cụm "iPhone 13", "iPhone 14", ...
  const matches = reply.match(/iPhone \d+(?: [A-Za-z]+)?/gi);
  if (!matches) return [];
  // Loại bỏ trùng lặp, chuẩn hóa
  return [...new Set(matches.map(name => name.trim().toLowerCase()))];
}

router.post('/chat-ai', async (req, res) => {
  const { message, history } = req.body;
  const networkOnlyKeywords = [
    'đặc điểm', 'so sánh', 'review', 'ưu điểm', 'nhược điểm', 'có tốt không', 'có nên mua', 'đánh giá', 'so với', 'khác biệt', 'điểm khác'
  ];
  const isNetworkOnly = networkOnlyKeywords.some(k => message.toLowerCase().includes(k));
  let products = [];
  let prompt = message;
  let geminiPayload;
  if (isNetworkOnly) {
    // Luôn lấy kiến thức trên mạng, không lấy từ DB, không gửi history
    products = [];
    prompt = message;
    geminiPayload = {
      contents: [
        { parts: [ { text: prompt } ] }
      ]
    };
  } else {
    let { nameAndFeatureKeywords, priceKeywords } = extractKeywords(message);
    let compareNames = extractCompareProducts(message);
    const productName = extractProductNameFromMessage(message);
    if (productName) {
      // Tìm sản phẩm theo tên đầy đủ trước
      const allProducts = await Product.find({ an_hien: true }).lean();
      const found = allProducts.filter(p => normalizeString(p.TenSP).includes(normalizeString(productName)));
      for (const p of found) {
        p.variants = await Variant.find({ id_san_pham: p._id.toString(), an_hien: true }).lean();
      }
      products = found;
    }
    if (!products.length) {
      if (nameAndFeatureKeywords.length === 0 && history && history.length > 0) {
        const lastUserMessage = [...history].reverse().find(h => h.role === 'user');
        if (lastUserMessage) {
          const previousKeywords = extractKeywords(lastUserMessage.content);
          if (previousKeywords.nameAndFeatureKeywords.length > 0) {
            nameAndFeatureKeywords = previousKeywords.nameAndFeatureKeywords;
          }
        }
      }
      products = await searchProducts({ nameAndFeatureKeywords, priceKeywords, compareNames, message });
    }
    if (/so sánh|compare|khác biệt|điểm khác/i.test(message)) {
      prompt = `Bạn là trợ lý AI của cửa hàng điện thoại Poly Smart. Nếu người dùng yêu cầu so sánh hai sản phẩm, hãy trả lời bằng bảng so sánh (table) ở định dạng Markdown, không dùng đoạn text dài. Nếu có thể, hãy thêm nhận xét ngắn gọn sau bảng.\n\nCâu hỏi của khách: "${message}"`;
    } else if (products.length > 0) {
      const productDataForAI = buildProductInfoForAI(products);
      prompt = `Khách hỏi: "${message}"\nDưới đây là các sản phẩm phù hợp:\n${productDataForAI}\nHãy tư vấn ngắn gọn, thân thiện.`;
    } else {
      prompt = message;
    }
    // Gửi history nếu có sản phẩm
    geminiPayload = {
      contents: [
        { parts: [ { text: prompt } ] }
      ]
    };
  }
  let reply = "";
  try {
    const geminiRes = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      geminiPayload
    );
    // Kiểm tra an toàn dữ liệu trả về từ Gemini
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
      console.error('Gemini trả về dữ liệu không đúng định dạng:', JSON.stringify(geminiRes.data));
      reply = "Xin lỗi, AI không trả về kết quả phù hợp.";
    }
  } catch (err) {
    console.error('Lỗi khi gọi Gemini API:', err.message);
    if (err.response && err.response.data) {
      console.error('Chi tiết:', err.response.data);
    }
    reply = "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.";
  }

  // Nếu AI trả lời có nhắc tên sản phẩm cụ thể, chỉ render các sản phẩm đó
  let filteredProducts = products;
  const aiProductNames = extractProductNamesFromAIReply(reply);
  if (aiProductNames.length > 0 && products && products.length > 0) {
    filteredProducts = products.filter(p => {
      const normName = (p.TenSP || '').toLowerCase();
      return aiProductNames.some(aiName => normName.includes(aiName));
    });
  }

  res.json({
    reply,
    products: filteredProducts
  });
});

// Hàm test Gemini trực tiếp trên terminal
if (require.main === module) {
  (async () => {
    const prompt = 'So sánh iPhone 12 và iPhone 12 Pro';
    try {
      const geminiRes = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            { parts: [ { text: `Bạn là trợ lý AI của cửa hàng điện thoại Poly Smart. Nếu người dùng yêu cầu so sánh hai sản phẩm, hãy trả lời bằng bảng so sánh (table) ở định dạng Markdown, không dùng đoạn text dài. Nếu có thể, hãy thêm nhận xét ngắn gọn sau bảng.\n\nCâu hỏi của khách: \"${prompt}\"` } ] }
          ]
        }
      );
      const reply = geminiRes.data.candidates[0].content.parts[0].text;
      console.log('Kết quả AI:', reply);
    } catch (err) {
      console.error('Lỗi khi gọi Gemini API:', err.message);
      if (err.response && err.response.data) {
        console.error('Chi tiết:', err.response.data);
      }
    }
  })();
}

// API sinh mô tả sản phẩm chuẩn SEO bằng AI
router.post('/generate-product-description', async (req, res) => {
  const { name, specs } = req.body;
  if (!name || !specs) {
    return res.status(400).json({ success: false, message: 'Thiếu tên sản phẩm hoặc thông số kỹ thuật.' });
  }
  // Tạo prompt cho AI
  let specsText = Object.entries(specs).map(([k, v]) => `- ${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n');
  const prompt = `Viết một đoạn mô tả sản phẩm chuẩn SEO, thu hút khách hàng cho sản phẩm sau:\nTên: ${name}\nThông số kỹ thuật:\n${specsText}\nĐoạn mô tả nên ngắn gọn, hấp dẫn, có chứa từ khóa liên quan.`;
  try {
    const geminiRes = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          { parts: [ { text: prompt } ] }
        ]
      }
    );
    let description = '';
    if (
      geminiRes.data &&
      geminiRes.data.candidates &&
      geminiRes.data.candidates[0] &&
      geminiRes.data.candidates[0].content &&
      geminiRes.data.candidates[0].content.parts &&
      geminiRes.data.candidates[0].content.parts[0] &&
      geminiRes.data.candidates[0].content.parts[0].text
    ) {
      description = geminiRes.data.candidates[0].content.parts[0].text;
    } else {
      description = 'Không thể sinh mô tả AI.';
    }
    res.json({ success: true, description });
  } catch (err) {
    console.error('Lỗi khi gọi Gemini API:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi AI hoặc mạng.' });
  }
});

module.exports = router;


