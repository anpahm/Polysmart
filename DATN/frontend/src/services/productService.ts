export async function fetchAllProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/products`);
  if (!res.ok) throw new Error('Không thể lấy danh sách sản phẩm');
  return res.json();
}

export async function trackUserEvent(eventType: string, productId: string, userId: string, searchKeyword?: string) {
  await fetch('/api/track-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, productId, userId, searchKeyword }),
  });
}

export async function fetchRecommendedProducts(userId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/recommendations/${userId}`);
  if (!res.ok) throw new Error('Không thể lấy sản phẩm gợi ý');
  return res.json();
} 