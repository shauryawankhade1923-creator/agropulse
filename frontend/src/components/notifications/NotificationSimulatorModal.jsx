import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Smartphone, 
  CheckCheck, 
  Send, 
  Clock, 
  ShieldCheck, 
  RefreshCw, 
  X,
  Bell,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { api } from '../../api';

export default function NotificationSimulatorModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [activeChannel, setActiveChannel] = useState('ALL'); // ALL, APP, WHATSAPP, SMS
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Manual test trigger state
  const [customPhone, setCustomPhone] = useState('7020975052');
  const [customEvent, setCustomEvent] = useState('BID_ACCEPTED');
  const [triggerLoading, setTriggerLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getNotificationLogs(activeChannel === 'ALL' ? null : activeChannel);
      setLogs(data || []);
      if (data && data.length > 0 && !selectedLog) {
        setSelectedLog(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch notification logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, activeChannel]);

  if (!isOpen) return null;

  const handleSendTestAlert = async (e) => {
    e.preventDefault();
    setTriggerLoading(true);
    try {
      let title = "Mandi Update";
      let msg = "";
      let ch = "SMS";

      if (customEvent === 'BID_ACCEPTED') {
        title = "🤝 Deal Confirmed: Tomato (1,200 kg)";
        msg = "AgroPulse: Deal confirmed! Your Tomato (1,200 kg) is sold to Reliance Fresh at Rs.32.00/kg. Total: Rs.38,400. Book APMC slot on portal.";
      } else if (customEvent === 'TOKEN_ISSUED') {
        title = "🎟️ Mandi E-Pass & QR Token: AP-2026-9901";
        msg = "AgroPulse E-Pass: Token AP-2026-9901 confirmed for Today (10:00 AM) at Nashik Main APMC. Counter #2. Show QR pass at entry gate.";
      } else if (customEvent === 'PAYMENT_SETTLED') {
        title = "💰 Instant DBT Payment Disbursed: ₹57,500.00";
        msg = "AgroPulse Govt DBT: Rs.57,500.00 credited to SBIN-XXXX-4819 via UTR202608319912 for Onion (2,500 kg, Grade A). APMC settlement complete.";
      } else {
        ch = "SMS";
        title = "⏱️ Gate Checked-in: Token AP-2026-9901";
        msg = "AgroPulse Gate Entry: Token AP-2026-9901 verified. Assigned to Counter #2. Your queue position is #1. Estimated wait: ~10 mins. Please proceed to inspection bay.";
      }

      const res = await api.sendSMSAlert({
        recipient_phone: customPhone,
        recipient_name: "Ramesh Patil",
        template_type: customEvent,
        message_text: msg,
        reference_id: "SIM-" + Date.now().toString().slice(-4)
      });

      setSelectedLog(res);
      fetchLogs();
    } catch (err) {
      alert("Error triggering alert: " + err.message);
    } finally {
      setTriggerLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  SMS, App Notifications & WhatsApp Center
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-bold uppercase tracking-wider">
                  DLT Telecom & In-App Gateway
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated multi-channel dispatch of QR Token Passes, Bid Acceptance SMS, and Instant DBT Payout Vouchers.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Content Grid: Left Feed & Right Mobile Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1 overflow-hidden">
          
          {/* Left Column: Notification Feed & Test Trigger (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col border-r border-slate-800 overflow-y-auto space-y-4">
            
            {/* Filter Tabs & Refresh */}
            <div className="flex items-center justify-between">
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveChannel('ALL')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                    activeChannel === 'ALL' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({logs.length})
                </button>
                <button
                  onClick={() => setActiveChannel('SMS')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                    activeChannel === 'SMS' ? 'bg-blue-950 text-blue-400 border border-blue-800' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>SMS (DLT)</span>
                </button>
                <button
                  onClick={() => setActiveChannel('APP')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                    activeChannel === 'APP' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bell className="w-3 h-3" />
                  <span>In-App Push</span>
                </button>
                <button
                  onClick={() => setActiveChannel('WHATSAPP')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                    activeChannel === 'WHATSAPP' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>WhatsApp</span>
                </button>
              </div>

              <button
                onClick={fetchLogs}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition flex items-center space-x-1 cursor-pointer"
                title="Refresh Logs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {/* Test Trigger Bar */}
            <form onSubmit={handleSendTestAlert} className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                <span className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Instant SMS Dispatcher</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">VK-AGRPULSE (DLT)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={customEvent}
                  onChange={(e) => setCustomEvent(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-slate-700"
                >
                  <option value="BID_ACCEPTED">🤝 Bid Accepted Alert</option>
                  <option value="TOKEN_ISSUED">🎟️ QR Token Pass SMS</option>
                  <option value="PAYMENT_SETTLED">💰 DBT Payment SMS</option>
                  <option value="QUEUE_ALERT">⏱️ Mandi Gate Callout</option>
                </select>

                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="Recipient Mobile"
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-slate-700"
                />

                <button
                  type="submit"
                  disabled={triggerLoading}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-sm flex items-center justify-center space-x-1.5 transition disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>{triggerLoading ? 'Dispatching...' : 'Send SMS Now'}</span>
                </button>
              </div>
            </form>

            {/* Notification Stream List */}
            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No automated alerts recorded yet. Trigger one above!
                </div>
              ) : (
                logs.map((log) => {
                  const isSelected = selectedLog?.id === log.id;
                  const isWhatsApp = log.channel === 'WHATSAPP';
                  const isSMS = log.channel === 'SMS';
                  const isApp = log.channel === 'APP';

                  return (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-slate-800 border-blue-500 shadow-md'
                          : 'bg-slate-950/70 border-slate-850 hover:bg-slate-850 hover:border-slate-750'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            isSMS
                              ? 'bg-blue-950 text-blue-400 border border-blue-800'
                              : (isApp ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-300 border border-slate-700')
                          }`}>
                            {log.channel}
                          </span>
                          <span className="font-bold text-white truncate">{log.title}</span>
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {log.message_content.replace(/\*/g, '')}
                        </p>

                        <div className="flex items-center space-x-3 text-[10px] text-slate-500 pt-1 font-mono">
                          <span>To: {log.recipient_name} ({log.recipient_phone})</span>
                          <span>•</span>
                          <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-1 shrink-0">
                        <span className="text-[10px] font-semibold text-emerald-400 flex items-center space-x-0.5">
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>{log.status}</span>
                        </span>
                        {log.reference_id && (
                          <span className="text-[9px] font-mono text-slate-500">
                            {log.reference_id}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Right Column: Mobile Phone Live Preview (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950 p-4 sm:p-6 flex flex-col items-center justify-center overflow-y-auto">
            
            {/* Phone Frame */}
            <div className="w-full max-w-[320px] bg-slate-900 border-4 border-slate-800 rounded-[36px] shadow-2xl overflow-hidden flex flex-col h-[520px] relative">
              
              {/* Phone Top Notch */}
              <div className="bg-slate-950 h-6 w-full flex items-center justify-between px-6 text-[10px] text-slate-400 font-mono select-none">
                <span>09:41</span>
                <div className="w-16 h-3 bg-slate-850 rounded-full"></div>
                <span>5G 100%</span>
              </div>

              {selectedLog?.channel === 'SMS' || (!selectedLog && activeChannel === 'SMS') ? (
                /* SMS UI */
                <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
                  
                  {/* SMS App Bar */}
                  <div className="bg-slate-900 p-2.5 flex items-center justify-between border-b border-slate-800 text-xs">
                    <div>
                      <div className="font-bold text-white text-xs">VK-AGRPULSE (DLT)</div>
                      <span className="text-[10px] text-blue-400">Government APMC Mandi Alerts</span>
                    </div>
                  </div>

                  {/* SMS Message Bubble */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-2 flex flex-col justify-end">
                    <div className="bg-slate-850 border border-slate-750 text-slate-200 p-3.5 rounded-2xl text-[11px] leading-relaxed shadow space-y-1.5 max-w-[92%]">
                      <p className="whitespace-pre-line font-sans">
                        {selectedLog ? selectedLog.message_content : "AgroPulse Alert: Select a notification from the list to preview DLT SMS text."}
                      </p>
                      <div className="text-[9px] text-slate-500 text-right pt-1">
                        {selectedLog ? new Date(selectedLog.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'} • SMS
                      </div>
                    </div>
                  </div>

                  {/* SMS Bottom Input */}
                  <div className="bg-slate-900 p-2.5 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px] pl-2">Text message</span>
                    <span className="text-[10px] text-blue-400 font-bold pr-2">SMS (DLT)</span>
                  </div>

                </div>
              ) : selectedLog?.channel === 'APP' ? (
                /* IN-APP NOTIFICATION UI */
                <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 p-3 justify-center">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                        <Bell className="w-3.5 h-3.5" />
                        <span>AgroPulse In-App Alert</span>
                      </span>
                      <span className="text-[9px] text-slate-500">now</span>
                    </div>
                    <div className="text-xs font-bold text-white">
                      {selectedLog.title}
                    </div>
                    <div className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      {selectedLog.message_content}
                    </div>
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80 font-mono">
                      Ref: {selectedLog.reference_id || 'AP-SYS'}
                    </div>
                  </div>
                </div>
              ) : (
                /* WHATSAPP UI */
                <div className="flex-1 flex flex-col bg-[#0b141a] text-slate-100 overflow-hidden">
                  
                  {/* WhatsApp App Bar */}
                  <div className="bg-[#1f2c34] p-2.5 flex items-center justify-between border-b border-slate-800 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-xs">
                        AP
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs flex items-center space-x-1">
                          <span>AgroPulse APMC</span>
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        </div>
                        <span className="text-[10px] text-emerald-400">Official Business Account</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300">
                      <PhoneCall className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Chat Wallpaper & Message Bubble */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:12px_12px] flex flex-col justify-end">
                    
                    {/* Timestamp Pill */}
                    <div className="text-center">
                      <span className="bg-[#182229] text-[9px] font-mono text-slate-400 px-2 py-0.5 rounded-md shadow-sm">
                        TODAY
                      </span>
                    </div>

                    {/* Green WhatsApp Bubble */}
                    <div className="bg-[#005c4b] text-white p-3 rounded-2xl rounded-tr-none text-[11px] leading-relaxed shadow-md space-y-1.5 self-end max-w-[92%]">
                      <div className="whitespace-pre-line font-sans text-[11px]">
                        {selectedLog ? selectedLog.message_content : "Select a notification on the left to preview WhatsApp message format."}
                      </div>

                      <div className="flex items-center justify-end space-x-1 text-[9px] text-emerald-200/70 pt-0.5">
                        <span>{selectedLog ? new Date(selectedLog.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:41'}</span>
                        <CheckCheck className="w-3 h-3 text-sky-300" />
                      </div>
                    </div>

                  </div>

                  {/* WhatsApp Bottom Input Bar */}
                  <div className="bg-[#1f2c34] p-2 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[11px] text-slate-500 pl-2">Reply to AgroPulse Mandi...</span>
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                      ➤
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

