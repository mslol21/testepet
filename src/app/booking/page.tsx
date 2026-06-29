'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { api } from '../../lib/db';
import { Service, Employee, Appointment, Client, Pet } from '../../types';
import { Calendar, User, Clock, ChevronLeft, ChevronRight, CheckCircle2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { brandConfig } from '../../config/brand';

export default function OnlineBooking() {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Selections
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  // Client Details
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  
  // Pet Details
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState<'Cão' | 'Gato' | 'Outros'>('Cão');
  const [petBreed, setPetBreed] = useState('');
  const [petSize, setPetSize] = useState<'Pequeno' | 'Médio' | 'Grande' | 'Gigante'>('Pequeno');
  
  const [submitting, setSubmitting] = useState(false);
  const [appointmentSuccess, setAppointmentSuccess] = useState<Appointment | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedServices = await api.getServices();
        const fetchedEmployees = await api.getEmployees();
        setServices(fetchedServices.filter(s => s.isActive));
        setEmployees(fetchedEmployees.filter(e => e.isActive));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Handle URL pre-selection of service
  useEffect(() => {
    if (services.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const serviceId = urlParams.get('service');
      if (serviceId) {
        const found = services.find(s => s.id === serviceId);
        if (found) {
          setSelectedService(found);
          setStep(2); // Go to professional step
        }
      }
    }
  }, [services]);

  if (tenantLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  if (!tenant) return null;

  // Generate available times (dummy simple version based on business hours)
  const times = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  // Handle final submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientPhone || !petName) {
      alert('Preencha todas as informações obrigatórias.');
      return;
    }

    setSubmitting(true);
    try {
      const cleanPhone = clientPhone.replace(/\D/g, '');

      // 1. Create client ref in db
      const clientId = `cli-${Date.now()}`;
      const newClient: Client = {
        id: clientId,
        name: clientName,
        phone: clientPhone,
        whatsapp: cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone,
        email: clientEmail,
        address: { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' },
        loyaltyPoints: 0,
        createdAt: new Date().toISOString()
      };
      await api.saveClient(tenant.id, newClient);

      // 2. Create pet ref in db
      const petId = `pet-${Date.now()}`;
      const newPet: Pet = {
        id: petId,
        clientId,
        name: petName,
        species: petSpecies,
        breed: petBreed || 'Vira-lata (SDR)',
        gender: 'Macho',
        weight: 10,
        size: petSize,
        vaccines: [],
        allergies: [],
        medications: [],
        createdAt: new Date().toISOString()
      };
      await api.savePet(tenant.id, newPet);

      // 3. Create appointment
      const appointmentId = `ap-${Date.now()}`;
      const newAppointment: Appointment = {
        id: appointmentId,
        clientId,
        clientName,
        clientPhone,
        petId,
        petName,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        employeeId: selectedEmployee?.id || '',
        employeeName: selectedEmployee?.name || 'Qualquer Profissional',
        date: selectedDate,
        time: selectedTime,
        status: 'Agendado',
        price: selectedService.price,
        createdAt: new Date().toISOString()
      };

      await api.saveAppointment(tenant.id, newAppointment);

      // Log activity
      await api.saveActivityLog(tenant.id, {
        id: `log-${Date.now()}`,
        userId: 'cliente-publico',
        userName: 'Agendamento Online',
        action: 'Novo Agendamento',
        details: `${clientName} agendou ${selectedService.name} para ${petName} em ${selectedDate} às ${selectedTime}`,
        timestamp: new Date().toISOString()
      });

      setAppointmentSuccess(newAppointment);
      setStep(5);
    } catch (err) {
      console.error(err);
      alert('Falha ao concluir agendamento.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-6 flex flex-col justify-between">
      <div className="max-w-xl mx-auto w-full">
        {/* Header navigation back */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-500 transition-colors font-medium">
            <ChevronLeft className="w-4 h-4" />
            Voltar para o site
          </Link>
          <span className="text-xs text-slate-400 font-semibold">{tenant.name}</span>
        </div>

        {/* Step progress bar */}
        {step < 5 && (
          <div className="flex justify-between items-center mb-8 bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s 
                    ? 'bg-blue-500 text-white' 
                    : step > s 
                    ? 'bg-blue-50 text-blue-500' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {s}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:inline ${
                  step === s ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {s === 1 ? 'Serviço' : s === 2 ? 'Profissional' : s === 3 ? 'Data & Hora' : 'Seu Pet'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* STEP 1: SELECT SERVICE */}
        {step === 1 && (
          <div className="space-y-6 animate-scale-in">
            <h2 className="text-xl font-bold text-slate-800">Escolha o Serviço</h2>
            <div className="grid grid-cols-1 gap-3">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedService(s);
                    setStep(2);
                  }}
                  className={`p-5 rounded-2xl border text-left flex justify-between items-center transition-all ${
                    selectedService?.id === s.id 
                      ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500' 
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:-translate-y-0.5'
                  }`}
                >
                  <div>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">{s.category}</span>
                    <h4 className="font-bold text-slate-800 text-sm mt-2">{s.name}</h4>
                    <p className="text-slate-500 text-xs mt-1">{s.description}</p>
                    <span className="text-[10px] text-slate-400 font-medium block mt-2">Duração estimada: {s.duration} minutos</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-800 text-sm block">R$ {s.price.toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: SELECT EMPLOYEE */}
        {step === 2 && (
          <div className="space-y-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Escolha o Profissional</h2>
              <button onClick={() => setStep(1)} className="text-xs text-slate-500 hover:text-blue-500">Voltar</button>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  setStep(3);
                }}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  selectedEmployee === null 
                    ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                  👥
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Qualquer Profissional</h4>
                  <p className="text-slate-500 text-xs">Menor tempo de espera.</p>
                </div>
              </button>

              {employees.map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    setSelectedEmployee(e);
                    setStep(3);
                  }}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    selectedEmployee?.id === e.id 
                      ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                    {e.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{e.name}</h4>
                    <p className="text-slate-400 text-xs capitalize">{e.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: DATE & TIME */}
        {step === 3 && (
          <div className="space-y-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Selecione Data e Hora</h2>
              <button onClick={() => setStep(2)} className="text-xs text-slate-500 hover:text-blue-500">Voltar</button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data do Atendimento</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Horários Disponíveis</label>
                  <div className="grid grid-cols-3 gap-2">
                    {times.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={`py-3 text-xs font-semibold rounded-xl border transition-all ${
                          selectedTime === t 
                            ? 'bg-blue-500 border-blue-500 text-white shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedDate && selectedTime && (
              <button
                onClick={() => setStep(4)}
                className="w-full py-4 bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-500/10 hover:opacity-95 text-sm"
              >
                Prosseguir
              </button>
            )}
          </div>
        )}

        {/* STEP 4: CLIENT & PET DATA */}
        {step === 4 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Seus Dados e do Pet</h2>
              <button type="button" onClick={() => setStep(3)} className="text-xs text-slate-500 hover:text-blue-500">Voltar</button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Seus Contatos</h3>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Seu Nome Completo *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nome do tutor"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">WhatsApp / Celular *</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="(11) 99999-9999"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Seu E-mail (Opcional)</label>
                  <input 
                    type="email" 
                    placeholder="email@provedor.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 pt-4">Dados do Pet</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nome do Pet *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Nome do bichinho"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Espécie *</label>
                  <select 
                    value={petSpecies}
                    onChange={(e) => setPetSpecies(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Cão">Cachorro</option>
                    <option value="Gato">Gato</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Raça</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Golden, Lhasa, etc."
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Porte do Animal</label>
                  <select 
                    value={petSize}
                    onChange={(e) => setPetSize(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Pequeno">Pequeno (Até 10kg)</option>
                    <option value="Médio">Médio (11-20kg)</option>
                    <option value="Grande">Grande (21-40kg)</option>
                    <option value="Gigante">Gigante (Acima de 40kg)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Serviço:</span>
                <span className="font-bold text-slate-800">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Valor:</span>
                <span className="font-bold text-slate-800">R$ {selectedService?.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Data/Hora:</span>
                <span className="font-bold text-slate-800">{selectedDate} às {selectedTime}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-500/10 hover:opacity-95 text-sm"
            >
              {submitting ? 'Confirmando Agendamento...' : 'Concluir Agendamento'}
            </button>
          </form>
        )}

        {/* STEP 5: SUCCESS CONFIRMATION */}
        {step === 5 && appointmentSuccess && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto text-3xl">
              <CheckCircle2 className="w-10 h-10 text-blue-500" />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-slate-800">Agendamento Confirmado!</h2>
              <p className="text-slate-500 text-xs mt-1">O seu horário já foi inserido no painel de atendimento do {tenant.name}.</p>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Pet:</span>
                <span className="font-bold text-slate-800">{appointmentSuccess.petName}</span>
              </div>
              <div className="flex justify-between">
                <span>Serviço:</span>
                <span className="font-bold text-slate-800">{appointmentSuccess.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span>Horário:</span>
                <span className="font-bold text-slate-800">{appointmentSuccess.date} às {appointmentSuccess.time}</span>
              </div>
              <div className="flex justify-between">
                <span>Profissional:</span>
                <span className="font-bold text-slate-800">{appointmentSuccess.employeeName}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-2 mt-2">
                <span>Total Estimado:</span>
                <span className="font-extrabold text-slate-800 text-sm">R$ {appointmentSuccess.price.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link 
                href="/"
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
              >
                Voltar para o Início
              </Link>
              <a
                href={`https://wa.me/${brandConfig.contact.whatsapp}?text=Ol%C3%A1%2C+acabei+de+fazer+um+agendamento+online+para+o+pet+${appointmentSuccess.petName}+no+dia+${appointmentSuccess.date}+%C3%A0s+${appointmentSuccess.time}.`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
              >
                Enviar confirmação por WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
