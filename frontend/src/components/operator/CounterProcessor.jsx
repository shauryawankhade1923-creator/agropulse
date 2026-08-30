import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Building2, 
  FileCheck,
  AlertCircle,
  Camera,
  Scan,
  Sparkles
} from 'lucide-react';
import { api } from '../../api';
import VisionQualityScannerModal from '../ai/VisionQualityScannerModal';

export default function CounterProcessor({ tokenId, onCompleted, onBack }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Inspector form states
  const [measuredWeight, setMeasuredWeight] = useState(2500);
  const [grade, setGrade] = useState('A');
  const [testedMoisture, setTestedMoisture] = useState(11.2);
  const [finalRate, setFinalRate] = useState(23.5);
  const [notes, setNotes] = useState('Crop specimen verified and approved by APMC Quality Inspector');

  const [completedRecord, setCompletedRecord] = useState(null);

  useEffect(() => {
    async function loadToken() {
      if (!tokenId) return;
      try {
        setLoading(true);
        const data = await api.getTokenById(tokenId);
        setToken(data);
        if (data.quantity_kg) setMeasuredWeight(data.quantity_kg);
      } catch (err) {
        console.error('Failed to load token:', err);
      } finally {
        setLoading(false);
      }
    }
    loadToken();
  }, [tokenId]);

  const grossAmount = Math.round(measuredWeight * finalRate * 100) / 100;
  const cess = Math.round(grossAmount * 0.01 * 100) / 100;
  const netPayable = grossAmount - cess;

  const handleCompleteProcurement = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const targetTokenId = token ? token.id : (tokenId || 1);

    setSubmitting(true);
    try {
      const res = await api.advanceTokenStage({
        token_id: targetTokenId,
        new_stage: 'COMPLETED',
        counter_number: token?.assigned_counter || 1,
        measured_weight_kg: Number(measuredWeight),
        final_grade: grade,
        final_rate_per_kg: Number(finalRate),
        notes: notes
      });
      setCompletedRecord(res);
      if (onCompleted) onCompleted(res);
    } catch (err) {
      console.error('Error completing procurement:', err);
      setErrorMessage('Error completing procurement: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-300">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Weighbridge & Inspection Desk</h1>
            <span className="text-xs text-slate-400 font-mono">
              Lot Pass: <strong className="text-emerald-400">{token?.token_number || 'AP-2026-0247'}</strong>
            </span>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-850 text-slate-300 text-xs font-medium border border-slate-800 transition"
        >
          ← Live Board
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-950/40 border border-rose-900 rounded-xl text-xs text-rose-400 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {completedRecord ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-5 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-950/50 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">Procurement Lot Settled</h2>
            <p className="text-xs text-slate-400 mt-1">
              Certificate recorded and direct payment initiated to farmer account.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Token ID:</span>
              <span className="text-white font-semibold">{token?.token_number || completedRecord.token_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Certified Weight:</span>
              <span className="text-white font-semibold">{measuredWeight} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Certified Grade:</span>
              <span className="text-emerald-400 font-semibold">Grade {grade}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-bold">
              <span className="text-slate-300">Net DBT Payout:</span>
              <span className="text-emerald-400">₹{netPayable.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={onBack}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs shadow-sm transition"
          >
            Process Next Farmer →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Form (7 cols) */}
          <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Weighment & Laboratory Inspection
              </h2>
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                title="Perform APMC Optical Assay & AGMARK computer vision scan on specimen"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>🔬 APMC Optical Assay</span>
              </button>
            </div>

            {/* Weighbridge Input */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Scale Net Weight (kg)
              </label>
              <div className="relative">
                <Scale className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="number"
                  step="10"
                  value={measuredWeight}
                  onChange={(e) => setMeasuredWeight(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-emerald-400 font-mono font-bold focus:outline-none focus:border-slate-700"
                  required
                />
              </div>
            </div>

            {/* Quality Grade & Moisture */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Quality Grade
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-slate-700"
                >
                  <option value="A">Grade A (Premium / Export Quality)</option>
                  <option value="B">Grade B (FAQ / Good Standard)</option>
                  <option value="C">Grade C (Below Average)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Tested Moisture (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={testedMoisture}
                  onChange={(e) => setTestedMoisture(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-slate-700"
                />
              </div>
            </div>

            {/* Approved Rate per kg */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Settlement Rate (₹/kg)
              </label>
              <div className="relative">
                <span className="text-slate-500 absolute left-3 top-2 text-xs">₹</span>
                <input
                  type="number"
                  step="0.25"
                  value={finalRate}
                  onChange={(e) => setFinalRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-slate-700"
                />
              </div>
            </div>

            {/* Inspector Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Inspection Remarks
              </label>
              <textarea
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-slate-700"
              />
            </div>
          </div>

          {/* Right Summary & Approval (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Settlement Summary</span>
              </h3>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Net Weight:</span>
                  <span className="text-white font-semibold">{measuredWeight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Unit Rate:</span>
                  <span className="text-white font-semibold">₹{finalRate}/kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Gross Value:</span>
                  <span className="text-white font-semibold">₹{grossAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-sans">
                  <span>Mandi Cess (1%):</span>
                  <span className="text-rose-400 font-mono">-₹{cess.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-sm">
                  <span className="text-slate-300 font-sans">Net Payable:</span>
                  <span className="text-emerald-400 font-mono">₹{netPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={handleCompleteProcurement}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center space-x-2 text-xs transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Settling Payment...' : 'Approve & Trigger DBT Payment'}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* AI Computer Vision Optical Assay Modal */}
      {isScannerOpen && (
        <VisionQualityScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          initialCropName={token?.crop_name || 'Onion'}
          onApplyGrade={(data) => {
            if (data.grade) setGrade(data.grade);
            if (data.moisture) setTestedMoisture(data.moisture);
            if (data.notes) setNotes(data.notes);
            if (data.priceMultiplier && finalRate) {
              const adjusted = Math.round(finalRate * data.priceMultiplier * 100) / 100;
              setFinalRate(adjusted);
            }
          }}
        />
      )}

    </div>
  );
}
