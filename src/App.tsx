import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { ColorPicker } from './components/ColorPicker';

function App() {
  const [selectedImage, setSelectedImage] = useState<string>('');

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleBack = () => {
    setSelectedImage('');
  };

  return (
    <>
      {!selectedImage ? (
        <LandingPage onImageSelect={handleImageSelect} />
      ) : (
        <ColorPicker imageUrl={selectedImage} onBack={handleBack} />
      )}
    </>
  );
}

export default App;
