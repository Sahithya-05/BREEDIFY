import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  FileWarning, 
  ServerCrash, 
  Clock, 
  RotateCcw, 
  ArrowLeft, 
  FileQuestion,
  Wrench
} from 'lucide-react';

export default function ErrorState({ code = 404, message, onRetry }) {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (code === 429) {
      const timer = setInterval(() => {
        setCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [code]);

  const errorConfigs = {
    400: {
      title: "Invalid Image or Request Format",
      icon: FileWarning,
      desc: message || "No cattle or buffalo detected in frame. Please ensure photo is well-lit and shows the animal clearly.",
      actionLabel: "Try Re-uploading Photo",
      color: "text-amber-600 bg-amber-100 border-amber-300"
    },
    404: {
      title: "Page or Resource Not Found",
      icon: FileQuestion,
      desc: message || "The requested route or livestock record does not exist or has been relocated.",
      actionLabel: "Return to Dashboard",
      color: "text-forest-700 bg-forest-100 border-forest-300"
    },
    413: {
      title: "Uploaded Image File Too Large",
      icon: AlertTriangle,
      desc: message || "Image exceeds the maximum 10MB limit. Auto-compress is available.",
      actionLabel: "Compress & Retry Upload",
      color: "text-terracotta bg-terracotta-light border-terracotta/30"
    },
    429: {
      title: "Too Many Requests (Rate Limited)",
      icon: Clock,
      desc: message || `Neural pipeline inference limit reached. Please wait ${countdown} seconds before retrying.`,
      actionLabel: countdown === 0 ? "Retry Request Now" : `Retry in ${countdown}s`,
      color: "text-indigo-600 bg-indigo-100 border-indigo-300"
    },
    500: {
      title: "Internal Server Processing Error",
      icon: ServerCrash,
      desc: message || "An unexpected error occurred during classification. Request ID: req_bovine_9921.",
      actionLabel: "Report Issue & Retry",
      color: "text-red-600 bg-red-100 border-red-300"
    },
    503: {
      title: "AI Vision Service Temporarily Unavailable",
      icon: Wrench,
      desc: message || "The YOLOv12 + MobileNetV2 neural vision pipeline is undergoing scheduled maintenance. Browse cached scans meanwhile.",
      actionLabel: "Browse Cached Scans",
      color: "text-amber-700 bg-amber-100 border-amber-300"
    }
  };

  const cfg = errorConfigs[code] || errorConfigs[500];
  const IconComp = cfg.icon;

  return (
    <div className="min-h-[500px] flex items-center justify-center p-6">
      <div className="bg-[#F4EDE0] p-8 md:p-12 rounded-3xl border border-[#DFD3BF] shadow-card max-w-lg w-full text-center space-y-6">
        
        {/* Error Code Icon Badge */}
        <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center border shadow-sm ${cfg.color}`}>
          <IconComp className="w-10 h-10" />
        </div>

        {/* Title & Message */}
        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-charcoal-muted">
            ERROR CODE {code}
          </span>
          <h2 className="text-2xl font-editorial font-bold text-charcoal">{cfg.title}</h2>
          <p className="text-xs text-charcoal-muted leading-relaxed">{cfg.desc}</p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/dashboard"
            className="flex-1 bg-cream-200 hover:bg-cream-300 text-charcoal py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>

          {onRetry ? (
            <button
              onClick={onRetry}
              disabled={code === 429 && countdown > 0}
              className="flex-1 bg-terracotta hover:bg-terracotta-hover text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" /> {cfg.actionLabel}
            </button>
          ) : (
            <Link
              to="/scanner"
              className="flex-1 bg-terracotta hover:bg-terracotta-hover text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <RotateCcw className="w-4 h-4" /> {cfg.actionLabel}
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
