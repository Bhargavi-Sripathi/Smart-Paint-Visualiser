import { X, Trash2, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAllSavedImages, deleteSavedImage, SavedImageLocal } from '../utils/localStorageHelper';

interface SavedPicturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SavedPicturesModal({ isOpen, onClose }: SavedPicturesModalProps) {
  const [savedImages, setSavedImages] = useState<SavedImageLocal[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSavedImages(getAllSavedImages());
    }
  }, [isOpen]);

  const handleDelete = (id: string) => {
    deleteSavedImage(id);
    setSavedImages(getAllSavedImages());
  };

  const handleDownload = (imageData: string, id: string) => {
    const link = document.createElement('a');
    link.download = `painted-house-${id}.png`;
    link.href = imageData;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Saved Pictures</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {savedImages.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-500 text-lg">No saved pictures yet</p>
              <p className="text-slate-400 text-sm mt-2">Start painting and save your creations!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedImages.map((image) => (
                <div
                  key={image.id}
                  className="bg-slate-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                >
                  <img
                    src={image.thumbnail}
                    alt="Saved painted house"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="text-xs text-slate-500 mb-3">
                      {new Date(image.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(image.image_data, image.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Download size={16} />
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
