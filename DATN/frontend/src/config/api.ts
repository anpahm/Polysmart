const config = {
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  IMAGE_URL: process.env.NEXT_PUBLIC_IMAGE_URL,
  STORAGE_URL: process.env.NEXT_PUBLIC_STORAGE_URL,
};

export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${config.API_URL}/${cleanEndpoint}`;
};

export const getImageUrl = (path: string | string[]): string => {
  // Log để debug
  console.log('Original image path:', path);
  
  if (!path) return '/images/no-image.png';
  
  // Handle array of image paths
  if (Array.isArray(path)) {
    if (path.length === 0) return '/images/no-image.png';
    path = path[0];
  }
  
  // Handle direct URLs
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Handle local paths starting with /images/
  if (path.startsWith('/images/')) {
    return path; // Return relative path for Next.js Image component
  }
  
  // Handle paths starting with ../images/
  if (path.startsWith('../images/')) {
    return `/images/${path.replace('../images/', '')}`;
  }
  
  // Default case - assume image is in the images directory
  return `/images/${path.replace(/^\//, '')}`;
};

export const getStorageUrl = (path: string): string => {
  if (!path) return '/images/no-image.png';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/images/')) {
    return path;
  }
  return `/images/${path}`;
};

export default config; 