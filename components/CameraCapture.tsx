'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, StopCircle, Check, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const FILTERS = [
  { id: 'none', name: 'Normal', filter: 'none' },
  { id: 'grayscale', name: 'N&B', filter: 'grayscale(100%)' },
  { id: 'sepia', name: 'Sépia', filter: 'sepia(100%)' },
  { id: 'warm', name: 'Chaud', filter: 'saturate(150%) contrast(110%) brightness(110%)' },
  { id: 'cool', name: 'Froid', filter: 'hue-rotate(180deg) saturate(120%)' },
  { id: 'vintage', name: 'Vintage', filter: 'contrast(120%) sepia(30%) brightness(90%)' },
  { id: 'dramatic', name: 'Dramatique', filter: 'contrast(150%) brightness(80%)' },
];

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const requestRef = useRef<number>();
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);

  const startCamera = async () => {
    setIsLoading(true);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode, 
          width: { ideal: 1080 }, 
          height: { ideal: 1920 } 
        },
        audio: true
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Impossible d'accéder à la caméra.");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [facingMode]);

  // Canvas drawing loop for filtered video
  const drawToCanvas = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const { videoWidth, videoHeight } = videoRef.current;
    if (videoWidth === 0) {
      requestRef.current = requestAnimationFrame(drawToCanvas);
      return;
    }

    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    ctx.filter = activeFilter.filter;
    
    // Handle mirroring for front camera
    if (facingMode === 'user') {
      ctx.translate(videoWidth, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
    
    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    requestRef.current = requestAnimationFrame(drawToCanvas);
  };

  useEffect(() => {
    if (!isLoading && !previewUrl) {
      requestRef.current = requestAnimationFrame(drawToCanvas);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isLoading, previewUrl, activeFilter]);

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const takePhoto = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        setCapturedBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
      }
    }, 'image/jpeg', 0.95);
  };

  const startRecording = () => {
    if (!canvasRef.current || !stream) return;
    
    const canvasStream = canvasRef.current.captureStream(30);
    // Add audio from original stream
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) canvasStream.addTrack(audioTrack);

    const chunks: BlobPart[] = [];
    const recorder = new MediaRecorder(canvasStream, { mimeType: 'video/webm;codecs=vp9' });
    mediaRecorderRef.current = recorder;
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setCapturedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    };

    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleConfirm = () => {
    if (capturedBlob) {
      const extension = mode === 'photo' ? 'jpg' : 'webm';
      const file = new File([capturedBlob], `story-${Date.now()}.${extension}`, {
        type: mode === 'photo' ? 'image/jpeg' : 'video/webm'
      });
      onCapture(file);
    }
  };

  const handleReset = () => {
    setCapturedBlob(null);
    setPreviewUrl(null);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      <div className="relative w-full h-full max-w-md bg-zinc-900 overflow-hidden flex flex-col">
        
        {/* Header Controls */}
        {!capturedBlob && (
          <div className="absolute top-0 inset-x-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={onClose}>
              <X className="w-6 h-6" />
            </Button>
            <div className="flex bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
              <button 
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'photo' ? 'bg-white text-black' : 'text-white'}`}
                onClick={() => setMode('photo')}
              >
                PHOTO
              </button>
              <button 
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'video' ? 'bg-white text-black' : 'text-white'}`}
                onClick={() => setMode('video')}
              >
                VIDEO
              </button>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={switchCamera}>
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Video Preview / Canvas Output */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          {isLoading && (
             <div className="absolute inset-0 z-30 flex items-center justify-center bg-black">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
             </div>
          )}
          
          <video ref={videoRef} className="hidden" autoPlay muted playsInline />
          
          {previewUrl ? (
            mode === 'photo' ? (
              <img src={previewUrl} className="w-full h-full object-cover" alt="Captured" />
            ) : (
              <video src={previewUrl} className="w-full h-full object-cover" autoPlay loop muted />
            )
          ) : (
            <canvas 
              ref={canvasRef} 
              className="w-full h-full object-cover"
            />
          )}

          {/* Filter Preview Indicator */}
          {!capturedBlob && activeFilter.id !== 'none' && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 pointer-events-none">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-white text-[10px] font-bold uppercase tracking-widest">{activeFilter.name}</span>
            </div>
          )}
        </div>

        {/* Filter Selector */}
        {!capturedBlob && (
          <div className="absolute bottom-32 inset-x-0 z-20">
            <div className="flex gap-4 overflow-x-auto px-8 py-4 no-scrollbar snap-x">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f)}
                  className={`flex-shrink-0 flex flex-col items-center gap-2 transition-all snap-center ${activeFilter.id === f.id ? 'scale-110' : 'opacity-60 scale-90'}`}
                >
                  <div 
                    className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden bg-zinc-800"
                    style={{ filter: f.filter }}
                  >
                     <div className="w-full h-full bg-gradient-to-tr from-rose-500 to-amber-500 opacity-50" />
                  </div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-tight">{f.name}</span>
                  {activeFilter.id === f.id && <div className="w-1 h-1 rounded-full bg-white" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="p-8 pb-12 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center gap-12 relative z-30">
          {capturedBlob ? (
            <>
              <Button 
                variant="outline" 
                className="rounded-full w-14 h-14 border-white/20 text-white hover:bg-white/10 backdrop-blur-md"
                onClick={handleReset}
              >
                <X className="w-6 h-6" />
              </Button>
              <Button 
                className="rounded-full w-20 h-20 bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-600/20 active:scale-95 transition-all"
                onClick={handleConfirm}
              >
                <Check className="w-10 h-10" />
              </Button>
            </>
          ) : (
            <div className="relative">
              {mode === 'photo' ? (
                <button 
                  className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-all shadow-2xl"
                  onClick={takePhoto}
                >
                  <div className="w-16 h-16 rounded-full bg-white" />
                </button>
              ) : (
                <button 
                  className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-all ${isRecording ? 'border-red-500' : 'shadow-2xl'}`}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? (
                    <StopCircle className="w-12 h-12 text-red-500 animate-pulse" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-red-600" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
