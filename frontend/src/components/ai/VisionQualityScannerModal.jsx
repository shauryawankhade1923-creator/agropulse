import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Layers, 
  Eye, 
  Award, 
  RotateCw, 
  FileText, 
  Cpu, 
  Check, 
  Scan,
  Zap,
  TrendingUp,
  Droplets,
  ShieldCheck,
  Tag,
  Clock,
  Sparkle
} from 'lucide-react';
import { api } from '../../api';
import { useLanguage } from '../../i18n/LanguageContext';

export default function VisionQualityScannerModal({
  isOpen,
  onClose,
  initialCropName = 'Auto-Detect',
  onApplyGrade
}) {
  if (!isOpen) return null;

  const { t, language } = useLanguage();
  const [cropName, setCropName] = useState(initialCropName || 'Auto-Detect');
  const [activeTab, setActiveTab] = useState('samples'); // 'samples', 'upload', 'camera'
  const [samples, setSamples] = useState([]);
  const [selectedSampleKey, setSelectedSampleKey] = useState('apple_grade_a');
  const [customImageBase64, setCustomImageBase64] = useState(null);
  
  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Analysis states
  const [analyzing, setAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Fetch sample specimens on mount
  useEffect(() => {
    api.getSampleSpecimens()
      .then(data => {
        setSamples(data || []);
        if (data && data.length > 0) {
          if (cropName && cropName !== 'Auto-Detect') {
            const match = data.find(s => s.crop_name.toLowerCase() === cropName.toLowerCase());
            if (match) setSelectedSampleKey(match.key);
            else setSelectedSampleKey(data[0].key);
          } else {
            setSelectedSampleKey(data[0].key);
          }
        }
      })
      .catch(err => console.error('Failed to load sample specimens:', err));
  }, [cropName]);

  // Clean up camera stream on unmount or tab change
  useEffect(() => {
    if (activeTab !== 'camera' && isCameraActive) {
      stopCamera();
    }
  }, [activeTab]);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setErrorMsg('Camera access is not available or blocked in browser. Please use Photo Upload or Sample Specimen mode.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 400;
    canvas.height = video.videoHeight || 400;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCustomImageBase64(dataUrl);
    stopCamera();
    runScanAnalysis({ image_base64: dataUrl, crop_name: cropName, auto_detect_produce: true });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = () => {
      setCustomImageBase64(reader.result);
      runScanAnalysis({ image_base64: reader.result, crop_name: cropName, auto_detect_produce: true });
    };
    reader.readAsDataURL(file);
  };

  const runScanAnalysis = async (payload) => {
    setAnalyzing(true);
    setErrorMsg(null);
    setScanResult(null);

    try {
      const res = await api.gradeProduceImage({
        ...payload,
        auto_detect_produce: true
      });
      // Add slight delay for scan laser visual feedback
      setTimeout(() => {
        setScanResult(res);
        setAnalyzing(false);
      }, 750);
    } catch (err) {
      setErrorMsg(err.message || 'Analysis failed. Please try again.');
      setAnalyzing(false);
    }
  };

  const handleRunSampleScan = (sampleKey) => {
    setSelectedSampleKey(sampleKey);
    const sample = samples.find(s => s.key === sampleKey);
    const sampleCrop = sample ? sample.crop_name : 'Auto-Detect';
    setCustomImageBase64(null);
    runScanAnalysis({ sample_key: sampleKey, crop_name: sampleCrop, auto_detect_produce: true });
  };

  const handleApply = () => {
    if (!scanResult) return;
    if (onApplyGrade) {
      onApplyGrade({
        fruit: scanResult.detected_fruit_or_crop,
        grade: scanResult.predicted_grade,
        moisture: scanResult.estimated_moisture_pct,
        notes: `AI CV Assay: ${scanResult.detected_fruit_or_crop} Grade ${scanResult.predicted_grade} (${scanResult.overall_quality_score}% Quality, ${scanResult.ripeness_stage})`,
        score: scanResult.overall_quality_score,
        priceMultiplier: scanResult.price_multiplier,
        variety: scanResult.variety_detected
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-750 max-w-3xl w-full rounded-2xl shadow-2xl overflow-hidden my-auto space-y-0 text-slate-200">
        
        {/* Top Gradient Banner */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-500" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold tracking-wider font-mono">
                  COMPUTER VISION: FRUIT DETECTION & QUALITY ASSAY
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                AI Fruit Identification & AGMARK Grade Model
              </h2>
            </div>
          </div>

          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Crop Mode & Input Mode Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            
            {/* Detection Mode */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-medium">Detection Mode:</span>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-750 text-emerald-400 font-semibold font-mono">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Auto-Detect Fruit & Quality</span>
              </div>
            </div>

            {/* Input Mode Tabs */}
            <div className="flex items-center space-x-1.5 text-xs bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => { stopCamera(); setActiveTab('samples'); }}
                className={`px-3 py-1 rounded-md transition font-medium ${
                  activeTab === 'samples'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Fruit & Crop Gallery
              </button>
              <button
                type="button"
                onClick={() => { stopCamera(); setActiveTab('upload'); }}
                className={`px-3 py-1 rounded-md transition font-medium ${
                  activeTab === 'upload'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Upload Photo
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('camera'); startCamera(); }}
                className={`px-3 py-1 rounded-md transition font-medium flex items-center space-x-1 ${
                  activeTab === 'camera'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Live Camera</span>
              </button>
            </div>

          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tab 1: Multi-Fruit Sample Gallery */}
          {activeTab === 'samples' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Select a fruit or agricultural produce specimen to run AI Computer Vision detection & grading:</span>
                <span className="font-mono text-emerald-400">{samples.length} fruits & crops</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {samples.map((s) => {
                  const isSelected = selectedSampleKey === s.key;
                  return (
                    <div
                      key={s.key}
                      onClick={() => handleRunSampleScan(s.key)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-emerald-950/40 border-emerald-600 shadow-md shadow-emerald-950/30' 
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">
                            {s.thumbnail_icon || (s.crop_name === 'Tomato' ? '🍅' : s.crop_name === 'Onion' ? '🧅' : s.crop_name === 'Apple' ? '🍎' : s.crop_name === 'Banana' ? '🍌' : s.crop_name === 'Mango' ? '🥭' : '🥔')}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                            s.expected_grade === 'A' 
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                              : (s.expected_grade === 'B' 
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800' 
                                  : 'bg-rose-950 text-rose-400 border border-rose-800')
                          }`}>
                            Grade {s.expected_grade || 'A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-cyan-400 font-mono uppercase font-bold block">
                            {s.fruit_category || 'PRODUCE'}
                          </span>
                          <h4 className="text-xs font-bold text-white line-clamp-1">{s.title || s.crop_name}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{s.description}</p>
                      </div>

                      <button
                        type="button"
                        className={`mt-2 w-full py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {isSelected ? '✓ Analyzed' : 'Detect & Grade'}
                      </button>
                    </div>

                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Upload Photo */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-750 hover:border-emerald-500/60 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-slate-950/60 group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-full bg-emerald-950/50 border border-emerald-800 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-white mt-3">
                  Upload Any Fruit or Harvest Photo
                </h4>
                <p className="text-xs text-slate-400 mt-1 text-center max-w-sm">
                  Drag and drop a photo or click to browse. The AI Computer Vision model will automatically detect the fruit type (Apple, Banana, Mango, Tomato, Orange, Onion, etc.) and assess its quality grade!
                </p>
                <span className="mt-3 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-mono">
                  Formats: JPEG, PNG, WebP
                </span>
              </label>

              {customImageBase64 && (
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center space-x-3">
                    <img
                      src={customImageBase64}
                      alt="Uploaded produce"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                    />
                    <div>
                      <span className="text-white font-semibold block">Custom Produce Photo</span>
                      <span className="text-slate-400 text-[11px]">Ready for automated fruit detection & quality grading</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => runScanAnalysis({ image_base64: customImageBase64, crop_name: 'Auto-Detect', auto_detect_produce: true })}
                    disabled={analyzing}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition disabled:opacity-50"
                  >
                    {analyzing ? 'Detecting...' : 'Re-run Detection & Scan'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Live Camera Viewfinder */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden aspect-video flex items-center justify-center max-h-72">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Viewfinder Target Reticle */}
                <div className="absolute inset-8 border border-emerald-500/40 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <span className="w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                    <span className="w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                  </div>
                  <div className="text-center font-mono text-[10px] text-emerald-400 bg-slate-950/80 py-0.5 px-2 rounded self-center">
                    CENTER ANY FRUIT OR CROP IN FRAME
                  </div>
                  <div className="flex justify-between">
                    <span className="w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                    <span className="w-3 h-3 border-b-2 border-r-2 border-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-2">
                <button
                  type="button"
                  onClick={captureCameraFrame}
                  disabled={!isCameraActive || analyzing}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg transition disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Photo & Detect Fruit Quality</span>
                </button>
              </div>
            </div>
          )}

          {/* Scanning In-Progress Animation */}
          {analyzing && (
            <div className="py-12 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-2xl bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-400 animate-pulse">
                  <Scan className="w-10 h-10" />
                </div>
                <div className="absolute inset-0 border-2 border-emerald-400/80 rounded-2xl animate-ping opacity-25" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">Detecting Fruit Type & Optical Features...</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Classifying produce category (Apple, Banana, Mango, Tomato, etc.), extracting HSV color spectrum, detecting skin blemishes, and grading AGMARK quality.
                </p>
              </div>
            </div>
          )}

          {/* Results Showcase Section */}
          {scanResult && !analyzing && (
            <div className="space-y-4 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800">
              
              {/* AI Fruit Detection Banner */}
              <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 rounded-xl border border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl shadow-inner">
                    {scanResult.produce_icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold font-mono uppercase">
                        {scanResult.fruit_category} DETECTED
                      </span>
                      <span className="text-[11px] text-emerald-400 font-mono font-bold">
                        {intConfidence(scanResult.fruit_detection_confidence)}% AI Confidence
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-white mt-0.5">
                      {scanResult.detected_fruit_or_crop} • <span className="text-slate-300 font-normal">{scanResult.variety_detected}</span>
                    </h3>
                  </div>
                </div>

                {/* Ripeness Badge */}
                <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-xs font-mono">
                  <span className="text-[10px] text-slate-500 font-sans block">Maturity & Ripeness</span>
                  <span className="text-emerald-400 font-bold block">{scanResult.ripeness_stage}</span>
                </div>
              </div>

              {/* Top Result Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
                
                {/* Visual Image with Optical Annotations */}
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  {scanResult.analyzed_image_base64 && (
                    <div className="relative rounded-xl overflow-hidden border-2 border-slate-700 w-28 h-28 shrink-0 shadow-lg">
                      <img
                        src={scanResult.analyzed_image_base64}
                        alt="Analyzed produce"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 right-1 bg-slate-950/90 text-emerald-400 font-mono text-[9px] px-1.5 py-0.2 rounded border border-emerald-800">
                        AI CV HUD
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Standard Quality Certification
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {scanResult.agmark_standard_summary}
                    </h4>
                    <p className="text-[11px] text-slate-400 italic">
                      "{scanResult.classification_reasoning}"
                    </p>
                  </div>
                </div>

                {/* Grade Badge */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-center min-w-36 shrink-0 font-mono">
                  <span className="text-[10px] text-slate-500 font-sans uppercase block font-semibold">
                    AGMARK Quality Grade
                  </span>
                  <div className={`text-2xl font-black my-0.5 ${
                    scanResult.predicted_grade.includes('A') 
                      ? 'text-emerald-400' 
                      : (scanResult.predicted_grade === 'B' ? 'text-amber-400' : 'text-rose-400')
                  }`}>
                    Grade {scanResult.predicted_grade}
                  </div>
                  <span className="text-[11px] text-slate-300 font-sans block">
                    {scanResult.overall_quality_score}% Quality Score
                  </span>
                </div>

              </div>

              {/* Multi-Factor Radar Metrics Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Optical Feature Quality Breakdown</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-sans">Surface Integrity</span>
                    <strong className="text-white text-sm">{scanResult.visual_scores?.surface_integrity || 98}%</strong>
                    <div className="w-full bg-slate-950 h-1 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full" 
                        style={{ width: `${scanResult.visual_scores?.surface_integrity || 98}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-sans">Color Uniformity</span>
                    <strong className="text-white text-sm">{scanResult.visual_scores?.color_uniformity || 96}%</strong>
                    <div className="w-full bg-slate-950 h-1 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full" 
                        style={{ width: `${scanResult.visual_scores?.color_uniformity || 96}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-sans">Size Symmetry</span>
                    <strong className="text-white text-sm">{scanResult.visual_scores?.size_consistency || scanResult.visual_scores?.size_conformity || 97}%</strong>
                    <div className="w-full bg-slate-950 h-1 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full" 
                        style={{ width: `${scanResult.visual_scores?.size_consistency || scanResult.visual_scores?.size_conformity || 97}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-sans">Inferred Moisture</span>
                    <strong className="text-emerald-400 text-sm">{scanResult.estimated_moisture_pct || 10.8}%</strong>
                    <span className="text-[9px] text-slate-500 font-sans block mt-1">Optical Skin Elasticity</span>
                  </div>
                </div>
              </div>

              {/* Detected Defects & Price Multiplier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* Detected Blemishes */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">
                    Defect & Blemish Analysis
                  </span>
                  {(!scanResult.defects_detected || scanResult.defects_detected.length === 0) ? (
                    <div className="text-emerald-400 text-[11px] flex items-center space-x-1 py-1 font-sans">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Zero visual lesions or surface blemishes detected (Export Quality)</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {scanResult.defects_detected.map((d, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                          <span className="text-slate-300">{d.defect_type || 'Minor Blemish'}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                            d.severity === 'Low' ? 'bg-amber-950 text-amber-300' : 'bg-rose-950 text-rose-300'
                          }`}>
                            {d.severity || 'Low'} Severity
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mandi Rate Impact */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5 font-mono">
                  <span className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider font-sans">
                    Mandi Valuation Adjustment
                  </span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-sans">Quality Multiplier:</span>
                    <strong className="text-white">{scanResult.price_multiplier || 1.14}x</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-sans">Rate Adjustment:</span>
                    <strong className={`font-bold ${
                      (scanResult.suggested_price_adjustment_pct || 14) > 0 
                        ? 'text-emerald-400' 
                        : ((scanResult.suggested_price_adjustment_pct || 14) < 0 ? 'text-rose-400' : 'text-slate-300')
                    }`}>
                      {(scanResult.suggested_price_adjustment_pct || 14) > 0 ? `+${scanResult.suggested_price_adjustment_pct || 14}%` : `${scanResult.suggested_price_adjustment_pct || 14}%`}
                    </strong>
                  </div>
                  <p className="text-[10px] text-slate-500 font-sans italic pt-1">
                    "{scanResult.inspection_notes || scanResult.classification_reasoning || 'AGMARK Grade A Standard'}"
                  </p>
                </div>

              </div>


            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => { stopCamera(); onClose(); }}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
          >
            Cancel
          </button>

          {scanResult ? (
            <button
              type="button"
              onClick={handleApply}
              className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-emerald-950/40 transition"
            >
              <Check className="w-4 h-4" />
              <span>Apply {scanResult.detected_fruit_or_crop} (Grade {scanResult.predicted_grade}) to Lot</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleRunSampleScan(selectedSampleKey)}
              disabled={analyzing}
              className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{analyzing ? 'Detecting...' : 'Detect Fruit Type & Quality'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

function intConfidence(val) {
  if (!val) return 96;
  if (val <= 1.0) return Math.round(val * 100);
  return Math.round(val);
}
