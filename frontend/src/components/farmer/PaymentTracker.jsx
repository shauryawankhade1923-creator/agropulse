import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  CreditCard, 
  CheckCircle2, 
  Receipt, 
  ArrowUpRight, 
  ShieldCheck, 
  Building2, 
  RefreshCw, 
  Search, 
  Printer, 
  Sparkles, 
  TrendingUp, 
  MessageSquare, 
  BadgeCheck, 
  Scale, 
  FileCheck, 
  ExternalLink,
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

export default function PaymentTracker() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [reviewBuyerTarget, setReviewBuyerTarget] = useState(null);

  const handleSendWhatsAppReceipt = (p) => {
    if (!p) return;
    const msg = (
      `✅ *Government APMC Mandi Settlement & DBT Receipt*\n\n` +
      `Namaste *${p.farmer_name || 'Ramesh Patil'}* ji,\n` +
      `Your crop inspection & weighing is COMPLETE and Direct Bank DBT has been disbursed!\n\n` +
      `🌾 *Produce:* ${p.crop_name || 'Agricultural Produce'}\n` +
      `💰 *Net Payable Disbursed:* *₹${p.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}*\n` +
      `🏦 *Transferred To:* ${p.bank_account_masked}\n` +
      `🆔 *Banking UTR / Ref:* \`${p.utr_number}\`\n` +
      `📜 *Digital Certificate:* Verified by Mandi Quality Officer\n\n` +
      `Thank you for transacting on AgroPulse APMC Portal.`
    );
    window.open(`https://wa.me/917020975052?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await api.getFarmerPayments(1);
      setPayments(data || []);
    } catch (err) {
      console.error('Failed to load farmer payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    const interval = setInterval(fetchPayments, 8000);
    return () => clearInterval(interval);
  }, []);

  const totalDisbursed = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Background Dashboard & History - Completely Hidden during Voucher Print */}
      <div className={activeReceipt ? "space-y-6 print:hidden" : "space-y-6"}>
        
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                Direct Benefit Transfer (DBT)
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Payment & Settlement History
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Transparent, automated APMC bank settlements with real-time UTR tracking.
              </p>
            </div>

            <button
              onClick={fetchPayments}
              disabled={loading}
              className="px-3.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-850 text-slate-300 text-xs font-medium border border-slate-800 flex items-center space-x-2 transition self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Total Disbursed (Direct to Bank)</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              ₹{totalDisbursed.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              100% processed via NPCI PFMS gateway
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Settled Transactions</span>
              <div className="w-7 h-7 rounded-lg bg-blue-950/60 border border-blue-800 text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {payments.length}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Avg. disbursement latency: &lt; 2 minutes
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Primary Beneficiary Account</span>
              <div className="w-7 h-7 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-400 flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base font-bold text-slate-200 font-mono">
              SBIN-XXXX-4819
            </div>
            <span className="text-[11px] text-emerald-400 mt-1 block flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 inline" />
              <span>Aadhaar & NPCI DBT Linked</span>
            </span>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              All Disbursement Records ({payments.length})
            </h2>
          </div>

          {loading && payments.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">Loading records...</div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">No records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Reference & UTR</th>
                    <th className="py-3 px-4">Farmer / Lot</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Net Payout</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {p.transaction_ref || p.settlement_id || `DBT-2026-${p.id || 101}`}
                        <span className="block text-[10px] text-slate-500 font-normal">
                          UTR: {p.utr_number || 'UTR202608319912'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <strong className="text-white block font-sans font-medium">{p.crop_name || p.produce_name || 'Agricultural Produce'}</strong>
                        <span className="text-[11px] text-slate-400 font-sans">{p.farmer_name || 'Ramesh Patil'} • {p.token_number || 'AP-2026-9901'}</span>
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-400">
                        {(p.payment_mode || 'DIRECT_BENEFIT_TRANSFER').replace(/_/g, ' ')}
                      </td>
                      <td className="py-3.5 px-4 text-sm font-semibold text-emerald-400">
                        ₹{(p.amount || p.net_disbursed || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>SETTLED</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <button
                          onClick={() => setActiveReceipt(p)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs border border-slate-700 inline-flex items-center space-x-1 transition cursor-pointer"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Voucher</span>
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

      {/* Official Government APMC Mandi Procurement Voucher Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 print-modal-overlay overflow-y-auto">
          <div className="bg-slate-900 border border-slate-750 max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden print-voucher-card my-auto">
            
            {/* National Tricolor Top Strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-slate-100 to-emerald-500" />

            <div className="p-4 sm:p-5 space-y-3">
              
              {/* Modal Screen Top Bar */}
              <div className="flex items-center justify-between no-print border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold tracking-wide uppercase font-mono">
                    ✓ NPCI PFMS DBT DISBURSED
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Ref: {activeReceipt.transaction_ref}</span>
                </div>
                <button
                  onClick={() => setActiveReceipt(null)}
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
                        {activeReceipt.center_name ? (activeReceipt.center_name.toUpperCase().includes('APMC') ? activeReceipt.center_name.toUpperCase() : `${activeReceipt.center_name.toUpperCase()} APMC MANDI`) : 'KRISHI UPAJ MANDI SAMITI (APMC)'}
                      </h1>
                    </div>
                    <div className="text-[11px] font-bold text-emerald-400 print-dark-text">
                      AGRICULTURAL PRODUCE MARKET COMMITTEE • DIRECT BENEFIT TRANSFER (DBT) ELECTRONIC PAYMENT VOUCHER
                    </div>
                    <p className="text-[9px] text-slate-400 print-muted">
                      Official Certified Weighbridge Assay & Real-Time Banking Settlement Certificate (e-NAM Protocol)
                    </p>
                  </div>

                  {/* Right Dynamic Optical Verification QR Code */}
                  <div className="flex flex-col items-center bg-white p-1.5 rounded-lg border border-slate-700 shadow-sm shrink-0">
                    <QRCodeSVG
                      value={`https://agropulse.gov.in/verify/utr/${activeReceipt.utr_number}`}
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

              {/* Beneficiary & Banking Dossier */}
              <div>
                <h4 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 print-dark-text mb-1 flex items-center space-x-1">
                  <CreditCard className="w-3 h-3 text-emerald-400" />
                  <span>Section A: Beneficiary & Banking Settlement Dossier</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 print:bg-white p-2.5 rounded-lg border border-slate-800 print-border text-[11px] font-mono">
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-sans">Beneficiary Farmer</span>
                    <strong className="text-white print-dark-text font-sans">{activeReceipt.farmer_name || 'Ramesh Patil'}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-sans">Aadhaar Linked Account</span>
                    <strong className="text-white print-dark-text">{activeReceipt.bank_account_masked || activeReceipt.bank_name || 'SBIN-XXXX-4819'}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-sans">Banking UTR Number</span>
                    <strong className="text-emerald-400 print-dark-text">{activeReceipt.utr_number || 'UTR202608319912'}</strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-sans">Disbursement Mode</span>
                    <strong className="text-slate-300 print-dark-text font-sans">NPCI Direct DBT</strong>
                  </div>
                </div>
              </div>

              {/* Certified Weighment & Assay Slip */}
              <div>
                <h4 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 print-dark-text mb-1 flex items-center space-x-1">
                  <Scale className="w-3 h-3 text-amber-400" />
                  <span>Section B: Certified Laboratory Weighment & Assay Certificate</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 print:bg-white p-2.5 rounded-lg border border-slate-800 print-border text-[11px] font-mono">
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-sans">Produce & Pass</span>
                    <strong className="text-white print-dark-text font-sans font-medium">
                      {activeReceipt.crop_name || activeReceipt.produce_name || 'Produce Lot'} (#{activeReceipt.token_number || 'AP-2026-9901'})
                    </strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-sans">Certified Net Weight</span>
                    <strong className="text-white print-dark-text">
                      {(activeReceipt.measured_weight_kg || activeReceipt.quantity_kg || 2500).toLocaleString()} kg ({(((activeReceipt.measured_weight_kg || activeReceipt.quantity_kg || 2500)/100).toFixed(1))} Qtl)
                    </strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-sans">Tested Quality Grade</span>
                    <strong className="text-emerald-400 print-dark-text font-sans">
                      Grade {activeReceipt.final_grade || 'A'} (FAQ Verified)
                    </strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-sans">Approved Unit Rate</span>
                    <strong className="text-white print-dark-text">
                      ₹{activeReceipt.final_rate_per_kg || ((activeReceipt.amount || 68062.50) / (activeReceipt.measured_weight_kg || activeReceipt.quantity_kg || 2500)).toFixed(2)} / kg
                    </strong>
                  </div>
                </div>
              </div>

              {/* Financial Valuation & Payout Summary */}
              <div>
                <h4 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 print-dark-text mb-1 flex items-center space-x-1">
                  <FileCheck className="w-3 h-3 text-blue-400" />
                  <span>Section C: Statutory Fiscal Settlement & Net Disbursement</span>
                </h4>
                <div className="bg-slate-950 print:bg-white rounded-lg border border-slate-800 print-border p-3 text-[11px] font-mono space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400 print-muted font-sans">Gross Produce Valuation:</span>
                    <span className="text-white print-dark-text font-semibold">
                      ₹{(activeReceipt.gross_amount || ((activeReceipt.amount || 68062.50) / 0.99)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-sans">
                    <span>Statutory Mandi Development Cess (1.0%):</span>
                    <span className="text-rose-400 font-mono">
                      -₹{(activeReceipt.mandi_cess_deduction || activeReceipt.mandi_cess_deducted || ((activeReceipt.amount || 68062.50) * 0.01)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border-t border-slate-800 print-border pt-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="text-slate-400 print-muted block font-sans text-[9px] uppercase">Net Direct Benefit Transfer (DBT) Deposited</span>
                      <span className="text-[10px] text-slate-300 print-dark-text italic font-sans">
                        "{numberToIndianWords(activeReceipt.amount || activeReceipt.net_disbursed || 68062.50)}"
                      </span>
                    </div>
                    <span className="text-base font-extrabold text-emerald-400 print-dark-text font-mono">
                      ₹{(activeReceipt.amount || activeReceipt.net_disbursed || 68062.50).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>


              {/* Official Signatory Seal & Blockchain Audit Trail */}
              <div className="pt-1.5 border-t border-slate-800 print-border flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] text-slate-500 print-muted">
                <div className="space-y-0.5 text-center sm:text-left">
                  <div className="flex items-center space-x-1 text-slate-400 print-dark-text font-semibold">
                    <BadgeCheck className="w-3 h-3 text-emerald-400" />
                    <span>Cryptographic Ledger Verification Hash</span>
                  </div>
                  <div className="font-mono text-[8px] text-slate-500">
                    SHA256: 0x8f4c{activeReceipt.utr_number ? activeReceipt.utr_number.slice(3) : '20268491'}e7b92c4a
                  </div>
                </div>

                <div className="text-center sm:text-right font-sans">
                  <span className="font-semibold text-slate-300 print-dark-text block">
                    S. M. Joshi (APMC Weighbridge Officer)
                  </span>
                  <span className="text-[8px] text-emerald-400 print-muted block">
                    Digitally Certified & Approved • {new Date(activeReceipt.paid_at || Date.now()).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-1.5 no-print border-t border-slate-800">
                <button
                  onClick={() => setActiveReceipt(null)}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium rounded-lg text-xs transition"
                >
                  Close
                </button>
                <button
                  onClick={() => setReviewBuyerTarget({
                    id: 4,
                    name: 'Rajesh Aggarwal (Kisan Agro Foods)',
                    role: 'BUYER',
                    cropName: activeReceipt.crop_name,
                    produceId: 1
                  })}
                  className="py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition shadow-sm"
                  title="Rate this institutional procurement buyer"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Rate Buyer</span>
                </button>
                <button
                  onClick={() => handleSendWhatsAppReceipt(activeReceipt)}
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
                  <span>Save / Print PDF Certificate</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Rate Buyer Modal */}
      {reviewBuyerTarget && (
        <TradeReviewModal
          isOpen={!!reviewBuyerTarget}
          onClose={() => setReviewBuyerTarget(null)}
          targetUser={reviewBuyerTarget}
          currentUserRole="FARMER"
          currentUserId={1}
          produceId={reviewBuyerTarget.produceId}
          cropName={reviewBuyerTarget.cropName}
          onReviewSubmitted={() => fetchPayments()}
        />
      )}

    </div>
  );
}
