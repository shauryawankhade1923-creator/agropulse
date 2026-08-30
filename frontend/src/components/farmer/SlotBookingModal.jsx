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
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-500 font-sans block">Lot:</span>
              <strong className="text-white text-sm font-sans font-medium">
                #{produce.id} - {produce.crop_name} ({produce.quantity_kg} kg)
              </strong>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 font-sans text-[11px]">
              Grade {produce.quality_grade}
            </span>
          </div>
        )}

        {/* Step 1: Select Center */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            1. Select Procurement Center
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {centers.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCenter(c)}
                className={`p-3 rounded-lg border text-left text-xs transition ${
                  selectedCenter?.id === c.id
                    ? 'bg-slate-800 border-slate-600 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-start justify-between">
                  <strong className="font-semibold text-slate-100">{c.name}</strong>
                  {selectedCenter?.id === c.id && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{c.location}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-855 text-[10px] text-slate-500">
                  <span>{c.active_counters} Active Counters</span>
                  <span className="text-slate-300 font-mono">
                    ~{c.distance_km} km
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Slot */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
            <span>2. Choose Arrival Window</span>
            <span className="text-[11px] text-slate-500 font-normal font-sans">
              Today: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {slots.map((s) => (
              <button
                key={s.id}
                type="button"
                disabled={s.available_tokens === 0}
                onClick={() => setSelectedSlot(s)}
                className={`p-2.5 rounded-lg border text-center text-xs transition ${
                  selectedSlot?.id === s.id
                    ? 'bg-slate-800 border-slate-600 text-white font-medium'
                    : (s.available_tokens === 0 
                        ? 'opacity-40 bg-slate-950 border-slate-850 cursor-not-allowed'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850')
                }`}
              >
                <Clock className="w-3.5 h-3.5 mx-auto mb-1 text-slate-500" />
                <span className="font-semibold block text-[11px]">{s.time_slot}</span>
                <span className="text-[10px] block mt-1 font-mono text-slate-400">
                  {s.available_tokens} left
                </span>
              </button>
            ))}
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
