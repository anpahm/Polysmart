import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: any;
  noindex?: boolean;
  canonical?: string;
}

export default function SEO({
  title,
  description,
  keywords = [],
  image = '/images/og-image.jpg',
  url,
  type = 'website',
  structuredData,
  noindex = false,
  canonical
}: SEOProps) {
  const fullTitle = title ? `${title} | Poly Smart` : 'Poly Smart - Đại lý ủy quyền Apple chính hãng';
  const fullDescription = description || 'Poly Smart - Đại lý ủy quyền Apple chính hãng tại Việt Nam. Chuyên cung cấp iPhone, iPad, MacBook, Apple Watch, AirPods chính hãng với giá tốt nhất.';
  const fullUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://polysmart.com.vn');
  const canonicalUrl = canonical || fullUrl;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Poly Smart" />
      <meta property="og:locale" content="vi_VN" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@polysmart" />
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
    </Head>
  );
}

// Predefined SEO configurations for common pages
export const productSEO = (product: any) => ({
  title: `${product.name} - ${product.brand || 'Apple'} chính hãng`,
  description: `${product.name} chính hãng Apple tại Poly Smart. ${product.description || 'Giá tốt nhất, giao hàng toàn quốc, bảo hành chính hãng.'}`,
  keywords: [
    product.name,
    product.brand || 'Apple',
    'chính hãng',
    'Poly Smart',
    'giá tốt',
    'giao hàng toàn quốc'
  ],
  type: 'product' as const,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Apple"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "VND",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Poly Smart"
      }
    },
    "aggregateRating": product.rating ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviewCount || 0
    } : undefined
  }
});

export const categorySEO = (category: any) => ({
  title: `${category.name} chính hãng Apple - Poly Smart`,
  description: `${category.name} chính hãng Apple tại Poly Smart. Đa dạng mẫu mã, giá tốt nhất, giao hàng toàn quốc.`,
  keywords: [
    category.name,
    'Apple',
    'chính hãng',
    'Poly Smart',
    'giá tốt'
  ],
  type: 'website' as const,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category.name,
    "description": `${category.name} chính hãng Apple`,
    "url": `https://polysmart.com.vn/categories/${category.slug}`
  }
});

export const articleSEO = (article: any) => ({
  title: article.title,
  description: article.excerpt || article.description,
  keywords: article.tags || [],
  type: 'article' as const,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt || article.description,
    "image": article.image,
    "author": {
      "@type": "Organization",
      "name": "Poly Smart"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Poly Smart",
      "logo": {
        "@type": "ImageObject",
        "url": "https://polysmart.com.vn/images/logo.png"
      }
    },
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt
  }
}); 