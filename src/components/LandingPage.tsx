import { Upload, Image as ImageIcon, Camera, Images } from 'lucide-react';
import { useState, useRef } from 'react';
import { SavedPicturesModal } from './SavedPicturesModal';

interface LandingPageProps {
  onImageSelect: (imageUrl: string) => void;
}

const SAMPLE_IMAGES = [
  'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?auto=compress&cs=tinysrgb&w=800',
];

export function LandingPage({ onImageSelect }: LandingPageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = () => {
    if (previewUrl) {
      onImageSelect(previewUrl);
    }
  };

  const handleSampleSelect = (imageUrl: string) => {
    onImageSelect(imageUrl);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please make sure you have granted camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageUrl = canvas.toDataURL('image/png');
        setPreviewUrl(imageUrl);
        setSelectedFile(null);
        stopCamera();
      }
    }
  };

  return (
    <>
      <SavedPicturesModal isOpen={showSavedModal} onClose={() => setShowSavedModal(false)} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <button
          onClick={() => setShowSavedModal(true)}
          className="fixed top-6 right-6 z-10 flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-100 transition-colors shadow-lg"
        >
          <Images size={20} />
          <span className="font-medium hidden sm:inline">Saved Pictures</span>
        </button>
        <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-slate-900 mb-4 tracking-tight">
            SMART PAINT VISUALISER
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Upload your home photo or choose from samples
          </p>

          <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg">
                <ImageIcon size={20} />
                <span className="font-medium">Select Photo</span>
              </div>
            </label>

            <button
              onClick={isCameraActive ? stopCamera : startCamera}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              <Camera size={20} />
              <span className="font-medium">{isCameraActive ? 'Close Camera' : 'Take Photo'}</span>
            </button>

            {(selectedFile || previewUrl) && !isCameraActive && (
              <button
                onClick={handleUpload}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Upload size={20} />
                <span className="font-medium">Upload</span>
              </button>
            )}
          </div>

          {isCameraActive && (
            <div className="mb-8 inline-block">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="max-h-96 rounded-lg shadow-lg border-4 border-white"
                />
                <button
                  onClick={capturePhoto}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg font-medium"
                >
                  Capture
                </button>
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {previewUrl && !isCameraActive && (
            <div className="mb-8 inline-block">
              <img
                src={previewUrl}
                alt="Selected preview"
                className="max-h-48 rounded-lg shadow-lg border-4 border-white"
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6 text-center">
            Or Choose from Sample Images
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SAMPLE_IMAGES.map((imageUrl, index) => (
              <div
                key={index}
                onClick={() => handleSampleSelect(imageUrl)}
                className="cursor-pointer group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <img
                  src={imageUrl}
                  alt={`Sample home ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-slate-900 bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Select
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
