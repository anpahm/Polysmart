import { Metadata, ResolvingMetadata } from 'next';
import NewsDetailComponent from './NewsDetail';

// Hàm lấy dữ liệu tin tức từ API
async function getNewsDetail(newsId: string) {
  try {
    const res = await fetch(`http://localhost:3000/api/news/${newsId}`, {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error fetching news:', error);
    return null;
  }
}

// Metadata động
export async function generateMetadata(
  { params }: { params: { id: string; newsId: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Lấy tin tức
  const news = await getNewsDetail(params.newsId);
  
  // Nếu không tìm thấy tin tức
  if (!news) {
    return {
      title: 'Không tìm thấy tin tức',
      description: 'Tin tức không tồn tại hoặc đã bị xóa',
    };
  }

  // Lấy metadata gốc
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: news.tieu_de,
    description: news.mo_ta,
    authors: [{ name: news.nguoi_dang?.ho_ten || 'Admin' }],
    openGraph: {
      title: news.tieu_de,
      description: news.mo_ta,
      type: 'article',
      publishedTime: news.ngay,
      authors: news.nguoi_dang?.ho_ten || 'Admin',
      images: [
        {
          url: `http://localhost:3000/${news.hinh}`,
          width: 1200,
          height: 630,
          alt: news.tieu_de,
        },
        ...previousImages,
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: news.tieu_de,
      description: news.mo_ta,
      images: [`http://localhost:3000/${news.hinh}`],
    },
    alternates: {
      canonical: `http://localhost:3000/news/${params.id}/${params.newsId}`,
    },
  };
}

// Page component
export default function NewsDetailPage({ params }: { params: { newsId: string } }) {
  return <NewsDetailComponent newsId={params.newsId} />;
} 