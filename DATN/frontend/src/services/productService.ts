export async function fetchAllProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/products`);
  if (!res.ok) throw new Error('Không thể lấy danh sách sản phẩm');
  return res.json();
} 