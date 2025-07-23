import React from 'react';
import { Product, Variant } from '../types/product';
import { ShoppingBag } from 'lucide-react';
import { colorMap, getVnColorName } from '../../../src/constants/colorMapShared';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '@/store/cartSlice';
import { RootState } from '@/store';
import { showAddToCartSuccess } from '@/utils/sweetAlert';
import { trackUserEvent } from '@/services/productService';

// Hàm lấy URL hình ảnh sản phẩm (copy từ Homepage)
const getImageUrl = (url: string | string[] | undefined | null) => {
  if (Array.isArray(url)) url = url[0];
  if (!url) return '/images/no-image.png';
  if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) return url;
  const backendUrl = process.env.NEXT_PUBLIC_IMAGE_URL;
  if (typeof url === 'string' && url.startsWith('../images/')) return url.replace('../images', '/images');
  if (typeof url === 'string' && url.startsWith('/images/')) return `${backendUrl}${url}`;
  return `${backendUrl}/images/${url}`;
};

// Hàm map mã màu sang tên màu tiếng Việt (nếu cần)
const mapColorCodeToName = (code?: string) => {
  if (!code) return '';
  const colorMap: { [key: string]: string } = {
    '#EFCFD2': 'Hồng nhạt',
    '#E9DFA7': 'Vàng nhạt',
    '#505865': 'Xám',
    '#000000': 'Đen',
    '#FFFFFF': 'Trắng',
    '#A3D8F4': 'Xanh dương nhạt',
    '#F5E6CC': 'Kem',
    '#F4B183': 'Cam nhạt',
    '#F7F7F7': 'Trắng tinh',
    '#D4E3E1': 'Xanh bạc hà',
    '#B6D7A8': 'Xanh lá nhạt',
    '#B4C7DC': 'Xanh nhạt',
    '#B7B7B7': 'Xám nhạt',
    '#FFD966': 'Vàng',
    '#F9CB9C': 'Cam',
    '#C9DAF8': 'Xanh dương',
    '#A2C4C9': 'Xanh ngọc',
    '#D9D2E9': 'Tím nhạt',
    '#B4A7D6': 'Tím',
    '#F4CCCC': 'Hồng',
    '#C27BA0': 'Hồng tím',
    '#A52A2A': 'Nâu',
    '#FFD700': 'Vàng gold',
    '#C0C0C0': 'Bạc',
    '#808080': 'Xám đậm',
    '#1D1D1F': 'Đen nhám',
    '#FBEFEF': 'Hồng phấn',
    '#F6E3B4': 'Vàng kem',
    '#E5E4E2': 'Bạch kim',
    '#D1C7B7': 'Titan tự nhiên',
    '#B5B5B5': 'Titan xám',
    '#E3E3E3': 'Titan trắng',
    '#232323': 'Titan đen',
    '#B9D9EB': 'Xanh dương nhạt',
    '#F3E2A9': 'Vàng nhạt',
    '#F5F5DC': 'Be',
    '#F8F8FF': 'Trắng xanh',
    '#F0FFF0': 'Xanh mint',
    '#F0F8FF': 'Xanh băng',
    '#E6E6FA': 'Tím lavender',
    '#FFFACD': 'Vàng chanh',
    '#FFE4E1': 'Hồng đào',
    '#F08080': 'Đỏ nhạt',
    '#DC143C': 'Đỏ',
    '#4169E1': 'Xanh hoàng gia',
    '#4682B4': 'Xanh thép',
    '#708090': 'Xám xanh',
    '#B0C4DE': 'Xanh đá',
    '#00CED1': 'Xanh ngọc đậm',
    '#20B2AA': 'Xanh biển',
    '#5F9EA0': 'Xanh cổ vịt',
    '#2E8B57': 'Xanh rêu',
    '#556B2F': 'Xanh ô liu',
    '#8B4513': 'Nâu đất',
    '#D2691E': 'Nâu cam',
    '#FFDAB9': 'Cam đào',
    '#FFF8DC': 'Vàng kem nhạt',
    '#E0FFFF': 'Xanh ngọc nhạt',
    '#F5FFFA': 'Trắng bạc hà',
    '#FDF5E6': 'Trắng ngà',
    '#FAEBD7': 'Trắng kem',
    '#FFEBCD': 'Vàng nhạt',
    '#FFE4B5': 'Vàng cam',
    '#FFDEAD': 'Vàng đất',
    '#F5DEB3': 'Vàng lúa mì',
    '#DEB887': 'Nâu vàng',
    '#D2B48C': 'Nâu nhạt',
    '#BC8F8F': 'Nâu hồng',
    '#F4A460': 'Nâu cát',
    '#DAA520': 'Vàng đồng',
    '#B8860B': 'Vàng sẫm',
    '#CD853F': 'Nâu đồng',
    '#8B0000': 'Đỏ đậm',
    '#800000': 'Đỏ nâu',
    '#A0522D': 'Nâu đỏ',
    '#808000': 'Xanh ô liu đậm',
    '#6B8E23': 'Xanh ô liu nhạt',
    '#9ACD32': 'Xanh vàng',
    '#32CD32': 'Xanh lá tươi',
    '#00FF00': 'Xanh lá',
    '#7FFF00': 'Xanh nõn chuối',
    '#7CFC00': 'Xanh cỏ',
    '#ADFF2F': 'Xanh vàng nhạt',
    '#00FF7F': 'Xanh ngọc tươi',
    '#00FA9A': 'Xanh ngọc sáng',
    '#40E0D0': 'Xanh ngọc biển',
    '#48D1CC': 'Xanh ngọc lam',
    '#00BFFF': 'Xanh da trời',
    '#1E90FF': 'Xanh dương sáng',
    '#6495ED': 'Xanh ngọc bích',
    '#7B68EE': 'Tím xanh',
    '#6A5ACD': 'Tím than',
    '#483D8B': 'Tím đậm',
    '#4B0082': 'Chàm',
    '#8A2BE2': 'Tím xanh đậm',
    '#9400D3': 'Tím đậm',
    '#9932CC': 'Tím nhạt',
    '#BA55D3': 'Tím hồng',
    '#800080': 'Tím',
    '#8B008B': 'Tím đậm',
    '#FF00FF': 'Hồng tím',
    '#FF69B4': 'Hồng cánh sen',
    '#FF1493': 'Hồng đậm',
    '#C71585': 'Hồng tím đậm',
    '#DB7093': 'Hồng nhạt',
    '#FFA07A': 'Cam nhạt',
    '#FF7F50': 'Cam san hô',
    '#FF6347': 'Đỏ cam',
    '#FF4500': 'Cam đỏ',
    '#FF8C00': 'Cam đậm',
    '#FFA500': 'Cam',
    '#FFFF00': 'Vàng',
    '#FFFFE0': 'Vàng nhạt',
    '#FAFAD2': 'Vàng nhạt',
    '#EEE8AA': 'Vàng nhạt',
    '#F0E68C': 'Vàng đất',
    '#BDB76B': 'Vàng ô liu',
    '#FFF0F5': 'Hồng lavender',
    '#D8BFD8': 'Tím nhạt',
    '#DDA0DD': 'Tím nhạt',
    '#EE82EE': 'Tím nhạt',
    '#DA70D6': 'Tím hồng',
    '#FFB6C1': 'Hồng nhạt',
    '#FFC0CB': 'Hồng',
  };
  return colorMap[code.toUpperCase()] || code;
};

