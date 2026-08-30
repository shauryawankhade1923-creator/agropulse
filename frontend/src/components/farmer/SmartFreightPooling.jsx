import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  Leaf, 
  TrendingDown, 
  RefreshCw, 
  ArrowRight,
  Phone,
  Package,
  Calendar,
  AlertCircle,
  AlertTriangle,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { api } from '../../api';
import { useLanguage } from '../../i18n/LanguageContext';

export default function SmartFreightPooling({ onNavigateProduce }) {
  const { t, language } = useLanguage();
  const [pools, setPools] = useState([]);
  const [farmerProduces, setFarmerProduces] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('EXPLORE_POOLS'); // EXPLORE_POOLS or MY_BOOKINGS
  
  // Booking modal state
  const [selectedPool, setSelectedPool] = useState(null);
  const [selectedProduceId, setSelectedProduceId] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Pimpalgaon Baswant, Nashik');
  const [pickupTime, setPickupTime] = useState('06:45 AM');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  const loadData = async () => {
    try {
      const [poolData, produceData, bookingData] = await Promise.all([
        api.getLogisticsPools(),
        api.getProduces({ farmer_id: 1 }),
        api.getFarmerFreightBookings(1)
      ]);
      setPools(poolData || []);
      setFarmerProduces(produceData || []);
      setMyBookings(bookingData || []);
      if (produceData && produceData.length > 0 && !selectedProduceId) {
        setSelectedProduceId(produceData[0].id);
      }
    } catch (err) {
      console.error('Failed to load logistics pools:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));

    // Live sync polling
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenJoin = (pool) => {
    setSelectedPool(pool);
    setBookingSuccess(null);
    setBookingError(null);
  };

  const handleSendWhatsAppFreight = (booking, pool) => {
    if (!booking) return;
    const driverName = pool?.driver_name || 'Ganesh Shinde';
    const driverPhone = pool?.driver_phone || '9823114455';
    const vType = pool?.vehicle_type || 'Eicher Pro 10-Ton';
    const vNum = pool?.vehicle_number || 'MH-15-EG-4821';
    const msg = (
      `🚚 *AgroPulse Kisan Smart Freight Pass*\n\n` +
      `Namaste *Ramesh Patil* ji,\n` +
      `Your shared pickup transport has been reserved successfully!\n\n` +
      `📦 *Consignment Code:* \`${booking.consignment_code}\`\n` +
      `👤 *Driver Name:* ${driverName}\n` +
      `📞 *Driver Phone:* ${driverPhone}\n` +
      `🚛 *Vehicle:* ${vType} (\`${vNum}\`)\n` +
      `📍 *Pickup Point:* ${booking.pickup_location}\n` +
      `⏰ *Pickup Time:* ${booking.pickup_time}\n` +
      `💵 *Your Shared Fare:* ₹${booking.calculated_fare?.toLocaleString('en-IN')}\n` +
      `🎉 *Net Savings:* ₹${booking.savings_amount?.toLocaleString('en-IN')} vs Solo Truck Hire\n\n` +
      `Driver will call you 15 minutes before arrival at your farmgate.`
    );
    window.open(`https://wa.me/917020975052?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleConfirmJoin = async (e) => {
    e.preventDefault();
    if (!selectedPool || !selectedProduceId) return;

    setBookingLoading(true);
    setBookingError(null);
    try {
      const res = await api.joinFreightPool({
        pool_id: selectedPool.id,
        farmer_id: 1,
        produce_id: Number(selectedProduceId),
        pickup_location: pickupLocation,
        pickup_time: pickupTime
      });
      setBookingSuccess(res);
      handleSendWhatsAppFreight(res, selectedPool);
      loadData();
    } catch (err) {
      setBookingError(err.message.replace(/^Error joining transport pool:\s*/i, ''));
    } finally {
      setBookingLoading(false);
    }
  };

  const selectedProduceObj = farmerProduces.find(p => p.id === Number(selectedProduceId)) || farmerProduces[0];

  const totalSavedAll = myBookings.reduce((acc, b) => acc + (b.savings_amount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                {t('freight_sub')}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                Save Up to 55%
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              {t('freight_title')}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              {t('freight_desc')}
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 self-start md:self-auto">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('EXPLORE_POOLS')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'EXPLORE_POOLS'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Available Pools ({pools.length})
              </button>
              <button
                onClick={() => setActiveTab('MY_BOOKINGS')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center space-x-1.5 ${
                  activeTab === 'MY_BOOKINGS'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>My Consignments</span>
                {myBookings.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
                    {myBookings.length}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={() => { setLoading(true); loadData().finally(() => setLoading(false)); }}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 transition"
              title="Refresh Pools"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 3-Card KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Total Transport Savings</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            ₹{totalSavedAll > 0 ? totalSavedAll.toLocaleString('en-IN') : '3,700'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            ~56% average freight cost reduction
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Active Multi-Stop Routes</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {pools.length} Heavy Trucks
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Operating in Nashik & Lasalgaon belts
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Carbon Footprint Cut</span>
            <Leaf className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            -48.5% CO₂
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            Consolidated vehicle trips
          </span>
        </div>
      </div>

      {/* TAB 1: EXPLORE AVAILABLE TRANSPORT POOLS */}
      {activeTab === 'EXPLORE_POOLS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Shared Trucks Heading to Your Mandi Today
            </h2>
            <span className="text-xs text-slate-500 font-mono">AI Proportional Split Active</span>
          </div>

          {loading && pools.length === 0 ? (
            <div className="py-20 text-center text-slate-500 text-xs">Loading active freight pools...</div>
          ) : pools.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
              No shared freight pools currently open. Create a new transport pool below.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {pools.map((p) => {
                const isFull = p.status === 'FULL' || p.available_capacity_kg <= 0;
                const fillPct = Math.min(100, p.capacity_percentage);

                return (
                  <div
                    key={p.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition space-y-4"
                  >
                    <div>
                      
                      {/* Top Bar: Code & Vehicle */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono font-bold text-emerald-400">{p.pool_code}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950 text-slate-300 border border-slate-800">
                              {p.vehicle_type || 'Eicher 10-Ton'}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-white mt-1">
                            Destination: {p.destination_mandi || 'Nashik APMC Mandi'}
                          </h3>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          isFull
                            ? 'bg-rose-950 text-rose-400 border border-rose-900'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {isFull ? 'CAPACITY FULL' : `${p.available_capacity_kg.toLocaleString()} kg SPACE`}
                        </span>
                      </div>

                      {/* Route Timeline */}
                      <div className="mt-3 bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                        <div className="flex items-center space-x-2 text-slate-300 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{p.route_summary}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-850">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>Departs: {p.departure_time_window}</span>
                          </span>
                          <span>{p.departure_date}</span>
                        </div>
                      </div>

                      {/* Capacity Progress Bar */}
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-400">Cargo Fill ({p.member_count} Farmers):</span>
                          <strong className="text-white">
                            {p.booked_capacity_kg.toLocaleString()} / {p.total_capacity_kg.toLocaleString()} kg ({fillPct}%)
                          </strong>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all ${
                              fillPct > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Transporter Driver Card */}
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-850">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-[10px]">
                            TR
                          </div>
                          <div>
                            <span className="text-slate-200 font-medium block">{p.driver_name || 'Ganesh Shinde'}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{p.vehicle_number}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-emerald-400 font-medium flex items-center justify-end space-x-0.5">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Verified Transporter</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{p.driver_phone}</span>
                        </div>
                      </div>

                    </div>

                    {/* Pricing & CTA */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Shared Pool Fare</span>
                        <div className="flex items-baseline space-x-1.5">
                          <strong className="text-base font-bold text-emerald-400 font-mono">
                            ~₹{p.pooled_base_fare.toLocaleString('en-IN')}
                          </strong>
                          <span className="text-xs text-slate-500 line-through font-mono">
                            ₹{p.solo_estimated_cost.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-semibold block">
                          Save {p.estimated_savings_percent}% on freight
                        </span>
                      </div>

                      <button
                        disabled={isFull}
                        onClick={() => handleOpenJoin(p)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center space-x-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Book Shared Pickup</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY FREIGHT BOOKINGS & DISPATCH SLIPS */}
      {activeTab === 'MY_BOOKINGS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              My Active Freight Bookings & Consignment Passes
            </h2>
            <span className="text-xs text-slate-500 font-mono">{myBookings.length} Consignments</span>
          </div>

          {myBookings.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 space-y-3">
              <Truck className="w-8 h-8 mx-auto text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-300">No Transport Bookings Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Join an available shared truck pool to schedule farmgate pickup and lock in discounted transport rates.
              </p>
              <button
                onClick={() => setActiveTab('EXPLORE_POOLS')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
              >
                Browse Shared Pools →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold font-mono text-emerald-400">{b.consignment_code}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {b.booking_status}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-white">
                      Crop: {b.crop_name || 'Garva Red Onion'} • {b.loaded_weight_kg.toLocaleString()} kg
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-amber-500" />
                        <span>Pickup: {b.pickup_location}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>Time: {b.pickup_time}</span>
                      </span>
                    </div>
                  </div>

                  {/* Financial Breakdown & Actions */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-right font-mono text-xs space-y-0.5">
                      <div className="text-slate-400 font-sans">
                        Pooled Fare: <strong className="text-emerald-400 font-mono text-sm">₹{b.calculated_fare.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="text-[11px] text-slate-500 line-through">
                        Solo Rate: ₹{b.solo_alternative_fare.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-semibold font-sans">
                        Net Saved: ₹{b.savings_amount.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSendWhatsAppFreight(b, pools.find(p => p.id === b.pool_id))}
                      className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
                      title="Send consignment pass to WhatsApp (7020975052)"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp (7020975052)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* JOIN TRANSPORT POOL MODAL */}
      {selectedPool && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-xl p-6 shadow-2xl space-y-4">
            
            {/* Modal Top */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">{selectedPool.pool_code}</span>
                <h3 className="text-base font-bold text-white">Join Shared Freight Transport</h3>
              </div>
              <button
                onClick={() => setSelectedPool(null)}
                className="text-slate-500 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-4 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-950/50 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div>
                  <h4 className="text-base font-bold text-white">Pickup Consignment Confirmed!</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Your cargo space is locked with Transporter <strong className="text-slate-200">{selectedPool.driver_name}</strong>.
                  </p>
                </div>

                {/* Confirmed Dispatch Slip */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Consignment ID:</span>
                    <span className="text-emerald-400 font-bold">{bookingSuccess.consignment_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled Pickup:</span>
                    <span className="text-white">{bookingSuccess.pickup_time} ({bookingSuccess.pickup_location})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Driver Phone:</span>
                    <span className="text-amber-400 font-bold">{selectedPool.driver_phone}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-sm">
                    <span className="text-slate-300 font-sans">Locked Pooled Fare:</span>
                    <span className="text-emerald-400">₹{bookingSuccess.calculated_fare.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 text-right">
                    You saved ₹{bookingSuccess.savings_amount.toLocaleString('en-IN')} vs solo hiring!
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                  <button
                    onClick={() => handleSendWhatsAppFreight(bookingSuccess, selectedPool)}
                    className="py-2 px-3 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send to WhatsApp (7020975052)</span>
                  </button>
                  <button
                    onClick={() => { setSelectedPool(null); setActiveTab('MY_BOOKINGS'); }}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                  >
                    View My Consignments →
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmJoin} className="space-y-3.5 text-xs">
                
                {/* Live Pool Capacity Overview */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Available Truck Capacity:</span>
                    <strong className="text-emerald-400">
                      {selectedPool ? (selectedPool.total_capacity_kg - selectedPool.booked_capacity_kg).toLocaleString() : 0} kg Space Left
                    </strong>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${selectedPool ? Math.min(100, selectedPool.capacity_percentage) : 0}%` }}
                    />
                  </div>
                </div>

                {/* Select Produce Lot */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-medium">
                      1. Select Produce Lot to Load
                    </label>
                    {selectedProduceObj && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Weight: <strong className="text-white">{selectedProduceObj.quantity_kg.toLocaleString()} kg</strong>
                      </span>
                    )}
                  </div>
                  <select
                    value={selectedProduceId}
                    onChange={(e) => {
                      setSelectedProduceId(e.target.value);
                      setBookingError(null);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-slate-700"
                    required
                  >
                    {farmerProduces.map((p) => (
                      <option key={p.id} value={p.id}>
                        Lot #{p.id}: {p.crop_name} ({p.quantity_kg.toLocaleString()} kg) • Grade {p.quality_grade}
                      </option>
                    ))}
                  </select>
                </div>

                {/* In-App Live Capacity Warning */}
                {selectedProduceObj && selectedPool && selectedProduceObj.quantity_kg > (selectedPool.total_capacity_kg - selectedPool.booked_capacity_kg) && (
                  <div className="bg-amber-950/70 border border-amber-800/90 text-amber-200 p-3 rounded-lg flex items-start space-x-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed">
                      <strong className="block text-amber-300 font-semibold mb-0.5">Cargo Exceeds Remaining Space</strong>
                      <span>
                        Your selected lot is <strong>{selectedProduceObj.quantity_kg.toLocaleString()} kg</strong>, but this truck only has <strong>{(selectedPool.total_capacity_kg - selectedPool.booked_capacity_kg).toLocaleString()} kg</strong> remaining space. Choose a smaller crop lot or another transport pool.
                      </span>
                    </div>
                  </div>
                )}

                {/* In-App Submission Error Banner */}
                {bookingError && (
                  <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-3 rounded-lg flex items-start space-x-2.5">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed">
                      <strong className="block text-rose-300 font-semibold mb-0.5">Booking Unsuccessful</strong>
                      <span>{bookingError}</span>
                    </div>
                  </div>
                )}

                {/* Pickup Location & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">
                      2. Farmgate / Hub Location
                    </label>
                    <input
                      type="text"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-slate-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">
                      3. Preferred Pickup Window
                    </label>
                    <input
                      type="text"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-slate-700"
                      required
                    />
                  </div>
                </div>

                {/* AI Cost-Split Preview */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2 font-mono">
                  <div className="flex justify-between text-slate-400 font-sans text-[11px]">
                    <span>Destination Mandi:</span>
                    <strong className="text-white">{selectedPool.destination_mandi || 'Nashik APMC'}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400 font-sans text-[11px]">
                    <span>Vehicle:</span>
                    <span className="text-slate-200">{selectedPool.vehicle_type} ({selectedPool.driver_name})</span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-sans text-[11px]">
                    <span>Solo Truck Estimate:</span>
                    <span className="text-slate-500 line-through">₹{selectedPool.solo_estimated_cost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1.5 font-bold text-sm">
                    <span className="text-slate-300 font-sans">Your Pooled Transport Fare:</span>
                    <span className="text-emerald-400">~₹{selectedPool.pooled_base_fare.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPool(null)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      bookingLoading || 
                      (selectedProduceObj && selectedPool && selectedProduceObj.quantity_kg > (selectedPool.total_capacity_kg - selectedPool.booked_capacity_kg))
                    }
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingLoading ? (
                      'Reserving Space...'
                    ) : (selectedProduceObj && selectedPool && selectedProduceObj.quantity_kg > (selectedPool.total_capacity_kg - selectedPool.booked_capacity_kg)) ? (
                      'Cargo Exceeds Space'
                    ) : (
                      'Confirm Shared Booking'
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
