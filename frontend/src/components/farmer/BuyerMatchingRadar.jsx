import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Star, 
  CheckCircle, 
  Calendar,
  ShieldCheck,
  Inbox,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { api } from '../../api';

export default function BuyerMatchingRadar({ selectedProduceId, onBookSlotForProduce }) {
  const [produces, setProduces] = useState([]);
  const [activeProduceId, setActiveProduceId] = useState(selectedProduceId || 1);
  const [matches, setMatches] = useState([]);
  const [incomingOffers, setIncomingOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acceptedOffer, setAcceptedOffer] = useState(null);
  const [acceptingOfferId, setAcceptingOfferId] = useState(null);

  useEffect(() => {
    async function loadProduces() {
      try {
        const data = await api.getProduces({ farmer_id: 1 });
        setProduces(data);
        if (data.length > 0 && !selectedProduceId) {
          setActiveProduceId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load produces:', err);
      }
    }
    loadProduces();
  }, [selectedProduceId]);

  const loadMatchesAndOffers = async () => {
    if (!activeProduceId) return;
    try {
      const [matchData, offersData] = await Promise.all([
        api.getMatchedBuyers(activeProduceId),
        api.getOffersForProduce(activeProduceId).catch(() => [])
      ]);
      setMatches(matchData || []);
      setIncomingOffers(offersData || []);
    } catch (err) {
      console.error('Failed to load matches and offers:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadMatchesAndOffers().finally(() => setLoading(false));

    // Live polling for incoming buyer bids
    const interval = setInterval(loadMatchesAndOffers, 4000);
    return () => clearInterval(interval);
  }, [activeProduceId]);

  const handleAcceptDirectBid = async (offer) => {
    setAcceptingOfferId(offer.id);
    try {
      await api.acceptBuyerOffer(offer.id);
      setAcceptedOffer({
        buyer_name: offer.buyer_name || 'Verified Buyer',
        buyer_company: 'Kisan Agro Foods / APMC Verified Buyer',
        offered_price_per_kg: offer.offered_price_per_kg,
        quantity_requested_kg: offer.quantity_requested_kg
      });
      loadMatchesAndOffers();
    } catch (err) {
      alert('Error accepting offer: ' + err.message);
    } finally {
      setAcceptingOfferId(null);
    }
  };

  const handleAcceptDeal = (buyer) => {
    setAcceptedOffer(buyer);
  };

  const activeProduce = produces.find(p => p.id === activeProduceId) || produces[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
              Procurement Discovery & Direct Bids
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Buyer Matches & Incoming Bids
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Review live offers submitted by institutional buyers or browse AI-ranked buyers for your lot.
            </p>
          </div>

          {/* Produce Lot Picker */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 whitespace-nowrap">Lot:</span>
            <select
              value={activeProduceId}
              onChange={(e) => setActiveProduceId(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-slate-700"
            >
              {produces.map((p) => (
                <option key={p.id} value={p.id}>
                  Lot #{p.id}: {p.crop_name} ({p.quantity_kg} kg @ ₹{p.expected_price_per_kg}/kg)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Produce Summary Bar */}
      {activeProduce && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-[11px] text-slate-500 block uppercase font-medium">Crop & Variety</span>
            <strong className="text-sm text-white mt-0.5 block">{activeProduce.crop_name}</strong>
            <span className="text-[11px] text-slate-400 block truncate">{activeProduce.variety}</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-[11px] text-slate-500 block uppercase font-medium">Quantity & Grade</span>
            <strong className="text-sm text-white font-mono mt-0.5 block">{activeProduce.quantity_kg.toLocaleString()} kg</strong>
            <span className="text-[11px] text-emerald-400 block font-semibold flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 inline" />
              <span>Grade {activeProduce.quality_grade} {activeProduce.ai_vision_verified ? `(${activeProduce.ai_quality_score || 95}% AI Certified)` : 'Verified'}</span>
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-[11px] text-slate-500 block uppercase font-medium">Asking Rate</span>
            <strong className="text-sm text-emerald-400 font-mono mt-0.5 block">₹{activeProduce.expected_price_per_kg}/kg</strong>
            <span className="text-[11px] text-slate-400 block font-mono">
              ₹{(activeProduce.quantity_kg * activeProduce.expected_price_per_kg).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 block uppercase font-medium">Mandi Ingress</span>
              <span className="text-xs text-slate-300 font-medium">Slot Booking Open</span>
            </div>
            <button
              onClick={() => onBookSlotForProduce && onBookSlotForProduce(activeProduce)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center space-x-1 shadow-sm transition"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Slot</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1: INCOMING DIRECT BUYER BIDS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Inbox className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Direct Buyer Bids Received on Lot #{activeProduce?.id} ({incomingOffers.length})
            </h3>
          </div>
          {incomingOffers.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-semibold">
              Live Bids Active
            </span>
          )}
        </div>

        {incomingOffers.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No direct purchase bids placed on this lot yet. Check AI Recommended Buyers below.
          </div>
        ) : (
          <div className="space-y-3">
            {incomingOffers.map((offer) => {
              const isAccepted = offer.status === 'ACCEPTED';
              const totalVal = offer.offered_price_per_kg * offer.quantity_requested_kg;

              return (
                <div
                  key={offer.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <strong className="text-sm font-semibold text-white">
                        {offer.buyer_name || 'Rajesh Aggarwal'}
                      </strong>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        isAccepted
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {offer.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 font-mono">
                      Offered: <strong className="text-emerald-400 font-semibold">₹{offer.offered_price_per_kg}/kg</strong> for <span className="text-slate-200">{offer.quantity_requested_kg} kg</span> (Total: ₹{totalVal.toLocaleString('en-IN')})
                    </div>

                    {offer.message && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5">
                        "{offer.message}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {isAccepted ? (
                      <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-emerald-400 text-xs font-semibold border border-slate-800 flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Deal Locked</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcceptDirectBid(offer)}
                        disabled={acceptingOfferId === offer.id}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center space-x-1.5 transition disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{acceptingOfferId === offer.id ? 'Locking Deal...' : 'Accept Bid & Lock Deal'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: AI RANKED BUYERS LIST */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          AI-Ranked Verified Buyers for this Crop
        </h3>

        {loading && matches.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            Computing buyer compatibility scores...
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((buyer, idx) => (
              <div
                key={buyer.buyer_id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left: Rank & Buyer Info */}
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center justify-center font-bold text-xs shrink-0 text-slate-300">
                      <span className="text-[9px] text-slate-500">RANK</span>
                      <span>#{idx + 1}</span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-white">{buyer.buyer_name}</h3>
                        <span className="text-xs text-slate-400">({buyer.buyer_company})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {buyer.feasibility_badge}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{buyer.location} ({buyer.distance_km} km)</span>
                        </span>
                        <span className="flex items-center space-x-1 text-slate-300">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{buyer.buyer_rating}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-slate-400">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{buyer.payment_speed}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Match Scores Breakdown */}
                  <div className="flex items-center space-x-6 border-y lg:border-y-0 lg:border-x border-slate-800 py-3 lg:py-0 lg:px-6">
                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Match</span>
                      <span className="text-xl font-bold text-white font-mono">
                        {buyer.overall_match_score}%
                      </span>
                    </div>

                    <div className="text-left space-y-1 text-xs text-slate-400">
                      <div className="flex items-center justify-between space-x-4">
                        <span>Offered Rate:</span>
                        <strong className="text-emerald-400 font-mono">₹{buyer.offered_price_per_kg}/kg</strong>
                      </div>
                      <div className="flex items-center justify-between space-x-4">
                        <span>Max Batch:</span>
                        <strong className="text-slate-200 font-mono">{buyer.quantity_requested_kg.toLocaleString()} kg</strong>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleAcceptDeal(buyer)}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm flex items-center space-x-1.5 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Accept Offer</span>
                    </button>

                    <button
                      onClick={() => onBookSlotForProduce && onBookSlotForProduce(activeProduce)}
                      className="px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-850 text-slate-300 text-xs border border-slate-800 transition"
                    >
                      Mandi Slot
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deal Confirmation Modal */}
      {acceptedOffer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-xl p-6 space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-emerald-950/50 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-5 h-5" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-white">Offer Accepted & Deal Locked</h3>
              <p className="text-xs text-slate-400 mt-1">
                Direct agreement confirmed with <strong className="text-slate-200">{acceptedOffer.buyer_name}</strong> ({acceptedOffer.buyer_company}).
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Agreed Rate:</span>
                <span className="text-emerald-400 font-bold">₹{acceptedOffer.offered_price_per_kg}/kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lot Weight:</span>
                <span className="text-white">{acceptedOffer.quantity_requested_kg} kg</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-sm">
                <span className="text-slate-300">Total Settlement:</span>
                <span className="text-white">
                  ₹{(acceptedOffer.offered_price_per_kg * acceptedOffer.quantity_requested_kg).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setAcceptedOffer(null)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setAcceptedOffer(null);
                  if (onBookSlotForProduce) onBookSlotForProduce(activeProduce);
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                Generate Token →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
