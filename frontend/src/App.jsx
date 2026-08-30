import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ProduceListingWizard from './components/farmer/ProduceListingWizard';
import BuyerMatchingRadar from './components/farmer/BuyerMatchingRadar';
import IncomingBidsView from './components/farmer/IncomingBidsView';
import SmartFreightPooling from './components/farmer/SmartFreightPooling';
import SlotBookingModal from './components/farmer/SlotBookingModal';
import DigitalTokenPass from './components/farmer/DigitalTokenPass';
import PaymentTracker from './components/farmer/PaymentTracker';
import BuyerMarketplace from './components/buyer/BuyerMarketplace';
import BuyerBidsTracker from './components/buyer/BuyerBidsTracker';
import BuyerPaymentsLedger from './components/buyer/BuyerPaymentsLedger';
import LiveQueueBoard from './components/operator/LiveQueueBoard';
import TokenScannerModal from './components/operator/TokenScannerModal';
import CounterProcessor from './components/operator/CounterProcessor';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';

export default function App() {
  const [currentRole, setRole] = useState('FARMER'); // FARMER, BUYER, OPERATOR
  const [activeTab, setActiveTab] = useState('produce');

  // Modals & Cross-component flow state
  const [slotBookingProduce, setSlotBookingProduce] = useState(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeProcessingTokenId, setActiveProcessingTokenId] = useState(null);

  const handleProduceCreated = (newProduce) => {
    setSlotBookingProduce(newProduce);
  };

  const handleBookSlotForProduce = (produce) => {
    setSlotBookingProduce(produce);
    setIsSlotModalOpen(true);
  };

  const handleTokenIssued = (token) => {
    setActiveTab('tokens');
  };

  const handleSelectTokenToProcess = (tokenId) => {
    setActiveProcessingTokenId(tokenId);
    setRole('OPERATOR');
    setActiveTab('counter');
  };

  const handleTokenVerifiedAtGate = (tokenId) => {
    setActiveProcessingTokenId(tokenId);
    setRole('OPERATOR');
    setActiveTab('counter');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navbar with live persona switcher */}
      <Navbar
        currentRole={currentRole}
        setRole={setRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* FARMER PERSONA VIEWS */}
        {currentRole === 'FARMER' && (
          <>
            {activeTab === 'produce' && (
              <ProduceListingWizard
                onProduceCreated={handleProduceCreated}
                onNavigateMatching={() => setActiveTab('matching')}
              />
            )}

            {activeTab === 'incoming-bids' && (
              <IncomingBidsView
                onBookSlotForProduce={handleBookSlotForProduce}
              />
            )}

            {activeTab === 'matching' && (
              <BuyerMatchingRadar
                selectedProduceId={slotBookingProduce?.id}
                onBookSlotForProduce={handleBookSlotForProduce}
              />
            )}

            {activeTab === 'freight' && (
              <SmartFreightPooling
                onNavigateProduce={() => setActiveTab('produce')}
              />
            )}

            {activeTab === 'tokens' && (
              <DigitalTokenPass />
            )}

            {activeTab === 'payments' && (
              <PaymentTracker />
            )}
          </>
        )}

        {/* BUYER PERSONA VIEWS */}
        {currentRole === 'BUYER' && (
          <>
            {activeTab === 'marketplace' && (
              <BuyerMarketplace />
            )}

            {activeTab === 'my-bids' && (
              <BuyerBidsTracker
                onBrowseMarketplace={() => setActiveTab('marketplace')}
              />
            )}

            {activeTab === 'buyer-payments' && (
              <BuyerPaymentsLedger />
            )}
          </>
        )}

        {/* OPERATOR PERSONA VIEWS */}
        {currentRole === 'OPERATOR' && (
          <>
            {activeTab === 'queue' && (
              <LiveQueueBoard
                onOpenScanner={() => setIsScannerOpen(true)}
                onSelectTokenToProcess={handleSelectTokenToProcess}
              />
            )}

            {activeTab === 'scan' && (
              <div className="py-8">
                <TokenScannerModal
                  isOpen={true}
                  onClose={() => setActiveTab('queue')}
                  onTokenVerified={handleTokenVerifiedAtGate}
                />
              </div>
            )}

            {activeTab === 'counter' && (
              <CounterProcessor
                tokenId={activeProcessingTokenId}
                onCompleted={() => setActiveTab('queue')}
                onBack={() => setActiveTab('queue')}
              />
            )}
          </>
        )}

        {/* COMMON / ANALYTICS VIEW */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}

      </main>

      {/* Reusable Modals */}
      <SlotBookingModal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        produce={slotBookingProduce}
        onTokenIssued={handleTokenIssued}
      />

      <TokenScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onTokenVerified={handleTokenVerifiedAtGate}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AgroPulse • Smart India Hackathon (SIH) High-Impact Prototype</span>
          <span className="font-mono text-[11px] text-emerald-400/80">
            ⚡ FastAPI + Scikit-Learn + Vite React + Direct WhatsApp Messaging (7020975052)
          </span>
        </div>
      </footer>

    </div>
  );
}
