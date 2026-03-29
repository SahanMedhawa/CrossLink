const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const backendOrigin = apiBaseUrl.replace(/\/api\/?$/, '');

export const resolveImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') return '';

  // Keep Cloudinary and other absolute URLs untouched.
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('data:') ||
    imagePath.startsWith('blob:')
  ) {
    return imagePath;
  }

  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${backendOrigin}${normalizedPath}`;
};
