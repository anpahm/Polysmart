const express = require('express');
const router = express.Router();
const axios = require('axios');
const Product = require('../models/productModel');
const Variant = require('../models/variantModel');
const Category = require('../models/categoryModel');
const FlashSale = require('../models/FlashSale');
const FlashSaleVariant = require('../models/FlashSaleVariant');

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
  // Các từ chung chung về thông tin sản phẩm không được coi là từ khóa sản phẩm
  const infoOnlyWords = ['thông', 'số', 'kỹ', 'thuật', 'đặc', 'điểm', 'chi', 'tiết', 'cấu', 'hình', 'specs', 'specification', 'thông_số', 'kỹ_thuật'];
  
  let nameAndFeatureKeywords = words.filter(word => {
    if (!word || STOP_WORDS.includes(word) || allPriceKeywords.includes(word) || infoOnlyWords.includes(word)) return false;
    if (/^\d+$/.test(word)) return true;
    for (const key in SMART_KEYWORDS) {
      if (SMART_KEYWORDS[key].some(k => k === word)) return true;
    }
    if (word.length > 2) return true;
    return false;
  });
  if (nameAndFeatureKeywords.length === 0) {
    nameAndFeatureKeywords = words.filter(word => {
      if (!word || infoOnlyWords.includes(word)) return false;
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
  
  // Tìm tên sản phẩm cụ thể trong message
  const productNameRegex = /(iphone\s*\d+[a-zA-Z]*(?:\s+[a-zA-Z]+)?|ipad[a-zA-Z\s]*|macbook[a-zA-Z\s]*|airpod[a-zA-Z\s]*)/i;
  const productMatch = message.match(productNameRegex);
  if (productMatch) {
    return productMatch[1].trim();
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

const searchProducts = async ({ nameAndFeatureKeywords, priceKeywords, compareNames, message, fromHistory = false }) => {
  if (fromHistory) {
    console.log('🔍 Searching from history with keywords:', nameAndFeatureKeywords);
  }
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
  
  // Nếu không có từ khóa sản phẩm, trả về mảng rỗng
  if (nameAndFeatureKeywords.length === 0) return [];
  
  // Kiểm tra xem có từ khóa sản phẩm cụ thể không (bỏ qua nếu từ history)
  if (!fromHistory) {
    const hasProductKeyword = nameAndFeatureKeywords.some(keyword => 
      SMART_KEYWORDS.brands.includes(keyword) || 
      /^\d+$/.test(keyword) ||
      keyword.length > 4
    );
    
    // Nếu không có từ khóa sản phẩm cụ thể, trả về mảng rỗng
    if (!hasProductKeyword) return [];
  }
  
  const keywordFull = nameAndFeatureKeywords.join(' ').toLowerCase().trim();
  const allProducts = await Product.find({ an_hien: true }).lean();
  
  // Tìm exact match trước
  const exactMatch = allProducts.find(p => normalizeString(p.TenSP) === normalizeString(keywordFull));
  if (exactMatch) {
    // Lấy variants cho sản phẩm này
    const variants = await Variant.find({ id_san_pham: exactMatch._id.toString(), an_hien: true }).lean();
    exactMatch.variants = variants;
    return [exactMatch];
  }
  
  // Nếu từ history, tìm sản phẩm có nhiều từ khóa match nhất
  if (fromHistory) {
    const matchedProducts = allProducts.map(p => {
      const normName = normalizeString(p.TenSP);
      let matchCount = 0;
      let totalKeywordLength = 0;
      
      nameAndFeatureKeywords.forEach(kw => {
        if (normName.includes(normalizeString(kw))) {
          matchCount++;
          totalKeywordLength += kw.length;
        }
      });
      
      return {
        ...p,
        _matchCount: matchCount,
        _totalKeywordLength: totalKeywordLength,
        _relevanceScore: matchCount * 100 + totalKeywordLength
      };
    }).filter(p => p._matchCount > 0);
    
    // Sắp xếp theo độ liên quan giảm dần
    matchedProducts.sort((a, b) => b._relevanceScore - a._relevanceScore);
    
    if (matchedProducts.length > 0) {
      // Chỉ lấy sản phẩm có relevance score cao nhất
      const bestMatch = matchedProducts[0];
      const variants = await Variant.find({ id_san_pham: bestMatch._id.toString(), an_hien: true }).lean();
      bestMatch.variants = variants;
      console.log('🎯 Best match from history:', bestMatch.TenSP, 'score:', bestMatch._relevanceScore);
      return [bestMatch];
    }
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
    const MIN_KEYWORD_MATCH = fromHistory ? 1 : 2;
    const MAIN_KEYWORDS = ['iphone', 'ipad', 'macbook', 'airpod', 'apple'];
    const mainKeyword = importantKeywords.find(kw => MAIN_KEYWORDS.includes(kw));
    
    // Chỉ tìm kiếm nếu có từ khóa chính (bỏ qua nếu từ history)
    if (!mainKeyword && !fromHistory) return [];
    
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
  
  // Nếu không có match, trả về mảng rỗng thay vì dùng aggregation
  return [];
};

const buildProductInfoForAI = (products, message = '') => {
  let productInfo = `Tìm thấy ${products.length} sản phẩm phù hợp:\n`;
  
  // Kiểm tra xem có hỏi về thông số kỹ thuật không
  const isSpecsQuery = /thông số|kỹ thuật|đặc điểm|chi tiết|cấu hình|specs|specification/i.test(message);
  
  products.forEach((product) => {
    const variants = Array.isArray(product.variants) ? product.variants : [];
    const variantsInfo = variants.map(v =>
      `${v.dung_luong || ''} ${getColorName(v.mau)}`.trim()
    ).join(', ');
    const gia = variants[0]?.gia ? variants[0].gia.toLocaleString('vi-VN') : 'N/A';
    
    productInfo += `- Tên: ${product.TenSP}. Giá từ ${gia} VNĐ. Các phiên bản: ${variantsInfo}.\n`;
    
    // Nếu hỏi về thông số kỹ thuật và có thông số trong DB
    if (isSpecsQuery && product.thong_so_ky_thuat) {
      productInfo += `  Thông số kỹ thuật:\n`;
      const specs = product.thong_so_ky_thuat;
      if (specs.CPU) productInfo += `    - CPU: ${specs.CPU}\n`;
      if (specs.GPU) productInfo += `    - GPU: ${specs.GPU}\n`;
      if (specs.He_dieu_hanh) productInfo += `    - Hệ điều hành: ${specs.He_dieu_hanh}\n`;
      if (specs.Kich_thuoc_man_hinh) productInfo += `    - Kích thước màn hình: ${specs.Kich_thuoc_man_hinh}\n`;
      if (specs.Do_phan_giai) productInfo += `    - Độ phân giải: ${specs.Do_phan_giai}\n`;
      if (specs.Cong_nghe_man_hinh) productInfo += `    - Công nghệ màn hình: ${specs.Cong_nghe_man_hinh}\n`;
      if (specs.Camera && Array.isArray(specs.Camera)) productInfo += `    - Camera: ${specs.Camera.join(', ')}\n`;
      if (specs.Tinh_nang_camera && Array.isArray(specs.Tinh_nang_camera)) productInfo += `    - Tính năng camera: ${specs.Tinh_nang_camera.join(', ')}\n`;
      if (specs.Ket_noi && Array.isArray(specs.Ket_noi)) productInfo += `    - Kết nối: ${specs.Ket_noi.join(', ')}\n`;
      if (specs.Kich_thuoc_khoi_luong && Array.isArray(specs.Kich_thuoc_khoi_luong)) productInfo += `    - Kích thước & khối lượng: ${specs.Kich_thuoc_khoi_luong.join(', ')}\n`;
      if (specs.Tien_ich_khac && Array.isArray(specs.Tien_ich_khac)) productInfo += `    - Tiện ích khác: ${specs.Tien_ich_khac.join(', ')}\n`;
      productInfo += '\n';
    }
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

// Hàm lấy các chương trình flash sale đang diễn ra
const getActiveFlashSales = async () => {
  try {
    const now = new Date();
    const activeFlashSales = await FlashSale.find({
      an_hien: true,
      thoi_gian_bat_dau: { $lte: now },
      thoi_gian_ket_thuc: { $gte: now }
    }).lean();
    
    return activeFlashSales;
  } catch (error) {
    console.error('Lỗi khi lấy flash sale:', error);
    return [];
  }
};

// Hàm lấy sản phẩm flash sale đang có (còn hàng) - format cho ProductCard
const getActiveFlashSaleProducts = async () => {
  try {
    const now = new Date();
    
    // Lấy các flash sale đang diễn ra
    const activeFlashSales = await FlashSale.find({
      an_hien: true,
      thoi_gian_bat_dau: { $lte: now },
      thoi_gian_ket_thuc: { $gte: now }
    }).lean();
    
    if (activeFlashSales.length === 0) return [];
    
    const flashSaleIds = activeFlashSales.map(fs => fs._id);
    
    // Lấy variants flash sale còn hàng
    const flashSaleVariants = await FlashSaleVariant.find({
      id_flash_sale: { $in: flashSaleIds },
      an_hien: true,
      $expr: { $gt: ['$so_luong', '$da_ban'] } // Còn hàng
    })
    .populate('id_variant')
    .populate('id_flash_sale')
    .limit(2) // Chỉ lấy tối đa 2 sản phẩm
    .lean();
    
    // Lấy thông tin sản phẩm cho mỗi variant và format cho ProductCard
    const flashSaleProducts = [];
    for (const fsVariant of flashSaleVariants) {
      if (fsVariant.id_variant && fsVariant.id_flash_sale) {
        const product = await Product.findById(fsVariant.id_variant.id_san_pham).lean();
        if (product && product.an_hien) {
          // Tạo variant flash sale với giá đã giảm
          const flashSaleVariantForCard = {
            ...fsVariant.id_variant,
            gia: fsVariant.gia_flash_sale, // Giá flash sale
            gia_goc: fsVariant.id_variant.gia, // Giá gốc để hiển thị gạch ngang
            isFlashSale: true,
            flashSaleInfo: {
              ten_su_kien: fsVariant.id_flash_sale.ten_su_kien,
              so_luong_con_lai: fsVariant.so_luong - fsVariant.da_ban,
              phan_tram_giam: fsVariant.phan_tram_giam_gia || Math.round((1 - fsVariant.gia_flash_sale / fsVariant.id_variant.gia) * 100)
            }
          };
          
          // Tạo product với variant flash sale
          const flashSaleProduct = {
            ...product,
            variants: [flashSaleVariantForCard], // Chỉ có variant flash sale
            isFlashSale: true
          };
          
          flashSaleProducts.push(flashSaleProduct);
        }
      }
    }
    
    return flashSaleProducts.slice(0, 2); // Đảm bảo chỉ trả về tối đa 2 sản phẩm
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm flash sale:', error);
    return [];
  }
};

// Hàm format thông tin flash sale cho AI
const buildFlashSaleInfoForAI = (flashSales) => {
  if (!flashSales || flashSales.length === 0) {
    return 'Hiện tại không có chương trình flash sale nào đang diễn ra.';
  }
  
  let flashSaleInfo = `Hiện tại đang có ${flashSales.length} chương trình flash sale:\n`;
  
  flashSales.forEach((flashSale, index) => {
    const startDate = new Date(flashSale.thoi_gian_bat_dau).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const endDate = new Date(flashSale.thoi_gian_ket_thuc).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric', 
      hour: '2-digit',
      minute: '2-digit'
    });
    
    flashSaleInfo += `${index + 1}. 🔥 **${flashSale.ten_su_kien}**\n`;
    flashSaleInfo += `   📅 Từ: ${startDate}\n`;
    flashSaleInfo += `   📅 Đến: ${endDate}\n\n`;
  });
  
  return flashSaleInfo;
};

// Hàm format sản phẩm flash sale cho AI (rút gọn vì sản phẩm sẽ hiển thị trong khung)
const buildFlashSaleProductsForAI = (flashSaleProducts) => {
  if (!flashSaleProducts || flashSaleProducts.length === 0) {
    return '';
  }
  
  let productInfo = `\n🔥 HIỆN CÓ ${flashSaleProducts.length} SẢN PHẨM FLASH SALE NỔI BẬT:\n`;
  
  flashSaleProducts.forEach((product, index) => {
    const variant = product.variants[0]; // Lấy variant đầu tiên (đã là flash sale variant)
    const flashSaleInfo = variant.flashSaleInfo;
    
    productInfo += `${index + 1}. **${product.TenSP}** - Giảm ${flashSaleInfo.phan_tram_giam}%, còn ${flashSaleInfo.so_luong_con_lai} sản phẩm\n`;
  });
  
  productInfo += `\n👀 Bạn có thể xem chi tiết sản phẩm và giá ưu đãi bên dưới!`;
  
  return productInfo;
};

router.post('/chat-ai', async (req, res) => {
  const { message, history } = req.body;
  const networkOnlyKeywords = [
    'đặc điểm', 'so sánh', 'review', 'ưu điểm', 'nhược điểm', 'có tốt không', 'có nên mua', 'đánh giá', 'so với', 'khác biệt', 'điểm khác'
  ];
  const isNetworkOnly = networkOnlyKeywords.some(k => message.toLowerCase().includes(k));
  
  // Kiểm tra xem có hỏi về flash sale không
  const flashSaleKeywords = ['flash sale', 'flashsale', 'flash-sale', 'giảm giá', 'khuyến mãi', 'sale off', 'chương trình giảm giá', 'sự kiện giảm giá'];
  const isFlashSaleQuery = flashSaleKeywords.some(k => message.toLowerCase().includes(k));
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
     } else if (isFlashSaleQuery) {
     // Xử lý câu hỏi về flash sale
     const activeFlashSales = await getActiveFlashSales();
     const flashSaleProducts = await getActiveFlashSaleProducts();
     const flashSaleInfo = buildFlashSaleInfoForAI(activeFlashSales);
     const flashSaleProductsInfo = buildFlashSaleProductsForAI(flashSaleProducts);
     
     prompt = `Khách hỏi: "${message}"\n\nThông tin chương trình flash sale hiện tại:\n${flashSaleInfo}${flashSaleProductsInfo}\n\nHãy giới thiệu các chương trình flash sale một cách thân thiện, hấp dẫn và khuyến khích khách hàng tham gia. Nếu có sản phẩm flash sale cụ thể, hãy nhấn mạnh ưu đãi và tính khan hiếm. Sử dụng emoji và ngôn ngữ bán hàng chuyên nghiệp.`;
     
     geminiPayload = {
       contents: [
         { parts: [ { text: prompt } ] }
       ]
     };
     
     console.log('🔥 Flash Sale Query:', activeFlashSales.length, 'active events,', flashSaleProducts.length, 'products');
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
      // Kiểm tra xem câu hỏi có từ khóa liên quan đến thông tin sản phẩm không
      const infoKeywords = ['thông số', 'đặc điểm', 'chi tiết', 'cấu hình', 'specs', 'specification', 'kỹ thuật'];
      const hasInfoKeyword = infoKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
      );
      
             // Nếu không có từ khóa sản phẩm, cố gắng lấy từ history
       if (nameAndFeatureKeywords.length === 0 && history && history.length > 0) {
         // Lấy tin nhắn user gần nhất trong history
         const userMessages = history.filter(h => h.role === 'user');
         if (userMessages.length > 0) {
           const lastUserMessage = userMessages[userMessages.length - 1];
           const previousKeywords = extractKeywords(lastUserMessage.content);
           
           // Kiểm tra xem tin nhắn trước có từ khóa sản phẩm cụ thể không
           const hasPreviousProductKeyword = previousKeywords.nameAndFeatureKeywords.some(keyword => 
             SMART_KEYWORDS.brands.includes(keyword) || 
             /^\d+$/.test(keyword) ||
             keyword.length > 4
           );
           
           if (previousKeywords.nameAndFeatureKeywords.length > 0 && hasPreviousProductKeyword) {
             nameAndFeatureKeywords = previousKeywords.nameAndFeatureKeywords;
             console.log('Lấy context từ history:', nameAndFeatureKeywords);
             
             // Trích xuất tên sản phẩm chính xác từ tin nhắn trước
             const exactProductName = extractProductNameFromMessage(lastUserMessage.content);
             console.log('🎯 Exact product name from history:', exactProductName);
             
             if (exactProductName) {
               // Tìm chính xác sản phẩm đó
               const allProducts = await Product.find({ an_hien: true }).lean();
               const specificProduct = allProducts.find(p => 
                 normalizeString(p.TenSP).includes(normalizeString(exactProductName))
               );
               
               if (specificProduct) {
                 const variants = await Variant.find({ id_san_pham: specificProduct._id.toString(), an_hien: true }).lean();
                 specificProduct.variants = variants;
                 products = [specificProduct];
                 console.log('🎯 Found specific product:', specificProduct.TenSP);
               } else {
                 // Fallback to normal search
                 products = await searchProducts({ nameAndFeatureKeywords, priceKeywords, compareNames, message, fromHistory: true });
               }
             } else {
               // Tìm sản phẩm với flag fromHistory = true
               products = await searchProducts({ nameAndFeatureKeywords, priceKeywords, compareNames, message, fromHistory: true });
               console.log('🎯 Found products from history:', products.length);
               
               // Nếu tìm được nhiều sản phẩm, chỉ lấy sản phẩm đầu tiên (có score cao nhất)
               if (products.length > 1) {
                 console.log('🎯 Multiple products found, taking the most relevant one');
                 products = [products[0]];
               }
             }
           }
         }
       }
      
      // Chỉ gọi searchProducts nếu chưa tìm được từ history
      if (!products.length) {
        products = await searchProducts({ nameAndFeatureKeywords, priceKeywords, compareNames, message });
      }
      
      // Nếu vẫn không tìm được sản phẩm sau khi lấy từ history
      if (!products.length && hasInfoKeyword) {
        console.log('Không tìm thấy sản phẩm từ context, nameAndFeatureKeywords:', nameAndFeatureKeywords);
      }
    }
    if (/so sánh|compare|khác biệt|điểm khác/i.test(message)) {
      prompt = `Bạn là trợ lý AI của cửa hàng điện thoại Poly Smart. Nếu người dùng yêu cầu so sánh hai sản phẩm, hãy trả lời bằng bảng so sánh (table) ở định dạng Markdown, không dùng đoạn text dài. Nếu có thể, hãy thêm nhận xét ngắn gọn sau bảng.\n\nCâu hỏi của khách: "${message}"`;
         } else if (products.length > 0) {
       const productDataForAI = buildProductInfoForAI(products, message);
       
               // Lấy thông tin flash sale và sản phẩm để đề xuất
        const activeFlashSales = await getActiveFlashSales();
        const flashSaleProducts = await getActiveFlashSaleProducts();
        const flashSaleInfo = activeFlashSales.length > 0 ? `\n\n🔥 THÔNG TIN FLASH SALE:\n${buildFlashSaleInfoForAI(activeFlashSales)}` : '';
        const flashSaleProductsInfo = buildFlashSaleProductsForAI(flashSaleProducts);
       
                // Nếu hỏi về thông số kỹ thuật, tùy chỉnh prompt
         if (/thông số|kỹ thuật|đặc điểm|chi tiết|cấu hình|specs|specification/i.test(message)) {
           prompt = `Khách hỏi: "${message}"\nDưới đây là thông tin chi tiết sản phẩm:\n${productDataForAI}${flashSaleInfo}${flashSaleProductsInfo}\nHãy trình bày thông số kỹ thuật một cách rõ ràng, dễ hiểu và hấp dẫn. Nếu không có thông số kỹ thuật cụ thể, hãy tư vấn dựa trên thông tin có sẵn. Nếu có flash sale và sản phẩm flash sale, hãy nhắc nhở khách hàng về cơ hội giảm giá và tính khan hiếm.`;
         } else {
           prompt = `Khách hỏi: "${message}"\nDưới đây là các sản phẩm phù hợp:\n${productDataForAI}${flashSaleInfo}${flashSaleProductsInfo}\nHãy tư vấn ngắn gọn, thân thiện. Nếu có flash sale và sản phẩm flash sale đang diễn ra, hãy nhắc nhở khách hàng về cơ hội mua sắm với giá ưu đãi và tính khan hiếm của sản phẩm.`;
         }
     } else {
        // Kiểm tra xem có phải câu hỏi về thông tin sản phẩm không
        const infoKeywords = ['thông số', 'đặc điểm', 'chi tiết', 'cấu hình', 'specs', 'specification', 'kỹ thuật'];
        const hasInfoKeyword = infoKeywords.some(keyword => 
          message.toLowerCase().includes(keyword)
        );
        
                            if (hasInfoKeyword) {
             // Lấy flash sale và sản phẩm để đề xuất khi không tìm thấy sản phẩm
             const activeFlashSales = await getActiveFlashSales();
             const flashSaleProducts = await getActiveFlashSaleProducts();
             const flashSaleInfo = activeFlashSales.length > 0 ? `\n\n🔥 Tuy nhiên, bạn có thể quan tâm đến các chương trình flash sale đang diễn ra:\n${buildFlashSaleInfoForAI(activeFlashSales)}` : '';
             const flashSaleProductsInfo = buildFlashSaleProductsForAI(flashSaleProducts);
             
             prompt = `Khách hỏi: "${message}"\nHiện tại tôi chưa rõ bạn muốn hỏi thông tin về sản phẩm nào. Bạn có thể cho tôi biết cụ thể tên sản phẩm không ạ? Ví dụ: iPhone 15 Plus, MacBook Pro, iPad Air,...${flashSaleInfo}${flashSaleProductsInfo}`;
           } else {
             // Có thể đề xuất flash sale cho các câu hỏi chung chung
             const activeFlashSales = await getActiveFlashSales();
             const flashSaleProducts = await getActiveFlashSaleProducts();
             if (activeFlashSales.length > 0 || flashSaleProducts.length > 0) {
               const flashSaleInfo = buildFlashSaleInfoForAI(activeFlashSales);
               const flashSaleProductsInfo = buildFlashSaleProductsForAI(flashSaleProducts);
               prompt = `${message}\n\n🔥 Hiện tại cửa hàng đang có chương trình flash sale hấp dẫn:\n${flashSaleInfo}${flashSaleProductsInfo}`;
             } else {
               prompt = message;
             }
           }
      }
    // Chuẩn bị payload cho Gemini API
    if (products.length > 0 && history && history.length > 0) {
      // Nếu có sản phẩm và có history, gửi kèm history để AI hiểu context
      const historyContents = history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      }));
      
      geminiPayload = {
        contents: [
          ...historyContents,
          { 
            role: 'user',
            parts: [{ text: prompt }] 
          }
        ]
      };
    } else {
      geminiPayload = {
        contents: [
          { parts: [ { text: prompt } ] }
        ]
      };
    }
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
   
   // Lấy sản phẩm flash sale để hiển thị trong khung sản phẩm
   let flashSaleProducts = [];
   if (isFlashSaleQuery || !filteredProducts.length) {
     try {
       flashSaleProducts = await getActiveFlashSaleProducts();
     } catch (error) {
       console.error('Lỗi khi lấy flash sale products:', error);
     }
   }
   
   // Nếu là flash sale query hoặc không có sản phẩm thông thường, merge flash sale products vào products chính
   let finalProducts = filteredProducts;
   if (isFlashSaleQuery) {
     // Khi hỏi về flash sale, ưu tiên hiển thị flash sale products
     finalProducts = [...flashSaleProducts, ...filteredProducts];
   } else if (!filteredProducts.length && flashSaleProducts.length > 0) {
     // Khi không tìm thấy sản phẩm thông thường, hiển thị flash sale products
     finalProducts = flashSaleProducts;
   }
 
   res.json({
     reply,
     products: finalProducts,
     flashSaleProducts: [] // Không cần trả về riêng nữa vì đã merge vào products
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

// API sinh thông số kỹ thuật tự động bằng AI
router.post('/generate-product-specs', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Thiếu tên sản phẩm.' });
  }
  
  const prompt = `Dựa trên tên sản phẩm "${name}", hãy sinh ra thông số kỹ thuật chi tiết. Trả về kết quả dưới dạng JSON object với các trường sau:
{
  "CPU": "tên chip xử lý",
  "Camera": ["camera chính", "camera phụ", "camera selfie"],
  "GPU": "tên GPU",
  "Cong_nghe_man_hinh": "công nghệ màn hình",
  "He_dieu_hanh": "hệ điều hành",
  "Do_phan_giai": "độ phân giải màn hình",
  "Ket_noi": ["wifi", "bluetooth", "5g", "4g"],
  "Kich_thuoc_khoi_luong": ["kích thước", "trọng lượng"],
  "Kich_thuoc_man_hinh": "kích thước màn hình",
  "Tien_ich_khac": ["tính năng 1", "tính năng 2"],
  "Tinh_nang_camera": ["tính năng camera 1", "tính năng camera 2"]
}

Chỉ trả về JSON object, không có text khác.`;
  
  try {
    const geminiRes = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          { parts: [ { text: prompt } ] }
        ]
      }
    );
    
    let specs = {};
    if (
      geminiRes.data &&
      geminiRes.data.candidates &&
      geminiRes.data.candidates[0] &&
      geminiRes.data.candidates[0].content &&
      geminiRes.data.candidates[0].content.parts &&
      geminiRes.data.candidates[0].content.parts[0] &&
      geminiRes.data.candidates[0].content.parts[0].text
    ) {
      const responseText = geminiRes.data.candidates[0].content.parts[0].text;
      try {
        // Tìm JSON trong response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          specs = JSON.parse(jsonMatch[0]);
        } else {
          specs = {};
        }
      } catch (parseError) {
        console.error('Lỗi parse JSON:', parseError);
        specs = {};
      }
    }
    
    res.json({ success: true, specs });
  } catch (err) {
    console.error('Lỗi khi gọi Gemini API:', err.message);
    res.status(500).json({ success: false, message: 'Lỗi AI hoặc mạng.' });
  }
});

module.exports = router;


