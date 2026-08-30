import React, { useState } from 'react';
import { QrCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../api';

export default function TokenScannerModal({ isOpen, onClose, onTokenVerified }) {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verifiedToken, setVerifiedToken] = useState(null);

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const formatted = tokenInput.trim().toUpperCase();
      const token = await api.getTokenByNumber(formatted);
      setVerifiedToken(token);
    } catch (err) {
      setError('Token not found. Please check token number.');
      setVerifiedToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!verifiedToken) return;
    try {
      await api.advanceTokenStage({
        token_id: verifiedToken.id,
        new_stage: 'CHECKED_IN',
        counter_number: 1
      });
      if (onTokenVerified) onTokenVerified(verifiedToken.id);
      onClose();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-xl p-6 shadow-xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center text-slate-300">
              <QrCode className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">APMC Gate Scanner</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xs">✕</button>
        </div>

        {/* Viewfinder Mock */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center">
          <QrCode className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <span className="text-xs font-medium text-slate-300 block">
            QR Scanner Optical Sensor Ready
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Hold farmer pass in front of scanner or enter token number
          </span>
        </div>

        {/* Manual Lookup Form */}
        <form onSubmit={handleVerify} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              Token Number
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="e.g. AP-2026-0247"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-slate-700"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white rounded-lg font-medium border border-slate-700 disabled:opacity-50 transition"
              >
                {loading ? '...' : 'Verify'}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="p-3 bg-slate-950 border border-rose-900 rounded-lg text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Verified Result Card */}
        {verifiedToken && (
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">
                {verifiedToken.token_number}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-sans font-medium">
                VALID PASS
              </span>
            </div>

            <div className="text-slate-300 font-sans">
              Farmer: <strong className="text-white">{verifiedToken.farmer_name}</strong> ({verifiedToken.farmer_phone})
            </div>
            <div className="text-slate-400 font-sans">
              Lot: {verifiedToken.crop_name} • Weight: {verifiedToken.quantity_kg} kg
            </div>

            <div className="pt-2 font-sans">
              <button
                type="button"
                onClick={handleCheckIn}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg shadow-sm flex items-center justify-center space-x-1.5 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Gate Ingress</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
