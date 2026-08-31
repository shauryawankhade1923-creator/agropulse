import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  MapPin, 
  Clock, 
  Calendar, 
  Check, 
  X,
  AlertCircle,
  Building2
} from 'lucide-react';
import { api } from '../../api';

export default function SlotBookingModal({ isOpen, onClose, produce, onTokenIssued }) {
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    async function loadCenters() {
      try {
        setLoading(true);
        const data = await api.getProcurementCenters();
        setCenters(data);
        if (data.length > 0) setSelectedCenter(data[0]);
      } catch (err) {
        console.error('Failed to load centers:', err);
      } finally {
        setLoading(false);
      }
    }
    if (isOpen) loadCenters();
  }, [isOpen]);

  useEffect(() => {
    async function loadSlots() {
      if (!selectedCenter) return;
      try {
        const data = await api.getCenterSlots(selectedCenter.id);
        setSlots(data);
        const available = data.find(s => s.available_tokens > 0);
        if (available) setSelectedSlot(available);
      } catch (err) {
        console.error('Failed to load slots:', err);
      }
    }
    loadSlots();
  }, [selectedCenter]);

  if (!isOpen) return null;

  const handleBookToken = async () => {
    if (!selectedCenter || !selectedSlot || !produce) return;
    setBooking(true);
    try {
      const token = await api.bookToken({
        farmer_id: 1,
        produce_id: produce.id,
        center_id: selectedCenter.id,
        slot_id: selectedSlot.id
      });

      if (onTokenIssued) onTokenIssued(token);
      onClose();
    } catch (err) {
      alert('Error booking slot: ' + err.message);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 max-w-2xl w-full rounded-xl p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Book APMC Procurement Slot</h2>
              <p className="text-xs text-slate-400">
                Reserve your arrival window and generate an optical gate pass.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Produce Banner */}
        {produce && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-500 font-sans block text-[11px]">Selected Produce Lot:</span>
              <strong className="text-white text-sm font-sans font-bold">
                #{produce.id} - {produce.crop_name || 'Crop Lot'} ({(produce.quantity_kg || produce.total_quantity || 1000).toLocaleString('en-IN')} kg)
              </strong>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-sans text-xs font-semibold">
              ✓ Certified Grade {produce.quality_grade || 'A'}
            </span>
          </div>
        )}

        {/* Step 1: Select Center */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            1. Select Procurement Center & Weighbridge Yard
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {centers.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCenter(c)}
                className={`p-4 rounded-xl border text-left text-xs transition cursor-pointer ${
                  selectedCenter?.id === c.id
                    ? 'bg-gradient-to-r from-slate-900 to-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/40 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <strong className="font-bold text-sm text-white block">{c.name}</strong>
                    <div className="text-[11px] text-slate-300 flex items-start space-x-1.5 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">{c.location || c.address || `${c.district}, ${c.state}`}</span>
                    </div>
                  </div>
                  {selectedCenter?.id === c.id ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-700 shrink-0" />
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-emerald-400 font-mono font-semibold border border-slate-800">
                      🏛️ {c.active_counters || 6} Active Weighbridge Bays
                    </span>
                    <span className="text-slate-500 hidden sm:inline">•</span>
                    <span className="text-slate-400 font-sans hidden sm:inline">
                      🕒 {c.operating_hours || '06:00 AM - 08:00 PM'}
                    </span>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                    📍 ~{c.distance_km || 4.2} km away
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Slot */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>2. Choose Arrival Window & E-Pass Slot</span>
            <span className="text-[11px] text-emerald-400 font-mono font-semibold">
              Today: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {slots.map((s) => {
              const tokensLeft = s.available_tokens ?? s.tokens_left ?? (s.max_capacity - s.booked_count) ?? 30;
              const isSelected = selectedSlot?.id === s.id;
              const isFull = tokensLeft === 0;

              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={isFull}
                  onClick={() => setSelectedSlot(s)}
                  className={`p-3 rounded-xl border text-center text-xs transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500/40 text-white font-medium shadow-md'
                      : (isFull 
                          ? 'opacity-40 bg-slate-950 border-slate-850 cursor-not-allowed'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700')
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span className="font-bold text-[11px] text-white">{s.time_slot}</span>
                    </div>

                    <div className="text-xs font-bold font-mono text-emerald-400 mt-1.5">
                      {tokensLeft} tokens left
                    </div>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      (of {s.max_capacity || 50} passes)
                    </span>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-800/60">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                      tokensLeft < 20 
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/80 animate-pulse'
                        : 'bg-slate-900 text-cyan-300 border border-slate-800'
                    }`}>
                      {s.status_tag || (tokensLeft < 20 ? '🔥 High Demand' : '⚡ Fast-Track')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>


        {/* Submit Actions */}
        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={booking || !selectedCenter || !selectedSlot}
            onClick={handleBookToken}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs shadow-sm disabled:opacity-50 transition"
          >
            {booking ? 'Generating...' : 'Issue Digital Token'}
          </button>
        </div>

      </div>
    </div>
  );
}
