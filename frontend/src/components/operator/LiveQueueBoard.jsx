import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Volume2, 
  QrCode,
  Building2,
  Users,
  Radio,
  Eye,
  Zap,
  TrendingUp,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { api } from '../../api';
import { useLanguage } from '../../i18n/LanguageContext';
import RealTimeQueueVisionModal from './RealTimeQueueVisionModal';

export default function LiveQueueBoard({ onOpenScanner, onSelectTokenToProcess }) {
  const { t, language } = useLanguage();
  const [boardData, setBoardData] = useState(null);
  const [selectedCenterId, setSelectedCenterId] = useState(1);
  const [centers, setCenters] = useState([]);
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [isQueueVisionOpen, setIsQueueVisionOpen] = useState(false);
  const [cvQueueData, setCvQueueData] = useState(null);

  const fetchLiveBoard = async () => {
    try {
      const data = await api.getLiveQueueBoard(selectedCenterId);
      setBoardData(data);
    } catch (err) {
      console.error('Failed to load live board:', err);
    }
  };

  const fetchQueueVisionSnapshot = async () => {
    try {
      const cvRes = await api.detectQueueVision({
        sample_key: 'nashik_morning_rush',
        center_id: selectedCenterId,
        active_counters: 4
      });
      setCvQueueData(cvRes);
    } catch (err) {
      console.error('Failed to fetch CV queue snapshot:', err);
    }
  };

  useEffect(() => {
    async function loadCenters() {
      try {
        const c = await api.getProcurementCenters();
        setCenters(c);
      } catch (err) {
        console.error(err);
      }
    }
    loadCenters();
    fetchQueueVisionSnapshot();
  }, []);

  useEffect(() => {
    fetchLiveBoard();
    const interval = setInterval(fetchLiveBoard, 4000);
    return () => clearInterval(interval);
  }, [selectedCenterId]);

  const handleAudioAnnouncement = (tokenNum, counter) => {
    setIsAnnouncing(true);
    if ('speechSynthesis' in window) {
      const text = `Attention please. Token Number ${(tokenNum || '').replace(/-/g, ' ')}, please proceed to Counter Number ${counter || 1} for grain weighment.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setIsAnnouncing(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsAnnouncing(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                APMC Real-Time Queue Telemetry
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
                LIVE SYNC
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Live Mandi Digital Token Display
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Public display board broadcasting called token IDs, weighment counters, and live yard status.
            </p>
          </div>

          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <select
              value={selectedCenterId}
              onChange={(e) => setSelectedCenterId(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-slate-700 cursor-pointer"
            >
              {centers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsQueueVisionOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center space-x-1.5 transition cursor-pointer border border-blue-400/30"
              title="Launch AI Computer Vision Live Queue Detection"
            >
              <Radio className="w-4 h-4 animate-pulse text-cyan-300" />
              <span>{t('btn_open_queue_vision')}</span>
            </button>

            <button
              onClick={onOpenScanner}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg shadow-sm flex items-center space-x-1.5 transition cursor-pointer border border-slate-700"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR Pass</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Real-Time Queue Detection Hero Banner */}
      {cvQueueData && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-blue-900/50 rounded-xl p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-700/60 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-bold font-mono">
                    AI REAL-TIME QUEUE DETECTION: ACTIVE
                  </span>
                  <span className="text-[11px] font-mono font-bold" style={{ color: cvQueueData.congestion_color_hex }}>
                    {cvQueueData.congestion_label} ({cvQueueData.queue_density_percentage}% Density)
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Gate Ingress Telemetry: {cvQueueData.total_vehicles_detected || 6} Vehicles Queued (~{cvQueueData.estimated_wait_minutes || 12} min wait)
                </h3>
                <p className="text-xs text-slate-400">
                  Detected: <strong className="text-emerald-400 font-mono">🚜 {cvQueueData?.entity_breakdown?.tractors ?? 2} Tractors</strong>, <strong className="text-blue-400 font-mono">🚛 {cvQueueData?.entity_breakdown?.heavy_trucks ?? 3} Trucks</strong>, <strong className="text-amber-400 font-mono">🛻 {cvQueueData?.entity_breakdown?.pickup_tempos ?? 1} Tempos</strong> • Queue Length: <span className="text-white font-mono">{cvQueueData.queue_length_meters || 45}m</span>
                </p>
              </div>
            </div>


            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsQueueVisionOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View CCTV AI Feed & Load Balancer →</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Hero Display: Currently Called Token */}
      {boardData?.current_calling && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-semibold text-xs uppercase tracking-wider">
                  CURRENT CALL
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {(boardData.current_calling.status || 'CALLING').replace('_', ' ')}
                </span>

              </div>

              <div className="text-4xl sm:text-5xl font-bold text-white font-mono tracking-tight">
                {boardData.current_calling.token_number}
              </div>

              <div className="text-xs text-slate-400">
                Farmer: <strong className="text-slate-200">{boardData.current_calling.farmer_name}</strong> • {boardData.current_calling.crop} ({boardData.current_calling.quantity_kg} kg)
              </div>
            </div>

            {/* Counter Callout Box */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950 border border-slate-800 p-5 rounded-xl">
              <div className="text-center sm:text-left">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Proceed To</span>
                <div className="text-2xl font-bold text-emerald-400 font-mono mt-0.5">
                  COUNTER #{boardData.current_calling.assigned_counter}
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Est. Duration: ~{boardData.current_calling.estimated_wait_mins} mins
                </span>
              </div>

              <div className="flex flex-col space-y-2 w-full sm:w-auto">
                <button
                  onClick={() => handleAudioAnnouncement(boardData.current_calling.token_number, boardData.current_calling.assigned_counter)}
                  disabled={isAnnouncing}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 transition"
                >
                  <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isAnnouncing ? 'Calling...' : 'Voice Announcement'}</span>
                </button>

                <button
                  onClick={() => onSelectTokenToProcess && onSelectTokenToProcess(boardData.current_calling.token_id)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 shadow-sm transition"
                >
                  <span>Open Weighment Desk →</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* KPI Ticker Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Active In-Inspection</span>
          <strong className="text-xl font-bold text-white font-mono mt-1 block">
            {boardData?.processing_count || 0}
          </strong>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Waiting Line</span>
          <strong className="text-xl font-bold text-white font-mono mt-1 block">
            {boardData?.waiting_count || 0}
          </strong>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Completed Today</span>
          <strong className="text-xl font-bold text-emerald-400 font-mono mt-1 block">
            {boardData?.completed_count || 0}
          </strong>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Average Throughput</span>
          <strong className="text-xl font-bold text-slate-300 font-mono mt-1 block">
            11.5 min/lot
          </strong>
        </div>
      </div>

      {/* Split Queue Lists: In Process & Waiting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: In-Inspection / Weighing */}
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Active Counter Lots ({boardData?.in_process?.length || 0})
            </h3>
            <span className="text-[11px] text-slate-500">Live Stage</span>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {boardData?.in_process?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No tokens currently on counters.</div>
            ) : (
              boardData?.in_process?.map((t) => (
                <div key={t.token_id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-semibold text-xs text-white">{t.token_number}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 text-slate-400 border border-slate-800">
                        Counter #{t.assigned_counter}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {t.farmer_name} • {t.crop} ({t.quantity_kg} kg)
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectTokenToProcess && onSelectTokenToProcess(t.token_id)}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700"
                  >
                    Inspect
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Waiting Queue */}
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Waiting Queue ({boardData?.waiting?.length || 0})
            </h3>
            <span className="text-[11px] text-slate-500">Arrival Order</span>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {boardData?.waiting?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">Queue is clear.</div>
            ) : (
              boardData?.waiting?.map((t, idx) => (
                <div key={t.token_id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded bg-slate-900 text-slate-500 text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-mono font-semibold text-xs text-white">{t.token_number}</div>
                      <div className="text-[11px] text-slate-400">
                        {t.farmer_name} • {t.crop} ({t.quantity_kg} kg)
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-300 font-mono block">
                      ~{t.estimated_wait_mins} min
                    </span>
                    <button
                      onClick={() => onSelectTokenToProcess && onSelectTokenToProcess(t.token_id)}
                      className="text-[11px] text-emerald-400 hover:underline mt-0.5 block"
                    >
                      Call to Desk →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* AI Real-Time Queue Detection & CCTV Vision Modal */}
      {isQueueVisionOpen && (
        <RealTimeQueueVisionModal
          isOpen={isQueueVisionOpen}
          onClose={() => setIsQueueVisionOpen(false)}
          centerId={selectedCenterId}
          onApplyReroute={(cvData) => {
            setCvQueueData(cvData);
            fetchLiveBoard();
          }}
        />
      )}

    </div>
  );
}
