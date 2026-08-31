import React, { useState } from 'react';
import { 
  Sprout, 
  ShieldCheck, 
  Menu,
  X,
  Inbox,
  FileText,
  Truck,
  Scan,
  Globe,
  Radio,
  BarChart3,
  QrCode,
  CheckCircle2,
  Sparkles,
  Users,
  Coins,
  TrendingUp,
  Smartphone,
  Bell
} from 'lucide-react';
import VisionQualityScannerModal from './ai/VisionQualityScannerModal';
import NotificationBellDropdown from './notifications/NotificationBellDropdown';
import SendSMSModal from './notifications/SendSMSModal';
import NotificationSimulatorModal from './notifications/NotificationSimulatorModal';
import { useLanguage } from '../i18n/LanguageContext';

export default function Navbar({ currentRole, setRole, activeTab, setActiveTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisionScannerOpen, setIsVisionScannerOpen] = useState(false);
  const [isSendSMSOpen, setIsSendSMSOpen] = useState(false);
  const [isNotificationHubOpen, setIsNotificationHubOpen] = useState(false);
  const { language, setLanguage, t, supportedLanguages } = useLanguage();

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-lg w-full">
      {/* Top Row: Brand & Global Controls */}
      <div className="w-full px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-slate-900">
        <div className="flex items-center justify-between h-14">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-500 shadow-inner">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-white tracking-tight">{t('app_title')}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {t('apmc_badge')}
                </span>
                <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950 text-blue-400 border border-blue-800">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{t('verified')}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Notification Bell, Language Switcher, Persona Selector & Profile */}
          <div className="flex items-center space-x-2.5">
            
            {/* Live In-App Notification Bell Dropdown */}
            <NotificationBellDropdown
              onOpenSendSMS={() => setIsSendSMSOpen(true)}
              onOpenFullHub={() => setIsNotificationHubOpen(true)}
              setActiveTab={setActiveTab}
            />

            {/* Language Selector */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
              <div className="px-1.5 text-slate-400">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2 py-1 rounded text-xs font-medium transition cursor-pointer ${
                    language === lang.code
                      ? 'bg-emerald-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={`Switch language to ${lang.label}`}
                >
                  {lang.short}
                </button>
              ))}
            </div>

            {/* Persona Switcher */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => { setRole('FARMER'); setActiveTab('produce'); }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  currentRole === 'FARMER'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('farmer')}
              </button>

              <button
                onClick={() => { setRole('BUYER'); setActiveTab('marketplace'); }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  currentRole === 'BUYER'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('buyer')}
              </button>

              <button
                onClick={() => { setRole('OPERATOR'); setActiveTab('queue'); }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  currentRole === 'OPERATOR'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('operator')}
              </button>
            </div>

            {/* Profile Pill */}
            <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs">
                {currentRole === 'FARMER' ? 'RP' : (currentRole === 'BUYER' ? 'RA' : 'OP')}
              </div>
              <div className="text-left leading-tight">
                <div className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                  {currentRole === 'FARMER' ? (language === 'mr' ? 'रमेश पाटील' : (language === 'hi' ? 'रमेश पाटिल' : 'Ramesh Patil')) : (currentRole === 'BUYER' ? (language === 'mr' ? 'राजेश अगरवाल' : (language === 'hi' ? 'राजेश अग्रवाल' : 'Rajesh Aggarwal')) : (language === 'mr' ? 'नाशिक APMC' : 'Nashik APMC'))}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium">
                  {currentRole === 'FARMER' ? (language === 'mr' ? 'प्रमाणित शेतकरी' : (language === 'hi' ? 'सत्यापित किसान' : 'Verified Farmer')) : (currentRole === 'BUYER' ? (language === 'mr' ? 'थेट खरेदीदार' : (language === 'hi' ? 'सीधा खरीदार' : 'Licensed Buyer')) : (language === 'mr' ? 'मंडी तोल केंद्र' : (language === 'hi' ? 'मंडी तौल केंद्र' : 'Weighbridge Desk')))}
                </div>
              </div>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Bottom Row: Full-Length Navigation Bar (Full Width, No Sliding, No Clipping) */}
      <div className="w-full bg-slate-950/90 border-b border-slate-800/60 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 min-h-12">
          
          {/* Main Tabs List (Generous Full-Length Layout) */}
          <nav className="hidden lg:flex items-center space-x-1.5 flex-wrap gap-y-1">
            {currentRole === 'FARMER' && (
              <>
                <button
                  onClick={() => handleNavClick('produce')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'produce'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>{t('nav_produce')}</span>
                </button>
                <button
                  onClick={() => handleNavClick('incoming-bids')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'incoming-bids'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>{t('nav_incoming_bids')}</span>
                </button>
                <button
                  onClick={() => handleNavClick('matching')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'matching'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{t('nav_matching')}</span>
                </button>
                <button
                  onClick={() => handleNavClick('freight')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'freight'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{t('nav_freight')}</span>
                </button>
                <button
                  onClick={() => handleNavClick('tokens')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'tokens'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{t('nav_tokens')}</span>
                </button>
                <button
                  onClick={() => handleNavClick('payments')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'payments'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>{t('nav_payments')}</span>
                </button>
              </>
            )}

            {currentRole === 'BUYER' && (
              <>
                <button
                  onClick={() => handleNavClick('marketplace')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'marketplace'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>{t('nav_marketplace')}</span>
                </button>
                <button
                  onClick={() => handleNavClick('my-bids')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'my-bids'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>{t('nav_my_bids')}</span>
                </button>
                <button
                  onClick={() => handleNavClick('buyer-payments')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'buyer-payments'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t('nav_buyer_payments')}</span>
                </button>
              </>
            )}

            {currentRole === 'OPERATOR' && (
              <>
                <button
                  onClick={() => handleNavClick('queue')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'queue'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>{t('nav_queue')}</span>
                </button>
                <button
                  onClick={() => handleNavClick('scan')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'scan'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{t('nav_scan')}</span>
                </button>
              </>
            )}

            <button
              onClick={() => handleNavClick('analytics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t('nav_analytics')}</span>
            </button>
          </nav>

          {/* Right Action: Send SMS Alert + AI Vision Scanner */}
          <div className="hidden lg:flex items-center space-x-2">
            
            {/* Send SMS Alert Trigger Button */}
            <button
              type="button"
              onClick={() => setIsSendSMSOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600/90 hover:bg-blue-600 text-white transition flex items-center space-x-1.5 shadow-md shadow-blue-950/30 cursor-pointer border border-blue-400/30"
              title="Send Instant SMS & App Push Alert"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t('nav_send_sms')}</span>
            </button>

            {/* AI Vision Quality Scanner Trigger Button */}
            <button
              type="button"
              onClick={() => setIsVisionScannerOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition flex items-center space-x-2 shadow-md shadow-emerald-950/30 cursor-pointer border border-emerald-400/30"
              title="Launch AI Computer Vision Quality Scanner"
            >
              <Scan className="w-4 h-4" />
              <span>{t('nav_ai_vision')}</span>
            </button>
          </div>

          {/* Mobile Current Active Tab Indicator */}
          <div className="lg:hidden flex items-center justify-between w-full">
            <span className="text-xs text-slate-400">Current View:</span>
            <span className="text-xs font-bold text-emerald-400 capitalize">
              {(activeTab || 'Dashboard').replace('-', ' ')}
            </span>
          </div>


        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 py-3 px-2 space-y-2 bg-slate-950 animate-fade-in">
            {currentRole === 'FARMER' && (
              <>
                <button
                  onClick={() => handleNavClick('produce')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'produce' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {t('nav_produce')}
                </button>
                <button
                  onClick={() => handleNavClick('incoming-bids')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center space-x-2 ${
                    activeTab === 'incoming-bids' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Inbox className="w-4 h-4" />
                  <span>{t('nav_incoming_bids')}</span>
                </button>
                <button
                  onClick={() => handleNavClick('matching')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'matching' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {t('nav_matching')}
                </button>
                <button
                  onClick={() => handleNavClick('freight')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center space-x-2 ${
                    activeTab === 'freight' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>{t('nav_freight')}</span>
                </button>
                <button
                  onClick={() => handleNavClick('tokens')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'tokens' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {t('nav_tokens')}
                </button>
                <button
                  onClick={() => handleNavClick('payments')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'payments' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {t('nav_payments')}
                </button>
              </>
            )}

            {currentRole === 'BUYER' && (
              <>
                <button
                  onClick={() => handleNavClick('marketplace')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'marketplace' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {t('nav_marketplace')}
                </button>
                <button
                  onClick={() => handleNavClick('my-bids')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'my-bids' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {t('nav_my_bids')}
                </button>
                <button
                  onClick={() => handleNavClick('buyer-payments')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center space-x-2 ${
                    activeTab === 'buyer-payments' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>{t('nav_buyer_payments')}</span>
                </button>
              </>
            )}

            {currentRole === 'OPERATOR' && (
              <>
                <button
                  onClick={() => handleNavClick('queue')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'queue' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {t('nav_queue')}
                </button>
                <button
                  onClick={() => handleNavClick('scan')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'scan' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {t('nav_scan')}
                </button>
              </>
            )}

            <button
              onClick={() => handleNavClick('analytics')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'analytics' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              {t('nav_analytics')}
            </button>

            {/* Mobile SMS Dispatcher Trigger */}
            <button
              type="button"
              onClick={() => { setIsSendSMSOpen(true); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold bg-blue-950 border border-blue-700 text-blue-300 flex items-center space-x-2"
            >
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>{t('nav_send_sms')}</span>
            </button>

            {/* Mobile AI Vision Scanner Trigger */}
            <button
              type="button"
              onClick={() => { setIsVisionScannerOpen(true); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold bg-emerald-950 border border-emerald-700 text-emerald-300 flex items-center space-x-2"
            >
              <Scan className="w-4 h-4 text-emerald-400" />
              <span>{t('nav_ai_vision')}</span>
            </button>
          </div>
        )}

      </div>

      {/* Global Send SMS & App Notification Modal */}
      {isSendSMSOpen && (
        <SendSMSModal
          isOpen={isSendSMSOpen}
          onClose={() => setIsSendSMSOpen(false)}
        />
      )}

      {/* Global Multi-Channel Notification Hub & Simulator Modal */}
      {isNotificationHubOpen && (
        <NotificationSimulatorModal
          isOpen={isNotificationHubOpen}
          onClose={() => setIsNotificationHubOpen(false)}
        />
      )}

      {/* Global AI Computer Vision Quality Scanner Modal */}
      {isVisionScannerOpen && (
        <VisionQualityScannerModal
          isOpen={isVisionScannerOpen}
          onClose={() => setIsVisionScannerOpen(false)}
          initialCropName="Onion"
        />
      )}
    </header>
  );
}

