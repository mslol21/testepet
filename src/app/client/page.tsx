'use client';

import React, { useEffect, useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/db';
import { Pet, Appointment } from '../../types';
import { Calendar, Heart, Shield, LogOut, ArrowLeft, PlusCircle, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ClientPortal() {
  const { tenant } = useTenant();
  const { user, loginMockUser, logout } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const handleMockLogin = (role: 'client') => {
    if (tenant) {
      loginMockUser(role, tenant.id);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (user && user.role === 'client') {
        try {
          const clientMockId = user.email.includes('joao') ? 'c1' : 'c2';
          const allPets = await api.getPets();
          const allAppts = await api.getAppointments();

          setPets(allPets.filter(p => p.clientId === clientMockId));
          setAppointments(allAppts.filter(a => a.clientId === clientMockId));
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingData(false);
        }
      } else {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [user]);

  if (!tenant) return null;

  // LOGIN SCREEN
  if (!user || user.role !== 'client') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6">
        <div className="max-w-md mx-auto w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl stripe-card">
          <div className="text-center">
            <span className="text-4xl block mb-3">🐾</span>
            <h2 className="text-2xl font-extrabold text-slate-900">Área do Tutor</h2>
            <p className="text-xs text-slate-500 mt-2">Acompanhe carteirinha de vacinas, lembretes e linha do tempo de estética do seu pet.</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Acessar Conta de Teste</h3>
            
            <button
              onClick={() => handleMockLogin('client')}
              className="w-full py-3.5 border border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-between px-6 transition-all"
            >
              <div className="text-left">
                <span className="font-bold text-slate-800 text-xs block">João Silva</span>
                <span className="text-[10px] text-slate-500">Pet: Mel (Golden Retriever)</span>
              </div>
              <span className="text-xs text-blue-500 font-bold">Acessar ➔</span>
            </button>

            <button
              onClick={() => {
                loginMockUser('client', tenant.id);
                setTimeout(() => {
                  localStorage.setItem('petflow_current_user', JSON.stringify({
                    id: 'mock-client-maria',
                    name: 'Maria Oliveira (Cliente)',
                    email: 'maria.oliveira@outlook.com',
                    role: 'client',
                    tenantId: tenant.id,
                    createdAt: new Date().toISOString()
                  }));
                  window.location.reload();
                }, 50);
              }}
              className="w-full py-3.5 border border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-between px-6 transition-all"
            >
              <div className="text-left">
                <span className="font-bold text-slate-800 text-xs block">Maria Oliveira</span>
                <span className="text-[10px] text-slate-500">Pets: Thor (Shih Tzu), Pipoca (Persa)</span>
              </div>
              <span className="text-xs text-blue-500 font-bold font-sans">Acessar ➔</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-500 hover:text-blue-500 flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar ao site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pastAppointments = appointments.filter(a => a.status === 'Finalizado');
  const futureAppointments = appointments.filter(a => a.status !== 'Finalizado' && a.status !== 'Cancelado');
  const clientAvatar = user.email.includes('joao') 
    ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
    : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold text-slate-800 text-lg hover:text-blue-500 transition-colors">
            {tenant.name}
          </Link>
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500 uppercase">Área do Tutor</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={clientAvatar} 
              alt={user.name} 
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <div className="text-left hidden sm:block">
              <span className="font-bold text-slate-800 text-xs block">{user.name}</span>
              <span className="text-[10px] text-slate-400">{user.email}</span>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Columns: Pets & Timeline */}
        <div className="md:col-span-2 space-y-8">
          {/* Section: My Pets */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-current" />
                Nossos Pets
              </h2>
              <Link 
                href="/booking" 
                className="text-xs font-bold text-blue-500 flex items-center gap-1 hover:opacity-80"
              >
                <PlusCircle className="w-4 h-4" />
                Agendar Novo
              </Link>
            </div>

            {loadingData ? (
              <div className="w-full py-12 flex justify-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
              </div>
            ) : pets.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center text-slate-400 text-xs">
                Nenhum pet localizado. Agende seu primeiro serviço para cadastrá-lo!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {pets.map((pet) => (
                  <div key={pet.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-xl overflow-hidden border border-blue-100">
                          {pet.photoUrlAfter ? (
                            <img src={pet.photoUrlAfter} alt={pet.name} className="w-full h-full object-cover" />
                          ) : '🐾'}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-base">{pet.name}</h4>
                          <p className="text-xs text-slate-500">{pet.species} • {pet.breed} • {pet.size}</p>
                          <span className="text-[9px] text-slate-400 block mt-1">Tempo como cliente: 3 meses</span>
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 border border-amber-100 text-amber-800 px-3 py-1.5 rounded-xl text-center">
                        <span className="text-[9px] uppercase tracking-wider block font-bold">Fidelidade</span>
                        <span className="text-sm font-black block mt-0.5">{pet.id === 'pet1' ? '60 pts' : '120 pts'}</span>
                      </div>
                    </div>

                    {/* Próximo retorno sugerido */}
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-3 flex items-center justify-between text-indigo-900 text-xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                        <span>Próximo retorno sugerido para estética:</span>
                      </div>
                      <span className="font-extrabold bg-white px-2.5 py-0.5 rounded-md border border-indigo-200">12/07/2026</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                      {/* Vaccines card */}
                      <div>
                        <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <Shield className="w-4 h-4 text-blue-500" />
                          Carteira de Vacinação
                        </h5>
                        {pet.vaccines.length === 0 ? (
                          <p className="text-[10px] text-slate-400">Nenhum registro de vacina inserido.</p>
                        ) : (
                          <div className="space-y-2">
                            {pet.vaccines.map((v, i) => (
                              <div key={i} className="flex justify-between items-center text-xs p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                                <span className="font-semibold text-slate-700">{v.name}</span>
                                <div className="text-right text-[10px]">
                                  <span className="text-slate-400 block">Dose: {v.date}</span>
                                  {v.nextDose && <span className="text-blue-500 block font-bold">Reforço: {v.nextDose}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Warnings & Notes */}
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">Alergias e Restrições</h5>
                          {pet.allergies.length === 0 ? (
                            <p className="text-[10px] text-slate-400">Nenhuma restrição alimentar ou médica cadastrada.</p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {pet.allergies.map((a, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-50 text-red-600 border border-red-100">{a}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-1">Dicas do Cuidador</h5>
                          <p className="text-xs text-slate-500 leading-relaxed italic">{pet.notes || 'Sem observações especiais.'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Timeline of services */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Linha do Tempo de Atendimentos
            </h2>

            {pastAppointments.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 text-center text-slate-400 text-xs">
                Nenhum serviço anterior registrado na linha do tempo.
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 relative">
                {/* Vertical timeline line */}
                <div className="absolute left-9 top-8 bottom-8 w-0.5 bg-slate-100" />

                {pastAppointments.map((appt) => {
                  const pet = pets.find(p => p.id === appt.petId);
                  return (
                    <div key={appt.id} className="flex gap-4 relative">
                      {/* Timeline dot */}
                      <div className="w-6 h-6 rounded-full bg-blue-50 border-2 border-blue-500 flex items-center justify-center z-10 flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-current" />
                      </div>
                      
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex-1 text-xs space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-800">{appt.serviceName}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{appt.date}</span>
                        </div>
                        
                        <p className="text-[10px] text-slate-500">Realizado por: {appt.employeeName}</p>
                        
                        {/* Display products used */}
                        {appt.usedProducts && appt.usedProducts.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Produtos Utilizados:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {appt.usedProducts.map((prod, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-slate-200/60 rounded-md text-[9px] text-slate-600 font-medium">🧴 {prod}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Display before and after photo segment */}
                        {pet?.photoUrlBefore && pet?.photoUrlAfter && (appt.serviceName.includes('Banho') || appt.serviceName.includes('Tosa')) && (
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Antes</span>
                              <div className="h-28 rounded-xl overflow-hidden border border-slate-200/50 bg-slate-100">
                                <img src={pet.photoUrlBefore} alt="Antes" className="w-full h-full object-cover" />
                              </div>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Depois</span>
                              <div className="h-28 rounded-xl overflow-hidden border border-slate-200/50 bg-slate-100">
                                <img src={pet.photoUrlAfter} alt="Depois" className="w-full h-full object-cover" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Schedule */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Próximos Agendamentos
          </h2>

          <div className="space-y-4">
            {loadingData ? (
              <div className="w-full py-8 flex justify-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
              </div>
            ) : futureAppointments.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 text-center text-slate-400 text-xs">
                Nenhum horário marcado no momento.
              </div>
            ) : (
              futureAppointments.map((appt) => (
                <div key={appt.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">{appt.petName}</span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                      {appt.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-800 text-xs">{appt.serviceName}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">Atendente: {appt.employeeName}</p>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-3 text-[10px]">
                    <span className="text-blue-500 font-bold">{appt.date} às {appt.time}</span>
                    <span className="font-extrabold text-slate-800">R$ {appt.price.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
