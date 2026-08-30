import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Truck, 
  Calendar, 
  Building2,
  RefreshCw,
  ArrowRight,
  XCircle,
  AlertTriangle,
  Star
} from 'lucide-react';
import { api } from '../../api';
import TradeReviewModal from '../reviews/TradeReviewModal';
import ReputationProfileModal from '../reviews/ReputationProfileModal';
import { useLanguage } from '../../i18n/LanguageContext';

export default function IncomingBidsView({ onBookSlotForProduce }) {
  const { t, language } = useLanguage();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [lockedDeal, setLockedDeal] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Review modals state
  const [reviewTarget, setReviewTarget] = useState(null);
  const [profileUser, setProfileUser] = useState(null);

  const fetchOffers = async () => {
    try {
      const data = await api.getOffersForFarmer(1);
      setOffers(data || []);
    } catch (err) {
      console.error('Failed to load incoming bids:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOffers().finally(() => setLoading(false));

    const interval = setInterval(fetchOffers, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptBid = async (offer) => {
    setAcceptingId(offer.id);
    setErrorMsg(null);
    try {
      await api.acceptBuyerOffer(offer.id);
      setLockedDeal(offer);
      fetchOffers();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleCancelBid = async (offer) => {
    setCancellingId(offer.id);
    setErrorMsg(null);
    try {
      await api.cancelBuyerOffer(offer.id, 'FARMER', 'Farmer declined rate on current produce lot');
      fetchOffers();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const pendingCount = offers.filter(o => o.status === 'PENDING').length;
  const acceptedCount = offers.filter(o => o.status === 'ACCEPTED').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                {t('bids_sub')}
              </span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold animate-pulse">
                  {pendingCount} New Action Required
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              {t('bids_title')}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              {t('bids_desc')}
            </p>
          </div>

          <button
            onClick={() => { setLoading(true); fetchOffers().finally(() => setLoading(false)); }}
            className="p-2 rounded-lg bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 transition self-start sm:self-auto cursor-pointer"
            title="Refresh Bids"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-medium block mb-1">{t('pending_offers')}</span>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {pendingCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {t('awaiting_confirmation')}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-medium block mb-1">{t('accepted_deals')}</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {acceptedCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {t('locked_rate')}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-medium block mb-1">{t('total_bids_value')}</span>
          <div className="text-2xl font-bold text-white font-mono">
            ₹{offers.reduce((acc, o) => acc + (o.offered_price_per_kg * o.quantity_requested_kg), 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {t('across_lots')}
          </span>
        </div>
      </div>

      {/* In-App Action Error Banner */}
      {errorMsg && (
        <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-3 rounded-lg flex items-start space-x-2.5">
          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="block text-rose-300 font-semibold">Action Failed</strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Bids List */}
      <div className="space-y-3">
        {loading && offers.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">Loading received bids...</div>
        ) : offers.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
            <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-300">No Bids Received Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              When a buyer places a purchase bid on any of your produce lots from the Marketplace, it will appear here in real time.
            </p>
          </div>
        ) : (
          offers.map((offer) => {
            const isAccepted = offer.status === 'ACCEPTED';
            const isRejected = offer.status === 'REJECTED';
            const isTokenCancelled = isRejected && (offer.message?.toLowerCase().includes('token') || offer.message?.toLowerCase().includes('cancelled'));
            const totalVal = offer.offered_price_per_kg * offer.quantity_requested_kg;

            return (
              <div
                key={offer.id}
                className={`bg-slate-900 border rounded-xl p-5 transition ${
                  isAccepted 
                    ? 'border-emerald-800/80 bg-slate-900/90' 
                    : (isRejected 
                        ? 'border-rose-900/40 bg-slate-950/70' 
                        : 'border-slate-800 hover:border-slate-700')
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Details */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        {offer.buyer_name || 'Rajesh Aggarwal'}
                      </h3>
                      <span className="text-xs text-slate-400">
                        (Kisan Agro Foods / APMC Verified)
                      </span>

                      {/* Buyer Trust Rating Badge */}
                      <button
                        type="button"
                        onClick={() => setProfileUser({ id: offer.buyer_id || 4, name: offer.buyer_name || 'Rajesh Aggarwal', role: 'BUYER' })}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400 text-[10px] font-mono hover:border-amber-500/50 transition cursor-pointer"
                        title="Click to view Buyer APMC Trust Score & Past Farmer Reviews"
                      >
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-bold">4.9</span>
                        <span className="text-slate-500 font-sans text-[9px]">(Verified Buyer)</span>
                      </button>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                        isAccepted 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                          : (isRejected 
                              ? 'bg-rose-950 text-rose-400 border border-rose-900' 
                              : 'bg-amber-950 text-amber-400 border border-amber-800')
                      }`}>
                        {isTokenCancelled ? 'TOKEN CANCELLED / DEAL REVOKED' : (isRejected ? 'CANCELLED / DECLINED' : offer.status)}
                      </span>
                    </div>

                    {/* Lot & Rate Info */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 font-medium">
                        Target Lot: <strong className="text-white">#{offer.produce_id} - {offer.crop_name}</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                        Bid Rate: <strong className="text-emerald-400 font-bold">₹{offer.offered_price_per_kg}/kg</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                        Quantity: <strong className="text-white">{offer.quantity_requested_kg.toLocaleString()} kg</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-emerald-400 font-bold font-mono">
                        Total: ₹{totalVal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Cancellation or Transporter Message */}
                    {isTokenCancelled ? (
                      <div className="text-xs text-rose-300 bg-rose-950/50 p-2.5 rounded-lg border border-rose-900/80 flex items-start space-x-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                        <div>
                          <strong className="font-semibold text-rose-200 block">Mandi E-Pass Cancelled:</strong>
                          <span>{offer.message || 'The QR Token appointment for this lot was cancelled in the Digital Tokens section. The produce lot has been released back to active listings.'}</span>
                        </div>
                      </div>
                    ) : offer.message ? (
                      <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex items-start space-x-2">
                        <Truck className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                        <span className="italic">"{offer.message}"</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {isAccepted ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setReviewTarget({
                            id: offer.buyer_id || 4,
                            name: offer.buyer_name || 'Rajesh Aggarwal',
                            role: 'BUYER',
                            cropName: offer.crop_name,
                            produceId: offer.produce_id
                          })}
                          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition shadow-sm"
                          title="Post a verified review for this buyer"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{t('btn_rate_buyer')}</span>
                        </button>
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-400 text-xs font-semibold border border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Deal Accepted</span>
                        </span>
                      </div>
                    ) : isRejected ? (
                      <div className="text-right space-y-1">
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-950 text-rose-400 text-xs font-medium border border-rose-900">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{isTokenCancelled ? 'Token Cancelled' : 'Offer Cancelled'}</span>
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCancelBid(offer)}
                          disabled={cancellingId === offer.id || acceptingId === offer.id}
                          className="px-3 py-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-900 text-slate-300 font-medium text-xs rounded-lg border border-slate-700 flex items-center space-x-1.5 transition disabled:opacity-50 cursor-pointer"
                          title="Decline this bid & notify buyer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{cancellingId === offer.id ? 'Cancelling...' : t('btn_decline')}</span>
                        </button>
                        <button
                          onClick={() => handleAcceptBid(offer)}
                          disabled={acceptingId === offer.id || cancellingId === offer.id}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center space-x-1.5 transition disabled:opacity-50 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{acceptingId === offer.id ? 'Accepting...' : t('btn_accept_deal')}</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Locked Deal Success Modal */}
      {lockedDeal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-xl p-6 space-y-4 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-950/50 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Deal Locked with Buyer!</h3>
              <p className="text-xs text-slate-400 mt-1">
                You have accepted the purchase offer from <strong className="text-white">{lockedDeal.buyer_name || 'Rajesh Aggarwal'}</strong>.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1.5 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Agreed Rate:</span>
                <span className="text-emerald-400 font-bold">₹{lockedDeal.offered_price_per_kg}/kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Lot Volume:</span>
                <span className="text-white">{lockedDeal.quantity_requested_kg} kg</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1.5 font-bold text-sm">
                <span className="text-slate-300">Total Payout:</span>
                <span className="text-emerald-400">
                  ₹{(lockedDeal.offered_price_per_kg * lockedDeal.quantity_requested_kg).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setLockedDeal(null)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setLockedDeal(null);
                  if (onBookSlotForProduce) onBookSlotForProduce({ id: lockedDeal.produce_id, crop_name: lockedDeal.crop_name, quantity_kg: lockedDeal.quantity_requested_kg, quality_grade: 'A' });
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs shadow-sm"
              >
                Book Mandi Slot →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rate Buyer Modal */}
      {reviewTarget && (
        <TradeReviewModal
          isOpen={!!reviewTarget}
          onClose={() => setReviewTarget(null)}
          targetUser={reviewTarget}
          currentUserRole="FARMER"
          currentUserId={1}
          produceId={reviewTarget.produceId}
          cropName={reviewTarget.cropName}
          onReviewSubmitted={() => fetchOffers()}
        />
      )}

      {/* Buyer Reputation Profile Breakdown Modal */}
      {profileUser && (
        <ReputationProfileModal
          isOpen={!!profileUser}
          onClose={() => setProfileUser(null)}
          userId={profileUser.id}
          userName={profileUser.name}
          userRole={profileUser.role}
        />
      )}

    </div>
  );
}

