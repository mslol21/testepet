'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/db';
import { 
  Tenant, Service, Product, Client, Pet, Appointment, Employee, 
  FinancialTransaction, Supplier, Review, ActivityLog 
} from '../../types';
import { 
  LayoutDashboard, Calendar, Users, ShoppingCart, DollarSign, 
  Palette, LogOut, Search, Plus, Check, X, AlertTriangle, 
  TrendingUp, ArrowDown, ArrowUp, Download, Clock, BarChart2, 
  Mail, MapPin, Sparkles, Send, FileText, Printer, Moon, Sun, 
  Keyboard, Settings, MessageCircle, RefreshCw, Upload
} from 'lucide-react';
import Link from 'next/link';

type TabType = 'dashboard' | 'agenda' | 'clients' | 'inventory' | 'finance' | 'marketing' | 'whitelabel';
type CalendarViewType = 'day' | 'week' | 'month';

export default function AdminPortal() {
  const { tenant, reloadTenant } = useTenant();
  const { user, loginMockUser, logout } = useAuth();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [calendarView, setCalendarView] = useState<CalendarViewType>('day');
  
  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);

  // DB States
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Search & Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [mktFilter, setMktFilter] = useState<'dormant30' | 'dormant60' | 'birthdays' | 'vaccines' | 'vips'>('dormant30');
  
  // Modals
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [showAddApptModal, setShowAddApptModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);

  // Form Fields (temp variables)
  const [formClient, setFormClient] = useState({ name: '', phone: '', email: '', notes: '' });
  const [formPet, setFormPet] = useState({ clientId: '', name: '', species: 'Cão', breed: '', size: 'Pequeno' as any, notes: '' });
  const [formProduct, setFormProduct] = useState({ name: '', price: 0, costPrice: 0, stock: 0, minStockAlert: 5, category: 'Alimentação', barcode: '' });
  const [formService, setFormService] = useState({ name: '', price: 0, duration: 30, description: '', category: 'Estética' });
  const [formAppt, setFormAppt] = useState({ clientId: '', petId: '', serviceId: '', date: '', time: '', employeeId: '' });
  const [formSupplier, setFormSupplier] = useState({ name: '', phone: '', email: '', cnpj: '', address: '', notes: '' });

  // Customizer styling overrides
  const [customPrimary, setCustomPrimary] = useState(tenant?.theme.primaryColor || '#3b82f6');
  const [customName, setCustomName] = useState(tenant?.name || '');
  const [customPhone, setCustomPhone] = useState(tenant?.contact.phone || '');
  const [customWhatsapp, setCustomWhatsapp] = useState(tenant?.contact.whatsapp || '');
  const [customAddress, setCustomAddress] = useState(tenant?.contact.address || '');
  const [customTitle, setCustomTitle] = useState(tenant?.seo.metaTitle || '');
  const [customDesc, setCustomDesc] = useState(tenant?.seo.metaDescription || '');

  // Toggle state
  const [moduleStore, setModuleStore] = useState(true);
  const [moduleFinance, setModuleFinance] = useState(true);
  const [moduleInventory, setModuleInventory] = useState(true);
  const [moduleMarketing, setModuleMarketing] = useState(true);
  const [moduleLoyalty, setModuleLoyalty] = useState(true);
  const [moduleVaccines, setModuleVaccines] = useState(true);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Apply features checkboxes status
  useEffect(() => {
    if (tenant && tenant.features) {
      setModuleStore(tenant.features.includes('store'));
      setModuleFinance(tenant.features.includes('finance'));
      setModuleInventory(tenant.features.includes('inventory'));
      setModuleMarketing(tenant.features.includes('marketing'));
      setModuleLoyalty(tenant.features.includes('loyalty'));
      setModuleVaccines(tenant.features.includes('vaccines'));
    }
  }, [tenant]);

  // Handle Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'n') {
        e.preventDefault();
        setShowAddApptModal(true);
      } else if (key === 'c') {
        e.preventDefault();
        setActiveTab('clients');
      } else if (key === 'f') {
        e.preventDefault();
        setActiveTab('finance');
      } else if (key === 'e') {
        e.preventDefault();
        setActiveTab('inventory');
      } else if (key === 'm') {
        e.preventDefault();
        setActiveTab('marketing');
      } else if (key === 's') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Set default tab based on role permissions
  useEffect(() => {
    if (user) {
      if (user.role === 'employee') {
        setActiveTab('agenda');
      } else if (user.role === 'finance') {
        setActiveTab('finance');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [user]);

  // Load all tenant datasets
  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const fetchedServices = await api.getServices();
      const fetchedProducts = await api.getProducts();
      const fetchedClients = await api.getClients();
      const fetchedPets = await api.getPets();
      const fetchedAppts = await api.getAppointments();
      const fetchedTx = await api.getFinancialTransactions();
      const fetchedEmp = await api.getEmployees();
      const fetchedReviews = await api.getReviews();
      const fetchedLogs = await api.getActivityLogs();
      const fetchedSup = await api.getSuppliers();

      setServices(fetchedServices);
      setProducts(fetchedProducts);
      setClients(fetchedClients);
      setPets(fetchedPets);
      setAppointments(fetchedAppts);
      setTransactions(fetchedTx);
      setEmployees(fetchedEmp);
      setReviews(fetchedReviews);
      setLogs(fetchedLogs);
      setSuppliers(fetchedSup);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user]);

  if (!tenant) return null;

  // 1. ADMIN AUTH GATE
  if (!user || user.role === 'client') {
    return (
      <div className="min-h-screen bg-slate-905 flex flex-col justify-center py-12 px-6">
        <div className="max-w-md mx-auto w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl stripe-card">
          <div className="text-center">
            <span className="text-4xl block mb-3">🛡️</span>
            <h2 className="text-2xl font-extrabold text-slate-900">PetFlow Admin</h2>
            <p className="text-xs text-slate-500 mt-2">Área de acesso restrito a administradores e veterinários do pet shop.</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Entrar na Instalação</h3>
            
            <button
              onClick={() => loginMockUser('owner', tenant.id)}
              className="w-full py-3.5 border border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-between px-6 transition-all"
            >
              <div className="text-left">
                <span className="font-bold text-slate-800 text-xs block">Carlos Calixto (Proprietário)</span>
                <span className="text-[10px] text-slate-500">Acesso total a finanças e DRE</span>
              </div>
              <span className="text-xs text-blue-500 font-bold">Acessar ➔</span>
            </button>

            <button
              onClick={() => loginMockUser('employee', tenant.id)}
              className="w-full py-3.5 border border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-between px-6 transition-all"
            >
              <div className="text-left">
                <span className="font-bold text-slate-800 text-xs block">Ana Souza (Tosadora)</span>
                <span className="text-[10px] text-slate-500">Ver agenda operacional de tosas apenas</span>
              </div>
              <span className="text-xs text-blue-500 font-bold">Acessar ➔</span>
            </button>

            <button
              onClick={() => {
                loginMockUser('owner', tenant.id);
                setTimeout(() => {
                  localStorage.setItem('petflow_current_user', JSON.stringify({
                    id: 'mock-finance',
                    name: 'Lucas Financeiro',
                    email: 'lucas@calixto.com.br',
                    role: 'finance',
                    tenantId: tenant.id,
                    createdAt: new Date().toISOString()
                  }));
                  window.location.reload();
                }, 50);
              }}
              className="w-full py-3.5 border border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-between px-6 transition-all"
            >
              <div className="text-left">
                <span className="font-bold text-slate-800 text-xs block">Lucas Silveira (Financeiro)</span>
                <span className="text-[10px] text-slate-500">Visualizar DRE e fluxo de caixa apenas</span>
              </div>
              <span className="text-xs text-blue-500 font-bold">Acessar ➔</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-500 hover:text-blue-500 flex items-center justify-center gap-1">
              <ArrowDown className="w-3.5 h-3.5 rotate-90" />
              Voltar ao site público
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. BACKUP & RESTORE TRIGGERS
  const handleDownloadBackup = () => {
    if (typeof window === 'undefined') return;
    const backupState: Record<string, string | null> = {
      petflow_settings: localStorage.getItem('petflow_settings'),
      petflow_services: localStorage.getItem('petflow_services'),
      petflow_products: localStorage.getItem('petflow_products'),
      petflow_employees: localStorage.getItem('petflow_employees'),
      petflow_clients: localStorage.getItem('petflow_clients'),
      petflow_pets: localStorage.getItem('petflow_pets'),
      petflow_appointments: localStorage.getItem('petflow_appointments'),
      petflow_transactions: localStorage.getItem('petflow_transactions'),
      petflow_suppliers: localStorage.getItem('petflow_suppliers'),
      petflow_reviews: localStorage.getItem('petflow_reviews')
    };

    const dataStr = JSON.stringify(backupState, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `backup_petflow_${tenant.slug}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        Object.entries(parsed).forEach(([key, val]) => {
          if (val) localStorage.setItem(key, val as string);
        });
        alert('Banco de dados restaurado com sucesso! Recarregando...');
        window.location.reload();
      } catch (err) {
        alert('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    const headers = ['Nome', 'Telefone', 'WhatsApp', 'Email', 'Pontos Fidelidade'];
    const rows = clients.map(c => [c.name, c.phone, c.whatsapp, c.email, c.loyaltyPoints]);
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += headers.join(",") + "\r\n";
    rows.forEach(rowArray => {
      const row = rowArray.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `clientes_${tenant.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintDocument = (type: 'recibo' | 'orcamento' | 'comprovante', item: any) => {
    const printContent = `
      ===============================================
      📄 ${type.toUpperCase()} - ${tenant.name.toUpperCase()}
      ===============================================
      Código: DOC-${Date.now()}
      Data: ${new Date().toLocaleDateString('pt-BR')}
      Item: ${item.serviceName || item.name || 'Serviço Estético'}
      Preço Cobrado: R$ ${Number(item.price || item.amount || 0).toFixed(2)}
      -----------------------------------------------
      Obrigado pela preferência!
      Contato: ${tenant.contact.phone}
      ===============================================
    `;
    const blob = new Blob([printContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${type}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. ACTIONS HANDLERS
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: `cli-${Date.now()}`,
      name: formClient.name,
      phone: formClient.phone,
      whatsapp: '55' + formClient.phone.replace(/\D/g, ''),
      email: formClient.email,
      address: { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' },
      loyaltyPoints: 0,
      notes: formClient.notes,
      createdAt: new Date().toISOString()
    };

    await api.saveClient(tenant.id, newClient);
    setShowAddClientModal(false);
    setFormClient({ name: '', phone: '', email: '', notes: '' });
    loadAllData();
  };

  const handleSavePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPet.clientId) {
      alert('Selecione um tutor.');
      return;
    }
    const newPet: Pet = {
      id: `pet-${Date.now()}`,
      clientId: formPet.clientId,
      name: formPet.name,
      species: formPet.species,
      breed: formPet.breed,
      gender: 'Macho',
      weight: 8,
      size: formPet.size,
      vaccines: [],
      allergies: [],
      medications: [],
      notes: formPet.notes,
      createdAt: new Date().toISOString()
    };

    await api.savePet(tenant.id, newPet);
    setShowAddPetModal(false);
    setFormPet({ clientId: '', name: '', species: 'Cão', breed: '', size: 'Pequeno', notes: '' });
    loadAllData();
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProd: Product = {
      id: `p-${Date.now()}`,
      name: formProduct.name,
      price: Number(formProduct.price),
      costPrice: Number(formProduct.costPrice),
      stock: Number(formProduct.stock),
      minStockAlert: Number(formProduct.minStockAlert),
      barcode: formProduct.barcode,
      category: formProduct.category,
      imageUrls: [],
      isActive: true,
      createdAt: new Date().toISOString()
    };

    await api.saveProduct(tenant.id, newProd);
    setShowAddProductModal(false);
    setFormProduct({ name: '', price: 0, costPrice: 0, stock: 0, minStockAlert: 5, category: 'Alimentação', barcode: '' });
    loadAllData();
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSvc: Service = {
      id: `s-${Date.now()}`,
      name: formService.name,
      price: Number(formService.price),
      duration: Number(formService.duration),
      description: formService.description,
      category: formService.category,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    await api.saveService(tenant.id, newSvc);
    setShowAddServiceModal(false);
    setFormService({ name: '', price: 0, duration: 30, description: '', category: 'Estética' });
    loadAllData();
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      name: formSupplier.name,
      phone: formSupplier.phone,
      email: formSupplier.email,
      cnpj: formSupplier.cnpj,
      address: formSupplier.address,
      notes: formSupplier.notes,
      createdAt: new Date().toISOString()
    };

    await api.saveSupplier(tenant.id, newSup);
    setShowAddSupplierModal(false);
    setFormSupplier({ name: '', phone: '', email: '', cnpj: '', address: '', notes: '' });
    loadAllData();
  };

  const handleSaveAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === formAppt.clientId);
    const pet = pets.find(p => p.id === formAppt.petId);
    const service = services.find(s => s.id === formAppt.serviceId);
    const employee = employees.find(emp => emp.id === formAppt.employeeId);

    if (!client || !pet || !service) {
      alert('Erro ao selecionar cliente, pet ou serviço.');
      return;
    }

    const newAppt: Appointment = {
      id: `ap-${Date.now()}`,
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      petId: pet.id,
      petName: pet.name,
      serviceId: service.id,
      serviceName: service.name,
      employeeId: employee?.id || '',
      employeeName: employee?.name || 'Qualquer Profissional',
      date: formAppt.date,
      time: formAppt.time,
      status: 'Agendado',
      price: service.price,
      createdAt: new Date().toISOString()
    };

    await api.saveAppointment(tenant.id, newAppt);
    setShowAddApptModal(false);
    setFormAppt({ clientId: '', petId: '', serviceId: '', date: '', time: '', employeeId: '' });
    loadAllData();
  };

  const handleUpdateApptStatus = async (appt: Appointment, newStatus: Appointment['status']) => {
    const updated = { ...appt, status: newStatus };
    await api.saveAppointment(tenant.id, updated);
    
    if (newStatus === 'Finalizado') {
      const txId = `tx-${Date.now()}`;
      await api.saveFinancialTransaction(tenant.id, {
        id: txId,
        type: 'Entrada',
        category: 'Serviços',
        amount: appt.price,
        date: appt.date,
        status: 'Pago',
        description: `Serviço ${appt.serviceName} - Pet ${appt.petName}`,
        relatedId: appt.id,
        createdAt: new Date().toISOString()
      });
      
      const client = clients.find(c => c.id === appt.clientId);
      if (client) {
        await api.saveClient(tenant.id, {
          ...client,
          loyaltyPoints: (client.loyaltyPoints || 0) + 10
        });
      }
    }

    loadAllData();
  };

  const handleSaveWhiteLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedFeatures: string[] = ['scheduling'];
    if (moduleStore) updatedFeatures.push('store');
    if (moduleFinance) updatedFeatures.push('finance');
    if (moduleInventory) updatedFeatures.push('inventory');
    if (moduleMarketing) updatedFeatures.push('marketing');
    if (moduleLoyalty) updatedFeatures.push('loyalty');
    if (moduleVaccines) updatedFeatures.push('vaccines');

    const updatedTheme = {
      ...tenant.theme,
      primaryColor: customPrimary
    };

    const updatedContact = {
      ...tenant.contact,
      phone: customPhone,
      whatsapp: customWhatsapp,
      address: customAddress
    };

    await api.updateTenant(tenant.id, {
      name: customName,
      theme: updatedTheme,
      contact: updatedContact,
      seo: {
        metaTitle: customTitle,
        metaDescription: customDesc,
        keywords: tenant.seo.keywords
      },
      features: updatedFeatures
    });

    await reloadTenant();
    alert('Branding White Label e Módulos do Pet Shop salvos com sucesso!');
  };

  // 4. METRICS CALCULATIONS
  const totalInflows = transactions
    .filter(t => t.type === 'Entrada' && t.status === 'Pago')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflows = transactions
    .filter(t => t.type === 'Saída' && t.status === 'Pago')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalInflows - totalOutflows;

  const todayStr = new Date().toISOString().split('T')[0];
  const revenueToday = transactions
    .filter(t => t.type === 'Entrada' && t.status === 'Pago' && t.date === todayStr)
    .reduce((sum, t) => sum + t.amount, 0);

  const estimatedCPV = transactions
    .filter(t => t.type === 'Saída' && t.category === 'Fornecedores')
    .reduce((sum, t) => sum + t.amount, 0);

  const fixedExpenses = transactions
    .filter(t => t.type === 'Saída' && t.category !== 'Fornecedores')
    .reduce((sum, t) => sum + t.amount, 0);

  const finishedAppts = appointments.filter(a => a.status === 'Finalizado');
  const ticketMedio = finishedAppts.length > 0 
    ? finishedAppts.reduce((sum, a) => sum + a.price, 0) / finishedAppts.length 
    : 0;

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;

  const activeClientsCount = clients.filter(c => {
    const appts = appointments.filter(a => a.clientId === c.id);
    if (appts.length === 0) return false;
    const latest = Math.max(...appts.map(a => new Date(a.date).getTime()));
    return latest >= thirtyDaysAgo;
  }).length;

  const inactiveClientsCount = clients.filter(c => {
    const appts = appointments.filter(a => a.clientId === c.id);
    if (appts.length === 0) return true;
    const latest = Math.max(...appts.map(a => new Date(a.date).getTime()));
    return latest < sixtyDaysAgo;
  }).length;

  const totalInventoryValuation = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);

  const productsWithABC = products.map(p => {
    let abc: 'A' | 'B' | 'C' = 'C';
    if (p.price >= 100) abc = 'A';
    else if (p.price >= 30) abc = 'B';
    return { ...p, abcClass: abc };
  });

  const restockSuggestions = products
    .filter(p => p.stock <= p.minStockAlert)
    .map(p => ({
      ...p,
      suggestedQty: (p.minStockAlert - p.stock) + 10
    }));

  const getSmartList = () => {
    switch (mktFilter) {
      case 'dormant30':
        return clients.filter(c => {
          const appts = appointments.filter(a => a.clientId === c.id);
          if (appts.length === 0) return true;
          const latest = Math.max(...appts.map(a => new Date(a.date).getTime()));
          return latest < thirtyDaysAgo;
        });
      case 'dormant60':
        return clients.filter(c => {
          const appts = appointments.filter(a => a.clientId === c.id);
          if (appts.length === 0) return true;
          const latest = Math.max(...appts.map(a => new Date(a.date).getTime()));
          return latest < sixtyDaysAgo;
        });
      case 'birthdays':
        return clients.filter((c, idx) => idx % 2 === 0);
      case 'vaccines':
        return clients.filter((c, idx) => idx % 3 === 0);
      case 'vips':
        return clients.filter(c => (c.loyaltyPoints || 0) >= 60);
      default:
        return clients;
    }
  };

  const smartClientsList = getSmartList();

  const busyHours = [
    { label: '08h - 10h', percentage: 25 },
    { label: '10h - 12h', percentage: 40 },
    { label: '13h - 15h', percentage: 15 },
    { label: '15h - 17h', percentage: 20 }
  ];

  const occupancyRate = 75;

  const filteredAppointments = appointments.filter(appt => {
    const searchString = `${appt.clientName} ${appt.petName} ${appt.serviceName}`.toLowerCase();
    const matchesSearch = searchString.includes(globalSearch.toLowerCase());
    const matchesStatus = statusFilter ? appt.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  // Role Access Checks
  const isOwner = user.role === 'owner';
  const isFinance = user.role === 'finance';
  const isEmployee = user.role === 'employee';

  return (
    <div className={`min-h-screen flex transition-colors ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Side bar */}
      <aside className={`w-64 flex flex-col justify-between flex-shrink-0 z-10 border-r ${
        darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-900 border-slate-200 text-slate-400'
      }`}>
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
              🐾
            </div>
            <div>
              <span className="font-extrabold text-white text-sm block leading-tight">{tenant.name}</span>
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mt-1">Painel Executive</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {/* Owner/Gerente Only */}
            {!isEmployee && !isFinance && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'dashboard' ? 'bg-blue-500 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Painel Geral
              </button>
            )}

            {/* Banhista/Owner/Recepcao */}
            {!isFinance && (
              <button
                onClick={() => setActiveTab('agenda')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'agenda' ? 'bg-blue-500 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Agenda
              </button>
            )}

            {/* Owner/Recepcao Only */}
            {!isEmployee && !isFinance && (
              <>
                <button
                  onClick={() => setActiveTab('clients')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-colors ${
                    activeTab === 'clients' ? 'bg-blue-500 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  CRM Clientes & Pets
                </button>

                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-colors ${
                    activeTab === 'inventory' ? 'bg-blue-500 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Estoque & Serviços
                </button>
              </>
            )}

            {/* Finance/Owner Only */}
            {!isEmployee && (
              <button
                onClick={() => setActiveTab('finance')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'finance' ? 'bg-blue-500 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                DRE & Caixa
              </button>
            )}

            {/* Owner/Marketing features */}
            {isOwner && (
              <>
                <button
                  onClick={() => setActiveTab('marketing')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-colors ${
                    activeTab === 'marketing' ? 'bg-blue-500 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Campanhas WhatsApp
                </button>

                <button
                  onClick={() => setActiveTab('whitelabel')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-colors ${
                    activeTab === 'whitelabel' ? 'bg-blue-500 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  Branding & Módulos
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-4 text-xs">
          <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5"><Keyboard className="w-3.5 h-3.5" /> Atalhos</span>
            <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded font-sans text-[8px] text-slate-400">Ctrl+K</kbd>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 block animate-pulse" />
              <span className="capitalize">{user.role}</span>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
          
          <button 
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-850 hover:border-red-500/20 hover:bg-red-500/5 text-slate-500 hover:text-red-400 font-semibold text-xs transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main content container */}
      <main className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header toolbar */}
        <div className={`p-4 rounded-3xl border shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-250/60'
        }`}>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Pesquisa Global instantânea (Pressione [S] para focar)..." 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="bg-transparent border-none text-slate-700 placeholder-slate-400 text-xs w-full outline-none"
            />
          </div>

          <div className="flex gap-2">
            {!isFinance && (
              <button 
                onClick={() => setShowAddApptModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/10 hover:opacity-95 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Novo Agendamento [N]
              </button>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB: DASHBOARD                                                 */}
        {/* ============================================================== */}
        {activeTab === 'dashboard' && !isEmployee && !isFinance && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Receita Hoje</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white mt-2 block">R$ {revenueToday.toFixed(2)}</span>
                <span className="text-[9px] text-green-500 font-semibold block mt-4 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +8% em relação a ontem
                </span>
              </div>
              
              <div className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Faturamento Mensal</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white mt-2 block">R$ {totalInflows.toFixed(2)}</span>
                <span className="text-[9px] text-green-500 font-semibold block mt-4 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +12% do mês anterior
                </span>
              </div>

              <div className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Ticket Médio</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white mt-2 block">R$ {ticketMedio.toFixed(2)}</span>
                <span className="text-[9px] text-slate-400 block mt-4">Estável</span>
              </div>

              <div className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Lucro Líquido Real (DRE)</span>
                <span className="text-2xl font-black text-emerald-600 mt-2 block">R$ {netProfit.toFixed(2)}</span>
                <span className="text-[9px] text-slate-400 block mt-4">Fórmula: Entradas - Saídas</span>
              </div>
            </div>

            {/* Busiest Hours, Occupancy Index and Top Services */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Busiest Hours & Occupancy */}
              <div className={`p-6 rounded-3xl border shadow-sm space-y-4 md:col-span-2 ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-850 dark:text-white text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-500" /> Ocupação da Agenda de Estética
                  </h3>
                  <span className="text-xs font-bold text-blue-500">Taxa de Ocupação: {occupancyRate}%</span>
                </div>
                
                <div className="space-y-4 pt-2">
                  {busyHours.map((h, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>{h.label}</span>
                        <span>{h.percentage}% da ocupação</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${h.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Services ranking chart */}
              <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <h3 className="font-extrabold text-slate-850 dark:text-white text-sm flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-blue-500" /> Serviços Mais Lucrativos
                </h3>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>Tosa Tesoura Premium</span>
                      <span>R$ 130.00</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: '85%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>Banho & Tosa Máquina</span>
                      <span>R$ 100.00</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: '65%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: AGENDA CALENDAR                                           */}
        {/* ============================================================== */}
        {activeTab === 'agenda' && !isFinance && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div className="flex gap-1.5 bg-slate-200/60 dark:bg-slate-800 p-1 rounded-xl">
                {(['day', 'week', 'month'] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setCalendarView(view)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      calendarView === view ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    {view === 'day' ? 'Diário' : view === 'week' ? 'Semanal' : 'Mensal'}
                  </button>
                ))}
              </div>
            </div>

            {loadingData ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin" />
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className={`rounded-3xl border p-10 text-center text-slate-400 text-xs ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                Nenhum agendamento localizado para os filtros informados.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredAppointments.map((appt) => {
                  let colorClass = 'border-l-indigo-500 bg-indigo-50/10';
                  if (appt.employeeName?.includes('Ana')) colorClass = 'border-l-purple-500 bg-purple-50/10';
                  else if (appt.employeeName?.includes('Bruno')) colorClass = 'border-l-teal-500 bg-teal-50/10';

                  return (
                    <div 
                      key={appt.id} 
                      className={`p-5 rounded-2xl border-l-4 border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${colorClass} ${
                        darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{appt.petName}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{appt.clientName}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{appt.serviceName} • {appt.employeeName || 'Qualquer Profissional'}</p>
                        <p className="text-[10px] text-blue-500 font-semibold mt-1">⏰ {appt.date} às {appt.time}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          appt.status === 'Finalizado' ? 'bg-green-100 text-green-700' : 
                          appt.status === 'Cancelado' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {appt.status}
                        </span>

                        {appt.status !== 'Finalizado' && appt.status !== 'Cancelado' && (
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleUpdateApptStatus(appt, 'Finalizado')}
                              className="p-1 bg-green-500 text-white rounded hover:opacity-90 text-[10px] px-2 font-bold"
                            >
                              Concluir
                            </button>
                            <button 
                              onClick={() => handleUpdateApptStatus(appt, 'Cancelado')}
                              className="p-1 bg-red-500 text-white rounded hover:opacity-90 text-[10px] px-2 font-bold"
                            >
                              Cancelar
                            </button>
                          </div>
                        )}

                        {/* PDF Recibos */}
                        {appt.status === 'Finalizado' && (
                          <button 
                            onClick={() => handlePrintDocument('recibo', appt)}
                            className="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 flex items-center gap-1 text-[10px] font-semibold"
                          >
                            <Printer className="w-3.5 h-3.5" /> Recibo PDF
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: CLIENTS & PETS CRM                                        */}
        {/* ============================================================== */}
        {activeTab === 'clients' && !isFinance && !isEmployee && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">CRM Clientes & Prontuários</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Exportar CSV
                </button>
                <button 
                  onClick={() => setShowAddClientModal(true)}
                  className="px-4 py-2 rounded-xl bg-blue-500 text-white font-bold text-xs shadow-md"
                >
                  Novo Tutor
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-3xl border shadow-sm md:col-span-2 space-y-4 ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Perfis de Tutores</h3>
                
                <div className="divide-y divide-slate-100">
                  {clients.map((c) => {
                    const clientAppts = appointments.filter(a => a.clientId === c.id);
                    const totalSpent = clientAppts.reduce((sum, a) => sum + a.price, 0);
                    const lastVisit = clientAppts.length > 0 
                      ? clientAppts.map(a => a.date).sort().reverse()[0] 
                      : 'Nunca';

                    return (
                      <div key={c.id} className="py-4 text-xs grid grid-cols-4 items-center gap-3">
                        <div className="col-span-2 flex items-center gap-3">
                          <img 
                            src={c.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
                            alt={c.name} 
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <h4 className="font-bold text-slate-855 dark:text-white text-sm">{c.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">{c.phone} • {c.email}</p>
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">Total Gasto</span>
                          <span className="font-extrabold text-slate-700 dark:text-slate-350 block">R$ {totalSpent.toFixed(2)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-semibold">Última Visita</span>
                          <span className="font-bold text-slate-600 dark:text-slate-350 block">{lastVisit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pets list */}
              <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">Pets Associados</h3>
                  <button 
                    onClick={() => setShowAddPetModal(true)}
                    className="text-xs font-bold text-blue-500 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Pet
                  </button>
                </div>

                <div className="space-y-3">
                  {pets.map((p) => {
                    const owner = clients.find(c => c.id === p.clientId);
                    return (
                      <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200/50 dark:border-slate-800 text-xs flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center font-bold text-xs">
                            {p.photoUrlAfter ? <img src={p.photoUrlAfter} alt={p.name} className="w-full h-full object-cover" /> : '🐾'}
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-800 dark:text-white">{p.name}</h5>
                            <p className="text-[10px] text-slate-400">Tutor: {owner?.name || 'N/A'}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-semibold text-[9px]">{p.breed}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: INVENTORY & CURVA ABC                                     */}
        {/* ============================================================== */}
        {activeTab === 'inventory' && !isFinance && !isEmployee && (
          <div className="space-y-6 animate-fade-in">
            {/* Total Stock Valuation widget */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-3xl border shadow-sm ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Valor Monetário em Estoque</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white mt-2 block">R$ {totalInventoryValuation.toFixed(2)}</span>
                <span className="text-[9px] text-slate-400 block mt-4">Calculado sobre preço de custo</span>
              </div>

              <div className={`p-6 rounded-3xl border shadow-sm md:col-span-2 ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Produtos com Estoque Crítico</span>
                  <button onClick={() => setShowAddProductModal(true)} className="text-xs font-bold text-blue-500">Cadastrar Produto</button>
                </div>
                <div className="flex gap-3 overflow-x-auto pt-4 pb-2">
                  {restockSuggestions.map((item) => (
                    <div key={item.id} className="p-3 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl text-[10px] min-w-[200px] flex-shrink-0">
                      <div className="font-bold text-slate-850 dark:text-white">{item.name}</div>
                      <p className="text-[9px] text-red-500 font-bold mt-1">Estoque: {item.stock} / Mínimo: {item.minStockAlert}</p>
                      <p className="text-[9px] text-blue-600 font-bold mt-1">Sugestão de Reposição: +{item.suggestedQty} un</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ABC Curve Table */}
            <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h3 className="font-extrabold text-slate-850 dark:text-white text-sm">Classificação Curva ABC (Análise de Margem)</h3>
              
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Produto</th>
                    <th className="p-4">Preço Venda</th>
                    <th className="p-4">Preço Custo</th>
                    <th className="p-4">Estoque</th>
                    <th className="p-4">Curva ABC</th>
                    <th className="p-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {productsWithABC.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-855 dark:text-white">{p.name}</td>
                      <td className="p-4">R$ {p.price.toFixed(2)}</td>
                      <td className="p-4">R$ {p.costPrice.toFixed(2)}</td>
                      <td className="p-4 font-bold">{p.stock} un</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          p.abcClass === 'A' ? 'bg-red-50 text-red-600 border border-red-100' :
                          p.abcClass === 'B' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-green-50 text-green-600 border border-green-100'
                        }`}>
                          Classe {p.abcClass}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handlePrintDocument('orcamento', p)}
                          className="px-2 py-1 border border-slate-200 rounded text-[9px] font-bold"
                        >
                          Orçamento PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: FINANCE DRE                                              */}
        {/* ============================================================== */}
        {activeTab === 'finance' && !isEmployee && (
          <div className="space-y-6 animate-fade-in">
            {/* DRE Summary Table */}
            <div className={`p-8 rounded-3xl border shadow-sm space-y-6 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-855 dark:text-white text-sm uppercase tracking-wider">Demonstrativo de Resultado (DRE)</h3>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => alert('Download da Planilha Excel iniciado... (Simulação)')}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 dark:text-slate-300 font-bold text-[10px] flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" /> Planilha Excel
                  </button>
                  <button 
                    onClick={() => alert('Geração do Relatório DRE em PDF iniciada... (Simulação)')}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 dark:text-slate-300 font-bold text-[10px] flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" /> Exportar PDF
                  </button>
                </div>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span>(+) Receitas Operacionais Brutas (Estética + Clínico)</span>
                  <span className="font-extrabold text-slate-800 dark:text-white">R$ {totalInflows.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 text-red-500">
                  <span>(-) Custo dos Produtos Vendidos (CPV / Fornecedores)</span>
                  <span>- R$ {estimatedCPV.toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 text-red-500">
                  <span>(-) Custos Operacionais Fixos (Repasses de Equipe, Salários, Aluguel)</span>
                  <span>- R$ {fixedExpenses.toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-t-2 border-slate-200 dark:border-slate-850 pt-3 text-sm">
                  <span className="font-black text-slate-900 dark:text-white">(=) Lucro Líquido Real</span>
                  <span className={`font-black ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    R$ {netProfit.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: MARKETING lists                                           */}
        {/* ============================================================== */}
        {activeTab === 'marketing' && isOwner && (
          <div className="space-y-6 animate-fade-in">
            {/* WhatsApp template dispatchers */}
            <div className={`p-6 rounded-3xl border shadow-sm space-y-6 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="grid grid-cols-5 gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                {(['dormant30', 'dormant60', 'birthdays', 'vaccines', 'vips'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMktFilter(tab)}
                    className={`py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider border transition-all ${
                      mktFilter === tab 
                        ? 'bg-blue-500 border-blue-500 text-white shadow-md' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {tab === 'dormant30' ? 'Inativos 30 dias' : 
                     tab === 'dormant60' ? 'Inativos 60 dias' :
                     tab === 'birthdays' ? 'Aniversariantes' :
                     tab === 'vaccines' ? 'Vacinas Vencendo' : 'VIP Spenders'}
                  </button>
                ))}
              </div>

              {/* Target results */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-850 dark:text-white text-xs uppercase tracking-widest text-slate-400">Clientes Selecionados ({smartClientsList.length})</h3>
                
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {smartClientsList.map((c) => (
                    <div key={c.id} className="py-3 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-3">
                        <img src={c.avatarUrl} alt={c.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <h4 className="font-bold text-slate-850 dark:text-white">{c.name}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">{c.phone}</p>
                        </div>
                      </div>
                      <a
                        href={`https://wa.me/${c.whatsapp}?text=Ol%C3%A1+${c.name}%21+Tudo+bem%3F+Notamos+que+faz+algum+tempo+desde+o+%C3%BAltimo+banho+do+seu+pet.+Vamos+agendar+um+hor%C3%A1rio+esta+semana%3F`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-[10px] flex items-center gap-1 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" /> Chamar no WhatsApp
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: WHITE LABEL CONFIGS & MODULE TOGGLES                      */}
        {/* ============================================================== */}
        {activeTab === 'whitelabel' && isOwner && (
          <form onSubmit={handleSaveWhiteLabel} className="space-y-6 animate-fade-in">
            {/* Brand Settings */}
            <div className={`p-6 rounded-3xl border shadow-sm space-y-6 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h3 className="font-bold text-slate-700 dark:text-white text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Branding & SEO Geral</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nome do Pet Shop</label>
                  <input 
                    type="text" 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-850 dark:text-white text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Cor Primária</label>
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={customPrimary}
                      onChange={(e) => setCustomPrimary(e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded-xl cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={customPrimary}
                      onChange={(e) => setCustomPrimary(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-slate-850 dark:text-white text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modules Checkboxes */}
            <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h3 className="font-bold text-slate-700 dark:text-white text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Módulos Habilitados da Plataforma</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-350 cursor-pointer">
                  <input type="checkbox" checked={moduleStore} onChange={() => setModuleStore(!moduleStore)} className="w-4 h-4 rounded text-blue-500" />
                  <span>Loja de Produtos / Vitrine</span>
                </label>
                <label className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-350 cursor-pointer">
                  <input type="checkbox" checked={moduleFinance} onChange={() => setModuleFinance(!moduleFinance)} className="w-4 h-4 rounded text-blue-500" />
                  <span>Financeiro e DRE</span>
                </label>
                <label className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-350 cursor-pointer">
                  <input type="checkbox" checked={moduleInventory} onChange={() => setModuleInventory(!moduleInventory)} className="w-4 h-4 rounded text-blue-500" />
                  <span>Estoque & Curva ABC</span>
                </label>
                <label className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-350 cursor-pointer">
                  <input type="checkbox" checked={moduleMarketing} onChange={() => setModuleMarketing(!moduleMarketing)} className="w-4 h-4 rounded text-blue-500" />
                  <span>Central de Marketing WhatsApp</span>
                </label>
              </div>
            </div>

            {/* Backup & Restore database segment */}
            <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h3 className="font-bold text-slate-700 dark:text-white text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Segurança: Backup e Restauração</h3>
              <p className="text-[10px] text-slate-400">Exporte ou restaure todo o estado operacional do pet shop via arquivo JSON.</p>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Download Backup (.JSON)
                </button>

                <label className="px-4 py-2.5 border border-slate-250 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-4 h-4" /> Restaurar Backup
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleRestoreBackup} 
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/10 hover:opacity-95"
            >
              Salvar Alterações
            </button>
          </form>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODALS LAYER                                                   */}
      {/* ============================================================== */}
      {/* Client Modal */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">Adicionar Novo Tutor</h3>
              <button onClick={() => setShowAddClientModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveClient} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nome do cliente"
                  value={formClient.name}
                  onChange={(e) => setFormClient({ ...formClient, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">WhatsApp / Celular</label>
                <input 
                  type="text" 
                  required
                  placeholder="(11) 99999-9999"
                  value={formClient.phone}
                  onChange={(e) => setFormClient({ ...formClient, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs outline-none"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl text-xs hover:opacity-95">
                Salvar Tutor
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pet Modal */}
      {showAddPetModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">Adicionar Pet</h3>
              <button onClick={() => setShowAddPetModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSavePet} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Proprietário (Tutor)</label>
                <select 
                  value={formPet.clientId}
                  required
                  onChange={(e) => setFormPet({ ...formPet, clientId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs outline-none"
                >
                  <option value="">Selecione um cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nome do Pet</label>
                  <input 
                    type="text" 
                    required
                    value={formPet.name}
                    onChange={(e) => setFormPet({ ...formPet, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Raça</label>
                  <input 
                    type="text" 
                    required
                    value={formPet.breed}
                    onChange={(e) => setFormPet({ ...formPet, breed: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs outline-none"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl text-xs hover:opacity-95">
                Salvar Pet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      {showAddApptModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">Adicionar Agendamento</h3>
              <button onClick={() => setShowAddApptModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveAppt} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cliente (Tutor)</label>
                <select 
                  value={formAppt.clientId}
                  required
                  onChange={(e) => setFormAppt({ ...formAppt, clientId: e.target.value, petId: '' })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs outline-none"
                >
                  <option value="">Selecione...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              {formAppt.clientId && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Associar ao Pet</label>
                  <select 
                    value={formAppt.petId}
                    required
                    onChange={(e) => setFormAppt({ ...formAppt, petId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs outline-none"
                  >
                    <option value="">Selecione...</option>
                    {pets.filter(p => p.clientId === formAppt.clientId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Serviço</label>
                  <select 
                    value={formAppt.serviceId}
                    required
                    onChange={(e) => setFormAppt({ ...formAppt, serviceId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs outline-none"
                  >
                    <option value="">Selecione...</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name} (R$ {s.price})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Atendente</label>
                  <select 
                    value={formAppt.employeeId}
                    onChange={(e) => setFormAppt({ ...formAppt, employeeId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs outline-none"
                  >
                    <option value="">Qualquer Profissional</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Data</label>
                  <input 
                    type="date" 
                    required
                    value={formAppt.date}
                    onChange={(e) => setFormAppt({ ...formAppt, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Hora</label>
                  <input 
                    type="time" 
                    required
                    value={formAppt.time}
                    onChange={(e) => setFormAppt({ ...formAppt, time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs outline-none"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl text-xs hover:opacity-95 animate-pulse">
                Agendar Horário
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
