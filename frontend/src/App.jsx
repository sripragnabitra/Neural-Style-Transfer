import React, { useState, useEffect } from 'react';
import UploadForm from './components/UploadForm';

function App() {
  const [outputImage, setOutputImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      if (outputImage && typeof outputImage === "string" && outputImage.startsWith("blob:")) {
        URL.revokeObjectURL(outputImage);
      }
    };
  }, [outputImage]);

  const handleStylize = async (contentFile, styleFile) => {
    const formData = new FormData();
    formData.append('content', contentFile);
    formData.append('style', styleFile);

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/stylize', {
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
      console.log("Response headers:", [...response.headers.entries()]);
      console.log("Content-Type:", response.headers.get("Content-Type"));

      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) {
        console.error("Unexpected blob type:", blob.type);
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
    <div className="min-h-screen p-6 bg-gray-100 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Neural Style Transfer</h1>
      <UploadForm onStylize={handleStylize} />
      {loading && <p className="mt-4 text-blue-500">Stylizing... Please wait.</p>}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      {outputImage && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Stylized Output:</h2>
          <img src={outputImage} alt="Output" className="rounded shadow" />
        </div>
      )}
    </div>
  );
}

export default App;
