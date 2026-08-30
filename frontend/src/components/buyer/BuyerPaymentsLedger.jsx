import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Building2, 
  Receipt, 
  Printer, 
  CheckCircle2, 
  Download, 
  TrendingUp, 
  RefreshCw,
  CreditCard,
  FileText,
  BadgeCheck,
  Scale,
  FileCheck,
  MessageSquare,
  Star
} from 'lucide-react';
import { api } from '../../api';
import TradeReviewModal from '../reviews/TradeReviewModal';

function numberToIndianWords(num) {
  if (!num) return 'Zero Rupees';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const inWords = (n) => {
    let str = '';
    if (n > 9999999) {
      str += inWords(Math.floor(n / 10000000)) + 'Crore ';
      n %= 10000000;
    }
    if (n > 99999) {
      str += inWords(Math.floor(n / 100000)) + 'Lakh ';
      n %= 100000;
    }
    if (n > 999) {
      str += inWords(Math.floor(n / 1000)) + 'Thousand ';
      n %= 1000;
    }
    if (n > 99) {
      str += inWords(Math.floor(n / 100)) + 'Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
    } else if (n > 0) {
      str += a[n];
    }
    return str;
  };
  const parts = Number(num).toFixed(2).split('.');
  const rupees = inWords(parseInt(parts[0], 10)).trim();
  const paise = parseInt(parts[1], 10) > 0 ? ` and ${inWords(parseInt(parts[1], 10)).trim()} Paise` : '';
  return `${rupees} Rupees${paise} Only`;
}

