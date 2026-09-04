import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  X,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Sparkles,
  Info,
  ShieldAlert
} from 'lucide-react';

export default function EyeCaptureModal({
  isOpen,
  onClose,
  onImageCaptured,
  title = "Capture Animal Eye Biometric"
}) {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'upload'
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [capturedPreview, setCapturedPreview] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [isCameraStarting, setIsCameraStarting] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera tracks cleanly
  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Start camera when modal opens in camera tab
  const startCamera = async () => {
    stopCameraStream();
    setCameraError(null);
    setIsCameraStarting(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera capture is unavailable on this device or browser.');
      setIsCameraStarting(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Camera access failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied. Please allow camera permissions in your browser or upload an existing eye photo.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Please upload an image instead.');
      } else {
        setCameraError(`Unable to start camera: ${err.message || 'Hardware unavailable'}.`);
      }
    } finally {
      setIsCameraStarting(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !capturedPreview) {
      startCamera();
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, activeTab, capturedPreview]);

  if (!isOpen) return null;

  // Capture frame from video
  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `iris_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const previewUrl = URL.createObjectURL(blob);
      setCapturedFile(file);
      setCapturedPreview(previewUrl);
      stopCameraStream();
    }, 'image/jpeg', 0.92);
  };

  const handleRetake = () => {
    setCapturedFile(null);
    setCapturedPreview(null);
    startCamera();
  };

  const handleConfirmCaptured = () => {
    if (capturedFile) {
      onImageCaptured(capturedFile, capturedPreview);
      handleModalClose();
    }
  };

  // Upload handlers
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      alert('Image size exceeds 12MB. Please upload a compressed photo.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setUploadFile(file);
    setUploadPreview(previewUrl);
  };

  const handleConfirmUpload = () => {
    if (uploadFile) {
      onImageCaptured(uploadFile, uploadPreview);
      handleModalClose();
    }
  };

  const handleModalClose = () => {
    stopCameraStream();
    setCapturedFile(null);
    setCapturedPreview(null);
    setUploadFile(null);
    setUploadPreview(null);
    setCameraError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#F8F3EA] rounded-[28px] border border-[#DFD3BF] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* MODAL HEADER */}
        <div className="px-5 py-4 border-b border-[#EDE7DA] flex items-center justify-between bg-[#F8F3EA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F5EBE1] text-[#D96B43] flex items-center justify-center font-bold">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2A2A28]">{title}</h3>
              <p className="text-[11px] text-[#7A7A70]">Dual Input: Camera Capture & File Upload</p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="w-8 h-8 rounded-full hover:bg-[#EDE7DA] flex items-center justify-center text-[#7A7A70] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TAB SWITCHER (REQUIRED: Capture with Camera OR Upload Image) */}
        <div className="px-5 pt-3 pb-1 bg-[#F8F3EA] border-b border-[#EDE7DA] flex gap-2">
          <button
            onClick={() => {
              setActiveTab('camera');
              setCameraError(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-[#324E38] text-white shadow-xs'
                : 'bg-[#FFFDF8] text-[#5A5A50] border border-[#DFD3BF] hover:border-[#324E38]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>📷 Capture with Camera</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('upload');
              stopCameraStream();
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-[#324E38] text-white shadow-xs'
                : 'bg-[#FFFDF8] text-[#5A5A50] border border-[#DFD3BF] hover:border-[#324E38]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>📁 Upload Image</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* TAB 1: CAMERA CAPTURE */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              {/* If already captured a frame, show preview */}
              {capturedPreview ? (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-emerald-500 shadow-inner aspect-4/3 flex items-center justify-center">
                    <img
                      src={capturedPreview}
                      alt="Captured eye"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-emerald-700/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Frame Captured
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleRetake}
                      className="flex-1 py-2.5 px-3 rounded-xl border border-[#E3DDCF] bg-white text-xs font-bold text-[#4A4A40] hover:bg-neutral-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retake Photo
                    </button>
                    <button
                      onClick={handleConfirmCaptured}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Use This Image
                    </button>
                  </div>
                </div>
              ) : cameraError ? (
                /* CAMERA PERMISSION FAILURE / UNAVAILABLE STATE */
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">Camera Access Notice</h4>
                    <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">{cameraError}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="bg-[#324E38] hover:bg-[#253D2A] text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image Instead</span>
                  </button>
                </div>
              ) : (
                /* LIVE CAMERA VIEW WITH EYE GUIDE OVERLAY */
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center border border-white/10 shadow-inner">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      className="w-full h-full object-cover"
                    />

                    {/* EYE GUIDE RETICLE OVERLAY */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                      <div className="relative w-44 h-44 rounded-full border-2 border-dashed border-amber-300/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] flex items-center justify-center">
                        <div className="w-16 h-10 rounded-full border border-white/60 flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white/70 animate-pulse" />
                        </div>
                        <span className="absolute -bottom-6 text-[10px] font-bold text-amber-200 tracking-wider uppercase bg-black/60 px-2 py-0.5 rounded-full">
                          Eye Guide
                        </span>
                      </div>
                    </div>

                    {/* LIVE STATUS BAR */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                      <span>Eye Status: Aligning inside reticle...</span>
                      <span className="text-emerald-300">Ready</span>
                    </div>

                    {isCameraStarting && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-white text-xs font-bold gap-2">
                        <span className="animate-spin">⏳</span> Starting camera preview...
                      </div>
                    )}
                  </div>

                  {/* CAMERA GUIDANCE (Specification #6) */}
                  <div className="p-3 rounded-xl bg-[#F5EBE1]/60 border border-[#EADBD0] text-[11px] text-[#4A4A40] space-y-1">
                    <div className="font-bold text-[#D96B43] flex items-center gap-1 text-[10px] uppercase">
                      <Info className="w-3 h-3" /> Field Capture Guidance
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[#5A5A50] text-[10px]">
                      <li>Position the animal's eye inside the circular guide.</li>
                      <li>Move closer if the eye is too small; keep the camera steady.</li>
                      <li>Ensure sufficient natural or ambient lighting; avoid heavy shadows.</li>
                      <li>Hold camera perpendicular to the eye for minimal distortion.</li>
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleModalClose}
                      className="flex-1 py-2.5 px-3 rounded-xl border border-[#DFD3BF] bg-[#FFFDF8] text-xs font-bold text-[#5A5A50] hover:bg-[#FAF5EB] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCaptureFrame}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Capture Frame
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD IMAGE */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {uploadPreview ? (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden bg-black border border-[#DFD3BF] shadow-inner aspect-4/3 flex items-center justify-center">
                    <img
                      src={uploadPreview}
                      alt="Uploaded eye"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2.5 px-3 rounded-xl border border-[#DFD3BF] bg-[#FFFDF8] text-xs font-bold text-[#4A4A40] hover:bg-[#FAF5EB] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Choose Different Photo
                    </button>
                    <button
                      onClick={handleConfirmUpload}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Use Uploaded Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#DFD3BF] hover:border-[#D96B43] rounded-2xl p-8 text-center cursor-pointer bg-[#FFFDF8] transition-colors space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-[#F5EBE1] text-[#D96B43] flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#2A2A28] block">
                      Click to upload an eye photo
                    </span>
                    <span className="text-[10px] text-[#7A7A70] block mt-0.5">
                      Supports JPG, PNG, WEBP (Max 12MB)
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8A8A80]">
                    Both camera captures and uploaded images enter the exact same biometric verification pipeline.
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
