'use client';
import React, { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import {
  Upload, MapPin, Camera, X, AlertCircle, Loader2, CheckCircle, WifiOff,
  RefreshCw, SkipForward, ShieldAlert, CloudOff, Clock, Wifi,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIResultCard from './AIResultCard';
import { toast } from 'sonner';
import { useFraudScoring } from '@/lib/hooks/useFraudScoring';
import { FraudScoringResult } from '@/lib/ai/fraudScoring';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOffline } from '@/contexts/OfflineContext';
import { useNotifications } from '@/contexts/NotificationContext';
import dynamic from 'next/dynamic';
import AIProcessingLoader from '@/components/AIProcessingLoader';
import CameraCapture from '@/components/CameraCapture';
import DownloadReportButton from '@/components/DownloadReportButton';
import { compressImage, validateImageFile } from '@/lib/utils/imageCompression';

const MapPreview = dynamic(() => import('@/components/MapPreview'), {
  ssr: false,
  loading: () => (
    <div className="h-44 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
      <Loader2 size={20} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
    </div>
  ),
});

type UploadState = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

type GpsErrorCode = 'permission_denied' | 'position_unavailable' | 'timeout' | 'not_supported' | 'unknown';
type UploadErrorCode = 'network' | 'ai_failed' | 'timeout' | 'server' | 'unknown';

interface GpsErrorInfo {
  code: GpsErrorCode;
  title: string;
  message: string;
  canRetry: boolean;
  canSkip: boolean;
}

interface UploadErrorInfo {
  code: UploadErrorCode;
  title: string;
  message: string;
  canRetry: boolean;
}

function getGpsErrorInfo(code: GpsErrorCode): GpsErrorInfo {
  switch (code) {
    case 'permission_denied':
      return {
        code,
        title: 'Location Access Denied',
        message:
          'You have blocked location access. Please allow location permission in your browser settings and tap "Retry GPS".',
        canRetry: true,
        canSkip: false,
      };
    case 'position_unavailable':
      return {
        code,
        title: 'Location Unavailable',
        message:
          'Your device could not determine your location. This may happen indoors or in areas with poor signal. Move to an open area and retry.',
        canRetry: true,
        canSkip: true,
      };
    case 'timeout':
      return {
        code,
        title: 'Location Timed Out',
        message:
          'GPS took too long to respond. Please ensure location services are enabled and try again.',
        canRetry: true,
        canSkip: true,
      };
    case 'not_supported':
      return {
        code,
        title: 'GPS Not Supported',
        message:
          'Your browser does not support GPS location. Please use a modern browser or contact your field officer for assistance.',
        canRetry: false,
        canSkip: true,
      };
    default:
      return {
        code,
        title: 'GPS Error',
        message:
          'An unexpected error occurred while capturing your location. Please try again.',
        canRetry: true,
        canSkip: true,
      };
  }
}

function getUploadErrorInfo(code: UploadErrorCode): UploadErrorInfo {
  switch (code) {
    case 'network':
      return {
        code,
        title: 'Network Error',
        message:
          'Could not connect to the server. Please check your internet connection and try again.',
        canRetry: true,
      };
    case 'ai_failed':
      return {
        code,
        title: 'AI Analysis Failed',
        message:
          'The AI verification engine could not process your image. This may be due to a low-quality photo or server load. Please retake the photo and try again.',
        canRetry: true,
      };
    case 'timeout':
      return {
        code,
        title: 'Request Timed Out',
        message:
          'The verification is taking too long. This may be due to a slow connection. Please try again.',
        canRetry: true,
      };
    case 'server':
      return {
        code,
        title: 'Server Error',
        message:
          'Our servers are temporarily unavailable. Please wait a few minutes and try again.',
        canRetry: true,
      };
    default:
      return {
        code,
        title: 'Verification Failed',
        message:
          'Something went wrong during verification. Please try again. If the problem persists, contact your field officer.',
        canRetry: true,
      };
  }
}

const assetCategories = [
  'Tractor', 'Pump Set', 'Irrigation Equipment', 'Sewing Machine',
  'Cattle / Livestock', 'House Construction', 'Solar Panel', 'Cold Storage',
  'Welding Machine', 'Seed Purchase', 'Other',
];

const AI_STEPS = [
  'Extracting image metadata...',
  'Analyzing asset with Gemini Vision...',
  'Performing OCR invoice scan...',
  'Checking duplicate image hash...',
  'Validating GPS coordinates...',
  'Computing fraud risk score...',
  'Generating verification report...',
];

export default function AssetUploadZone() {
  const { t } = useLanguage();
  const { isOnline, queueCount, addToQueue } = useOffline();
  const { addNotification } = useNotifications();

  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [assetCategory, setAssetCategory] = useState('');
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'fetching' | 'captured' | 'error' | 'skipped'>('idle');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<GpsErrorInfo | null>(null);
  const [uploadError, setUploadError] = useState<UploadErrorInfo | null>(null);
  const [progress, setProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [processingStepIdx, setProcessingStepIdx] = useState(1);
  const [fraudResult, setFraudResult] = useState<FraudScoringResult | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showCameraDirectly, setShowCameraDirectly] = useState(false);
  const [locationName, setLocationName] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { scoreSubmission, isScoring, error: scoringError } = useFraudScoring();

  useEffect(() => {
    if (scoringError) {
      // Map raw error strings to professional UI messages
      const lower = scoringError.toLowerCase();
      let friendlyMsg = 'AI verification temporarily unavailable. Please retry.';
      if (lower.includes('too large') || lower.includes('photo')) {
        friendlyMsg = 'Photo size too large. Please use a smaller image.';
      } else if (lower.includes('network') || lower.includes('fetch')) {
        friendlyMsg = 'Network error — please check your connection and retry.';
      } else if (lower.includes('busy') || lower.includes('429')) {
        friendlyMsg = 'Server busy. Trying fallback verification...';
      } else if (lower.includes('timeout')) {
        friendlyMsg = 'Verification timed out. Please retry.';
      } else if (lower.includes('configuration') || lower.includes('api key')) {
        friendlyMsg = 'AI service configuration issue. Please contact support.';
      }
      toast.error(friendlyMsg);
    }
  }, [scoringError]);

  const handleFile = useCallback(async (file: File) => {
    // Validate file type and size
    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Compress if needed — prevents Gemini 400 "payload too large" errors
    let processedFile = file;
    try {
      if (file.size > 500 * 1024) {
        toast.info('Optimizing photo for upload...');
        const result = await compressImage(file, {
          maxDimension: 1024,
          quality: 0.82,
          maxBytes: 850_000,
        });
        processedFile = result.file;
        if (result.wasCompressed) {
          console.log(
            `[Upload] Compressed: ${(file.size / 1024).toFixed(0)}KB to ` +
            `${(processedFile.size / 1024).toFixed(0)}KB`
          );
        }
      }
    } catch (compressionErr) {
      // Compression failed safely — proceed with original file
      console.warn('[Upload] Compression skipped:', compressionErr);
      processedFile = file;
    }

    setSelectedFile(processedFile);
    const url = URL.createObjectURL(processedFile);
    setPreviewUrl(url);
    captureGPS();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const captureGPS = useCallback(() => {
    setGpsStatus('fetching');
    setGpsError(null);

    if (typeof window === 'undefined' || !navigator.geolocation) {
      const err = getGpsErrorInfo('not_supported');
      setGpsError(err);
      setGpsStatus('error');
      toast.error(err.title);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGpsCoords({ lat, lng });
        setGpsStatus('captured');
        setGpsError(null);
        toast.success(t('gpsCaptured'));
        // Reverse geocode
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            '';
          const state = data.address?.state || '';
          setLocationName(city && state ? `${city}, ${state}` : state || data.display_name || '');
        } catch {
          setLocationName('');
        }
      },
      (posError) => {
        let code: GpsErrorCode = 'unknown';
        if (posError.code === 1) code = 'permission_denied';
        else if (posError.code === 2) code = 'position_unavailable';
        else if (posError.code === 3) code = 'timeout';

        const errInfo = getGpsErrorInfo(code);
        setGpsError(errInfo);
        setGpsStatus('error');
        toast.error(errInfo.title);
      },
      { timeout: 12000, enableHighAccuracy: true, maximumAge: 0 }
    );
  }, [t]);

  const handleGpsRetry = () => {
    setRetryCount((c) => c + 1);
    captureGPS();
  };

  const handleGpsSkip = () => {
    setGpsStatus('skipped');
    setGpsCoords(null);
    setGpsError(null);
    toast.info('GPS skipped — submission will be marked as location unverified.');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const handleSubmit = async () => {
    if (!selectedFile || !assetCategory) {
      toast.error('Please select an asset category before submitting.');
      return;
    }
    if (gpsStatus === 'fetching') {
      toast.error('Please wait for GPS capture to complete.');
      return;
    }
    if (gpsStatus === 'error' && !gpsError?.canSkip) {
      toast.error('GPS location is required. Please allow location access and retry.');
      return;
    }
    if (gpsStatus !== 'captured' && gpsStatus !== 'skipped') {
      toast.error('Please capture or skip GPS location before submitting.');
      return;
    }

    // Offline queuing
    if (!isOnline) {
      addToQueue();
      toast.info('Offline mode — upload queued. Will sync when connection is restored.');
      return;
    }

    setUploadState('uploading');
    setUploadError(null);
    setProgress(0);
    setProcessingStepIdx(1);

    // Upload progress simulation
    await new Promise<void>((resolve) => {
      const uploadInterval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) { clearInterval(uploadInterval); resolve(); return 100; }
          return p + 8;
        });
      }, 120);
    });

    setUploadState('processing');
    setProcessingStepIdx(2);

    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      if (stepIdx < AI_STEPS.length) {
        setProcessingStep(AI_STEPS[stepIdx]);
        setProcessingStepIdx(Math.min(stepIdx + 2, 6));
        stepIdx++;
      }
    }, 700);

    try {
      const imageBase64 = await fileToBase64(selectedFile);

      const result = await scoreSubmission({
        assetCategory,
        gpsCoords,
        imageMetadata: {
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type,
          lastModified: selectedFile.lastModified,
        },
        imageBase64,
        loanAmount: 420000,
      });

      clearInterval(stepInterval);
      setProcessingStepIdx(6);

      if (result) {
        setFraudResult(result);
        setUploadState('complete');
        toast.success('AI verification complete — submission sent to officer review');
        addNotification({
          type: 'upload',
          title: t('uploadSuccess'),
          message: `Asset proof submitted for ${assetCategory} — AI Confidence: ${result.confidenceScore}%`,
        });
        if (result.fraudScore > 60) {
          addNotification({
            type: 'fraud',
            title: t('fraudAlert'),
            message: `High fraud risk detected — Score: ${result.fraudScore}% for ${assetCategory}`,
          });
        }
      } else {
        clearInterval(stepInterval);
        const errInfo = getUploadErrorInfo('ai_failed');
        setUploadError(errInfo);
        setUploadState('error');
      }
    } catch (err: unknown) {
      clearInterval(stepInterval);
      // Classify the error
      let code: UploadErrorCode = 'unknown';
      if (err instanceof TypeError && err.message.includes('fetch')) code = 'network';
      else if (err instanceof Error && err.message.toLowerCase().includes('timeout')) code = 'timeout';
      else if (err instanceof Error && err.message.toLowerCase().includes('500')) code = 'server';

      const errInfo = getUploadErrorInfo(code);
      setUploadError(errInfo);
      setUploadState('error');
    }
  };

  const resetUpload = () => {
    setUploadState('idle');
    setSelectedFile(null);
    setPreviewUrl(null);
    setAssetCategory('');
    setGpsStatus('idle');
    setGpsCoords(null);
    setGpsError(null);
    setUploadError(null);
    setProgress(0);
    setProcessingStep('');
    setProcessingStepIdx(1);
    setFraudResult(null);
    setRetryCount(0);
  };

  const handleRetryUpload = () => {
    setUploadState('idle');
    setUploadError(null);
    setProgress(0);
    setProcessingStep('');
    setProcessingStepIdx(1);
    // Re-submit automatically
    setTimeout(() => handleSubmit(), 100);
  };

  return (
    <div className="space-y-4">
      {/* Camera Capture Modal */}
      <AnimatePresence>
        {showCamera && (
          <CameraCapture
            onCapture={(file) => { setShowCamera(false); setShowCameraDirectly(false); handleFile(file); }}
            onClose={() => { setShowCamera(false); setShowCameraDirectly(false); }}
            directCamera={showCameraDirectly}
          />
        )}
      </AnimatePresence>

      {/* Upload Card */}
      <motion.div
        className="card-base p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
              {t('uploadAssetProof')}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {t('milestone')}
            </p>
          </div>
          {uploadState !== 'idle' && uploadState !== 'complete' && (
            <button onClick={resetUpload} className="p-2 rounded-xl hover:bg-muted transition-colors">
              <X size={16} style={{ color: 'var(--muted-foreground)' }} />
            </button>
          )}
        </div>

        {uploadState === 'idle' && (
          <div className="space-y-4">
            {/* Asset Category */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
                {t('assetCategory')} <span style={{ color: 'var(--destructive)' }}>*</span>
              </label>
              <select
                value={assetCategory}
                onChange={(e) => setAssetCategory(e.target.value)}
                className="input-base text-sm"
              >
                <option value="">{t('selectAssetType')}</option>
                {assetCategories.map((cat) => (
                  <option key={`cat-${cat}`} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Drop Zone */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
                {t('assetPhoto')} <span style={{ color: 'var(--destructive)' }}>*</span>
              </label>
              <motion.div
                whileHover={{ scale: 1.005 }}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  dragOver ? 'border-primary bg-blue-50' : 'hover:border-primary/50 hover:bg-muted/50'
                }`}
                style={{ borderColor: dragOver ? 'var(--primary)' : 'var(--border)' }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                />
                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center"
                  >
                    <Upload size={24} style={{ color: 'var(--primary)' }} />
                  </motion.div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                      {t('dragDrop')}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                      {t('tapCamera')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <Camera size={12} />
                    <span>{t('uploadInstructions')}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Camera Capture Button */}
            <button
              onClick={() => { setShowCameraDirectly(true); setShowCamera(true); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 hover:bg-muted"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              <Camera size={15} style={{ color: 'var(--primary)' }} />
              {t('capturePhoto')}
            </button>
          </div>
        )}

        {/* Preview state */}
        {(uploadState === 'idle' && previewUrl) && (
          <div className="mt-4 space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-2xl overflow-hidden border"
              style={{ borderColor: 'var(--border)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Selected asset photo preview" className="w-full object-cover" style={{ maxHeight: '240px' }} />
              <button
                onClick={() => { setSelectedFile(null); setPreviewUrl(null); setGpsStatus('idle'); setGpsCoords(null); setGpsError(null); }}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X size={13} className="text-white" />
              </button>
            </motion.div>

            {/* GPS Status */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-3 border ${
                gpsStatus === 'captured' ? 'bg-green-50 border-green-100' :
                gpsStatus === 'fetching' ? 'bg-blue-50 border-blue-100' :
                gpsStatus === 'skipped'? 'bg-yellow-50 border-yellow-100' : 'bg-red-50 border-red-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <MapPin
                  size={16}
                  className="mt-0.5 shrink-0"
                  style={{
                    color: gpsStatus === 'captured' ? 'var(--accent)' :
                           gpsStatus === 'fetching' ? 'var(--primary)' :
                           gpsStatus === 'skipped'? '#D97706' : 'var(--destructive)',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                    {gpsStatus === 'fetching' ? t('capturingGPS') :
                     gpsStatus === 'captured' ? t('gpsCaptured') :
                     gpsStatus === 'skipped'? 'GPS Skipped' : gpsError?.title || t('gpsFailed')}
                  </p>
                  {gpsStatus === 'captured' && gpsCoords && (
                    <p className="text-[11px] tabular-nums mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      {gpsCoords.lat.toFixed(6)}°N, {gpsCoords.lng.toFixed(6)}°E{locationName ? ` · ${locationName}` : ''}
                    </p>
                  )}
                  {gpsStatus === 'error' && gpsError && (
                    <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                      {gpsError.message}
                    </p>
                  )}
                  {gpsStatus === 'skipped' && (
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      Submission will be marked as location unverified.
                    </p>
                  )}

                  {/* GPS Error Actions */}
                  {gpsStatus === 'error' && gpsError && (
                    <div className="flex items-center gap-2 mt-2">
                      {gpsError.canRetry && (
                        <button
                          onClick={handleGpsRetry}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all"
                          style={{ background: 'var(--primary)' }}
                        >
                          <RefreshCw size={11} />
                          Retry GPS
                          {retryCount > 0 && (
                            <span className="opacity-70">({retryCount})</span>
                          )}
                        </button>
                      )}
                      {gpsError.canSkip && (
                        <button
                          onClick={handleGpsSkip}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all hover:bg-white/50"
                          style={{ borderColor: 'var(--destructive)', color: 'var(--destructive)' }}
                        >
                          <SkipForward size={11} />
                          Skip GPS
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {gpsStatus === 'fetching' && (
                  <Loader2 size={14} className="animate-spin shrink-0" style={{ color: 'var(--primary)' }} />
                )}
                {gpsStatus === 'captured' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shrink-0" style={{ background: 'var(--accent)' }}>
                    {t('gpsVerified')}
                  </span>
                )}
                {gpsStatus === 'skipped' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: '#FEF3C7', color: '#92400E' }}>
                    Skipped
                  </span>
                )}
              </div>

              {/* Permission hint for GPS permission denied */}
              {gpsStatus === 'error' && gpsError?.code === 'permission_denied' && (
                <div
                  className="mt-2 rounded-lg p-2 text-[11px] leading-relaxed"
                  style={{ background: 'rgba(255,255,255,0.6)', color: 'var(--muted-foreground)' }}
                >
                  <p className="font-semibold mb-0.5" style={{ color: 'var(--foreground)' }}>How to allow location:</p>
                  <p>• <strong>Chrome:</strong> Lock icon → Location → Allow</p>
                  <p>• <strong>Safari:</strong> Settings → Safari → Location → Allow</p>
                </div>
              )}
            </motion.div>

            {/* Map Preview */}
            {gpsStatus === 'captured' && gpsCoords && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Suspense fallback={<div className="h-44 rounded-2xl" style={{ background: 'var(--muted)' }} />}>
                  <MapPreview lat={gpsCoords.lat} lng={gpsCoords.lng} locationName={locationName || 'Your Location'} />
                </Suspense>
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={
                !assetCategory ||
                gpsStatus === 'fetching' ||
                (gpsStatus === 'error' && !gpsError?.canSkip) ||
                isScoring
              }
              className="btn-primary w-full py-3 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {!isOnline && <WifiOff size={14} />}
              <Upload size={16} />
              {isOnline ? t('submitVerification') : 'Queue Upload (Offline)'}
            </motion.button>

            {/* GPS skip warning on submit */}
            {gpsStatus === 'skipped' && (
              <p className="text-[11px] text-center" style={{ color: '#D97706' }}>
                ⚠ Submitting without GPS verification — officer may request re-upload.
              </p>
            )}
          </div>
        )}

        {/* Uploading state */}
        {uploadState === 'uploading' && (
          <div className="py-8 space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative w-16 h-16">
                <div className="w-16 h-16 rounded-full border-4 border-blue-100" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>
                <span>Uploading photo...</span>
                <span className="tabular-nums font-semibold">{Math.min(progress, 100)}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'var(--primary)' }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>
          </div>
        )}

        {/* AI Processing state */}
        {uploadState === 'processing' && (
          <AIProcessingLoader currentStep={processingStepIdx} processingText={processingStep} />
        )}

        {/* Complete state */}
        {uploadState === 'complete' && fraudResult && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <AIResultCard onUploadAnother={resetUpload} result={fraudResult} />
            <div className="flex justify-end">
              <DownloadReportButton
                result={fraudResult}
                assetType={assetCategory}
                gpsCoords={gpsCoords}
              />
            </div>
          </motion.div>
        )}

        {/* Error state — comprehensive */}
        {uploadState === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6 space-y-4"
          >
            {/* Error icon + message */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                {uploadError?.code === 'network' ? (
                  <CloudOff size={24} style={{ color: 'var(--destructive)' }} />
                ) : uploadError?.code === 'timeout' ? (
                  <Clock size={24} style={{ color: 'var(--destructive)' }} />
                ) : uploadError?.code === 'server' ? (
                  <ShieldAlert size={24} style={{ color: 'var(--destructive)' }} />
                ) : (
                  <AlertCircle size={24} style={{ color: 'var(--destructive)' }} />
                )}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                  {uploadError?.title || 'Verification Failed'}
                </p>
                <p className="text-xs mt-1 leading-relaxed max-w-xs mx-auto" style={{ color: 'var(--muted-foreground)' }}>
                  {uploadError?.message || 'Something went wrong. Please try again.'}
                </p>
              </div>
            </div>

            {/* Connection status hint */}
            <div
              className="flex items-center gap-2 rounded-xl p-3 border text-xs"
              style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
            >
              {isOnline ? (
                <Wifi size={13} style={{ color: 'var(--accent)' }} />
              ) : (
                <WifiOff size={13} style={{ color: '#D97706' }} />
              )}
              <span style={{ color: 'var(--muted-foreground)' }}>
                {isOnline ? 'Internet connected — server may be temporarily unavailable.' : 'No internet connection detected.'}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              {uploadError?.canRetry && (
                <button
                  onClick={handleRetryUpload}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white transition-all"
                  style={{ background: 'var(--primary)' }}
                >
                  <RefreshCw size={14} />
                  Retry Verification
                </button>
              )}
              <button
                onClick={resetUpload}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-semibold transition-all hover:bg-muted"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <X size={14} />
                Start Over
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Offline indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 rounded-xl p-3 border"
        style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
      >
        {isOnline ? (
          <CheckCircle size={15} style={{ color: 'var(--accent)' }} />
        ) : (
          <WifiOff size={15} style={{ color: '#D97706' }} />
        )}
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {isOnline ? (
            <>
              <span className="font-semibold" style={{ color: 'var(--foreground)' }}>Online:</span>{' '}
              {t('offlineSyncMsg')}
              {queueCount > 0 && (
                <span className="ml-1 font-semibold" style={{ color: 'var(--accent)' }}>
                  {queueCount} {t('itemsInQueue')}
                </span>
              )}
            </>
          ) : (
            <>
              <span className="font-semibold" style={{ color: '#D97706' }}>{t('offlineMode')}:</span>{' '}
              {t('offlineSyncMsg')}
              {queueCount > 0 && (
                <span className="ml-1 font-semibold" style={{ color: '#D97706' }}>
                  {queueCount} {t('itemsInQueue')}
                </span>
              )}
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
}