interface ProductCardProps {
  product: Product;
  variant?: Variant;
  style?: React.CSSProperties;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, variant, style }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  
  console.log('ProductCard image debug:', { variantHinh: variant?.hinh, productHinh: product.hinh });
  // Lấy danh sách màu sắc duy nhất từ tất cả variants nếu có
  const colors = product.variants
    ? Array.from(new Set(product.variants.map(v => v.mau).filter(Boolean)))
    : (variant?.mau ? [variant.mau] : []);

  // Handle add to cart click
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn chặn navigation nếu ProductCard nằm trong Link
    e.stopPropagation();

    if (!product) return;

    // Lấy variant đầu tiên nếu không có variant được chỉ định
    const selectedVariant = variant || product.variants?.[0];
    if (!selectedVariant) return;

    // Track user event nếu user đã đăng nhập
    if (user && user._id) {
      trackUserEvent('add_to_cart', product._id, user._id);
    }

    // Thêm vào giỏ hàng
    dispatch(addToCart({
      productId: product._id,
      variantId: selectedVariant._id,
      name: product.TenSP + (selectedVariant.dung_luong ? ` ${selectedVariant.dung_luong}` : ""),
      price: selectedVariant.gia || 0,
      originPrice: selectedVariant.gia_goc || selectedVariant.gia || 0,
      image: getImageUrl(selectedVariant.hinh || product.hinh),
      colors: product.variants?.map(v => v.mau).filter(Boolean) || [],
      selectedColor: product.variants?.findIndex(v => v._id === selectedVariant._id) || 0,
      colorName: selectedVariant.mau || '',
      quantity: 1,
    }));

    // Hiển thị thông báo thành công với SweetAlert2
    showAddToCartSuccess(product.TenSP);
  };

  return (
    <div style={{
      background: '#fff',
      padding: 16,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      minWidth: 0,
      boxSizing: 'border-box',
      ...style
    }}>
      <img
        src={getImageUrl(variant?.hinh?.[0] || product.hinh)}
        alt={product.TenSP}
        style={{ width: 190, height: 190, objectFit: 'cover', borderRadius: 10, background: '#f3f4f6', marginBottom: 10, alignSelf: 'center' }}
      />
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, textAlign: 'left', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.TenSP} {variant?.dung_luong ? `${variant.dung_luong}` : ''}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, width: '100%', marginBottom: 2 }}>
        <span style={{ color: '#e11d48', fontWeight: 600, fontSize: 13 }}>{variant?.gia?.toLocaleString('vi-VN')}₫</span>
        {variant?.gia_goc && (
          <span style={{ color: '#888', fontSize: 11, textDecoration: 'line-through' }}>{variant.gia_goc.toLocaleString('vi-VN')}₫</span>
        )}
      </div>
      
      {colors.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, margin: '6px 0 18px 0', width: '100%' }}>
          <span style={{ fontSize: 13, color: '#555', marginRight: 4 }}>Màu:</span>
          {colors.slice(0, 6).map((color, idx) => (
            <span key={idx} title={mapColorCodeToName(color)} style={{
              display: 'inline-block',
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: color,
              border: '1.5px solid #e5e7eb',
              marginRight: 2
            }} />
          ))}
        </div>
      )}
      <button 
        onClick={handleAddToCart}
        style={{
          background: '#fff',
          color: '#374151',
          border: '1px solid #e5e7eb',
          padding: '10px 0',
          fontWeight: 500,
          cursor: 'pointer',
          fontSize: 14,
          width: '100%',
          marginTop: 'auto',
          alignSelf: 'stretch',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          transition: 'border 0.2s',
        }}
        onMouseOver={e => (e.currentTarget.style.border = '1.5px solid #2563eb')}
        onMouseOut={e => (e.currentTarget.style.border = '1px solid #e5e7eb')}
      >
        <ShoppingBag size={18} style={{marginRight: 4}} />
        Thêm vào giỏ
      </button>
    </div>
  );
};

export default ProductCard; 