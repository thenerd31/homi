'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Upload, Image as ImageIcon, File, Check } from 'lucide-react';
import { api } from '../../../lib/api';

export default function MultimodalInputPage() {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState(() => {
    // Get existing user ID from localStorage or create a new one
    if (typeof window !== 'undefined') {
      const existingUserId = localStorage.getItem('vibe_user_id');
      if (existingUserId) {
        return existingUserId;
      }
      const newUserId = 'demo-user-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('vibe_user_id', newUserId);
      return newUserId;
    }
    return 'demo-user-' + Math.random().toString(36).substr(2, 9);
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!uploadedFiles.length && !description.trim()) return;

    console.log('Starting preference analysis...', {
      fileCount: uploadedFiles.length,
      description
    });

    setIsLoading(true);

    try {
      // Analyze preference images with backend
      console.log('Calling api.analyzePreferences...');
      const result = await api.analyzePreferences(uploadedFiles, description);

      console.log('Analysis result:', result);

      if (result.success) {
        console.log('Preferences extracted:', result.extracted_preferences);
        console.log('Search query:', result.search_query);
        console.log('Reasoning:', result.reasoning);

        // Use the extracted search query for conversational search
        const convResponse = await api.conversationSearch({
          user_message: result.search_query,
          user_id: userId,
          conversation_history: [],
          extracted_so_far: {}
        });

        // If we have enough info, execute search
        if (convResponse.status === 'ready_to_search') {
          await api.executeSearch({
            extracted_params: convResponse.extracted_params,
            user_id: userId
          });
        }

        // Navigate to results page with extracted preferences
        const prefsParam = encodeURIComponent(JSON.stringify(result.extracted_preferences));
        router.push(`/discover/multimodal/results?preferences=${prefsParam}`);
      }
    } catch (error) {
      console.error('Preference analysis error:', error);
      alert('Failed to analyze preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* header */}
      <div className="flex items-center justify-center pt-4 pb-2 relative">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Go back"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-white" />
          <span className="text-white text-lg font-medium">Upload</span>
        </div>
      </div>

      {/* main content */}
      <div className="flex-1 px-6 pt-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <p className="text-white/60 text-base mb-6">
            Share images or files of places you love
          </p>

          {/* upload files here */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/30 rounded-2xl p-12 mb-6 cursor-pointer hover:border-white/50 transition-colors"
          >
            <div className="flex flex-col items-center justify-center text-center">
              <Upload className="w-12 h-12 text-white/40 mb-4" />
              <p className="text-white/60 text-lg mb-2">
                Drop files here or click to browse
              </p>
              <p className="text-white/40 text-sm">
                Images, PDFs, and other files supported
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Upload files"
            />
          </div>

          {/* uploaded files */}
          {uploadedFiles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white text-sm font-medium mb-3">
                Uploaded Files ({uploadedFiles.length})
              </h3>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-white/10 rounded-lg p-3"
                  >
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="w-5 h-5 text-white/60 flex-shrink-0" />
                    ) : (
                      <File className="w-5 h-5 text-white/60 flex-shrink-0" />
                    )}
                    <span className="text-white text-sm flex-1 truncate">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="text-white/40 hover:text-white/80 transition-colors"
                      aria-label="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* description */}
          <div>
            <label className="text-white/60 text-sm mb-2 block">
              Add a description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you're looking for..."
              className="w-full bg-white/10 text-white rounded-lg p-4 resize-none outline-none placeholder:text-white/30 min-h-[100px] focus:bg-white/15 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* submit button */}
      {(uploadedFiles.length > 0 || description.trim()) && (
        <div className="fixed bottom-24 right-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Submit"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-7 h-7 text-white" strokeWidth={3} />
            )}
          </button>
        </div>
      )}

    </div>
  );
}
