import React, { useState } from 'react';

function UploadForm({ onStylize }) {
  const [contentFile, setContentFile] = useState(null);
  const [styleFile, setStyleFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (contentFile && styleFile) {
      onStylize(contentFile, styleFile);
    } else {
      alert('Please upload both images');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md bg-white p-6 rounded shadow">
      <div>
        <label className="block font-medium">Content Image:</label>
        <input type="file" accept="image/*" onChange={e => setContentFile(e.target.files[0])} required />
      </div>
      <div>
        <label className="block font-medium">Style Image:</label>
        <input type="file" accept="image/*" onChange={e => setStyleFile(e.target.files[0])} required />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Stylize
      </button>
    </form>
  );
}

export default UploadForm;
