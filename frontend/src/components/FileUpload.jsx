import React, { useState } from "react";
import api from "../api";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      setFile(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Unsupported file type. Upload images, PDFs, or documents.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError("");
    setUploadedFile(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("fileSize", file.size);
      formData.append("fileType", file.type);

      const res = await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) {
            const percent = Math.round((e.loaded * 100) / e.total);
            setUploadProgress(percent);
          }
        },
      });

      setUploadedFile(res.data);
      setFile(null);
      setTimeout(() => setUploadProgress(0), 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Upload failed. Please try again.");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadedFile(null);
    setError("");
    setUploadProgress(0);
  };

  const isImageFile = (file) => file?.type?.startsWith("image/");

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="p-6 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 hover:border-blue-500 hover:bg-blue-100 transition-all">
        <h3 className="text-lg font-semibold mb-3 text-center text-slate-800">📁 File Upload</h3>

        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg font-medium">
            {error}
          </div>
        )}

        {uploadedFile && (
          <div className="mb-3 p-3 bg-green-50 border border-green-300 text-green-700 rounded-lg">
            <strong className="block mb-1">✓ Upload Successful!</strong>
            <div className="text-sm mb-2">File: <span className="font-medium">{uploadedFile.fileName || uploadedFile.file}</span></div>
            {uploadedFile.url && (
              <a
                href={uploadedFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline font-medium text-sm"
              >
                View File →
              </a>
            )}
          </div>
        )}

        <input
          type="file"
          onChange={handleFileSelect}
          accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.doc,.docx"
          className="w-full p-3 mb-3 border border-blue-300 rounded-lg cursor-pointer text-sm file:bg-blue-600 file:text-white file:border-none file:mr-2 file:py-2 file:px-4 file:rounded-md file:font-medium hover:file:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isUploading}
        />

        {file && (
          <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-3 mb-3 text-left">
            <p className="font-medium text-slate-800">{file.name}</p>
            <p className="text-xs text-slate-600">
              {(file.size / 1024).toFixed(1)} KB — {file.type}
            </p>
            {isImageFile(file) && (
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="mt-2 rounded-lg max-h-48 object-contain mx-auto"
              />
            )}
          </div>
        )}

        {isUploading && (
          <div className="w-full bg-gray-200 h-2 rounded mb-3">
            <div
              className="h-2 bg-blue-600 rounded"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <div className="flex justify-center gap-3 mt-3">
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`px-4 py-2 rounded text-white ${
              isUploading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isUploading ? `Uploading... ${uploadProgress}%` : "Upload File"}
          </button>

          {(file || uploadedFile) && (
            <button
              onClick={resetUpload}
              disabled={isUploading}
              className="px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-100"
            >
              {uploadedFile ? "Upload Another" : "Cancel"}
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Supported: JPG, PNG, GIF, PDF, TXT, DOC, DOCX (max 5MB)
        </p>
      </div>
    </div>
  );
}
