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
  ShieldCheck, 
  Clock, 
  Truck, 
  RefreshCw, 
  Radio, 
  Sliders, 
  Activity,
  ArrowRight,
  TrendingUp,
  Volume2,
  Zap,
  Check,
  Building2,
  Navigation
} from 'lucide-react';
import { api } from '../../api';
import { useLanguage } from '../../i18n/LanguageContext';

export default function RealTimeQueueVisionModal({
  isOpen,
  onClose,
  centerId = 1,
  onApplyReroute
}) {
  if (!isOpen) return null;

  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('cctv_feeds'); // 'cctv_feeds', 'upload', 'live_cam'
  const [cctvSamples, setCctvSamples] = useState([]);
  const [selectedSampleKey, setSelectedSampleKey] = useState('nashik_morning_rush');
  const [customImageBase64, setCustomImageBase64] = useState(null);

  // Live Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Analysis & Telemetry states
  const [analyzing, setAnalyzing] = useState(false);
  const [queueResult, setQueueResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);
  const [activeCountersCount, setActiveCountersCount] = useState(4);

  // Fetch CCTV sample presets on mount
  useEffect(() => {
    api.getCCTVQueueSamples()
      .then(data => {
        setCctvSamples(data || []);
        if (data && data.length > 0) {
          setSelectedSampleKey(data[0].key);
          runQueueAnalysis({ sample_key: data[0].key });
        }
      })
      .catch(err => console.error('Failed to load CCTV queue samples:', err));
  }, []);

  // Cleanup camera stream
  useEffect(() => {
    if (activeTab !== 'live_cam' && isCameraActive) {
      stopCamera();
    }
  }, [activeTab]);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setErrorMsg('Camera access is not available in browser. Using verified APMC CCTV camera feeds.');
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
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCustomImageBase64(dataUrl);
    stopCamera();
    runQueueAnalysis({ image_base64: dataUrl, center_id: centerId, active_counters: activeCountersCount });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = () => {
      setCustomImageBase64(reader.result);
      runQueueAnalysis({ image_base64: reader.result, center_id: centerId, active_counters: activeCountersCount });
    };
    reader.readAsDataURL(file);
  };

  const runQueueAnalysis = async (payload) => {
    setAnalyzing(true);
    setErrorMsg(null);
    setActionSuccessMsg(null);

    try {
      const res = await api.detectQueueVision({
        ...payload,
        center_id: centerId,
        active_counters: activeCountersCount
      });
      // Short visual delay for radar sweep animation
      setTimeout(() => {
        setQueueResult(res);
        setAnalyzing(false);
      }, 600);
    } catch (err) {
      setErrorMsg(err.message || 'Queue vision analysis failed. Please try again.');
      setAnalyzing(false);
    }
  };

  const handleSelectSample = (sampleKey) => {
    setSelectedSampleKey(sampleKey);
    setCustomImageBase64(null);
    runQueueAnalysis({ sample_key: sampleKey, center_id: centerId, active_counters: activeCountersCount });
  };

  const handleTriggerOverflowWeighbridge = () => {
    setActiveCountersCount(4);
    setActionSuccessMsg('Emergency Overflow Weighbridge Counter #4 activated! Ingress queue diverted & throughput increased by 25%.');
    if (queueResult) {
      runQueueAnalysis({
        sample_key: selectedSampleKey,
        image_base64: customImageBase64,
        center_id: centerId,
        active_counters: 4
      });
    }
  };

  const handleVoiceBroadcast = () => {
    if (!queueResult) return;
    if ('speechSynthesis' in window) {
      const text = `Attention all incoming drivers at ${queueResult.cctv_feed_name}. ${queueResult.load_balancing_recommendation}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
      setActionSuccessMsg('Gate public address audio announcement broadcasted to drivers.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-750 max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden my-auto space-y-0 text-slate-200">
        
        {/* Top Header Glow Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-500" />

        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/70 border border-blue-700/60 flex items-center justify-center text-blue-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-bold tracking-wider font-mono">
                  COMPUTER VISION: REAL-TIME QUEUE DETECTION
                </span>
                <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>LIVE CCTV</span>
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {t('queue_vision_title')}
              </h2>
            </div>
          </div>

          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          
          {/* CCTV Feed Selector Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            
            {/* Feed Mode */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-medium">Camera Feed Source:</span>
              <div className="flex items-center space-x-1.5 text-xs bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => { stopCamera(); setActiveTab('cctv_feeds'); }}
                  className={`px-3 py-1 rounded-md transition font-medium ${
                    activeTab === 'cctv_feeds'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  APMC CCTV Presets ({cctvSamples.length})
                </button>
                <button
                  type="button"
                  onClick={() => { stopCamera(); setActiveTab('upload'); }}
                  className={`px-3 py-1 rounded-md transition font-medium ${
                    activeTab === 'upload'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Upload Gate Photo
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('live_cam'); startCamera(); }}
                  className={`px-3 py-1 rounded-md transition font-medium flex items-center space-x-1 ${
                    activeTab === 'live_cam'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Gate Webcam</span>
                </button>
              </div>
            </div>

            {/* AI Bounding Box & Refresh Controls */}
            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center space-x-1.5 transition ${
                  showBoundingBoxes 
                    ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' 
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
                title="Toggle AI CV entity bounding boxes"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>AI HUD: {showBoundingBoxes ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => runQueueAnalysis({ sample_key: selectedSampleKey, image_base64: customImageBase64 })}
                disabled={analyzing}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 transition"
                title="Re-run Computer Vision Detection"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin text-blue-400' : ''}`} />
              </button>
            </div>

          </div>

          {/* Error & Success Banners */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {actionSuccessMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-start space-x-2 shadow-sm animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
          )}

          {/* TAB 1: APMC CCTV Camera Feeds Gallery */}
          {activeTab === 'cctv_feeds' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {cctvSamples.map((s) => {
                const isSelected = selectedSampleKey === s.key && !customImageBase64;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => handleSelectSample(s.key)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-950/50 border-blue-600 shadow-md shadow-blue-950/30' 
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-blue-400 font-bold uppercase">{(s.key || 'CCTV_BAY').replace(/_/g, ' ')}</span>
                        <span className="px-1 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          {(s.tractors_count || 0) + (s.trucks_count || 0) + (s.tempos_count || 0)} Veh
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white line-clamp-1">{s.title}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{s.description}</p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>🚜 {s.tractors_count} Tractors</span>
                      <span className={isSelected ? 'text-blue-400 font-bold' : 'text-slate-500'}>
                        {isSelected ? '✓ Active' : 'Switch'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: Upload Photo */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <label className="border-2 border-dashed border-slate-750 hover:border-blue-500/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-slate-950/60 group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-blue-950/50 border border-blue-800 text-blue-400 flex items-center justify-center group-hover:scale-110 transition">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-white mt-2">
                  Upload Live APMC Gate / Weighbridge Snapshot
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 text-center max-w-sm">
                  The AI Computer Vision model will automatically detect vehicle bounds, count tractors vs trucks, and assess queue congestion index!
                </p>
              </label>
            </div>
          )}

          {/* TAB 3: Live Camera Viewfinder */}
          {activeTab === 'live_cam' && (
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
                <div className="absolute inset-6 border border-blue-500/40 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <span className="w-3 h-3 border-t-2 border-l-2 border-blue-400" />
                    <span className="w-3 h-3 border-t-2 border-r-2 border-blue-400" />
                  </div>
                  <div className="text-center font-mono text-[10px] text-blue-400 bg-slate-950/80 py-0.5 px-2 rounded self-center">
                    AIM AT INCOMING WEIGHBRIDGE OR GATE LANE
                  </div>
                  <div className="flex justify-between">
                    <span className="w-3 h-3 border-b-2 border-l-2 border-blue-400" />
                    <span className="w-3 h-3 border-b-2 border-r-2 border-blue-400" />
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={captureCameraFrame}
                  disabled={!isCameraActive || analyzing}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg transition disabled:opacity-50 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Gate Frame & Analyze Queue</span>
                </button>
              </div>
            </div>
          )}

          {/* Main Visual Display & Telemetry Card */}
          {queueResult && (
            <div className="space-y-4">
              
              {/* CCTV Feed Display & Hero HUD */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-slate-750 bg-slate-950 shadow-2xl">
                
                {/* Image View */}
                <div className="relative aspect-video max-h-[340px] w-full flex items-center justify-center bg-slate-950 overflow-hidden">
                  <img
                    src={showBoundingBoxes && queueResult.analyzed_cctv_frame_base64 ? queueResult.analyzed_cctv_frame_base64 : (customImageBase64 || cctvSamples.find(s => s.key === selectedSampleKey)?.image_base64)}
                    alt="AI CCTV Queue Feed"
                    className="w-full h-full object-cover"
                  />

                  {/* Scanning Radar Wave Effect while analyzing */}
                  {analyzing && (
                    <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-blue-900/80 border-2 border-blue-400 flex items-center justify-center text-blue-300 animate-pulse">
                        <Activity className="w-7 h-7 animate-spin" />
                      </div>
                      <div className="font-mono text-xs text-blue-300 font-bold bg-slate-950/80 px-3 py-1 rounded-full border border-blue-700">
                        DETECTING TRACTORS & WEIGHBRIDGE LANES...
                      </div>
                    </div>
                  )}

                  {/* Live Feed Status Tag */}
                  <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-sm border border-slate-800 rounded-lg p-2 text-xs font-mono flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    <span className="text-white font-bold">{queueResult.cctv_feed_name}</span>
                    <span className="text-slate-500">• {queueResult.timestamp}</span>
                  </div>

                  {/* Congestion Level Pill */}
                  <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-sm border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400 font-sans">{t('congestion_status')}:</span>
                    <strong style={{ color: queueResult.congestion_color_hex }}>
                      {queueResult.congestion_label}
                    </strong>
                  </div>
                </div>

              </div>

              {/* 4-Metric Real-Time KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                
                {/* 1. Vehicles Detected */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-sans uppercase block">{t('detected_vehicles')}</span>
                  <div className="text-2xl font-bold text-white flex items-baseline space-x-1">
                    <span>{queueResult.total_vehicles_detected}</span>
                    <span className="text-xs text-slate-400 font-sans">units</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-sans">
                    🚜 {queueResult.entity_breakdown.tractors} Tractors • 🚛 {queueResult.entity_breakdown.heavy_trucks} Trucks
                  </div>
                </div>

                {/* 2. Queue Density % */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-sans uppercase block">{t('queue_density')}</span>
                  <div className="text-2xl font-bold" style={{ color: queueResult.congestion_color_hex }}>
                    {queueResult.queue_density_percentage}%
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${queueResult.queue_density_percentage}%`,
                        backgroundColor: queueResult.congestion_color_hex 
                      }}
                    />
                  </div>
                </div>

                {/* 3. Estimated Wait Time */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-sans uppercase block">{t('est_wait')}</span>
                  <div className="text-2xl font-bold text-amber-400 flex items-baseline space-x-1">
                    <span>~{queueResult.estimated_wait_minutes}</span>
                    <span className="text-xs text-slate-400 font-sans">mins</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">
                    Conf: {queueResult.confidence_interval}
                  </div>
                </div>

                {/* 4. Queue Lane Distance */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-sans uppercase block">{t('lane_distance')}</span>
                  <div className="text-2xl font-bold text-cyan-400 flex items-baseline space-x-1">
                    <span>{queueResult.queue_length_meters}</span>
                    <span className="text-xs text-slate-400 font-sans">m</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">
                    👥 {queueResult.entity_breakdown.farmers_pedestrians} Farmers in queue
                  </div>
                </div>

              </div>

              {/* AI Smart Weighbridge Counter Load Balancing Section */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Navigation className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      {t('smart_routing_title')}
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">4 Active Weighbridges</span>
                </div>

                {/* Counter Load Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {queueResult.active_counters_status.map((c) => (
                    <div 
                      key={c.counter_id}
                      className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold">{c.counter_name}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          c.status === 'IDLE' 
                            ? 'bg-slate-800 text-slate-300' 
                            : (c.status === 'LOW_LOAD' 
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                                : (c.status === 'OPTIMAL' 
                                    ? 'bg-blue-950 text-blue-400 border border-blue-800' 
                                    : 'bg-amber-950 text-amber-400 border border-amber-800'))
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Queued:</span>
                        <strong className="text-white">{c.vehicles_queued} Tractors</strong>
                      </div>

                      <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${c.load_percentage}%` }}
                        />
                      </div>

                      <div className="text-[10px] text-slate-500 text-right">
                        Clearance: ~{c.est_clearance_minutes}m
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Load Balancing Routing Recommendation Alert */}
                <div className="p-3 bg-blue-950/40 border border-blue-800/80 rounded-xl flex items-start space-x-2.5 text-xs text-blue-200">
                  <Zap className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <strong className="font-semibold text-blue-300 block mb-0.5">AI Routing Directive:</strong>
                    <p className="text-slate-300 leading-relaxed font-sans">{queueResult.load_balancing_recommendation}</p>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Modal Footer & Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleVoiceBroadcast}
              className="py-2 px-3.5 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              title="Voice announce counter directive to gate PA system"
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Voice Announcement</span>
            </button>

            <button
              type="button"
              onClick={handleTriggerOverflowWeighbridge}
              className="py-2 px-3.5 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              title="Open overflow weighbridge for bottleneck clearance"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('btn_overflow_weighbridge')}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => { stopCamera(); onClose(); }}
              className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer"
            >
              {t('btn_close')}
            </button>
            <button
              type="button"
              onClick={() => {
                if (onApplyReroute && queueResult) {
                  onApplyReroute(queueResult);
                }
                stopCamera();
                onClose();
              }}
              className="py-2 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-blue-950/40 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t('btn_reroute_tractors')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
