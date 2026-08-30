import React, { useState } from 'react';
import { 
  Star, 
  CheckCircle2, 
  Award, 
  ShieldCheck, 
  XCircle, 
  MessageSquare, 
  Sparkles,
  ThumbsUp
} from 'lucide-react';
import { api } from '../../api';

export default function TradeReviewModal({
  isOpen,
  onClose,
  targetUser,      // { id, name, role }
  currentUserRole, // "FARMER" or "BUYER"
  currentUserId = 1,
  produceId = null,
  cropName = 'Agricultural Produce',
  onReviewSubmitted
}) {
  if (!isOpen || !targetUser) return null;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [qualityScore, setQualityScore] = useState(5);
  const [timelinessScore, setTimelinessScore] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const isFarmerReviewingBuyer = currentUserRole === 'FARMER';

  const availableTags = isFarmerReviewingBuyer ? [
    '⚡ Instant DBT Payout',
    '🤝 Fair Price Negotiation',
    '⚖️ Transparent Weighment',
    '📜 APMC Verified',
    '🚫 Zero Hidden Deductions',
    '🚚 Smooth Gate Entry'
  ] : [
    '🏆 Grade A+ Quality',
    '📦 Proper Gunny Bags',
    '🌱 Accurate Moisture Report',
    '🚚 Punctual Farmgate Dispatch',
    '🛡️ Zero Transit Rot',
    '💯 Honest Weight Count'
  ];

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      setErrorMsg('Please enter a few words about your trade experience.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await api.submitTradeReview({
        reviewer_id: currentUserId,
        reviewee_id: targetUser.id,
        reviewer_role: currentUserRole,
        produce_id: produceId,
        rating: rating,
        quality_score: qualityScore,
        timeliness_score: timelinessScore,
        review_title: reviewTitle.trim() || (rating >= 4 ? 'Verified Quality Trade Partner' : 'Trade Feedback'),
        review_text: reviewText.trim(),
        trust_tags: selectedTags.join(',')
      });

      setIsSuccess(true);
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 font-mono uppercase font-bold tracking-wider">
                APMC Verified Trade Reputation
              </span>
              <h3 className="text-base font-bold text-white">
                {isFarmerReviewingBuyer ? `Rate Buyer: ${targetUser.name}` : `Rate Farmer: ${targetUser.name}`}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1 text-sm rounded-lg"
          >
            ✕
          </button>
        </div>

        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-white">Trust Rating Submitted!</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Thank you! Your verified rating for <strong className="text-slate-200">{targetUser.name}</strong> has been logged to the public APMC Trust Ledger.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-center">
              <div className="flex items-center justify-center space-x-1 text-amber-400 text-base mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                  />
                ))}
              </div>
              <span className="text-slate-400 font-sans text-[11px]">
                {rating}.0 / 5.0 Stars Rated
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Error banner */}
            {errorMsg && (
              <div className="bg-rose-950/70 border border-rose-800 text-rose-200 p-2.5 rounded-lg flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Target Context Banner */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Trade Associated</span>
                <div className="text-white font-medium">{cropName}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Verified Mandi Deal</span>
                <div className="text-emerald-400 font-mono text-[11px] flex items-center justify-end space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Audit Pass</span>
                </div>
              </div>
            </div>

            {/* 5-Star Interactive Rating */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Overall Satisfaction Rating
              </span>

              <div className="flex items-center justify-center space-x-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition transform hover:scale-125"
                  >
                    <Star
                      className={`w-7 h-7 transition ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                          : 'text-slate-700 hover:text-slate-500'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="text-xs font-mono font-bold text-amber-400">
                {rating === 5 && '⭐⭐⭐⭐⭐ Exceptional (5.0)'}
                {rating === 4 && '⭐⭐⭐⭐ Very Good (4.0)'}
                {rating === 3 && '⭐⭐⭐ Satisfactory (3.0)'}
                {rating === 2 && '⭐⭐ Needs Improvement (2.0)'}
                {rating === 1 && '⭐ Poor Experience (1.0)'}
              </div>
            </div>

            {/* Multi-Criteria Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">{isFarmerReviewingBuyer ? 'Payment Promptness' : 'Crop Quality Assay'}</span>
                  <strong className="text-emerald-400 font-mono">{qualityScore}.0/5</strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={qualityScore}
                  onChange={(e) => setQualityScore(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">{isFarmerReviewingBuyer ? 'Fair Negotiation & Weighment' : 'Packaging & Dispatch'}</span>
                  <strong className="text-emerald-400 font-mono">{timelinessScore}.0/5</strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={timelinessScore}
                  onChange={(e) => setTimelinessScore(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Preset Trust Badges */}
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium text-[11px]">
                Highlight Key Trust Strengths (Select badges)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition ${
                        isSelected
                          ? 'bg-emerald-900 border border-emerald-700 text-emerald-200'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Review Title & Written Feedback */}
            <div className="space-y-2">
              <div>
                <label className="block text-slate-400 mb-1 font-medium text-[11px]">
                  Review Headline (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prompt settlement & transparent weighment"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium text-[11px]">
                  Detailed Written Feedback *
                </label>
                <textarea
                  rows={3}
                  placeholder={`Write your genuine experience with ${targetUser.name}...`}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-slate-700 resize-none"
                  required
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? 'Submitting...' : 'Post Verified Review'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
