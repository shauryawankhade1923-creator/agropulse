import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Ticket, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  RefreshCw, 
  Building2,
  Calendar,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { api } from '../../api';
import { useLanguage } from '../../i18n/LanguageContext';

export default function DigitalTokenPass() {
  const { t, language } = useLanguage();
  const [tokens, setTokens] = useState([]);
  const [activeToken, setActiveToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const handleSendWhatsAppToken = (token) => {
    if (!token) return;
    const msg = (
      `🎟️ *AgroPulse Electronic Mandi Pass & QR Token*\n\n` +
      `Namaste *${token.farmer_name || 'Ramesh Patil'}* ji,\n` +
      `Your procurement slot appointment has been confirmed!\n\n` +
      `🏷️ *Token Number:* \`${token.token_number}\`\n` +
      `🏛️ *Mandi Center:* ${token.center_name || 'Nashik Main APMC Market Yard'}\n` +
      `🌾 *Crop:* ${token.crop_name || 'Produce'} (${token.quantity_kg?.toLocaleString()} kg)\n` +
      `📅 *Arrival Date:* ${token.slot_date || new Date().toLocaleDateString('en-GB')}\n` +
      `⏰ *Time Slot:* ${token.slot_time || '10:00 AM - 12:00 PM'}\n` +
      `🏬 *Assigned Weighbridge:* Counter #${token.assigned_counter || 2}\n` +
      `⏳ *AI Wait Time Estimate:* ~${token.estimated_wait_minutes || 12} mins\n\n` +
      `📲 *Scan & Go QR Pass:* Show this token or scan your QR at the APMC entrance gate camera for fast-track entry.\n` +
      `🔗 E-Pass Link: https://agropulse.gov.in/token/${token.token_number}`
    );
    window.open(`https://wa.me/917020975052?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const data = await api.getFarmerTokens(1);
      setTokens(data);
      if (data.length > 0) {
        setActiveToken(prev => (prev ? data.find(t => t.id === prev.id) || data[0] : data[0]));
      }
    } catch (err) {
      console.error('Failed to load farmer tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
    const interval = setInterval(fetchTokens, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleCancelToken = async (tokenId) => {
    setCancellingId(tokenId);
    try {
      await api.cancelToken(tokenId);
      await fetchTokens();
    } catch (err) {
      alert('Error cancelling pass: ' + err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const getStageStep = (status) => {
    switch (status?.toUpperCase()) {
      case 'BOOKED': return 1;
      case 'CHECKED_IN': 
      case 'CHECK-IN':
      case 'ARRIVED': return 2;
      case 'IN_INSPECTION': 
      case 'INSPECTION': return 3;
      case 'WEIGHING': 
      case 'WEIGHMENT': return 4;
      case 'APPROVED':
      case 'SETTLED':
      case 'DISBURSED':
      case 'COMPLETED': return 5;
      default: return 1;
    }
  };


  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
              {t('tokens_sub')}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              {t('tokens_title')}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              {t('tokens_desc')}
            </p>
          </div>

          <button
            onClick={fetchTokens}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-850 text-slate-300 text-xs font-medium border border-slate-800 flex items-center space-x-2 transition self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {tokens.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
          <Ticket className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-300">No Active Tokens</h3>
          <p className="text-xs text-slate-500 mt-1">
            List produce and book a procurement slot to generate your QR pass.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Token List Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Issued Passes ({tokens.length})
            </h3>

            <div className="space-y-2">
              {tokens.map((t) => {
                const isSelected = activeToken?.id === t.id;
                const isCompleted = t.status === 'COMPLETED' || t.status === 'APPROVED';
                const isCancelled = t.status === 'CANCELLED';
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveToken(t)}
                    className={`w-full p-3.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-slate-800 border-slate-600 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-xs text-white">
                        {t.token_number}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium font-mono ${
                        isCompleted
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : (isCancelled
                              ? 'bg-rose-950 text-rose-400 border border-rose-900'
                              : 'bg-slate-950 text-slate-400 border border-slate-800')
                      }`}>
                        {(t.status || 'BOOKED').replace('_', ' ')}
                      </span>

                    </div>

                    <div className="text-xs font-medium text-slate-200">
                      {t.crop_name} • {t.quantity_kg} kg
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span className="truncate">{t.center_name}</span>
                      <span className="font-mono">{t.slot_time}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Token Pass Card (8 cols) */}
          {activeToken && (
            <div className="lg:col-span-8">
              <div className={`bg-slate-900 border rounded-xl p-6 sm:p-8 space-y-6 ${
                activeToken.status === 'CANCELLED' ? 'border-rose-900/60 opacity-80' : 'border-slate-800'
              }`}>
                
                {/* Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        APMC Gate Ingress Pass
                      </span>
                      {activeToken.status === 'CANCELLED' && (
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-900 text-[10px] font-mono font-bold">
                          CANCELLED
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white font-mono mt-0.5">
                      {activeToken.token_number}
                    </h2>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSendWhatsAppToken(activeToken)}
                      className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
                      title="Send digital QR token pass directly to WhatsApp (7020975052)"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Send to WhatsApp (7020975052)</span>
                    </button>

                    {(activeToken.status === 'BOOKED' || activeToken.status === 'CHECKED_IN') && (
                      <button
                        onClick={() => handleCancelToken(activeToken.id)}
                        disabled={cancellingId === activeToken.id}
                        className="px-3 py-2 bg-slate-950 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-900 text-slate-400 hover:text-rose-200 border border-slate-800 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition disabled:opacity-50"
                        title="Cancel this token pass & release lot"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{cancellingId === activeToken.id ? 'Cancelling...' : 'Cancel Token'}</span>
                      </button>
                    )}

                    <div className="flex items-center space-x-3 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-lg">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <div className="text-left">
                        <span className="text-[10px] text-slate-500 block">Est. Gate Wait</span>
                        <strong className="text-sm font-semibold text-white font-mono">
                          {activeToken.status === 'CANCELLED' ? 'Cancelled' : (activeToken.status === 'COMPLETED' ? '0 mins' : `~${activeToken.estimated_wait_minutes} mins`)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code & Specs */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  
                  {/* Left QR Code (5 cols) */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm">
                    <QRCodeSVG
                      value={activeToken.qr_payload || activeToken.token_number}
                      size={160}
                      level="H"
                      includeMargin={false}
                    />
                    <span className="text-[10px] text-slate-700 font-mono font-medium mt-2">
                      Scan at APMC Counter
                    </span>
                  </div>

                  {/* Right Details (7 cols) */}
                  <div className="sm:col-span-7 space-y-3 text-xs">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Farmer & Crop</span>
                      <div className="text-sm font-medium text-white mt-0.5">
                        {activeToken.farmer_name} • {activeToken.crop_name}
                      </div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        Weight: {activeToken.quantity_kg?.toLocaleString()} kg
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Procurement Mandi</span>
                      <div className="text-xs font-medium text-slate-200 mt-0.5">
                        {activeToken.center_name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{activeToken.center_location}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Assigned Counter</span>
                        <strong className="text-emerald-400 text-xs">Counter #{activeToken.assigned_counter || 1}</strong>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Queue Depth</span>
                        <strong className="text-slate-300 text-xs">#{activeToken.queue_position} in line</strong>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Progress Stages */}
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                    Ingress Stage
                  </span>

                  <div className="relative flex items-center justify-between">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 w-full z-0" />
                    
                    {['Booked', 'Check-In', 'Inspection', 'Weighing', 'Settled'].map((stage, idx) => {
                      const stepNum = idx + 1;
                      const currentStep = getStageStep(activeToken.status);
                      const isSettledAll = currentStep >= 5;
                      const isPassed = currentStep >= stepNum;
                      const isCurrent = !isSettledAll && currentStep === stepNum;
                      const isCompleted = isSettledAll || (isPassed && !isCurrent);

                      return (
                        <div key={stage} className="relative z-10 flex flex-col items-center text-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition shadow-sm ${
                            isCompleted
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/30'
                              : (isCurrent
                                  ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-500/40 animate-pulse'
                                  : 'bg-slate-950 text-slate-600 border border-slate-800')
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                          </div>
                          <span className={`text-[10px] font-medium mt-1.5 transition ${
                            isCompleted ? 'text-emerald-400 font-semibold' : (isCurrent ? 'text-amber-400 font-bold' : 'text-slate-600')
                          }`}>
                            {stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
