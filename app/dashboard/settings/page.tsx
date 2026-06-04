"use client";

import React, { useState } from "react";
import { useWorkspace } from "../../../context/WorkspaceContext";

interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  priceLabel: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  credits: number;
  features: string[];
}

function generateOrderId(): string {
  const randomNum = Math.floor(Math.random() * 90000) + 10000;
  return `ORDER-${randomNum}`;
}

interface WorkspaceProfileFormProps {
  activeWorkspace: {
    id: string;
    name: string;
    description: string;
    createdAt: string;
  };
  updateWorkspaceDetails: (workspaceId: string, name: string, description: string) => void;
}

function WorkspaceProfileForm({ activeWorkspace, updateWorkspaceDetails }: WorkspaceProfileFormProps) {
  const [wsName, setWsName] = useState(activeWorkspace.name);
  const [wsDesc, setWsDesc] = useState(activeWorkspace.description);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateWorkspaceDetails(activeWorkspace.id, wsName, wsDesc);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <form onSubmit={handleSaveDetails} className="space-y-4 text-xs font-body">
      <div className="space-y-1">
        <label className="block font-bold text-on-surface">Nama Workspace</label>
        <input
          type="text"
          required
          value={wsName}
          onChange={(e) => setWsName(e.target.value)}
          className="w-full bg-surface-container-low/60 border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all"
        />
      </div>

      <div className="space-y-1">
        <label className="block font-bold text-on-surface">Deskripsi Bisnis / Ide</label>
        <textarea
          rows={4}
          required
          value={wsDesc}
          onChange={(e) => setWsDesc(e.target.value)}
          className="w-full bg-surface-container-low/60 border border-outline-glow rounded-lg px-3 py-2 text-xs text-on-surface-variant leading-relaxed focus:border-primary outline-none transition-all resize-none"
        />
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="text-[10px] text-on-surface-variant font-mono">
          Dibuat pada: {new Date(activeWorkspace.createdAt).toLocaleDateString("id-ID")}
        </span>
        <button
          type="submit"
          className="bg-primary text-surface-dim font-headline font-bold text-[11px] px-5 py-2.5 rounded-lg shadow-md hover:bg-primary-fixed transition-all cursor-pointer"
        >
          {saveSuccess ? "Perubahan Disimpan!" : "Simpan Detail"}
        </button>
      </div>
    </form>
  );
}

interface CheckoutItemType {
  type: "plan" | "pack";
  id: string;
  name: string;
  amount: number;
  credits: number;
  orderId: string;
}

