import React, { useState } from "react";

export default function UploadForm({ onStylize }) {
  const [contentImage, setContentImage] = useState(null);
  const [styleImage, setStyleImage] = useState(null);
  const [contentPreview, setContentPreview] = useState(null);
  const [stylePreview, setStylePreview] = useState(null);

  const handleContentImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setContentImage(file);
      setContentPreview(URL.createObjectURL(file));
    }
  };

  const handleStyleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStyleImage(file);
      setStylePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contentImage || !styleImage) {
      alert("Please upload both content and style images");
      return;
    }
    
    if (onStylize) {
      onStylize(contentImage, styleImage);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 text-blue-400">Upload Your Images</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Select a content image (the photo you want to style) and a style image (the artistic style you want to apply). 
          For best results, use high-quality images with clear subjects.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Content Image Section */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2 text-green-400">Content Image</h3>
              <p className="text-gray-400 text-sm">
                This is the photo you want to style (e.g., your portrait, landscape, etc.)
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="text-2xl mb-2">📷</div>
                    <p className="mb-2 text-sm text-gray-300">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG, JPEG up to 10MB</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleContentImageChange}
                  />
                </label>
              </div>
              
              {contentPreview && (
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Preview:</p>
                  <img
                    src={contentPreview}
                    alt="Content preview"
                    className="max-w-full h-48 object-cover rounded-lg shadow-md mx-auto"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Style Image Section */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2 text-purple-400">Style Image</h3>
              <p className="text-gray-400 text-sm">
                This is the artistic style you want to apply (e.g., famous painting, artwork, etc.)
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="text-2xl mb-2">🎨</div>
                    <p className="mb-2 text-sm text-gray-300">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG, JPEG up to 10MB</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleStyleImageChange}
                  />
                </label>
              </div>
              
              {stylePreview && (
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Preview:</p>
                  <img
                    src={stylePreview}
                    alt="Style preview"
                    className="max-w-full h-48 object-cover rounded-lg shadow-md mx-auto"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-blue-900 bg-opacity-30 rounded-xl p-6 border border-blue-700">
          <h3 className="text-lg font-semibold mb-4 text-blue-400 flex items-center">
            <span className="mr-2">💡</span>
            Tips for Best Results
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">Content Image:</h4>
              <ul className="space-y-1">
                <li>• Use clear, high-resolution photos</li>
                <li>• Ensure good lighting and contrast</li>
                <li>• Avoid overly complex backgrounds</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-300 mb-2">Style Image:</h4>
              <ul className="space-y-1">
                <li>• Choose paintings with distinct artistic styles</li>
                <li>• Famous artworks work particularly well</li>
                <li>• Abstract or impressionist styles are effective</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={!contentImage || !styleImage}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>✨</span>
              <span>Generate Stylized Image</span>
              <span>✨</span>
            </span>
          </button>
          {(!contentImage || !styleImage) && (
            <p className="text-gray-400 text-sm mt-2">
              Please upload both images to continue
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
