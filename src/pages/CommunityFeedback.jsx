import React, { useState, useEffect } from 'react';
import { Stethoscope, CheckCircle2, XCircle, AlertTriangle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CommunityFeedback() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vet/queue')
      .then(res => res.json())
      .then(data => {
        setQueue(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleReviewAction = async (scanId, action, correctedBreed = null) => {
    try {
      const res = await fetch('/api/vet/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: scanId,
          action: action,
          corrected_breed: correctedBreed || 'jaffarabadi',
          notes: 'Reviewed and confirmed by Veterinary Officer'
        })
      });
      if (res.ok) {
        setQueue(queue.filter(q => q.id !== scanId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-editorial font-bold text-charcoal">
            Veterinary <span className="text-terracotta">Human-in-the-Loop Review Queue</span>
          </h1>
          <p className="text-xs text-charcoal-muted">Review low-confidence predictions (&lt;65%) and disputed farmer feedback</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
          Vet Officer Active
        </span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-charcoal-muted">Loading review queue...</div>
      ) : queue.length === 0 ? (
        <div className="bg-[#F4EDE0] p-8 rounded-3xl border border-[#DFD3BF] text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="font-editorial font-bold text-lg text-charcoal">Queue Fully Clear!</h3>
          <p className="text-xs text-charcoal-muted">There are no pending low-confidence or disputed scan predictions requiring review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => (
            <div key={item.id} className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl bg-black overflow-hidden shrink-0 border border-cream-200">
                  <img
                    src={item.full_body_image_url || 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=600&q=80'}
                    alt="Scan preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-charcoal">#{item.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      Conf: {Math.round(item.confidence * 100)}%
                    </span>
                  </div>
                  <h4 className="font-editorial font-bold text-base text-charcoal mt-1">
                    AI Predicted: {item.predicted_breed_name || item.predicted_breed}
                  </h4>
                  <p className="text-xs text-charcoal-muted">
                    Farmer: <strong>{item.farmer_name || 'Ramesh Patel'}</strong> ({item.farmer_mobile || '+919876543210'})
                  </p>
                  <p className="text-[11px] text-amber-800 mt-1">
                    Pregnancy: {item.pregnancy_status}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => handleReviewAction(item.id, 'confirm')}
                  className="flex-1 md:flex-none bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirm Prediction
                </button>
                <button
                  onClick={() => handleReviewAction(item.id, 'correct', 'jaffarabadi')}
                  className="flex-1 md:flex-none bg-terracotta hover:bg-terracotta-hover text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" /> Correct Breed
                </button>
                <Link
                  to={`/scanner/result/${item.id}`}
                  className="p-2.5 rounded-xl bg-cream-200 hover:bg-cream-300 text-charcoal"
                  title="View Scan Details"
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
