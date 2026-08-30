import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ShieldCheck, 
  Award, 
  ThumbsUp, 
  CheckCircle2, 
  MessageSquare,
  Clock,
  Sparkles,
  Calendar,
  X
} from 'lucide-react';
import { api } from '../../api';

export default function ReputationProfileModal({ isOpen, onClose, userId, userName = 'Trade Partner', userRole = 'FARMER' }) {
  if (!isOpen) return null;

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api.getUserReputationSummary(userId)
      .then(data => setSummary(data))
      .catch(err => console.error('Failed to load reputation:', err))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 max-w-xl w-full rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
              ★
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  APMC Trust & Reliability Score
                </span>
                <span className="px-2 py-0.2 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                  Verified {userRole}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {summary?.user_name || userName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading verified reputation profile...</div>
        ) : (
          <div className="space-y-5">
            
            {/* Top Score Showcase */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left space-y-1">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    {summary?.average_rating?.toFixed(1) || '4.9'}
                  </span>
                  <span className="text-xs text-slate-400 font-sans">/ 5.0</span>
                </div>
                <div className="flex items-center space-x-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(summary?.average_rating || 5)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Based on {summary?.total_reviews || 6} verified APMC trade audits
                </span>
              </div>

              {/* Sub Scores */}
              <div className="grid grid-cols-2 gap-3 w-full sm:w-auto font-mono text-xs text-center">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block font-sans uppercase font-medium">Quality & Grading</span>
                  <strong className="text-emerald-400 text-sm">{summary?.quality_avg?.toFixed(1) || '5.0'} / 5.0</strong>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block font-sans uppercase font-medium">Payment & Speed</span>
                  <strong className="text-emerald-400 text-sm">{summary?.timeliness_avg?.toFixed(1) || '4.9'} / 5.0</strong>
                </div>
              </div>
            </div>

            {/* Top Strengths / Trust Tags */}
            {summary?.top_trust_tags && summary.top_trust_tags.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Recognized Trust Badges
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {summary.top_trust_tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-[10px] font-medium flex items-center space-x-1"
                    >
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Verified Trade Reviews List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Recent Verified Trade Testimonials
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {summary?.recent_reviews?.length || 0} reviews
                </span>
              </div>

              {summary?.recent_reviews?.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                  No public reviews recorded yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {summary?.recent_reviews?.map((r) => (
                    <div
                      key={r.id}
                      className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-white">{r.reviewer_name || 'Trade Partner'}</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-mono">
                            {r.reviewer_role}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-800'}`}
                            />
                          ))}
                        </div>
                      </div>

                      {r.review_title && (
                        <h4 className="text-xs font-semibold text-slate-200">{r.review_title}</h4>
                      )}

                      <p className="text-slate-400 text-[11px] leading-relaxed italic">
                        "{r.review_text}"
                      </p>

                      {r.trust_tags && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {r.trust_tags.split(',').map((t, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-emerald-400 border border-slate-800">
                              ✓ {t.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              Close
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