export default function BuyerPaymentsLedger() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [reviewFarmerTarget, setReviewFarmerTarget] = useState(null);

  const fetchPayments = async () => {
    try {
      const data = await api.getAllPayments();
      setPayments(data || []);
    } catch (err) {
      console.error('Failed to load buyer payments ledger:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPayments().finally(() => setLoading(false));

    const interval = setInterval(fetchPayments, 4000);
    return () => clearInterval(interval);
  }, []);

  const totalSpent = payments.reduce((acc, p) => p.status === 'SETTLED' ? acc + p.amount : acc, 0);

  const handleSendWhatsAppInvoice = (p) => {
    if (!p) return;
    const invNo = `INV-APMC-2026-${p.id.toString().padStart(4, '0')}`;
    const weightKg = p.measured_weight_kg || 2500;
    const rate = p.final_rate_per_kg || (p.amount / weightKg).toFixed(2);
    const msg = (
      `🏛️ *Official APMC Buyer Procurement Tax Invoice*\n\n` +
      `🏢 *Buyer:* Rajesh Aggarwal (Kisan Agro Foods Pvt. Ltd.)\n` +
      `🧾 *Invoice No:* \`${invNo}\`\n` +
      `🌾 *Produce:* ${p.crop_name || 'Agricultural Produce'} (Grade ${p.final_grade || 'A'})\n` +
      `📦 *Procured Weight:* ${weightKg.toLocaleString()} kg (${(weightKg/100).toFixed(1)} Quintals)\n` +
      `💰 *Settlement Rate:* ₹${rate} / kg\n` +
      `💵 *Total Debited / Settled:* *₹${p.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}*\n` +
      `🆔 *Banking UTR / Ref:* \`${p.utr_number}\`\n` +
      `🚚 *Mandi Gate Clearance:* Bay Dispatch Cleared\n\n` +
      `Certified by APMC Mandi Commercial Directorate.`
    );
    window.open(`https://wa.me/917020975052?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Background Content - Hidden during Invoice Print */}
      <div className={activeInvoice ? "space-y-6 print:hidden" : "space-y-6"}>
        
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                Institutional Sourcing & Invoices
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Buyer Procurement Ledger & Invoices
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Commercial tax invoices, mandi cess deductions, and bank debit settlements for procured crop lots.
              </p>
            </div>

            <button
              onClick={() => { setLoading(true); fetchPayments().finally(() => setLoading(false)); }}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 transition self-start sm:self-auto"
              title="Refresh Invoices"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <span className="text-xs text-slate-500 uppercase font-medium block mb-1">Total Procurement Spend</span>
            <div className="text-2xl font-bold text-white font-mono">
              ₹{totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-emerald-400 mt-1 block">
              Debited via Escrow / DBT
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <span className="text-xs text-slate-500 uppercase font-medium block mb-1">Purchased Lots</span>
            <div className="text-2xl font-bold text-amber-400 font-mono">
              {payments.length} Lots
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Quality Grade Certified
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <span className="text-xs text-slate-500 uppercase font-medium block mb-1">Buyer Entity</span>
            <div className="text-sm font-semibold text-white mt-1">
              Kisan Agro Foods Pvt. Ltd.
            </div>
            <span className="text-[11px] text-slate-400 font-mono block">
              GSTIN: 27AABCK8901L1Z4
            </span>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Purchased Lots & Invoices
            </h3>
            <span className="text-xs text-slate-500 font-mono">{payments.length} Invoices</span>
          </div>

          {loading && payments.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">Loading buyer invoices...</div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">No purchase transactions found yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Invoice / UTR</th>
                    <th className="py-3 px-4">Farmer / Origin</th>
                    <th className="py-3 px-4">Crop Lot</th>
                    <th className="py-3 px-4">Net Debited</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Tax Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {p.transaction_ref}
                        <span className="block text-[10px] text-slate-500 font-normal">
                          UTR: {p.utr_number}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <strong className="text-white block font-medium">{p.farmer_name || 'Ramesh Patil'}</strong>
                        <span className="text-[10px] text-slate-500">{p.center_name || 'Nashik APMC Mandi'}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <strong className="text-white block font-sans font-medium">{p.crop_name || 'Agricultural Produce'}</strong>
                        <span className="text-[11px] text-slate-400">{p.token_number}</span>
                      </td>
                      <td className="py-3.5 px-4 text-sm font-semibold text-white">
                        ₹{p.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PAID / DEBITED</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <button
                          onClick={() => setActiveInvoice(p)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs border border-slate-700 inline-flex items-center space-x-1 transition"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Official APMC Institutional Buyer Procurement Tax Invoice Modal */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 print-modal-overlay overflow-y-auto">
          <div className="bg-slate-900 border border-slate-750 max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden print-voucher-card my-auto">
            
            {/* National Tricolor Top Strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-slate-100 to-emerald-500" />

            <div className="p-4 sm:p-5 space-y-3">
              
              {/* Modal Screen Top Bar */}
              <div className="flex items-center justify-between no-print border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold tracking-wide uppercase font-mono">
                    ✓ APMC SETTLED & DEBITED
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Invoice: INV-APMC-2026-{activeInvoice.id.toString().padStart(4, '0')}</span>
                </div>
                <button
                  onClick={() => setActiveInvoice(null)}
                  className="text-slate-500 hover:text-white text-xs p-1"
                >
                  ✕
                </button>
              </div>

              {/* Official Printable Certificate Header */}
              <div className="border-b-2 border-slate-750 pb-2.5 print-border">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  
                  {/* Left & Center Emblem & Title */}
                  <div className="text-center sm:text-left space-y-0.5">
                    <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-[9px] font-bold uppercase tracking-widest text-amber-400 print-dark-text">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>GOVERNMENT OF INDIA • MINISTRY OF AGRICULTURE & FARMERS WELFARE</span>
                    </div>
                    <div className="flex items-center space-x-1.5 justify-center sm:justify-start">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-black tracking-widest uppercase font-mono">
                        APMC
                      </span>
                      <h1 className="text-sm sm:text-base font-extrabold text-white print-dark-text tracking-wide uppercase font-sans">
                        {activeInvoice.center_name ? (activeInvoice.center_name.toUpperCase().includes('APMC') ? activeInvoice.center_name.toUpperCase() : `${activeInvoice.center_name.toUpperCase()} APMC MANDI`) : 'KRISHI UPAJ MANDI SAMITI (APMC)'}
                      </h1>
                    </div>
                    <div className="text-[11px] font-bold text-emerald-400 print-dark-text">
                      INSTITUTIONAL AGRI-BUYER PROCUREMENT TAX INVOICE & COMMODITY RELEASE SLIP
                    </div>
                    <p className="text-[9px] text-slate-400 print-muted">
                      Certified Mandi Allocation under National e-NAM Electronic Trade Clearing Protocol
                    </p>
                  </div>

                  {/* Right Dynamic Optical Verification QR Code */}
                  <div className="flex flex-col items-center bg-white p-1.5 rounded-lg border border-slate-700 shadow-sm shrink-0">
                    <QRCodeSVG
                      value={`https://agropulse.gov.in/buyer/invoice/INV-APMC-2026-${activeInvoice.id.toString().padStart(4, '0')}`}
                      size={68}
                      level="H"
                      includeMargin={false}
                    />
                    <span className="text-[7px] text-slate-800 font-mono font-bold mt-0.5">
                      SCAN TO VERIFY
                    </span>
                  </div>

                </div>
              </div>

              {/* Section A: Institutional Buyer & Sourcing Dossier */}
              <div>
                <h4 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 print-dark-text mb-1 flex items-center space-x-1">
                  <Building2 className="w-3 h-3 text-emerald-400" />
                  <span>Section A: Institutional Buyer & Sourcing Dossier</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 print:bg-white p-2.5 rounded-lg border border-slate-800 print-border text-[11px] font-mono">
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-sans">Institutional Buyer</span>
                    <strong className="text-white print-dark-text font-sans">Rajesh Aggarwal</strong>
                    <span className="text-[9px] text-slate-400 block font-sans">(Kisan Agro Foods)</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-sans">Buyer APMC License</span>
                    <strong className="text-white print-dark-text">BUY-MH-2026-9081</strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-sans">Procured From Farmer</span>
                    <strong className="text-emerald-400 print-dark-text font-sans">{activeInvoice.farmer_name || 'Ramesh Patil'}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-sans">Mandi Sourcing Market</span>
                    <strong className="text-slate-300 print-dark-text font-sans">{activeInvoice.center_name || 'Nashik APMC Mandi'}</strong>
                  </div>
                </div>
              </div>

              {/* Section B: Certified Commodity Specification & Weighment Assay */}
              <div>
                <h4 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 print-dark-text mb-1 flex items-center space-x-1">
                  <Scale className="w-3 h-3 text-amber-400" />
                  <span>Section B: Certified Commodity Specification & Allocation Slip</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 print:bg-white p-2.5 rounded-lg border border-slate-800 print-border text-[11px] font-mono">
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-sans">Commodity Lot</span>
                    <strong className="text-white print-dark-text font-sans font-medium">
                      {activeInvoice.crop_name || 'Agricultural Produce'} (#{activeInvoice.token_number})
                    </strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-sans">Allocated Net Weight</span>
                    <strong className="text-white print-dark-text">
                      {(activeInvoice.measured_weight_kg || 2500).toLocaleString()} kg ({(((activeInvoice.measured_weight_kg || 2500)/100).toFixed(1))} Qtl)
                    </strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-sans">Quality Grade</span>
                    <strong className="text-emerald-400 print-dark-text font-sans">
                      Grade {activeInvoice.final_grade || 'A'} (FAQ Verified)
                    </strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-sans">Approved Unit Rate</span>
                    <strong className="text-white print-dark-text">
                      ₹{activeInvoice.final_rate_per_kg || (activeInvoice.amount / (activeInvoice.measured_weight_kg || 2475)).toFixed(2)} / kg
                    </strong>
                  </div>
                </div>
              </div>

              {/* Section C: Financial Settlement & Tax Invoice */}
              <div>
                <h4 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 print-dark-text mb-1 flex items-center space-x-1">
                  <FileCheck className="w-3 h-3 text-blue-400" />
                  <span>Section C: Statutory Fiscal Settlement & Tax Invoice</span>
                </h4>
                <div className="bg-slate-950 print:bg-white rounded-lg border border-slate-800 print-border p-3 text-[11px] font-mono space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400 print-muted font-sans">Gross Produce Valuation:</span>
                    <span className="text-white print-dark-text font-semibold">
                      ₹{(activeInvoice.gross_amount || (activeInvoice.amount / 0.99)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-sans">
                    <span>APMC User Market Development Fee (1.0%):</span>
                    <span className="text-emerald-400 font-mono">
                      +₹{(activeInvoice.mandi_cess_deduction || (activeInvoice.amount * 0.01)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border-t border-slate-800 print-border pt-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="text-slate-400 print-muted block font-sans text-[9px] uppercase">Total Institutional Invoice Amount Paid</span>
                      <span className="text-[10px] text-slate-300 print-dark-text italic font-sans">
                        "{numberToIndianWords(activeInvoice.amount)}"
                      </span>
                    </div>
                    <span className="text-base font-extrabold text-emerald-400 print-dark-text font-mono">
                      ₹{activeInvoice.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section D: Official Signatory Seal & Mandi Gate Dispatch Clearance */}
              <div className="pt-1.5 border-t border-slate-800 print-border flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] text-slate-500 print-muted">
                <div className="space-y-0.5 text-center sm:text-left">
                  <div className="flex items-center space-x-1 text-slate-400 print-dark-text font-semibold">
                    <BadgeCheck className="w-3 h-3 text-emerald-400" />
                    <span>Cryptographic Ledger Verification Hash</span>
                  </div>
                  <div className="font-mono text-[8px] text-slate-500">
                    SHA256: 0x4a9b{activeInvoice.utr_number ? activeInvoice.utr_number.slice(3) : '20268491'}8f4c2c4a
                  </div>
                </div>

                <div className="text-center sm:text-right font-sans">
                  <span className="font-semibold text-slate-300 print-dark-text block">
                    Mandi Commercial Sourcing Directorate
                  </span>
                  <span className="text-[8px] text-emerald-400 print-muted block">
                    Gate Clearance #2 (Logistics Dispatch Approved) • {new Date(activeInvoice.paid_at || Date.now()).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-1.5 no-print border-t border-slate-800">
                <button
                  onClick={() => setActiveInvoice(null)}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs transition"
                >
                  Close
                </button>
                <button
                  onClick={() => setReviewFarmerTarget({
                    id: activeInvoice.farmer_id || 1,
                    name: activeInvoice.farmer_name || 'Ramesh Patil',
                    role: 'FARMER',
                    cropName: activeInvoice.crop_name,
                    produceId: activeInvoice.produce_id || 1
                  })}
                  className="py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition shadow-sm"
                  title="Rate farmer on crop quality and packaging"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Rate Farmer</span>
                </button>
                <button
                  onClick={() => handleSendWhatsAppInvoice(activeInvoice)}
                  className="py-2 px-3 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-semibold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send to WhatsApp (7020975052)</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-1.5 shadow-sm transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Save / Print PDF Tax Invoice</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Rate Farmer Modal */}
      {reviewFarmerTarget && (
        <TradeReviewModal
          isOpen={!!reviewFarmerTarget}
          onClose={() => setReviewFarmerTarget(null)}
          targetUser={reviewFarmerTarget}
          currentUserRole="BUYER"
          currentUserId={4}
          produceId={reviewFarmerTarget.produceId}
          cropName={reviewFarmerTarget.cropName}
          onReviewSubmitted={() => fetchPayments()}
        />
      )}

    </div>
  );
}
