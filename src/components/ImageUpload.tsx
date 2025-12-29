'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

// Get API URL dynamically based on current origin
function getApiUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  }
  return `${window.location.origin}/api`;
}

interface ImageUploadProps {
  currentImage?: string;
  onUpload: (url: string) => void;
  uploadEndpoint: 'restaurant/logo' | 'restaurant/cover' | 'menu-item';
  className?: string;
  aspectRatio?: 'square' | 'cover' | 'auto';
}

export function ImageUpload({
  currentImage,
  onUpload,
  uploadEndpoint,
  className = '',
  aspectRatio = 'square',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectClasses = {
    square: 'aspect-square',
    cover: 'aspect-[16/5]',
    auto: '',
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Formato inválido. Use JPG, PNG, GIF ou WebP.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setError(null);
    setIsUploading(true);

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/upload/${uploadEndpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao fazer upload');
      }

      const data = await response.json();
      setPreviewUrl(data.url);
      onUpload(data.url);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
      setPreviewUrl(currentImage || null);
    } finally {
      setIsUploading(false);
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUpload('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {previewUrl ? (
        <div className={`relative overflow-hidden rounded-lg bg-gray-100 ${aspectClasses[aspectRatio]}`}>
          <img
            src={previewUrl}
            alt="Preview"
            className="h-full w-full object-cover"
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
          {!isUploading && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all hover:bg-black/50 hover:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Trocar
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="rounded-lg bg-red-500 p-2 text-white hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-orange-400 hover:bg-orange-50 ${aspectClasses[aspectRatio]} ${
            aspectRatio === 'auto' ? 'min-h-[120px]' : ''
          }`}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          ) : (
            <>
              <Upload className="mb-2 h-8 w-8 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">
                Clique para fazer upload
              </span>
              <span className="text-xs text-gray-400">
                JPG, PNG, GIF ou WebP (máx. 5MB)
              </span>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
