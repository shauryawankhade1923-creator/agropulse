import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Layers, 
  Droplets, 
  MapPin, 
  Scale, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Camera,
  Scan,
  Sparkles,
  Award,
  ShieldCheck,
  Eye,
  RotateCw,
  X
} from 'lucide-react';
import { api } from '../../api';
import VisionQualityScannerModal from '../ai/VisionQualityScannerModal';
import { useLanguage } from '../../i18n/LanguageContext';

const POPULAR_CROPS = [
  { name: 'Apple', icon: '🍎', defaultVariety: 'Shimla Royal Delicious' },
  { name: 'Banana', icon: '🍌', defaultVariety: 'Robusta / Grand Naine' },
  { name: 'Mango', icon: '🥭', defaultVariety: 'Ratnagiri Alphonso Premium' },
  { name: 'Orange', icon: '🍊', defaultVariety: 'Nagpur Santra (Mandarin)' },
  { name: 'Tomato', icon: '🍅', defaultVariety: 'Abhinav Hybrid' },
  { name: 'Onion', icon: '🧅', defaultVariety: 'Garva Red Onion (Nashik Export)' },
  { name: 'Wheat', icon: '🌾', defaultVariety: 'Sharbati Premium Gold' },
  { name: 'Soybean', icon: '🌱', defaultVariety: 'JS-335 Certified' },
  { name: 'Potato', icon: '🥔', defaultVariety: 'Kufri Jyoti' },
  { name: 'Cotton', icon: '☁️', defaultVariety: 'BT Cotton Long Staple' }
];

