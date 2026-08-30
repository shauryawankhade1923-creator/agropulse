import React, { useState } from 'react';
import { 
  Smartphone, 
  MessageSquare, 
  Send, 
  X, 
  CheckCircle2, 
  Bell, 
  Radio, 
  Sparkles, 
  Coins, 
  QrCode, 
  Scale, 
  Truck, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import { api } from '../../api';
import { useLanguage } from '../../i18n/LanguageContext';

export default function SendSMSModal({ isOpen, onClose, onSent }) {
  const { t, language } = useLanguage();

  const [channel, setChannel] = useState('SMS'); // 'SMS', 'APP', 'WHATSAPP'
  const [recipientPhone, setRecipientPhone] = useState('7020975052');
  const [recipientName, setRecipientName] = useState(
    language === 'mr' ? 'रमेश पाटील' : (language === 'hi' ? 'रमेश पाटिल' : 'Ramesh Patil')
  );
  const [templateType, setTemplateType] = useState('BID_ALERT');
  const [customText, setCustomText] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successStatus, setSuccessStatus] = useState(null);

  if (!isOpen) return null;

  const templates = [
    {
      id: 'BID_ALERT',
      icon: Coins,
      name: '📩 New Bid Received Alert',
      desc: 'Notifies farmer when a buyer submits a new price offer.',
      smsBody: 'AgroPulse Alert: New bid from Rajesh Aggarwal for Onion (2,500 kg) at Rs.28.50/kg. Total: Rs.71,250. Check portal: agropulse.gov.in',
      appBody: 'Buyer Rajesh Aggarwal offered ₹28.50/kg for your Onion lot (2,500 kg). Total ₹71,250.',
      title: '📩 New Bid: Onion (2,500 kg)'
    },
    {
      id: 'DEAL_LOCKED',
      icon: CheckCircle2,
      name: '🤝 Deal Locked & Confirmed',
      desc: 'Confirms price lock agreement and instructs gate dispatch.',
      smsBody: 'AgroPulse Deal Confirmed: Your Tomato (1,200 kg) is sold to Reliance Fresh at Rs.32.00/kg. Total: Rs.38,400. Book APMC slot on portal.',
      appBody: 'Deal Locked! Sold 1,200 kg Tomato to Reliance Fresh at ₹32.00/kg. Total ₹38,400.',
      title: '🤝 Deal Locked: Tomato (1,200 kg)'
    },
    {
      id: 'TOKEN_PASS',
      icon: QrCode,
      name: '🎟️ Mandi E-Pass & QR Token',
      desc: 'Delivers scheduled arrival slot and weighbridge assignment.',
      smsBody: 'AgroPulse E-Pass: Token AP-2026-8812 confirmed for Today (10:00 AM) at Nashik Main APMC. Counter #2. Show QR pass at entry gate.',
      appBody: 'E-Pass Booked: Token AP-2026-8812 assigned to Weighbridge Counter #2. Est. wait ~12m.',
      title: '🎟️ Mandi E-Pass: AP-2026-8812'
    },
    {
      id: 'GATE_ENTRY',
      icon: Scale,
      name: '⏱️ Weighbridge Gate Callout',
      desc: 'Alerts vehicle driver to proceed to specific weighbridge counter.',
      smsBody: 'AgroPulse Gate Entry: Token AP-2026-8812 verified. Assigned to Counter #2. Queue Pos #1. Please proceed to weighbridge inspection bay.',
      appBody: 'Weighbridge Counter #2 Ready! Please proceed with your vehicle now.',
      title: '⏱️ Gate Checked-in: Counter #2'
    },
    {
      id: 'DBT_PAYOUT',
      icon: Coins,
      name: '💰 Direct DBT Payout Voucher',
      desc: 'Notifies instantaneous bank credit with official UTR number.',
      smsBody: 'AgroPulse Govt DBT: Rs.57,500.00 credited to SBIN-XXXX-4819 via UTR202608319912 for Onion (2,500 kg, Grade A). APMC settlement complete.',
      appBody: 'Instant Payment Settled: ₹57,500.00 transferred via DBT. Ref: UTR202608319912.',
      title: '💰 DBT Disbursed: ₹57,500.00'
    },
    {
      id: 'FREIGHT_SLIP',
      icon: Truck,
      name: '🚚 Smart Freight Pickup Slip',
      desc: 'Sends pooled truck details, pickup time, and driver phone.',
      smsBody: 'AgroPulse Freight: Pickup booked for 06:30 AM at Dindori Phata. Driver Suresh (+91 9822019283), Veh MH-15-EG-4821. Fare Rs.680.',
      appBody: 'Smart Freight Reserved: Driver Suresh (+91 9822019283) arriving 06:30 AM. Saved ₹820!',
      title: '🚚 Freight Reserved: FRG-2026-9021'
    },
    {
      id: 'ADVISORY',
      icon: AlertTriangle,
      name: '📢 Mandi Rate & Weather Advisory',
      desc: 'Broadcasts weather warnings or crop rate spikes to farmers.',
      smsBody: 'AgroPulse Mandi Advisory: Onion FAQ Grade A arrivals high today at Nashik APMC. Current average modal rate ₹27.50/kg. Weather dry.',
      appBody: 'Market Advisory: Onion FAQ Grade A modal rate trading at ₹27.50/kg today.',
      title: '📢 Market Rate Advisory'
    }
  ];

  const selectedTemplate = templates.find(t => t.id === templateType) || templates[0];
  const activeMessageBody = isCustomMode 
    ? customText 
    : (channel === 'APP' ? selectedTemplate.appBody : selectedTemplate.smsBody);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeMessageBody.trim()) {
      return;
    }

    setLoading(true);
    setSuccessStatus(null);

    try {
      if (channel === 'SMS') {
        await api.sendSMSAlert({
          recipient_phone: recipientPhone,
          recipient_name: recipientName,
          template_type: templateType,
          message_text: activeMessageBody,
          reference_id: `SMS-${Date.now().toString().slice(-4)}`
        });
      } else if (channel === 'APP') {
        await api.sendAppNotification({
          recipient_phone: recipientPhone,
          recipient_name: recipientName,
          event_type: templateType,
          title: selectedTemplate.title,
          message_content: activeMessageBody,
          reference_id: `APP-${Date.now().toString().slice(-4)}`
        });
      } else {
        await api.sendCustomNotification({
          channel: 'WHATSAPP',
          recipient_phone: recipientPhone,
          recipient_name: recipientName,
          event_type: templateType,
          title: selectedTemplate.title,
          message_content: activeMessageBody,
          reference_id: `WA-${Date.now().toString().slice(-4)}`
        });
      }

      setSuccessStatus({
        channel,
        phone: recipientPhone,
        time: new Date().toLocaleTimeString()
      });

      if (onSent) onSent();
      setTimeout(() => {
        setSuccessStatus(null);
      }, 4000);

    } catch (err) {
      alert("Error sending notification: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {t('sms_dispatcher_title')}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-bold uppercase tracking-wider">
                  DLT Telecom & Push
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t('sms_dispatcher_sub')}
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

        {/* Content Body: Form on Left, Live Simulator on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1 overflow-y-auto">
          
          {/* Left Form: Controls (7 cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 p-4 sm:p-5 space-y-4 border-r border-slate-800">
            
            {/* Channel Switcher */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('label_channel')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('SMS')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                    channel === 'SMS'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-950/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>SMS (DLT)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('APP')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                    channel === 'APP'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span>In-App Push</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('WHATSAPP')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                    channel === 'WHATSAPP'
                      ? 'bg-emerald-700 text-white border-emerald-600 shadow-md shadow-emerald-950/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t('label_phone')}
                </label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white">
                  <span className="text-slate-500 mr-1.5 font-mono">+91</span>
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="7020975052"
                    className="bg-transparent font-mono focus:outline-none w-full"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Farmer / Buyer Name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-slate-700"
                  required
                />
              </div>
            </div>

            {/* Template Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {t('label_template')}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomMode(!isCustomMode);
                    if (!isCustomMode) setCustomText(activeMessageBody);
                  }}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                >
                  {isCustomMode ? "← Use Standard Template" : "✏️ Compose Custom Text"}
                </button>
              </div>

              {!isCustomMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {templates.map((tpl) => {
                    const Icon = tpl.icon;
                    const isSelected = templateType === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => setTemplateType(tpl.id)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition flex items-start space-x-2 ${
                          isSelected
                            ? 'bg-slate-800 border-blue-500/80 shadow'
                            : 'bg-slate-950/70 border-slate-850 hover:bg-slate-850'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-200 truncate">{tpl.name}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">{tpl.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <textarea
                    rows={4}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Type custom SMS / push notification content here..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed font-mono"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span>DLT Header: VK-AGRPULSE</span>
                    <span>{customText.length} characters • {Math.ceil(customText.length / 160) || 1} SMS unit(s)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Success Banner & Direct Send to Mobile Button */}
            {successStatus && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs space-y-2 animate-fade-in">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong>Dispatched:</strong> {successStatus.channel} alert logged for <strong>+91 {successStatus.phone}</strong>!
                  </span>
                </div>

                {/* Direct 1-Click WhatsApp / SMS Launch to user's real phone */}
                <div className="pt-1 flex flex-wrap gap-2">
                  <a
                    href={`https://wa.me/91${recipientPhone}?text=${encodeURIComponent(activeMessageBody)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open in WhatsApp (Direct to +91 {recipientPhone})</span>
                  </a>

                  <a
                    href={`sms:+91${recipientPhone}?body=${encodeURIComponent(activeMessageBody)}`}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow transition"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Open in Phone SMS App</span>
                  </a>
                </div>
              </div>
            )}

            {/* Submit Button & Direct Dispatch */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center justify-center space-x-2 shadow-lg shadow-blue-950/50 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? "Dispatching Alert..." : t('btn_send_now')}</span>
              </button>

              {/* Direct Instant WhatsApp & SMS Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`https://wa.me/91${recipientPhone}?text=${encodeURIComponent(activeMessageBody)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white transition flex items-center justify-center space-x-1.5 shadow text-center cursor-pointer border border-emerald-500/40"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send to my WhatsApp</span>
                </a>

                <a
                  href={`sms:+91${recipientPhone}?body=${encodeURIComponent(activeMessageBody)}`}
                  className="py-2 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-blue-300 transition flex items-center justify-center space-x-1.5 shadow text-center cursor-pointer border border-slate-700"
                >
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  <span>Send via Phone SMS</span>
                </a>
              </div>
            </div>

          </form>

          {/* Right Column: Live Mobile & Notification Card Preview (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950 p-4 sm:p-6 flex flex-col items-center justify-center border-t lg:border-t-0">
            <div className="text-center mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Live Handset Preview
              </span>
            </div>

            {channel === 'SMS' && (
              /* SMS Preview Phone */
              <div className="w-full max-w-[280px] bg-slate-900 border-2 border-slate-800 rounded-3xl p-3 shadow-xl space-y-3">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-b border-slate-800 pb-2">
                  <span className="font-bold text-white">VK-AGRPULSE (DLT)</span>
                  <span>SIM 1</span>
                </div>
                <div className="bg-slate-950 border border-slate-850 p-3 rounded-2xl text-xs text-slate-200 leading-relaxed font-sans shadow-inner">
                  <p className="whitespace-pre-line text-[11px]">
                    {activeMessageBody}
                  </p>
                  <div className="text-[9px] text-slate-500 text-right pt-1.5">
                    Just now • SMS
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 text-center">
                  To: +91 {recipientPhone}
                </div>
              </div>
            )}

            {channel === 'APP' && (
              /* In-App Notification Card Preview */
              <div className="w-full max-w-[280px] bg-slate-900 border-2 border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1 border-b border-slate-800">
                  <span className="font-bold text-emerald-400 flex items-center space-x-1">
                    <Bell className="w-3 h-3" />
                    <span>AgroPulse Push</span>
                  </span>
                  <span>now</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-white">
                    {selectedTemplate.title}
                  </div>
                  <div className="text-[11px] text-slate-300 leading-relaxed">
                    {activeMessageBody}
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 text-center">
                  In-App Notification Center
                </div>
              </div>
            )}

            {channel === 'WHATSAPP' && (
              /* WhatsApp Preview */
              <div className="w-full max-w-[280px] bg-[#0b141a] border-2 border-slate-800 rounded-3xl p-3 shadow-xl space-y-2">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center">
                    AP
                  </div>
                  <div className="text-xs font-bold text-white">AgroPulse Mandi</div>
                </div>
                <div className="bg-[#005c4b] text-white p-3 rounded-2xl rounded-tr-none text-[11px] leading-relaxed shadow">
                  <p className="whitespace-pre-line">
                    {activeMessageBody}
                  </p>
                  <div className="text-[9px] text-emerald-200/70 text-right pt-1">
                    Just now ✓✓
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
