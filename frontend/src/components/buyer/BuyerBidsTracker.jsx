import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Truck, 
  DollarSign, 
  RefreshCw, 
  MapPin, 
  ArrowRight, 
  XCircle, 
  AlertTriangle, 
  Receipt, 
  Printer, 
  Building2, 
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

export default function BuyerBidsTracker({ onBrowseMarketplace }) {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [reviewFarmerTarget, setReviewFarmerTarget] = useState(null);

  const fetchBids = async () => {
    try {
      const data = await api.getOffersByBuyer(4);
      setBids(data || []);
    } catch (err) {
      console.error('Failed to load buyer bids:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchBids().finally(() => setLoading(false));

    const interval = setInterval(fetchBids, 4000);
    return () => clearInterval(interval);
  }, []);

  const acceptedBids = bids.filter(b => b.status === 'ACCEPTED');
  const totalCommitted = bids.reduce((acc, b) => b.status === 'ACCEPTED' ? acc + (b.offered_price_per_kg * b.quantity_requested_kg) : acc, 0);

  const handleCancelBid = async (bid) => {
    setCancellingId(bid.id);
    try {
      await api.cancelBuyerOffer(bid.id, 'BUYER', 'Buyer withdrew the offer before farmer acceptance');
      fetchBids();
    } catch (err) {
      alert('Error cancelling bid: ' + err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const handleSendWhatsAppInvoice = (bid) => {
    if (!bid) return;
    const totalVal = bid.offered_price_per_kg * bid.quantity_requested_kg;
    const cess = totalVal * 0.01;
    const netTotal = totalVal + cess;
    const invNo = `INV-APMC-${new Date().getFullYear()}-${bid.id.toString().padStart(4, '0')}`;
    const msg = (
      `🏛️ *Official APMC Buyer Procurement Tax Invoice*\n\n` +
      `🏢 *Buyer:* Rajesh Aggarwal (Kisan Agro Foods Pvt. Ltd.)\n` +
      `🧾 *Invoice No:* \`${invNo}\`\n` +
      `🌾 *Produce:* ${bid.crop_name || 'Agricultural Produce'} (Grade A)\n` +
      `📦 *Contract Volume:* ${bid.quantity_requested_kg.toLocaleString()} kg (${(bid.quantity_requested_kg/100).toFixed(1)} Quintals)\n` +
      `💰 *Agreed Rate:* ₹${bid.offered_price_per_kg} / kg\n` +
      `💵 *Gross Value:* ₹${totalVal.toLocaleString('en-IN')}\n` +
      `🏛️ *APMC Market Cess (1%):* ₹${cess.toLocaleString('en-IN')}\n` +
      `💳 *Total Invoice Payable:* *₹${netTotal.toLocaleString('en-IN')}*\n` +
      `🚚 *Mandi Gate Clearance:* Ready for Bay Loading\n\n` +
      `Certified by Mandi Commercial Directorate.`
    );
    window.open(`https://wa.me/917020975052?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Background Bids Portfolio - Completely Hidden during Invoice Print */}
      <div className={activeInvoice ? "space-y-6 print:hidden" : "space-y-6"}>
        
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                Procurement Portfolio
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
                My Active Purchase Bids
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Track bids submitted to farmers, acceptance status, and procurement commitments.
              </p>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <button
                onClick={() => onBrowseMarketplace && onBrowseMarketplace()}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg text-xs transition"
              >
                + Place New Bid
              </button>
              <button
                onClick={() => { setLoading(true); fetchBids().finally(() => setLoading(false)); }}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 transition"
                title="Refresh Bids"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <span className="text-xs text-slate-500 uppercase font-medium block mb-1">Total Active Bids</span>
            <div className="text-2xl font-bold text-white font-mono">
              {bids.length} Bids
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Across active farmer lots
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <span className="text-xs text-slate-500 uppercase font-medium block mb-1">Accepted / Locked Deals</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              {acceptedBids.length} Deals
            </div>
            <span className="text-[11px] text-emerald-400 mt-1 block">
              Guaranteed allocation
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <span className="text-xs text-slate-500 uppercase font-medium block mb-1">Total Committed Volume</span>
            <div className="text-2xl font-bold text-amber-400 font-mono">
              ₹{totalCommitted.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Institutional escrow budget
            </span>
          </div>
        </div>

        {/* Bids List */}
        <div className="space-y-3">
          {loading && bids.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">Loading placed bids...</div>
          ) : bids.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-300">No Bids Placed Yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Browse the Produce Marketplace to inspect farmer lots and place competitive purchase bids.
              </p>
            </div>
          ) : (
            bids.map((b) => {
              const isAccepted = b.status === 'ACCEPTED';
              const isRejected = b.status === 'REJECTED';
              const bidRate = b.offered_price_per_kg || b.offered_price || 0;
              const bidQty = b.quantity_requested_kg || b.quantity_requested || 0;
              const totalVal = bidRate * bidQty;

              return (
                <div
                  key={b.id}
                  className={`bg-slate-900 border rounded-xl p-5 transition ${
                    isAccepted 
                      ? 'border-emerald-800/80' 
                      : (isRejected 
                          ? 'border-slate-850 opacity-60 bg-slate-950/40' 
                          : 'border-slate-800 hover:border-slate-700')
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Left Details */}
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-white">
                          Lot #{b.produce_id} • {b.crop_name || 'Agricultural Produce'}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                          isAccepted 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                            : (isRejected 
                                ? 'bg-rose-950 text-rose-400 border border-rose-900' 
                                : 'bg-amber-950 text-amber-400 border border-amber-800')
                        }`}>
                          {isRejected ? 'CANCELLED / DECLINED' : b.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-mono">
                        <span>Bid Rate: <strong className="text-emerald-400">₹{bidRate}/kg</strong></span>
                        <span>•</span>
                        <span>Volume: <strong>{(bidQty || 0).toLocaleString()} kg</strong></span>
                        <span>•</span>
                        <span>Total Value: <strong className="text-white">₹{(totalVal || 0).toLocaleString('en-IN')}</strong></span>
                      </div>


                      {b.message && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">
                          "{b.message}"
                        </p>
                      )}
                    </div>

                    {/* Actions on Right */}
                    <div className="shrink-0 text-right flex items-center space-x-2">
                      {isAccepted ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setReviewFarmerTarget({
                              id: 1, // Farmer Ramesh Patil
                              name: 'Ramesh Patil',
                              role: 'FARMER',
                              cropName: b.crop_name,
                              produceId: b.produce_id
                            })}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold inline-flex items-center space-x-1.5 transition shadow-sm"
                            title="Rate this farmer's produce quality and delivery"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>Rate Farmer</span>
                          </button>
                          <button
                            onClick={() => setActiveInvoice(b)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center space-x-1.5 transition shadow-sm"
                            title="View Official APMC Procurement Tax Invoice"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Tax Invoice</span>
                          </button>
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-400 text-xs font-semibold border border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accepted</span>
                          </span>
                        </div>
                      ) : isRejected ? (
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-950 text-rose-400 text-xs font-medium border border-rose-900">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Bid Cancelled</span>
                        </span>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCancelBid(b)}
                            disabled={cancellingId === b.id}
                            className="px-3 py-1.5 bg-slate-950 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-900 text-slate-400 text-xs font-medium rounded-lg border border-slate-800 flex items-center space-x-1.5 transition disabled:opacity-50"
                            title="Withdraw this bid"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{cancellingId === b.id ? 'Withdrawing...' : 'Withdraw Bid'}</span>
                          </button>
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-950 text-amber-400 text-xs font-medium border border-slate-800">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Under Review</span>
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })
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
                    ✓ APMC TRADE CONFIRMED & ALLOCATED
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
                        KRISHI UPAJ MANDI SAMITI (APMC)
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
                    <strong className="text-emerald-400 print-dark-text font-sans">Ramesh Patil</strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-sans">Mandi Sourcing Market</span>
                    <strong className="text-slate-300 print-dark-text font-sans">Nashik APMC Mandi</strong>
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
                      {activeInvoice.crop_name || 'Agricultural Produce'} (#{activeInvoice.produce_id})
                    </strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-sans">Allocated Volume</span>
                    <strong className="text-white print-dark-text">
                      {activeInvoice.quantity_requested_kg.toLocaleString()} kg ({(activeInvoice.quantity_requested_kg/100).toFixed(1)} Qtl)
                    </strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-sans">Quality Grade</span>
                    <strong className="text-emerald-400 print-dark-text font-sans">
                      Grade A (Certified FAQ)
                    </strong>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-500 uppercase block font-sans">Locked Contract Rate</span>
                    <strong className="text-white print-dark-text">
                      ₹{activeInvoice.offered_price_per_kg} / kg (₹{(activeInvoice.offered_price_per_kg * 100).toFixed(2)}/Qtl)
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
                    <span className="text-slate-400 print-muted font-sans">Base Produce Value:</span>
                    <span className="text-white print-dark-text font-semibold">
                      ₹{(activeInvoice.offered_price_per_kg * activeInvoice.quantity_requested_kg).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-sans">
                    <span>APMC Market User Development Fee (1.0%):</span>
                    <span className="text-emerald-400 font-mono">
                      +₹{(activeInvoice.offered_price_per_kg * activeInvoice.quantity_requested_kg * 0.01).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border-t border-slate-800 print-border pt-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="text-slate-400 print-muted block font-sans text-[9px] uppercase">Total Institutional Invoice Amount Payable</span>
                      <span className="text-[10px] text-slate-300 print-dark-text italic font-sans">
                        "{numberToIndianWords(activeInvoice.offered_price_per_kg * activeInvoice.quantity_requested_kg * 1.01)}"
                      </span>
                    </div>
                    <span className="text-base font-extrabold text-emerald-400 print-dark-text font-mono">
                      ₹{(activeInvoice.offered_price_per_kg * activeInvoice.quantity_requested_kg * 1.01).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
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
                    SHA256: 0x4a9b20268491e7b9{activeInvoice.id.toString().padStart(4, '0')}8f4c2c4a
                  </div>
                </div>

                <div className="text-center sm:text-right font-sans">
                  <span className="font-semibold text-slate-300 print-dark-text block">
                    Mandi Commercial Sourcing Directorate
                  </span>
                  <span className="text-[8px] text-emerald-400 print-muted block">
                    Gate Clearance #2 (Logistics Dispatch Approved) • {new Date().toLocaleDateString('en-GB')}
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
                    id: 1, // Ramesh Patil
                    name: 'Ramesh Patil',
                    role: 'FARMER',
                    cropName: activeInvoice.crop_name,
                    produceId: activeInvoice.produce_id
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
          onReviewSubmitted={() => fetchBids()}
        />
      )}

    </div>
  );
}
