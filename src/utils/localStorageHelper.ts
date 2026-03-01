export interface SavedImageLocal {
  id: string;
  image_data: string;
  thumbnail: string;
  created_at: string;
}

const STORAGE_KEY = 'painted_images';

export function saveImageToLocal(imageData: string, thumbnail: string): SavedImageLocal {
  const savedImage: SavedImageLocal = {
    id: crypto.randomUUID(),
    image_data: imageData,
    thumbnail,
    created_at: new Date().toISOString(),
  };

  const existingImages = getAllSavedImages();
  existingImages.unshift(savedImage);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(existingImages));

  return savedImage;
}

export function getAllSavedImages(): SavedImageLocal[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function deleteSavedImage(id: string): void {
  const existingImages = getAllSavedImages();
  const filtered = existingImages.filter(img => img.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