export default function SettingsPage() {
  const {
    activeWorkspace,
    subscriptionPlans,
    updateWorkspaceDetails,
    upgradeSubscription,
    purchaseCredits
  } = useWorkspace();

  // Midtrans Snap Modal States
  const [snapOpen, setSnapOpen] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<CheckoutItemType | null>(null);
  const [snapMethod, setSnapMethod] = useState<"qris" | "va" | "cc" | "gopay">("qris");
  const [selectedBank, setSelectedBank] = useState<"bca" | "mandiri" | "bni">("bca");
  const [paymentSuccessOpen, setPaymentSuccessOpen] = useState(false);

  if (!activeWorkspace) {
    return (
      <div className="flex items-center justify-center h-full text-on-surface-variant font-mono">
        Loading settings...
      </div>
    );
  }

  const currentPlan = subscriptionPlans[activeWorkspace.id] || "Free Trial";



  const creditPacks: CreditPack[] = [
    { id: "pack-starter", name: "Starter Pack", credits: 10000, price: 89000, priceLabel: "Rp 89.000" },
    { id: "pack-standard", name: "Standard Pack", credits: 30000, price: 229000, priceLabel: "Rp 229.000" },
    { id: "pack-power", name: "Power Pack", credits: 75000, price: 499000, priceLabel: "Rp 499.000" }
  ];

  const plans: SubscriptionPlan[] = [
    { id: "Starter", name: "Starter Plan", price: 299000, priceLabel: "Rp 299.000/bln", credits: 20000, features: ["20,000 Kredit bulanan", "1 Workspace aktif", "Synthetic & Real Interviews tak terbatas", "GTM Personas & Decks", "Ekspor Markdown"] },
    { id: "Growth", name: "Growth Plan", price: 179000 * 12, priceLabel: "Rp 179.000/bln (Tahunan)", credits: 50000, features: ["50,000 Kredit bulanan", "3 Workspace aktif", "Interviews & GTM Decks lengkap", "Prioritas Support", "Ekspor Markdown"] },
    { id: "Pro", name: "Pro Plan", price: 499000, priceLabel: "Rp 499.000/bln", credits: 60000, features: ["60,000 Kredit bulanan", "Workspace tak terbatas", "White-label interview links", "Kolaborator hingga 10 orang", "API Access"] }
  ];

  const triggerCheckout = (type: "plan" | "pack", id: string, name: string, price: number, credits: number) => {
    setCheckoutItem({ type, id, name, amount: price, credits, orderId: generateOrderId() });
    setSnapMethod("qris");
    setSelectedBank("bca");
    setSnapOpen(true);
  };

  const executePayment = () => {
    if (!checkoutItem) return;

    if (checkoutItem.type === "plan") {
      upgradeSubscription(activeWorkspace.id, checkoutItem.id);
    } else {
      purchaseCredits(activeWorkspace.id, checkoutItem.credits);
    }

    setSnapOpen(false);
    setPaymentSuccessOpen(true);
  };

  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6 relative font-sans">
      {/* Page Header */}
      <header className="border-b border-outline-glow/30 pb-4 shrink-0">
        <div className="flex items-center gap-2 text-secondary mb-1 font-mono text-[9px] tracking-wider uppercase">
          <span className="material-symbols-outlined text-[10px]">settings</span>
          <span>Operations // Workspace Settings</span>
        </div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">Workspace Settings & Billing</h1>
        <p className="font-body text-xs text-on-surface-variant mt-1">
          Kelola profil workspace Anda, pantau pemakaian kredit AI Co-founder, dan tingkatkan paket langganan Anda.
        </p>
      </header>

      {/* Settings Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: General Configuration (5/12) */}
        <section className="lg:col-span-5 flex flex-col gap-5">
          <div className="glass-panel border border-outline-glow rounded-xl p-5 space-y-4">
            <h3 className="font-headline text-sm font-bold text-primary flex items-center gap-1.5 uppercase tracking-wide">
              <span className="material-symbols-outlined text-sm text-secondary">tune</span>
              Profil Workspace
            </h3>
            
            <WorkspaceProfileForm
              activeWorkspace={activeWorkspace}
              updateWorkspaceDetails={updateWorkspaceDetails}
              key={activeWorkspace.id}
            />
          </div>

          {/* Credit Usage Panel */}
          <div className="glass-panel border border-outline-glow rounded-xl p-5 space-y-4">
            <h3 className="font-headline text-sm font-bold text-primary flex items-center gap-1.5 uppercase tracking-wide">
              <span className="material-symbols-outlined text-sm text-secondary">token</span>
              Saldo & Paket Aktif
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="text-on-surface-variant text-[10px] font-mono uppercase tracking-wider block">Paket Berjalan</span>
                  <span className="text-sm font-black text-secondary uppercase tracking-tight">{currentPlan}</span>
                </div>
                <div className="text-right">
                  <span className="text-on-surface-variant text-[10px] font-mono uppercase tracking-wider block font-sans">Sisa Kredit</span>
                  <span className="text-sm font-mono font-bold text-primary">{activeWorkspace.credits.toLocaleString("id-ID")}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="h-2 w-full bg-surface-deep border border-outline-glow/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((activeWorkspace.credits / 60000) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[8px] font-mono text-on-surface-variant/60">
                  <span>0 Credits</span>
                  <span>60,000 Credits Cap</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Billing Store (7/12) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* Subscription Plans */}
          <div className="glass-panel border border-outline-glow rounded-xl p-5 space-y-4">
            <h3 className="font-headline text-sm font-bold text-primary flex items-center gap-1.5 uppercase tracking-wide">
              <span className="material-symbols-outlined text-sm text-secondary">workspace_premium</span>
              Upgrade Langganan AI Co-Founder
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {plans.map((plan) => {
                const isActive = currentPlan === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={`bg-surface-container-low/40 border rounded-xl p-4 flex flex-col justify-between transition-all relative ${
                      isActive
                        ? "border-secondary active-panel shadow-[inset_0_0_10px_rgba(93,230,255,0.05)]"
                        : "border-outline-glow/30 hover:border-outline-glow"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-secondary text-surface-dim font-mono text-[8px] font-bold px-2 py-0.5 rounded-full uppercase shadow">
                        Active Plan
                      </span>
                    )}
                    <div className="space-y-2 font-sans">
                      <h4 className="font-headline font-bold text-xs text-on-surface">{plan.name}</h4>
                      <p className="font-headline font-black text-sm text-gradient leading-tight">{plan.priceLabel}</p>
                      <ul className="space-y-1.5 text-[9px] text-on-surface-variant/80 font-body pt-2 border-t border-outline-glow/15">
                        {plan.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex gap-1 items-start">
                            <span className="text-secondary shrink-0">•</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      disabled={isActive}
                      onClick={() => triggerCheckout("plan", plan.id, plan.name, plan.price, plan.credits)}
                      className={`w-full mt-4 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-surface-container text-on-surface-variant/50 border border-outline-glow/30"
                          : "bg-secondary text-surface-dim hover:bg-secondary-fixed shadow-[0_0_10px_rgba(93,230,255,0.2)]"
                      }`}
                    >
                      {isActive ? "Berjalan" : "Pilih Paket"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* À la carte Credit Top-ups */}
          <div className="glass-panel border border-outline-glow rounded-xl p-5 space-y-4">
            <h3 className="font-headline text-sm font-bold text-primary flex items-center gap-1.5 uppercase tracking-wide">
              <span className="material-symbols-outlined text-sm text-secondary">shopping_bag</span>
              Top-Up Kredit (à la carte)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {creditPacks.map((pack) => (
                <div
                  key={pack.id}
                  className="bg-surface-container-low/40 border border-outline-glow/30 hover:border-outline-glow rounded-xl p-4 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-1">
                    <h4 className="font-headline font-bold text-xs text-on-surface">{pack.name}</h4>
                    <p className="font-mono text-[9px] text-secondary font-bold uppercase tracking-wider">
                      +{pack.credits.toLocaleString("id-ID")} Kredit
                    </p>
                    <p className="font-headline font-extrabold text-sm text-on-surface pt-1">{pack.priceLabel}</p>
                  </div>

                  <button
                    onClick={() => triggerCheckout("pack", pack.id, pack.name, pack.price, pack.credits)}
                    className="w-full mt-4 py-1.5 bg-primary/10 hover:bg-primary hover:text-surface-dim text-primary border border-primary/30 rounded-md text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Beli Paket
                  </button>
                </div>
              ))}
            </div>
          </div>

        </section>
      </div>

      {/* Midtrans Snap Modal Overlay */}
      {snapOpen && checkoutItem && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans text-xs md:pl-[280px]">
          <div className="bg-[#141b2c] border border-outline-glow/50 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col md:flex-row h-auto md:h-[420px] relative text-[#dce2fa]">
            
            {/* Modal Exit */}
            <button
              onClick={() => setSnapOpen(false)}
              className="absolute top-3.5 right-4 text-on-surface-variant hover:text-[#5de6ff] transition-colors cursor-pointer z-55"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            {/* Left Box: Payment Selector List */}
            <div className="w-full md:w-56 bg-[#070e1e] p-5 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-outline-glow/30 shrink-0">
              {/* Header Logo */}
              <div className="flex flex-col gap-1 border-b border-outline-glow/20 pb-3">
                <span className="font-bold text-[#c0c1ff] tracking-wide uppercase text-[11px]">Midtrans // Snap</span>
                <span className="text-[9px] text-on-surface-variant font-mono">ORDER ID: {checkoutItem.orderId}</span>
              </div>

              {/* Selector items */}
              <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
                <button
                  onClick={() => setSnapMethod("qris")}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-[10.5px] font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    snapMethod === "qris" ? "bg-[#5de6ff]/10 border-[#5de6ff] text-[#5de6ff]" : "bg-transparent border-transparent text-on-surface-variant hover:bg-surface-container/50"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm font-bold">qr_code_2</span>
                  <span>QRIS (Universal QR)</span>
                </button>

                <button
                  onClick={() => setSnapMethod("va")}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-[10.5px] font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    snapMethod === "va" ? "bg-[#5de6ff]/10 border-[#5de6ff] text-[#5de6ff]" : "bg-transparent border-transparent text-on-surface-variant hover:bg-surface-container/50"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">account_balance</span>
                  <span>Virtual Account</span>
                </button>

                <button
                  onClick={() => setSnapMethod("cc")}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-[10.5px] font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    snapMethod === "cc" ? "bg-[#5de6ff]/10 border-[#5de6ff] text-[#5de6ff]" : "bg-transparent border-transparent text-on-surface-variant hover:bg-surface-container/50"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">credit_card</span>
                  <span>Kartu Kredit / Debit</span>
                </button>

                <button
                  onClick={() => setSnapMethod("gopay")}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-[10.5px] font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    snapMethod === "gopay" ? "bg-[#5de6ff]/10 border-[#5de6ff] text-[#5de6ff]" : "bg-transparent border-transparent text-on-surface-variant hover:bg-surface-container/50"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">payments</span>
                  <span>GoPay / E-Wallet</span>
                </button>
              </div>

              {/* Order total amount */}
              <div className="border-t border-outline-glow/20 pt-3">
                <span className="text-[9px] text-on-surface-variant block uppercase font-mono">Total Bayar (incl 11% PPN)</span>
                <span className="text-xs font-mono font-black text-[#5de6ff]">
                  Rp {Math.round(checkoutItem.amount * 1.11).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Right Box: Method Details Panel */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col justify-between">
              
              {/* Method: QRIS */}
              {snapMethod === "qris" && (
                <div className="space-y-4 text-center my-auto flex flex-col items-center">
                  <div className="bg-[#070e1e] p-4 rounded-xl border border-outline-glow/20 shadow-inner w-32 h-32 flex items-center justify-center relative">
                    {/* Simulated QR Code box */}
                    <div className="w-24 h-24 bg-white p-1 rounded relative">
                      <div className="w-full h-full border-4 border-black flex flex-wrap p-0.5">
                        <div className="w-7 h-7 bg-black"></div>
                        <div className="w-7 h-7 bg-transparent flex-1"></div>
                        <div className="w-7 h-7 bg-black"></div>
                        <div className="w-full flex-1 bg-transparent flex items-center justify-center">
                          <div className="w-4 h-4 bg-black"></div>
                        </div>
                        <div className="w-7 h-7 bg-black"></div>
                        <div className="w-7 h-7 bg-transparent flex-1"></div>
                        <div className="w-7 h-7 bg-black"></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-[#dce2fa]">Pindai Kode QRIS Anda</h4>
                    <p className="text-[10px] text-on-surface-variant/80 max-w-xs leading-relaxed font-body">
                      Scan QR menggunakan GoPay, OVO, Dana, LinkAja atau m-Banking pilihan Anda.
                    </p>
                  </div>
                </div>
              )}

              {/* Method: Virtual Account */}
              {snapMethod === "va" && (
                <div className="space-y-5 my-auto">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">Pilih Bank Penerima</label>
                    <div className="flex gap-2">
                      {(["bca", "mandiri", "bni"] as const).map(bank => (
                        <button
                          key={bank}
                          onClick={() => setSelectedBank(bank)}
                          className={`flex-1 py-1.5 rounded border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            selectedBank === bank ? "border-[#5de6ff] text-[#5de6ff] bg-[#5de6ff]/10" : "border-outline-glow/30 hover:border-outline-glow text-on-surface-variant"
                          }`}
                        >
                          {bank} VA
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#070e1e] p-3 rounded-lg border border-outline-glow/20 space-y-1">
                    <span className="text-[9px] text-on-surface-variant block uppercase font-mono">Nomor Virtual Account</span>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm font-bold text-primary tracking-wider">
                        {selectedBank === "bca" ? "8827-0812-4211-9874" : selectedBank === "mandiri" ? "900-11-209-4821" : "8274-0829-4091-2311"}
                      </span>
                      <button
                        onClick={() => alert("Nomor VA disalin ke clipboard.")}
                        className="text-[9px] font-mono text-secondary hover:underline cursor-pointer"
                      >
                        Salin
                      </button>
                    </div>
                  </div>
                  <p className="text-[9px] text-on-surface-variant/75 leading-relaxed font-body">
                    Gunakan ATM atau m-Banking Anda, pilih menu Transfer ke Virtual Account, masukkan nomor di atas, lalu bayar.
                  </p>
                </div>
              )}

              {/* Method: Credit Card */}
              {snapMethod === "cc" && (
                <div className="space-y-3.5 my-auto text-xs">
                  <div className="space-y-1">
                    <label className="block font-bold text-on-surface text-[10px] font-mono uppercase">Nomor Kartu Kredit</label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      className="w-full bg-[#070e1e] border border-outline-glow/40 rounded px-3 py-2 text-xs text-on-surface outline-none focus:border-primary transition-all font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-on-surface text-[10px] font-mono uppercase">Masa Berlaku</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full bg-[#070e1e] border border-outline-glow/40 rounded px-3 py-2 text-xs text-on-surface outline-none focus:border-primary transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-on-surface text-[10px] font-mono uppercase">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full bg-[#070e1e] border border-outline-glow/40 rounded px-3 py-2 text-xs text-on-surface outline-none focus:border-primary transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Method: GoPay */}
              {snapMethod === "gopay" && (
                <div className="space-y-4 text-center my-auto flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#5de6ff]/20 flex items-center justify-center text-[#5de6ff]">
                    <span className="material-symbols-outlined text-2xl font-bold">smartphone</span>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-xs text-[#dce2fa]">Bayar Menggunakan GoPay</h4>
                    <p className="text-[10px] text-on-surface-variant/80 max-w-xs leading-relaxed font-body">
                      Kami akan mengarahkan Anda ke aplikasi Gojek untuk otentikasi pembayaran instan.
                    </p>
                  </div>
                </div>
              )}

              {/* Snap Footer Action */}
              <div className="flex gap-3 justify-end pt-4 border-t border-outline-glow/20 mt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setSnapOpen(false)}
                  className="px-4 py-2 border border-outline-glow/30 hover:border-outline-glow text-on-surface-variant hover:text-[#dce2fa] rounded text-[10px] font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={executePayment}
                  className="px-5 py-2 bg-secondary text-surface-dim font-headline font-bold rounded text-[10px] hover:bg-secondary-fixed shadow-[0_0_15px_rgba(93,230,255,0.3)] transition-all cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  <span>Simulasikan Bayar Sukses</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Confirmation Toast Popup */}
      {paymentSuccessOpen && (
        <div className="fixed inset-0 bg-surface-deep/85 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans md:pl-[280px]">
          <div className="bg-surface-container border border-outline-glow rounded-xl shadow-2xl max-w-sm w-full p-6 text-center flex flex-col items-center gap-4 text-[#dce2fa]">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary border border-secondary/40 shadow-[0_0_20px_rgba(93,230,255,0.4)]">
              <span className="material-symbols-outlined text-2xl font-bold">check</span>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-headline text-base font-bold text-primary">Pembayaran Berhasil!</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed font-body">
                Transaksi Anda telah terverifikasi oleh Midtrans Snap. Saldo kredit dan paket langganan Anda telah diperbarui secara instan.
              </p>
            </div>
            <button
              onClick={() => setPaymentSuccessOpen(false)}
              className="w-full py-2 bg-primary text-surface-dim font-headline font-bold rounded-lg text-xs hover:bg-primary-fixed transition-all cursor-pointer"
            >
              Kembali ke Pengaturan
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
