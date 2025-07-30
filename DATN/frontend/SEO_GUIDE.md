# Hướng dẫn SEO cho Poly Smart Website

## 🚀 Tổng quan SEO đã được tối ưu hóa

Website Poly Smart đã được tối ưu hóa SEO toàn diện với các cải tiến sau:

### 1. **Meta Tags & Metadata**
- ✅ Title tags động với template
- ✅ Meta descriptions tối ưu
- ✅ Keywords phù hợp
- ✅ Open Graph tags
- ✅ Twitter Card tags
- ✅ Canonical URLs

### 2. **Structured Data (Schema.org)**
- ✅ Organization schema
- ✅ LocalBusiness schema
- ✅ Product schema
- ✅ WebSite schema
- ✅ BreadcrumbList schema
- ✅ Article schema

### 3. **Technical SEO**
- ✅ Sitemap.xml tự động
- ✅ Robots.txt
- ✅ Manifest.json (PWA)
- ✅ Preconnect links
- ✅ Favicon đầy đủ

### 4. **Components SEO**
- ✅ SEO component tái sử dụng
- ✅ Breadcrumbs component
- ✅ Semantic HTML
- ✅ ARIA labels

## 📁 Cấu trúc Files SEO

```
DATN/frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Layout chính với metadata
│   │   ├── sitemap.ts          # Sitemap generator
│   │   ├── robots.ts           # Robots.txt
│   │   └── payments/page.tsx   # Trang thanh toán (đã tối ưu)
│   ├── components/
│   │   ├── SEO.tsx             # Component SEO helper
│   │   ├── Breadcrumbs.tsx     # Breadcrumbs component
│   │   └── Homepage.tsx        # Trang chủ (đã tối ưu)
│   └── ...
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── favicon.ico
│   ├── icon.svg
│   └── apple-touch-icon.png
└── SEO_GUIDE.md               # Hướng dẫn này
```

## 🛠️ Cách sử dụng SEO Component

### 1. **Sử dụng cơ bản:**
```tsx
import SEO from '@/components/SEO';

export default function MyPage() {
  return (
    <>
      <SEO 
        title="Tên trang"
        description="Mô tả trang"
        keywords={["keyword1", "keyword2"]}
      />
      {/* Nội dung trang */}
    </>
  );
}
```

### 2. **Sử dụng với structured data:**
```tsx
import SEO, { productSEO } from '@/components/SEO';

export default function ProductPage({ product }) {
  return (
    <>
      <SEO {...productSEO(product)} />
      {/* Nội dung trang */}
    </>
  );
}
```

### 3. **Sử dụng Breadcrumbs:**
```tsx
import Breadcrumbs, { createProductBreadcrumbs } from '@/components/Breadcrumbs';

export default function ProductPage({ product }) {
  return (
    <>
      <Breadcrumbs items={createProductBreadcrumbs(product)} />
      {/* Nội dung trang */}
    </>
  );
}
```

## 📊 Các trang đã được tối ưu

### ✅ **Trang chủ** (`/`)
- Meta tags đầy đủ
- WebSite structured data
- Product offers schema

### ✅ **Trang thanh toán** (`/payments`)
- Meta tags tối ưu
- CheckoutPage schema
- Form validation
- Accessibility

### ✅ **Layout chính**
- Organization schema
- LocalBusiness schema
- Global metadata

## 🔧 Cấu hình cần cập nhật

### 1. **Google Search Console**
- Thêm domain: `https://polysmart.com.vn`
- Submit sitemap: `https://polysmart.com.vn/sitemap.xml`
- Verify ownership

### 2. **Google Analytics**
- Thêm tracking code vào layout
- Cấu hình goals và events

### 3. **Social Media**
- Cập nhật Open Graph images
- Cấu hình Twitter Card

### 4. **Local SEO**
- Cập nhật địa chỉ thực tế trong LocalBusiness schema
- Thêm Google My Business

## 📈 Monitoring & Analytics

### 1. **Core Web Vitals**
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)

### 2. **SEO Metrics**
- Organic traffic
- Keyword rankings
- Click-through rates
- Bounce rate

### 3. **Technical SEO**
- Page speed
- Mobile friendliness
- Indexing status

## 🚀 Next Steps

### 1. **Content SEO**
- Tạo blog/tin tức với keywords
- Product descriptions tối ưu
- FAQ pages

### 2. **Local SEO**
- Google My Business
- Local citations
- Customer reviews

### 3. **Technical SEO**
- Image optimization
- Lazy loading
- CDN setup

### 4. **Performance**
- Code splitting
- Bundle optimization
- Caching strategy

## 📞 Support

Nếu cần hỗ trợ thêm về SEO, vui lòng liên hệ:
- Email: support@polysmart.com.vn
- Phone: +84-xxx-xxx-xxxx

---

**Lưu ý:** Đảm bảo cập nhật thông tin liên hệ và địa chỉ thực tế trong các schema trước khi deploy production. 