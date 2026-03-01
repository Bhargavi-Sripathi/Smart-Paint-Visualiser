import { Search, Download, Share2, Undo2, MousePointer2, Redo2, Save, Images } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { floodFill, hexToRgb } from '../utils/imageProcessing';
import { PAINT_COLORS, COLOR_CATEGORIES } from '../utils/colorPalette';
import { saveImageToLocal } from '../utils/localStorageHelper';
import { SavedPicturesModal } from './SavedPicturesModal';

interface ColorPickerProps {
  imageUrl: string;
  onBack: () => void;
}

export function ColorPicker({ imageUrl, onBack }: ColorPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isClickMode, setIsClickMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showSavedModal, setShowSavedModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [currentImageData, setCurrentImageData] = useState<ImageData | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOriginalImage(img);
      initializeCanvas(img);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const initializeCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setCurrentImageData(imageData);
    setHistory([imageData]);
    setHistoryIndex(0);
  };

  const saveToHistory = (imageData: ImageData) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isClickMode || !selectedColor || !currentImageData) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((event.clientX - rect.left) * scaleX);
    const y = Math.floor((event.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const fillColor = hexToRgb(selectedColor);
    const copiedImageData = new ImageData(
      new Uint8ClampedArray(currentImageData.data),
      currentImageData.width,
      currentImageData.height
    );
    const newImageData = floodFill(copiedImageData, x, y, fillColor, 30);

    ctx.putImageData(newImageData, 0, 0);
    setCurrentImageData(newImageData);
    saveToHistory(newImageData);
    setIsClickMode(false);
    setSelectedColor('');
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setIsClickMode(true);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const imageData = history[newIndex];
      setCurrentImageData(imageData);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d', { willReadFrequently: true });
      if (ctx && imageData) {
        ctx.putImageData(imageData, 0, 0);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const imageData = history[newIndex];
      setCurrentImageData(imageData);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d', { willReadFrequently: true });
      if (ctx && imageData) {
        ctx.putImageData(imageData, 0, 0);
      }
    }
  };

  const handleReset = () => {
    setIsClickMode(false);
    setSelectedColor('');
    if (originalImage) {
      initializeCanvas(originalImage);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const fullImage = canvas.toDataURL('image/png');

    const tempCanvas = document.createElement('canvas');
    const maxSize = 300;
    const scale = Math.min(maxSize / canvas.width, maxSize / canvas.height);
    tempCanvas.width = canvas.width * scale;
    tempCanvas.height = canvas.height * scale;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
    }
    const thumbnail = tempCanvas.toDataURL('image/jpeg', 0.7);

    saveImageToLocal(fullImage, thumbnail);
    alert('Image saved successfully!');
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'painted-house.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });

      const file = new File([blob], 'painted-house.png', { type: 'image/png' });

      if (navigator.share) {
        const shareData: ShareData = {
          title: 'My Painted House',
          text: 'Check out my house design!',
        };

        if (navigator.canShare && navigator.canShare({ ...shareData, files: [file] })) {
          shareData.files = [file];
        } else {
          const dataUrl = canvas.toDataURL('image/png');
          shareData.url = dataUrl;
        }

        await navigator.share(shareData);
      } else {
        alert('Sharing is not supported on this browser. The image will be downloaded instead.');
        handleDownload();
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Error sharing:', error);
      alert('Unable to share. The image will be downloaded instead.');
      handleDownload();
    }
  };

  const filteredColors = PAINT_COLORS.filter((color) => {
    const matchesSearch = color.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || color.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <SavedPicturesModal isOpen={showSavedModal} onClose={() => setShowSavedModal(false)} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-100 transition-colors shadow"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-slate-900">Paint Your Home</h1>
            <button
              onClick={() => setShowSavedModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-100 transition-colors shadow"
            >
              <Images size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
              <div className="mb-4 flex gap-3 flex-wrap">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow"
                >
                  <Save size={18} />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow"
                >
                  <Download size={18} />
                  <span>Download</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors shadow"
                >
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Undo2 size={18} />
                    <span>Undo</span>
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Redo2 size={18} />
                    <span>Redo</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow"
                  >
                    <Undo2 size={18} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

            <div className="relative bg-slate-100 rounded-lg overflow-hidden">
              {isClickMode && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                  <MousePointer2 size={18} />
                  <span className="font-medium">Click on the image to paint</span>
                </div>
              )}
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className={`w-full h-auto ${isClickMode ? 'cursor-crosshair' : 'cursor-default'}`}
              />
            </div>
          </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Color Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {COLOR_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search colors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Choose Color</h3>
                <div className="grid grid-cols-4 gap-2">
                  {filteredColors.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => handleColorSelect(color.hex)}
                      className="group relative"
                      title={color.name}
                    >
                      <div
                        className="w-full aspect-square rounded-lg border-2 border-slate-300 hover:border-slate-900 transition-all shadow-sm hover:shadow-md cursor-pointer"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
