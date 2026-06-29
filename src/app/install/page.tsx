'use client';

import React, { useState } from 'react';
import { api } from '../../lib/db';
import { brandConfig } from '../../config/brand';
import { CheckCircle2, ChevronRight, ChevronLeft, Sparkles, Settings2, Palette, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function InstallWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Installer States
  const [name, setName] = useState('Calixto Pet Shop');
  const [phone, setPhone] = useState('(11) 98888-7777');
  const [whatsapp, setWhatsapp] = useState('5511988887777');
  const [address, setAddress] = useState('Av. Paulista, 1000 - Bela Vista, São Paulo - SP');
  
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [fontFamily, setFontFamily] = useState("'Inter', sans-serif");
  
  const [instagram, setInstagram] = useState('calixtopetshop');
  const [metaTitle, setMetaTitle] = useState('Calixto Pet Shop | Estética Canina & Saúde');
  const [metaDescription, setMetaDescription] = useState('O melhor tratamento para seu pet com profissionais qualificados.');

  // Feature Toggles
  const [features, setFeatures] = useState({
    store: true,
    finance: true,
    inventory: true,
    marketing: true,
    loyalty: true,
    vaccines: true
  });

  const handleToggle = (key: keyof typeof features) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInstall = async () => {
    setLoading(true);
    try {
      const activeFeaturesList: string[] = ['scheduling'];
      if (features.store) activeFeaturesList.push('store');
      if (features.finance) activeFeaturesList.push('finance');
      if (features.inventory) activeFeaturesList.push('inventory');
      if (features.marketing) activeFeaturesList.push('marketing');
      if (features.loyalty) activeFeaturesList.push('loyalty');
      if (features.vaccines) activeFeaturesList.push('vaccines');

      const setupConfig = {
        ...brandConfig,
        name,
        theme: {
          ...brandConfig.theme,
          primaryColor,
          fontFamily
        },
        contact: {
          ...brandConfig.contact,
          phone,
          whatsapp,
          address,
          instagram
        },
        seo: {
          metaTitle,
          metaDescription,
          keywords: brandConfig.seo.keywords
        },
        features: activeFeaturesList
      };

      // Save installer setup to database
      await api.updateTenant('calixto', setupConfig);
      
      // Seed initial mock collections
      api.getServices(); // Triggers lazy database seeding if empty

      // Log setup log
      await api.saveActivityLog('calixto', {
        id: `log-setup-${Date.now()}`,
        userId: 'admin-installer',
        userName: 'Instalador PetFlow',
        action: 'Configuração Inicial',
        details: `Instalação concluída com sucesso para o pet shop ${name}`,
        timestamp: new Date().toISOString()
      });

      setStep(5); // Success step
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao salvar as configurações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-6">
      <div className="max-w-xl mx-auto w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        
        {/* Wizard header progress */}
        {step < 5 && (
          <div className="flex justify-between items-center border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-1.5">
                <Settings2 className="w-5 h-5 text-blue-500" />
                Instalador White Label
              </h2>
              <p className="text-[10px] text-slate-400 mt-1">Configure o pet shop em menos de 2 minutos.</p>
            </div>
            <span className="text-xs font-bold text-slate-400">Etapa {step} de 4</span>
          </div>
        )}

        {/* STEP 1: GENERAL PROFILE */}
        {step === 1 && (
          <div className="space-y-4 animate-scale-in">
            <h3 className="font-bold text-slate-755 text-sm">Perfil Geral do Estabelecimento</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome do Pet Shop *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Telefone Comercial</label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">WhatsApp de Contato</label>
                  <input 
                    type="text" 
                    value={whatsapp} 
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Endereço Comercial</label>
                <input 
                  type="text" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 outline-none"
                />
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-md shadow-blue-500/10"
            >
              Próxima Etapa <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: LOOK AND FEEL STYLE */}
        {step === 2 && (
          <div className="space-y-4 animate-scale-in">
            <h3 className="font-bold text-slate-755 text-sm flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-blue-500" /> Identidade Visual
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Selecione a Cor Principal da Marca</label>
                <div className="flex gap-3">
                  <input 
                    type="color" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border border-slate-200"
                  />
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-xs text-slate-800 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fonte / Tipografia Principal</label>
                <select 
                  value={fontFamily} 
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 outline-none"
                >
                  <option value="'Inter', sans-serif">Inter (Moderna / Limpa)</option>
                  <option value="'Outfit', sans-serif">Outfit (Premium / Tecnológica)</option>
                  <option value="system-ui, sans-serif">Sistema Padrão</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setStep(1)}
                className="w-1/3 py-3 border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
              <button 
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-md shadow-blue-500/10"
              >
                Próxima Etapa <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SOCIAL & SEO */}
        {step === 3 && (
          <div className="space-y-4 animate-scale-in">
            <h3 className="font-bold text-slate-755 text-sm">SEO & Redes Sociais</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Instagram (Nome do Perfil)</label>
                <input 
                  type="text" 
                  value={instagram} 
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="calixtopetshop"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Título de SEO (Google Title)</label>
                <input 
                  type="text" 
                  value={metaTitle} 
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Descrição do Site (MetaDescription)</label>
                <input 
                  type="text" 
                  value={metaDescription} 
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setStep(2)}
                className="w-1/3 py-3 border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
              <button 
                onClick={() => setStep(4)}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-md shadow-blue-500/10"
              >
                Próxima Etapa <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: FEATURE CONFIGURATION MODULES */}
        {step === 4 && (
          <div className="space-y-4 animate-scale-in">
            <h3 className="font-bold text-slate-755 text-sm">Módulos Habilitados (Toggles)</h3>
            <p className="text-[10px] text-slate-400">Ative ou desative módulos que aparecerão no site público e nos painéis.</p>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              {Object.keys(features).map((key) => {
                const label = key === 'store' ? 'Loja de Produtos' :
                              key === 'finance' ? 'Financeiro Avançado' :
                              key === 'inventory' ? 'Estoque' :
                              key === 'marketing' ? 'Disparos Marketing' :
                              key === 'loyalty' ? 'Fidelidade' : 'Vacinas';

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleToggle(key as keyof typeof features)}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      features[key as keyof typeof features]
                        ? 'border-blue-500 bg-blue-50/10'
                        : 'border-slate-200 bg-slate-50/40 text-slate-400'
                    }`}
                  >
                    <span className="font-bold text-xs">{label}</span>
                    <span className="text-xs">{features[key as keyof typeof features] ? '🟢 On' : '⚪ Off'}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-4">
              <button 
                onClick={() => setStep(3)}
                className="w-1/3 py-3 border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
              <button 
                disabled={loading}
                onClick={handleInstall}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-md shadow-blue-500/10"
              >
                {loading ? 'Instalando...' : 'Concluir Instalação'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SUCCESS REDIRECT */}
        {step === 5 && (
          <div className="text-center space-y-6 py-8 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Instalação Concluída!</h3>
              <p className="text-xs text-slate-400 mt-2">O pet shop foi configurado e a identidade visual criada com sucesso.</p>
            </div>

            <div className="flex flex-col gap-2 max-w-xs mx-auto">
              <Link 
                href="/admin" 
                className="w-full py-3 bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-md text-center block"
              >
                Ir para o Painel Admin
              </Link>
              <Link 
                href="/" 
                className="w-full py-3 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 text-center block"
              >
                Ver Site Público
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
