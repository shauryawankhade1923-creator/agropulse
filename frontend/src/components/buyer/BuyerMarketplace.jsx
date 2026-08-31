import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Search, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Scale,
  Star,
  ShieldCheck,
  Eye,
  Award,
  Sparkles,
  Camera,
  X
} from 'lucide-react';
import { api } from '../../api';
import ReputationProfileModal from '../reviews/ReputationProfileModal';
import { useLanguage } from '../../i18n/LanguageContext';

export default function BuyerMarketplace() {
  const { t, language } = useLanguage();
  const [produces, setProduces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterCrop, setFilterCrop] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduce, setSelectedProduce] = useState(null);
  const [bidPrice, setBidPrice] = useState('');
  const [bidQty, setBidQty] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [bidSuccess, setBidSuccess] = useState(false);
  const [inspectFarmer, setInspectFarmer] = useState(null);

  // Optical Assay Modal inspection state
  const [inspectAssayProduce, setInspectAssayProduce] = useState(null);

  useEffect(() => {
    async function loadProduces() {
      setLoading(true);
      try {
        const data = await api.getProduces();
        setProduces(data);
      } catch (err) {
        console.error('Failed to load marketplace produces:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduces();
  }, []);

  const filtered = produces.filter(p => {
    const matchesCrop = filterCrop === 'ALL' || p.crop_name.toLowerCase() === filterCrop.toLowerCase();
    const matchesSearch = p.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.farmer_name && p.farmer_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCrop && matchesSearch;
  });

  const handleOpenBid = (p) => {
    setSelectedProduce(p);
    setBidPrice(p.expected_price_per_kg);
    setBidQty(p.quantity_kg);
    setBidMessage('Direct logistics pickup arranged. Immediate escrow payout upon loading.');
    setBidSuccess(false);
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    if (!selectedProduce) return;
    try {
      const res = await api.placeBuyerOffer({
        produce_id: selectedProduce.id,
        buyer_id: 201,
        offered_price_per_kg: Number(bidPrice),
        quantity_requested_kg: Number(bidQty),
        message: bidMessage
      });
      setBidSuccess(true);
    } catch (err) {
      alert('Error placing bid: ' + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
              {t('marketplace_sub')}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              {t('marketplace_title')}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              {t('marketplace_desc')}
            </p>
          </div>

          {/* Filter & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-slate-700"
              />
            </div>

            <select
              value={filterCrop}
              onChange={(e) => setFilterCrop(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 focus:outline-none focus:border-slate-700"
            >
              <option value="ALL">{t('all_crops')}</option>
              <option value="Apple">Apple 🍎</option>
              <option value="Banana">Banana 🍌</option>
              <option value="Mango">Mango 🥭</option>
              <option value="Orange">Orange 🍊</option>
              <option value="Tomato">Tomato 🍅</option>
              <option value="Onion">Onion 🧅</option>
              <option value="Wheat">Wheat 🌾</option>
              <option value="Soybean">Soybean 🌱</option>
              <option value="Potato">Potato 🥔</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Produce Lots */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading marketplace lots...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
          No produce lots matched your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-sm">
              <div>
                
                {/* Card Top */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono">Lot #{p.id}</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{p.crop_name}</h3>
                    <p className="text-xs text-slate-400 truncate">{p.variety || 'Standard Mandi Cultivar'}</p>
                  </div>

                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold font-mono border ${
                      p.quality_grade === 'A' 
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700' 
                        : (p.quality_grade === 'B' ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-slate-950 text-slate-300 border-slate-800')
                    }`}>
                      Grade {p.quality_grade}
                    </span>

                    {p.ai_vision_verified && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 text-[10px] font-semibold flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{t('ai_certified_badge')}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Vision Optical Assay Callout Badge */}
                {p.ai_vision_verified ? (
                  <div className="bg-gradient-to-r from-emerald-950/40 to-slate-950 rounded-lg p-2.5 border border-emerald-800/50 mb-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold text-[11px]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Vision Optical Assay</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInspectAssayProduce(p)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold underline flex items-center space-x-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>{t('view_assay_cert')}</span>
                      </button>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                      <span>Quality: <strong className="text-emerald-400 font-bold">{p.ai_quality_score || 95}%</strong></span>
                      <span className="truncate max-w-[170px] text-slate-300">{p.ai_ripeness_stage || 'Optimal Ripe'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/50 rounded-lg px-2.5 py-1.5 border border-slate-800 mb-3 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Mandi Lab Moisture: <strong className="text-slate-300 font-mono">{p.moisture_content}%</strong></span>
                    <span className="text-[10px] text-slate-500">Manual Inspection</span>
                  </div>
                )}

                {/* Specs Box */}
                <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 space-y-1.5 text-xs mb-3 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-sans">{t('available_qty')}:</span>
                    <strong className="text-white">{(p.quantity_kg || p.total_quantity || 0).toLocaleString()} kg</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-sans">{t('asking_price')}:</span>
                    <strong className="text-emerald-400 font-semibold text-sm">₹{p.expected_price_per_kg || p.asking_price || 0}/kg</strong>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-sans">{t('valuation_band')}:</span>
                    <span className="text-slate-400">₹{p.ai_recommended_min || (p.expected_price_per_kg || p.asking_price || 25) - 2} - ₹{p.ai_recommended_max || (p.expected_price_per_kg || p.asking_price || 25) + 3}/kg</span>
                  </div>
                </div>


                {/* Farmer & Location Info */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-500">Farmer:</span>
                      <span className="text-slate-200 font-medium">{p.farmer_name || 'Ramesh Patil'}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[150px]">{p.location}</span>
                    </div>
                  </div>

                  {/* Clickable Farmer Reputation Badge */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectFarmer({ id: p.farmer_id || 1, name: p.farmer_name || 'Ramesh Patil', role: 'FARMER' });
                    }}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-amber-400 text-[11px] font-mono transition cursor-pointer"
                    title="Click to view Farmer APMC Trust Score & Past Buyer Reviews"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold">4.9</span>
                    <span className="text-[10px] text-slate-500 font-sans">({t('verified')})</span>
                  </button>
                </div>

              </div>

              {/* Action Button */}
              <button
                onClick={() => handleOpenBid(p)}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('btn_place_bid')}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Place Bid Modal */}
      {selectedProduce && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Place Purchase Bid</h3>
                <span className="text-[11px] text-slate-400">Lot #{selectedProduce.id} • {selectedProduce.crop_name}</span>
              </div>
              <button onClick={() => setSelectedProduce(null)} className="text-slate-500 hover:text-white text-sm">✕</button>
            </div>

            {bidSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Bid Submitted to Farmer</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Farmer will receive your price offer and notification for acceptance and logistics pooling.
                </p>
                <button
                  onClick={() => setSelectedProduce(null)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitBid} className="space-y-3 text-xs">
                
                {selectedProduce.ai_vision_verified && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 flex items-center space-x-2 font-mono">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Certified Grade {selectedProduce.quality_grade} ({selectedProduce.ai_quality_score || 95}% Quality)</span>
                  </div>
                )}

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-mono">
                  <div className="flex justify-between text-slate-400 font-sans">
                    <span>Produce Lot:</span>
                    <strong className="text-white">{selectedProduce.crop_name} ({selectedProduce.variety || 'Standard'})</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span className="font-sans">Farmer Asking Rate:</span>
                    <strong className="text-slate-200 font-bold">₹{selectedProduce.expected_price_per_kg}/kg</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-sans">Your Bid Rate (₹/kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={bidPrice}
                      onChange={(e) => setBidPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-slate-700 text-sm font-bold text-emerald-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-sans">Quantity (kg)</label>
                    <input
                      type="number"
                      value={bidQty}
                      onChange={(e) => setBidQty(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-slate-700 text-sm font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-sans">Logistics & Payment Guarantee Note</label>
                  <textarea
                    rows="2"
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-slate-700"
                  />
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-right font-mono text-sm text-emerald-400">
                  <span className="text-slate-500 font-sans text-xs mr-2">Total Bid Amount:</span>
                  <strong>₹{(bidPrice * bidQty).toLocaleString('en-IN')}</strong>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProduce(null)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg"
                  >
                    Submit Purchase Bid
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Optical Assay Certificate Inspection Modal */}
      {inspectAssayProduce && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-700/60 max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">{t('optical_cert_title')}</h3>
                  <span className="text-[11px] text-slate-400">{t('optical_cert_sub')} • Lot #{inspectAssayProduce.id}</span>
                </div>
              </div>
              <button onClick={() => setInspectAssayProduce(null)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* Image Preview if available */}
              {inspectAssayProduce.image_url && (
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center max-h-56 shadow-inner">
                  <img
                    src={inspectAssayProduce.image_url}
                    alt="AI Optical Assay"
                    className="max-h-56 w-auto object-contain"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 font-mono">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-sans block">{t('certified_produce')}</span>
                  <strong className="text-white text-xs">{inspectAssayProduce.crop_name} ({inspectAssayProduce.variety || 'Standard'})</strong>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-sans block">{t('quality_grade')}</span>
                  <strong className="text-emerald-400 text-sm font-bold">Grade {inspectAssayProduce.quality_grade} ({inspectAssayProduce.ai_quality_score || 95}%)</strong>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-sans block">{t('ripeness_shelf_life')}</span>
                  <strong className="text-slate-200 text-xs">{inspectAssayProduce.ai_ripeness_stage || 'Optimal Table Ripe'}</strong>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-sans block">{t('moisture_ratio')}</span>
                  <strong className="text-cyan-400 text-xs">{inspectAssayProduce.moisture_content}% Tested</strong>
                </div>
              </div>

              {inspectAssayProduce.ai_inspection_notes && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-sans block mb-1">{t('optical_notes')}:</span>
                  <p className="text-slate-300 text-xs leading-relaxed">{inspectAssayProduce.ai_inspection_notes}</p>
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInspectAssayProduce(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium cursor-pointer"
                >
                  {t('btn_close')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const p = inspectAssayProduce;
                    setInspectAssayProduce(null);
                    handleOpenBid(p);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg cursor-pointer"
                >
                  {t('btn_bid_this_lot')}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Farmer Reputation Profile Modal */}
      {inspectFarmer && (
        <ReputationProfileModal
          isOpen={!!inspectFarmer}
          onClose={() => setInspectFarmer(null)}
          userId={inspectFarmer.id}
          userName={inspectFarmer.name}
          userRole={inspectFarmer.role}
        />
      )}

    </div>
  );
}
