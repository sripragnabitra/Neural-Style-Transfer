import React, { useState, useEffect } from 'react';
import UploadForm from './components/UploadForm';

function App() {
  const [outputImage, setOutputImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const backendURL = process.env.REACT_APP_BACKEND_URL;

  const resizeImage = (file, maxWidth = 512, maxHeight = 512) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = reject;

      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth) {
          height = Math.round((maxWidth / width) * height);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((maxHeight / height) * width);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, { type: file.type });
              resolve(resizedFile);
            } else {
              reject(new Error('Canvas is empty'));
            }
          },
          file.type,
          0.95 // quality param for image/jpeg (optional)
        );
      };
      img.onerror = reject;

      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    return () => {
      if (outputImage && typeof outputImage === "string" && outputImage.startsWith("blob:")) {
        URL.revokeObjectURL(outputImage);
      }
    };
  }, [outputImage]);

  const handleStylize = async (contentFile, styleFile) => {
    setLoading(true);
    setError(null);
    try {
      const resizedContent = await resizeImage(contentFile);
      const resizedStyle = await resizeImage(styleFile);
  
      const formData = new FormData();
      formData.append('content', resizedContent);
      formData.append('style', resizedStyle);
  
      const response = await fetch(`${backendURL}/stylize`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) {
        throw new Error("Expected an image response from server.");
      }
      if (outputImage  && typeof outputImage === "string" && outputImage.startsWith("blob:")) {
        URL.revokeObjectURL(outputImage);
      }

      // Add timestamp query param to bust browser cache
      const imageUrl = URL.createObjectURL(blob) + `#${Date.now()}`;
      setOutputImage(imageUrl);

    } catch (error) {
      console.error("Stylize error:", error);
      setError(error.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Digi Image Styler
              </h1>
            </div>
            <div className="text-sm text-gray-400">
              AI-Powered Image Stylization
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <section className="text-center mb-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-blue-400">What is Neural Style Transfer?</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Neural Style Transfer is a technique that uses deep learning to apply the visual style of one image 
                (like a famous painting) to another image (like your photo) while preserving the content and structure 
                of the original image. This technology combines the power of convolutional neural networks with 
                artistic creativity to create stunning visual transformations.
              </p>
            </div>
          </div>
        </section>

        {/* Upload Form Section */}
        <section className="mb-12">
          <UploadForm onStylize={handleStylize} />
        </section>

        {/* Loading and Error States */}
        {loading && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-blue-900 bg-opacity-50 px-6 py-3 rounded-lg">
              <div className="animate-spin border-2 border-t-transparent border-blue-400 rounded-full w-5 h-5"></div>
              <span className="text-blue-400 font-medium">Processing your images... Please wait.</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-900 bg-opacity-50 border border-red-500 text-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-xl">⚠️</span>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Output Section */}
        {outputImage && (
          <section className="text-center">
            <h2 className="text-2xl font-bold mb-6 text-green-400">✨ Your Stylized Image</h2>
            <div className="max-w-2xl mx-auto">
              <img 
                src={outputImage} 
                alt="Stylized output" 
                className="rounded-xl shadow-2xl border-2 border-gray-600" 
              />
              <div className="mt-4">
                <a 
                  href={outputImage} 
                  download="stylized-image.png"
                  className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <span>💾</span>
                  <span>Download Image</span>
                </a>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto px-6 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-400">Technologies Used</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>React.js Frontend</li>
                <li>Python Flask Backend</li>
                <li>TensorFlow/PyTorch</li>
                <li>Tailwind CSS</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-400">Licenses</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>MIT License</li>
                <li>Apache 2.0</li>
                <li>Creative Commons</li>
                <li>Open Source</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 Neural Style Transfer. Built with ❤️ using modern web technologies.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
