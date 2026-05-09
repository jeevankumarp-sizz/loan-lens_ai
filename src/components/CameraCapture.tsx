'use client';
import React, { useState, useRef, useCallback } from 'react';
import { Camera, X, RotateCcw, Check, Upload, AlertCircle, RefreshCw, ShieldAlert, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  /** If true, immediately opens device camera without showing the choice screen */
  directCamera?: boolean;
}

type CameraError =
  | 'permission_denied' |'no_camera' |'not_supported' |'file_too_large' |'invalid_format' |'unknown';

interface CameraErrorInfo {
  type: CameraError;
  title: string;
  message: string;
  canRetry: boolean;
  retryLabel?: string;
  fallbackLabel?: string;
}

function getCameraErrorInfo(type: CameraError): CameraErrorInfo {
  switch (type) {
    case 'permission_denied':
      return {
        type,
        title: 'Camera Access Denied',
        message:
          'You have blocked camera access. To use the camera, please allow camera permission in your browser settings, then try again.',
        canRetry: true,
        retryLabel: 'Try Again',
        fallbackLabel: 'Upload from Gallery Instead',
      };
    case 'no_camera':
      return {
        type,
        title: 'No Camera Found',
        message:
          'No camera was detected on your device. Please upload a photo from your gallery instead.',
        canRetry: false,
        fallbackLabel: 'Upload from Gallery',
      };
    case 'not_supported':
      return {
        type,
        title: 'Camera Not Supported',
        message:
          'Your browser does not support camera access. Please use a modern browser (Chrome, Safari, Firefox) or upload a photo from your gallery.',
        canRetry: false,
        fallbackLabel: 'Upload from Gallery',
      };
    case 'file_too_large':
      return {
        type,
        title: 'Photo Too Large',
        message:
          'The captured photo exceeds the 10MB limit. Please retake the photo or choose a smaller image from your gallery.',
        canRetry: true,
        retryLabel: 'Retake Photo',
        fallbackLabel: 'Upload from Gallery',
      };
    case 'invalid_format':
      return {
        type,
        title: 'Unsupported Format',
        message:
          'Only JPG, PNG, and WEBP images are supported. Please capture a standard photo or upload a supported file.',
        canRetry: true,
        retryLabel: 'Retake Photo',
        fallbackLabel: 'Upload from Gallery',
      };
    default:
      return {
        type,
        title: 'Camera Error',
        message:
          'Something went wrong while accessing the camera. Please try again or upload a photo from your gallery.',
        canRetry: true,
        retryLabel: 'Try Again',
        fallbackLabel: 'Upload from Gallery',
      };
  }
}