export default function ProduceListingWizard({ onProduceCreated, onNavigateMatching }) {
  const { t, language } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState(POPULAR_CROPS[4]); // Default to Tomato or first
  const [variety, setVariety] = useState(POPULAR_CROPS[4].defaultVariety);
  const [quantityKg, setQuantityKg] = useState(2500);
  const [qualityGrade, setQualityGrade] = useState('A');
  const [moisture, setMoisture] = useState(11.2);
  const [expectedPrice, setExpectedPrice] = useState(28.0);
  const [location, setLocation] = useState('Pimpalgaon Baswant, Nashik, Maharashtra');
  const [notes, setNotes] = useState('Cleaned and sun-dried export-quality batch.');

  // AI Vision Assay state attached to listing
  const [aiAssay, setAiAssay] = useState(null);

  const [aiPricing, setAiPricing] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Fetch AI Price whenever input parameters change
  useEffect(() => {
    let isCancelled = false;
    async function fetchAiPrice() {
      setLoadingAi(true);
      try {
        const res = await api.getPriceRecommendation({
          crop_name: selectedCrop.name,
          variety: variety,
          quantity_kg: Number(quantityKg) || 1000,
          quality_grade: qualityGrade,
          location: location,
          moisture_content: Number(moisture) || 12.0,
          season: 'Kharif'
        });
        if (!isCancelled) {
          setAiPricing(res);
          setExpectedPrice(res.recommended_target_per_kg);
        }
      } catch (err) {
        console.error('Pricing calculation error:', err);
      } finally {
        if (!isCancelled) setLoadingAi(false);
      }
    }

    const timer = setTimeout(fetchAiPrice, 300);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [selectedCrop.name, variety, quantityKg, qualityGrade, moisture, location]);

  const handleSelectCrop = (crop) => {
    setSelectedCrop(crop);
    setVariety(crop.defaultVariety);
  };

  const handleApplyVisionData = (data) => {
    setAiAssay(data);
    if (data.fruit) {
      const matched = POPULAR_CROPS.find(c => c.name.toLowerCase() === data.fruit.toLowerCase());
      if (matched) {
        setSelectedCrop(matched);
        if (data.variety) setVariety(data.variety);
        else setVariety(matched.defaultVariety);
      }
    }
    if (data.grade) setQualityGrade(data.grade);
    if (data.moisture) setMoisture(data.moisture);
    if (data.notes) setNotes(data.notes);
  };

  const handleSubmitProduce = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);
    try {
      const created = await api.createProduce({
        farmer_id: 1,
        crop_name: selectedCrop.name,
        variety: variety,
        quantity_kg: Number(quantityKg),
        expected_price_per_kg: Number(expectedPrice),
        quality_grade: qualityGrade,
        moisture_content: Number(moisture),
        location: location,
        lat: 20.1691,
        lon: 73.9877,
        notes: notes,
        ai_vision_verified: !!aiAssay,
        ai_quality_score: aiAssay ? aiAssay.score : 90.0,
        ai_ripeness_stage: aiAssay ? aiAssay.ripeness : 'Optimal Table Ripe',
        ai_inspection_notes: aiAssay ? aiAssay.notes : notes,
        image_url: aiAssay ? aiAssay.annotatedImage : null
      });

      setSuccessMessage(`Produce Lot #${created.id} (${created.crop_name} Grade ${created.quality_grade}) Listed Successfully`);
      if (onProduceCreated) onProduceCreated(created);
    } catch (err) {
      alert('Error creating produce: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
              {t('selling_header_sub')}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              {t('selling_header_title')}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              {t('selling_header_desc')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>📷 {t('btn_run_ai_scan')}</span>
          </button>
        </div>
      </div>

      {/* Hero: AI Vision Quality Assay Card (Step 1 in Selling) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-800/40 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Scan className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold font-mono tracking-wider">
                  {t('hero_step1_badge')}
                </span>
                {aiAssay && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold font-mono">
                    {t('hero_verified_badge')}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                {t('hero_ai_title')}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                {t('hero_ai_desc')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {aiAssay ? (
              <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-emerald-700/50 text-xs">
                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-400 block font-sans">Certified Lot</span>
                  <strong className="text-emerald-400 font-bold">{aiAssay.fruit} Grade {aiAssay.grade}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Re-scan produce"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>{t('btn_snap_upload_autofill')}</span>
              </button>
            )}
          </div>

        </div>

        {/* Live Attached AI Certificate HUD Strip */}
        {aiAssay && (
          <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center space-x-2.5">
              <span className="text-2xl">{selectedCrop.icon}</span>
              <div>
                <span className="text-[10px] text-slate-500 font-sans block">Detected Produce</span>
                <strong className="text-white text-xs">{aiAssay.fruit}</strong>
              </div>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-sans block">Quality Score</span>
              <strong className="text-emerald-400 text-sm font-bold">{aiAssay.score}%</strong>
              <span className="text-[10px] text-slate-400 font-sans block">Grade {aiAssay.grade} Certified</span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-sans block">Maturity Stage</span>
              <strong className="text-slate-200 text-xs truncate block">{aiAssay.ripeness || 'Optimal Table Ripe'}</strong>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-sans block">Mandi Valuation Multiplier</span>
              <strong className="text-amber-400 text-sm">{aiAssay.priceMultiplier || 1.05}x</strong>
              <span className="text-[10px] text-emerald-400 font-sans block">Premium Quality Payout</span>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Form & Analysis Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
            2. {t('spec_title')}
          </h2>

          <form onSubmit={handleSubmitProduce} className="space-y-4">
            
            {/* Quick Crop Selector Pills */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                {t('select_crop_label')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {POPULAR_CROPS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleSelectCrop(c)}
                    className={`flex items-center space-x-2 p-2.5 rounded-lg border text-xs font-medium transition ${
                      selectedCrop.name === c.name
                        ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base">{c.icon}</span>
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Variety & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {t('variety_label')}
                </label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-600"
                  placeholder="e.g. Abhinav Hybrid, Sharbati"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {t('location_label')}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-slate-600"
                    placeholder="e.g. Pimpalgaon, Nashik"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Quantity & Expected Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {t('weight_label')}
                </label>
                <div className="relative">
                  <Scale className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-slate-600"
                    required
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block font-mono">
                  ≈ {(quantityKg / 100).toFixed(1)} Quintals ({(quantityKg / 1000).toFixed(2)} MT)
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {t('asking_rate_label')}
                </label>
                <div className="relative">
                  <span className="text-slate-500 font-medium absolute left-3 top-2 text-sm">₹</span>
                  <input
                    type="number"
                    step="0.5"
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-emerald-400 font-bold font-mono focus:outline-none focus:border-slate-600"
                    required
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block font-mono">
                  {t('lot_valuation_label')}: ₹{(quantityKg * expectedPrice).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Quality Grade & Moisture */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-400">
                    {t('quality_grade_label')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                    title="Scan crop photo using Computer Vision to auto-determine grade & moisture"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>AI Optical Scan</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {['A', 'B', 'C'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setQualityGrade(g)}
                      className={`py-2 rounded-lg border text-xs font-semibold transition ${
                        qualityGrade === g
                          ? 'bg-emerald-950 border-emerald-600 text-emerald-300 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      Grade {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {t('moisture_label')}
                </label>
                <div className="relative">
                  <Droplets className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="30"
                    value={moisture}
                    onChange={(e) => setMoisture(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-slate-600"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {t('notes_label')}
              </label>
              <textarea
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-600"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center space-x-2 transition disabled:opacity-50 text-xs sm:text-sm cursor-pointer"
              >
                {submitting ? (
                  <span>{t('btn_publishing')}</span>
                ) : (
                  <>
                    <span>{t('btn_confirm_list')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {successMessage && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-lg flex items-center justify-between text-emerald-400 text-xs">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={onNavigateMatching}
                  className="font-semibold underline ml-2 hover:text-emerald-300 shrink-0"
                >
                  {t('btn_view_matched')}
                </button>
              </div>
            )}

          </form>
        </div>

        {/* Right Column: Price Benchmark Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-white">{t('pricing_valuation_title')}</h3>
                <span className="text-[11px] text-slate-400">{t('statistical_model')}</span>
              </div>

              {loadingAi && (
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  Calculating...
                </span>
              )}
            </div>

            {aiPricing ? (
              <div className="space-y-4">
                
                {/* Price Range Target Callout */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-center shadow-inner">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
                    {t('fair_market_band')}
                  </span>
                  <div className="flex items-center justify-center space-x-1.5 my-2">
                    <span className="text-2xl sm:text-3xl font-bold text-white font-mono">
                      ₹{aiPricing.recommended_min_per_kg} – ₹{aiPricing.recommended_max_per_kg}
                    </span>
                    <span className="text-xs text-slate-500">/ kg</span>
                  </div>
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-900 text-slate-300 text-xs border border-slate-800">
                    <span>{t('target_fair_value')}:</span>
                    <strong className="text-emerald-400 font-mono">₹{aiPricing.recommended_target_per_kg}/kg</strong>
                  </div>
                </div>

                {/* Mandi & MSP Benchmarks */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block mb-1 text-[11px]">{t('gov_msp')}</span>
                    <strong className="text-amber-400 text-sm font-mono">
                      ₹{aiPricing.msp_price_per_kg}/kg
                    </strong>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block mb-1 text-[11px]">{t('mandi_7d_avg')}</span>
                    <strong className="text-slate-200 text-sm font-mono">
                      ₹{aiPricing.historical_avg_per_kg}/kg
                    </strong>
                  </div>
                </div>

                {/* Factor Breakdown */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                    {t('factor_adjustments')}
                  </h4>
                  
                  <div className="space-y-2">
                    {aiPricing.factors.map((f, idx) => (
                      <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-slate-300 font-medium">{f.factor_name}</span>
                          <span className={`font-mono font-semibold ${
                            f.impact_pct > 0 ? 'text-emerald-400' : (f.impact_pct < 0 ? 'text-rose-400' : 'text-slate-400')
                          }`}>
                            {f.impact_pct > 0 ? `+${f.impact_pct}%` : `${f.impact_pct}%`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{f.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Market Insights */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 flex items-start space-x-2">
                  <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <p>{aiPricing.market_insights}</p>
                </div>

              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Select parameters to calculate valuation.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* AI Computer Vision Quality Scanner Modal */}
      {isScannerOpen && (
        <VisionQualityScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          initialCropName={selectedCrop.name}
          onApplyGrade={handleApplyVisionData}
        />
      )}

    </div>
  );
}