export default function CameraCapture({ onCapture, onClose, directCamera = false }: CameraCaptureProps) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'choice' | 'preview' | 'error'>('choice');
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [cameraError, setCameraError] = useState<CameraErrorInfo | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Auto-trigger camera when directCamera=true
  const handleMounted = useCallback(
    (node: HTMLInputElement | null) => {
      if (node && directCamera) {
        setTimeout(() => node.click(), 50);
      }
    },
    [directCamera]
  );

  const handleFileCapture = useCallback((file: File) => {
    // Validate format
    if (!file.type.startsWith('image/')) {
      setCameraError(getCameraErrorInfo('invalid_format'));
      setMode('error');
      return;
    }
    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setCameraError(getCameraErrorInfo('file_too_large'));
      setMode('error');
      return;
    }
    const url = URL.createObjectURL(file);
    setCapturedUrl(url);
    setCapturedFile(file);
    setMode('preview');
  }, []);

  // Handle when the camera input fires but no file was selected (user cancelled or permission denied)
  const handleCameraInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        // User cancelled — don't show error, just stay on choice screen
        return;
      }
      handleFileCapture(file);
    },
    [handleFileCapture]
  );

  // Detect camera availability before triggering
  const triggerCamera = useCallback(async () => {
    // Check browser support
    if (typeof window === 'undefined' || !navigator.mediaDevices) {
      setCameraError(getCameraErrorInfo('not_supported'));
      setMode('error');
      return;
    }
    // Try to enumerate devices to check for camera
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some((d) => d.kind === 'videoinput');
      if (!hasCamera) {
        setCameraError(getCameraErrorInfo('no_camera'));
        setMode('error');
        return;
      }
    } catch {
      // enumerateDevices failed — still try the file input
    }
    // Reset input value so same file can be re-selected
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
      cameraInputRef.current.click();
    }
  }, []);

  const handleRetake = () => {
    setCapturedUrl(null);
    setCapturedFile(null);
    setCameraError(null);
    setMode('choice');
    if (directCamera) {
      setTimeout(() => triggerCamera(), 50);
    }
  };

  const handleUsePhoto = () => {
    if (capturedFile) {
      onCapture(capturedFile);
    }
  };

  const handleRetryCamera = () => {
    setCameraError(null);
    setMode('choice');
    setTimeout(() => triggerCamera(), 100);
  };

  const handleFallbackToGallery = () => {
    setCameraError(null);
    setMode('choice');
    setTimeout(() => {
      if (galleryInputRef.current) {
        galleryInputRef.current.value = '';
        galleryInputRef.current.click();
      }
    }, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
    >
      {/* Hidden camera input */}
      <input
        ref={(node) => {
          (cameraInputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
          handleMounted(node);
        }}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCameraInputChange}
      />

      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ background: 'var(--card)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Camera size={16} style={{ color: 'var(--primary)' }} />
            <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
              {mode === 'preview' ? 'Review Photo' : mode === 'error' ? 'Camera Issue' : t('capturePhoto')}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-muted transition-colors">
            <X size={15} style={{ color: 'var(--muted-foreground)' }} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Choice screen */}
          {mode === 'choice' && (
            <motion.div
              key="choice"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-5 space-y-3"
            >
              {/* Camera capture button */}
              <button
                onClick={triggerCamera}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 hover:border-primary/50 hover:bg-blue-50/50"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Camera size={22} style={{ color: 'var(--primary)' }} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Take Photo</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Use your device camera</p>
                </div>
              </button>

              {/* Gallery upload */}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileCapture(e.target.files[0]);
                }}
              />
              <button
                onClick={() => {
                  if (galleryInputRef.current) {
                    galleryInputRef.current.value = '';
                    galleryInputRef.current.click();
                  }
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 hover:border-primary/50 hover:bg-blue-50/50"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
                  <Upload size={22} style={{ color: 'var(--accent)' }} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Upload from Gallery</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Choose from your photos</p>
                </div>
              </button>

              <p className="text-center text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                JPG, PNG, WEBP · Max 10MB · GPS auto-captured
              </p>
            </motion.div>
          )}

          {/* Preview screen */}
          {mode === 'preview' && capturedUrl && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-5 space-y-4"
            >
              <div className="relative rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={capturedUrl}
                  alt="Captured asset photo preview"
                  className="w-full object-cover"
                  style={{ maxHeight: '220px' }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 px-3 py-2 text-xs text-white font-medium"
                  style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }}
                >
                  {capturedFile?.name}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRetake}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-semibold transition-all hover:bg-muted"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  <RotateCcw size={15} />
                  {t('retakePhoto')}
                </button>
                <button
                  onClick={handleUsePhoto}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white transition-all"
                  style={{ background: 'var(--primary)' }}
                >
                  <Check size={15} />
                  {t('usePhoto')}
                </button>
              </div>
            </motion.div>
          )}

          {/* Error screen */}
          {mode === 'error' && cameraError && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-5 space-y-4"
            >
              {/* Error icon */}
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                  {cameraError.type === 'permission_denied' ? (
                    <ShieldAlert size={24} style={{ color: 'var(--destructive)' }} />
                  ) : cameraError.type === 'no_camera' ? (
                    <Smartphone size={24} style={{ color: 'var(--destructive)' }} />
                  ) : (
                    <AlertCircle size={24} style={{ color: 'var(--destructive)' }} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                    {cameraError.title}
                  </p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    {cameraError.message}
                  </p>
                </div>
              </div>

              {/* Permission hint for permission_denied */}
              {cameraError.type === 'permission_denied' && (
                <div
                  className="rounded-xl p-3 border text-xs leading-relaxed"
                  style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                >
                  <p className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>How to allow camera:</p>
                  <p>• <strong>Chrome:</strong> Click the lock icon in the address bar → Camera → Allow</p>
                  <p>• <strong>Safari:</strong> Settings → Safari → Camera → Allow</p>
                  <p>• <strong>Firefox:</strong> Click the camera icon in the address bar → Allow</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                {cameraError.canRetry && cameraError.retryLabel && (
                  <button
                    onClick={handleRetryCamera}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white transition-all"
                    style={{ background: 'var(--primary)' }}
                  >
                    <RefreshCw size={14} />
                    {cameraError.retryLabel}
                  </button>
                )}
                {cameraError.fallbackLabel && (
                  <button
                    onClick={handleFallbackToGallery}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-semibold transition-all hover:bg-muted"
                    style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  >
                    <Upload size={14} />
                    {cameraError.fallbackLabel}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-2xl text-xs transition-all hover:bg-muted"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
