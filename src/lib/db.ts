import { isFirebaseConfigured, db } from './firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, query, where, orderBy 
} from 'firebase/firestore';
import { 
  Tenant, Service, Product, Client, Pet, Appointment, Employee, 
  FinancialTransaction, Supplier, BlogPost, Review, ActivityLog, UserProfile 
} from '../types';
import { brandConfig } from '../config/brand';

// Helper for local storage operation
const getLocal = (key: string, fallback: any) => {
  if (typeof window === 'undefined') return fallback;
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : fallback;
};

const setLocal = (key: string, val: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(val));
};

// INITIAL SEED DATA
const defaultTenant: Tenant = {
  ...brandConfig,
  plan: 'premium',
  subscriptionStatus: 'active',
  trialEndsAt: '',
  subscriptionEndsAt: '',
  maxPets: 99999,
  maxEmployees: 99999,
  features: ['scheduling', 'crm', 'finance', 'online-booking', 'gallery', 'blog', 'reviews', 'custom-domain']
};

export const seedMockData = () => {
  if (typeof window === 'undefined') return;

  // 1. Seed tenant settings
  const cachedSettings = getLocal('petflow_settings', null);
  if (!cachedSettings) {
    setLocal('petflow_settings', defaultTenant);
  }

  // 2. Services
  const servicesKey = 'petflow_services';
  if (!localStorage.getItem(servicesKey)) {
    const services: Service[] = [
      { id: 's1', name: 'Banho Completo', price: 60, duration: 40, description: 'Banho com shampoo neutro, secagem, escovação e perfume pet suave.', category: 'Estética', isActive: true, createdAt: new Date().toISOString() },
      { id: 's2', name: 'Banho & Tosa Máquina', price: 100, duration: 75, description: 'Banho completo mais tosa completa na máquina adequada à pelagem.', category: 'Estética', isActive: true, createdAt: new Date().toISOString() },
      { id: 's3', name: 'Tosa Tesoura Premium', price: 130, duration: 90, description: 'Trabalho artístico feito 100% na tesoura, ideal para spitz e poodle.', category: 'Estética', isActive: true, createdAt: new Date().toISOString() },
      { id: 's4', name: 'Tosa Higiênica', price: 50, duration: 30, description: 'Limpeza de patas, barriga e região íntima para conforto do animal.', category: 'Estética', isActive: true, createdAt: new Date().toISOString() },
      { id: 's5', name: 'Hidratação de Pelos', price: 40, duration: 30, description: 'Máscara hidratante de argan para pelos sedosos e brilhantes.', category: 'Estética', isActive: true, createdAt: new Date().toISOString() },
      { id: 's6', name: 'Consulta Veterinária', price: 150, duration: 45, description: 'Avaliação clínica geral com veterinário credenciado.', category: 'Saúde', isActive: true, createdAt: new Date().toISOString() },
      { id: 's7', name: 'Vacinação Dose Múltipla V10', price: 95, duration: 15, description: 'Aplicação da vacina V10 importada com registro em carteirinha.', category: 'Saúde', isActive: true, createdAt: new Date().toISOString() }
    ];
    setLocal(servicesKey, services);
  }

  // 3. Products
  const productsKey = 'petflow_products';
  if (!localStorage.getItem(productsKey)) {
    const products: Product[] = [
      { id: 'p1', name: 'Ração Premium Cães Adultos 10kg', category: 'Alimentação', price: 189.90, costPrice: 120.00, stock: 15, minStockAlert: 5, barcode: '7891000200034', imageUrls: [], isActive: true, createdAt: new Date().toISOString() },
      { id: 'p2', name: 'Shampoo Neutro Pet 500ml', category: 'Higiene', price: 32.50, costPrice: 15.00, stock: 3, minStockAlert: 6, barcode: '7891234567890', imageUrls: [], isActive: true, createdAt: new Date().toISOString() },
      { id: 'p3', name: 'Brinquedo Mordedor de Borracha', category: 'Brinquedos', price: 24.90, costPrice: 9.90, stock: 22, minStockAlert: 4, barcode: '7895551112223', imageUrls: [], isActive: true, createdAt: new Date().toISOString() },
      { id: 'p4', name: 'Coleira Antipulgas Seresto P', category: 'Saúde', price: 219.00, costPrice: 160.00, stock: 8, minStockAlert: 3, barcode: '4007221037675', imageUrls: [], isActive: true, createdAt: new Date().toISOString() }
    ];
    setLocal(productsKey, products);
  }

  // 4. Employees
  const employeesKey = 'petflow_employees';
  if (!localStorage.getItem(employeesKey)) {
    const employees: Employee[] = [
      { id: 'e1', name: 'Rodrigo Medeiros (Vet)', role: 'admin', email: 'rodrigo@calixtopet.com.br', phone: '(11) 97777-1111', services: ['s6', 's7'], workHours: {}, isActive: true },
      { id: 'e2', name: 'Ana Souza (Tosa)', role: 'employee', email: 'ana@calixtopet.com.br', phone: '(11) 97777-2222', services: ['s1', 's2', 's3', 's4', 's5'], workHours: {}, isActive: true },
      { id: 'e3', name: 'Bruno Lima (Recepção)', role: 'receptionist', email: 'bruno@calixtopet.com.br', phone: '(11) 97777-3333', services: [], workHours: {}, isActive: true }
    ];
    setLocal(employeesKey, employees);
  }

  // 5. Clients
  const clientsKey = 'petflow_clients';
  if (!localStorage.getItem(clientsKey)) {
    const clients: Client[] = [
      {
        id: 'c1', name: 'João Silva', phone: '(11) 99999-1111', whatsapp: '5511999991111', email: 'joao.silva@gmail.com', cpf: '123.456.789-00',
        address: { street: 'Rua das Flores', number: '123', neighborhood: 'Jardins', city: 'São Paulo', state: 'SP', zipCode: '01234-567' },
        notes: 'Gosta de marcar sempre às sextas-feiras.', loyaltyPoints: 60, avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'c2', name: 'Maria Oliveira', phone: '(11) 99999-2222', whatsapp: '5511999992222', email: 'maria.oliveira@outlook.com', cpf: '987.654.321-11',
        address: { street: 'Alameda Santos', number: '1500', neighborhood: 'Cerqueira César', city: 'São Paulo', state: 'SP', zipCode: '01419-002' },
        notes: 'Pede sempre táxi dog. Pet fica muito ansioso.', loyaltyPoints: 120, avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'c3', name: 'Carlos Santos', phone: '(11) 99999-3333', whatsapp: '5511999993333', email: 'carlos.santos@yahoo.com',
        address: { street: 'Av. Brigadeiro', number: '500', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP', zipCode: '01311-000' },
        loyaltyPoints: 0, avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    setLocal(clientsKey, clients);
  }

  // 6. Pets
  const petsKey = 'petflow_pets';
  if (!localStorage.getItem(petsKey)) {
    const pets: Pet[] = [
      {
        id: 'pet1', clientId: 'c1', name: 'Mel', species: 'Cão', breed: 'Golden Retriever', gender: 'Fêmea', weight: 28, size: 'Grande',
        birthDate: '2021-05-10', color: 'Dourado', vaccines: [{ name: 'V10', date: '2026-01-15', nextDose: '2027-01-15' }, { name: 'Raiva', date: '2026-02-10', nextDose: '2027-02-10' }],
        allergies: ['Frango'], medications: [], veterinarianName: 'Dr. Rodrigo', notes: 'Gosta de brincar com bolinhas.', photoUrlBefore: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300', photoUrlAfter: 'https://images.unsplash.com/photo-1537151608828-ea2b117b6297?auto=format&fit=crop&q=80&w=300', createdAt: new Date().toISOString()
      },
      {
        id: 'pet2', clientId: 'c2', name: 'Thor', species: 'Cão', breed: 'Shih Tzu', gender: 'Macho', weight: 6.5, size: 'Pequeno',
        birthDate: '2023-08-20', color: 'Branco e Marrom', vaccines: [{ name: 'V10', date: '2025-11-20', nextDose: '2026-11-20' }],
        allergies: [], medications: ['Colírio diário para olho seco'], notes: 'Cuidado extra com a região dos olhos ao tosar.', photoUrlBefore: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&q=80&w=300', photoUrlAfter: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300', createdAt: new Date().toISOString()
      },
      {
        id: 'pet3', clientId: 'c2', name: 'Pipoca', species: 'Gato', breed: 'Persa', gender: 'Fêmea', weight: 4.2, size: 'Pequeno',
        birthDate: '2022-03-05', color: 'Branco', vaccines: [{ name: 'Quádrupla Felina', date: '2026-03-01', nextDose: '2027-03-01' }],
        allergies: [], medications: [], veterinarianName: 'Dr. Rodrigo', notes: 'Estressada com soprador de ar.', photoUrlBefore: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=300', photoUrlAfter: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=300', createdAt: new Date().toISOString()
      }
    ];
    setLocal(petsKey, pets);
  }

  // 7. Appointments
  const appointmentsKey = 'petflow_appointments';
  if (!localStorage.getItem(appointmentsKey)) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const appointments: Appointment[] = [
      { id: 'ap1', clientId: 'c1', clientName: 'João Silva', clientPhone: '(11) 99999-1111', petId: 'pet1', petName: 'Mel', serviceId: 's1', serviceName: 'Banho Completo', employeeId: 'e2', employeeName: 'Ana Souza (Tosa)', date: yesterday, time: '14:00', status: 'Finalizado', price: 60, usedProducts: ['Shampoo Neutro Pet 500ml', 'Condicionador Brilho Soft'], createdAt: new Date().toISOString() },
      { id: 'ap2', clientId: 'c2', clientName: 'Maria Oliveira', clientPhone: '(11) 99999-2222', petId: 'pet2', petName: 'Thor', serviceId: 's2', serviceName: 'Banho & Tosa Máquina', employeeId: 'e2', employeeName: 'Ana Souza (Tosa)', date: today, time: '09:00', status: 'Finalizado', price: 100, usedProducts: ['Shampoo Neutro Pet 500ml', 'Colônia Talco Baby'], createdAt: new Date().toISOString() },
      { id: 'ap3', clientId: 'c2', clientName: 'Maria Oliveira', clientPhone: '(11) 99999-2222', petId: 'pet3', petName: 'Pipoca', serviceId: 's5', serviceName: 'Hidratação de Pelos', employeeId: 'e2', employeeName: 'Ana Souza (Tosa)', date: today, time: '10:30', status: 'Em atendimento', price: 40, usedProducts: ['Máscara de Hidratação de Coco'], createdAt: new Date().toISOString() },
      { id: 'ap4', clientId: 'c1', clientName: 'João Silva', clientPhone: '(11) 99999-1111', petId: 'pet1', petName: 'Mel', serviceId: 's6', serviceName: 'Consulta Veterinária', employeeId: 'e1', employeeName: 'Rodrigo Medeiros (Vet)', date: today, time: '15:00', status: 'Confirmado', price: 150, createdAt: new Date().toISOString() },
      { id: 'ap5', clientId: 'c3', clientName: 'Carlos Santos', clientPhone: '(11) 99999-3333', petId: 'pet3', petName: 'Pipoca', serviceId: 's1', serviceName: 'Banho Completo', employeeId: 'e2', employeeName: 'Ana Souza (Tosa)', date: tomorrow, time: '11:00', status: 'Agendado', price: 60, createdAt: new Date().toISOString() }
    ];
    setLocal(appointmentsKey, appointments);
  }

  // 8. Financial Transactions
  const financialKey = 'petflow_transactions';
  if (!localStorage.getItem(financialKey)) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const thisMonth = today.slice(0, 7);
    const prevMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0].slice(0, 7);

    const transactions: FinancialTransaction[] = [
      { id: 't1', type: 'Entrada', category: 'Serviços', amount: 60.00, date: yesterday, status: 'Pago', description: 'Banho Mel - João Silva', createdAt: new Date().toISOString() },
      { id: 't2', type: 'Entrada', category: 'Serviços', amount: 100.00, date: today, status: 'Pago', description: 'Banho & Tosa Thor - Maria Oliveira', createdAt: new Date().toISOString() },
      { id: 't3', type: 'Entrada', category: 'Produtos', amount: 189.90, date: yesterday, status: 'Pago', description: 'Venda de Ração Premium 10kg', createdAt: new Date().toISOString() },
      { id: 't4', type: 'Saída', category: 'Aluguel', amount: 1200.00, date: `${thisMonth}-05`, status: 'Pago', description: 'Aluguel da Loja', createdAt: new Date().toISOString() },
      { id: 't5', type: 'Saída', category: 'Fornecedores', amount: 480.00, date: `${thisMonth}-10`, status: 'Pago', description: 'Compra de Estoque (Produtos Higiene)', createdAt: new Date().toISOString() },
      { id: 't6', type: 'Entrada', category: 'Serviços', amount: 3500.00, date: `${prevMonth}-15`, status: 'Pago', description: 'Serviços Acumulados Mês Anterior', createdAt: new Date().toISOString() },
      { id: 't7', type: 'Entrada', category: 'Produtos', amount: 1420.00, date: `${prevMonth}-20`, status: 'Pago', description: 'Vendas Acumuladas Mês Anterior', createdAt: new Date().toISOString() },
      { id: 't8', type: 'Saída', category: 'Salários', amount: 1800.00, date: `${thisMonth}-01`, status: 'Pago', description: 'Repasse Equipe Estética', createdAt: new Date().toISOString() }
    ];
    setLocal(financialKey, transactions);
  }

  // 9. Suppliers
  const suppliersKey = 'petflow_suppliers';
  if (!localStorage.getItem(suppliersKey)) {
    const suppliers: Supplier[] = [
      { id: 'sup1', name: 'Distribuidora PetBrás', phone: '(11) 3333-4444', email: 'vendas@petbras.com.br', cnpj: '12.345.678/0001-99', address: 'Via Dutra, Km 200 - Guarulhos, SP', notes: 'Principal fornecedor de rações.', createdAt: new Date().toISOString() },
      { id: 'sup2', name: 'Indústria Plásticos PetFun', phone: '(11) 4444-5555', email: 'contato@petfun.com.br', notes: 'Gaiolas e brinquedos.', createdAt: new Date().toISOString() }
    ];
    setLocal(suppliersKey, suppliers);
  }

  // 10. Reviews
  const reviewsKey = 'petflow_reviews';
  if (!localStorage.getItem(reviewsKey)) {
    const reviews: Review[] = [
      { id: 'r1', clientName: 'João Silva', rating: 5, comment: 'A Mel voltou linda e super cheirosa! O cuidado da Ana na tosa é visível. Recomendo de olhos fechados!', isApproved: true, createdAt: new Date().toISOString() },
      { id: 'r2', clientName: 'Maria Oliveira', rating: 4, comment: 'Excelente serviço de táxi dog, muito pontual. O Thor adora o espaço.', isApproved: true, createdAt: new Date().toISOString() }
    ];
    setLocal(reviewsKey, reviews);
  }
};

// UNIFIED DB ACCESS API
export const api = {
  // TENANT SETTINGS
  getTenant: async (slug?: string): Promise<Tenant | null> => {
    if (isFirebaseConfigured) {
      const docRef = doc(db, 'settings', 'brand');
      const snap = await getDoc(docRef);
      return snap.exists() ? (snap.data() as Tenant) : defaultTenant;
    } else {
      seedMockData();
      return getLocal('petflow_settings', defaultTenant);
    }
  },
  
  updateTenant: async (slug: string, data: Partial<Tenant>): Promise<void> => {
    if (isFirebaseConfigured) {
      const docRef = doc(db, 'settings', 'brand');
      await updateDoc(docRef, data);
    } else {
      const current = getLocal('petflow_settings', defaultTenant);
      const updated = { ...current, ...data };
      setLocal('petflow_settings', updated);
    }
  },

  // SERVICES
  getServices: async (): Promise<Service[]> => {
    if (isFirebaseConfigured) {
      const ref = collection(db, 'services');
      const snap = await getDocs(ref);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Service);
    } else {
      seedMockData();
      return getLocal('petflow_services', []);
    }
  },

  saveService: async (tenantId: string, item: Service): Promise<void> => {
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'services', item.id), item);
    } else {
      const items = getLocal('petflow_services', []);
      const idx = items.findIndex((i: Service) => i.id === item.id);
      if (idx !== -1) items[idx] = item;
      else items.push(item);
      setLocal('petflow_services', items);
    }
  },

  // PRODUCTS
  getProducts: async (): Promise<Product[]> => {
    if (isFirebaseConfigured) {
      const ref = collection(db, 'products');
      const snap = await getDocs(ref);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Product);
    } else {
      seedMockData();
      return getLocal('petflow_products', []);
    }
  },

  saveProduct: async (tenantId: string, item: Product): Promise<void> => {
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'products', item.id), item);
    } else {
      const items = getLocal('petflow_products', []);
      const idx = items.findIndex((i: Product) => i.id === item.id);
      if (idx !== -1) items[idx] = item;
      else items.push(item);
      setLocal('petflow_products', items);
    }
  },

  // EMPLOYEES
  getEmployees: async (): Promise<Employee[]> => {
    if (isFirebaseConfigured) {
      const ref = collection(db, 'employees');
      const snap = await getDocs(ref);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Employee);
    } else {
      seedMockData();
      return getLocal('petflow_employees', []);
    }
  },

  saveEmployee: async (tenantId: string, item: Employee): Promise<void> => {
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'employees', item.id), item);
    } else {
      const items = getLocal('petflow_employees', []);
      const idx = items.findIndex((i: Employee) => i.id === item.id);
      if (idx !== -1) items[idx] = item;
      else items.push(item);
      setLocal('petflow_employees', items);
    }
  },

  // CLIENTS
  getClients: async (): Promise<Client[]> => {
    if (isFirebaseConfigured) {
      const ref = collection(db, 'clients');
      const snap = await getDocs(ref);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Client);
    } else {
      seedMockData();
      return getLocal('petflow_clients', []);
    }
  },

  saveClient: async (tenantId: string, item: Client): Promise<void> => {
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'clients', item.id), item);
    } else {
      const items = getLocal('petflow_clients', []);
      const idx = items.findIndex((i: Client) => i.id === item.id);
      if (idx !== -1) items[idx] = item;
      else items.push(item);
      setLocal('petflow_clients', items);
    }
  },

  // PETS
  getPets: async (): Promise<Pet[]> => {
    if (isFirebaseConfigured) {
      const ref = collection(db, 'pets');
      const snap = await getDocs(ref);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Pet);
    } else {
      seedMockData();
      return getLocal('petflow_pets', []);
    }
  },

  savePet: async (tenantId: string, item: Pet): Promise<void> => {
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'pets', item.id), item);
    } else {
      const items = getLocal('petflow_pets', []);
      const idx = items.findIndex((i: Pet) => i.id === item.id);
      if (idx !== -1) items[idx] = item;
      else items.push(item);
      setLocal('petflow_pets', items);
    }
  },

  // APPOINTMENTS
  getAppointments: async (): Promise<Appointment[]> => {
    if (isFirebaseConfigured) {
      const ref = collection(db, 'appointments');
      const snap = await getDocs(ref);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Appointment);
    } else {
      seedMockData();
      return getLocal('petflow_appointments', []);
    }
  },

  saveAppointment: async (tenantId: string, item: Appointment): Promise<void> => {
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'appointments', item.id), item);
    } else {
      const items = getLocal('petflow_appointments', []);
      const idx = items.findIndex((i: Appointment) => i.id === item.id);
      if (idx !== -1) items[idx] = item;
      else items.push(item);
      setLocal('petflow_appointments', items);
    }
  },

  deleteAppointment: async (tenantId: string, id: string): Promise<void> => {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(db, 'appointments', id));
    } else {
      const items = getLocal('petflow_appointments', []);
      const filtered = items.filter((i: Appointment) => i.id !== id);
      setLocal('petflow_appointments', filtered);
    }
  },

  // FINANCIAL TRANSACTIONS
  getFinancialTransactions: async (): Promise<FinancialTransaction[]> => {
    if (isFirebaseConfigured) {
      const ref = collection(db, 'financial_transactions');
      const snap = await getDocs(ref);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }) as FinancialTransaction);
    } else {
      seedMockData();
      return getLocal('petflow_transactions', []);
    }
  },

  saveFinancialTransaction: async (tenantId: string, item: FinancialTransaction): Promise<void> => {
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'financial_transactions', item.id), item);
    } else {
      const items = getLocal('petflow_transactions', []);
      const idx = items.findIndex((i: FinancialTransaction) => i.id === item.id);
      if (idx !== -1) items[idx] = item;
      else items.push(item);
      setLocal('petflow_transactions', items);
    }
  },

  // SUPPLIERS
  getSuppliers: async (): Promise<Supplier[]> => {
    if (isFirebaseConfigured) {
      const ref = collection(db, 'suppliers');
      const snap = await getDocs(ref);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Supplier);
    } else {
      seedMockData();
      return getLocal('petflow_suppliers', []);
    }
  },

  saveSupplier: async (tenantId: string, item: Supplier): Promise<void> => {
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'suppliers', item.id), item);
    } else {
      const items = getLocal('petflow_suppliers', []);
      const idx = items.findIndex((i: Supplier) => i.id === item.id);
      if (idx !== -1) items[idx] = item;
      else items.push(item);
      setLocal('petflow_suppliers', items);
    }
  },

  // REVIEWS
  getReviews: async (): Promise<Review[]> => {
    if (isFirebaseConfigured) {
      const ref = collection(db, 'reviews');
      const snap = await getDocs(ref);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Review);
    } else {
      seedMockData();
      return getLocal('petflow_reviews', []);
    }
  },

  saveReview: async (tenantId: string, item: Review): Promise<void> => {
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'reviews', item.id), item);
    } else {
      const items = getLocal('petflow_reviews', []);
      const idx = items.findIndex((i: Review) => i.id === item.id);
      if (idx !== -1) items[idx] = item;
      else items.push(item);
      setLocal('petflow_reviews', items);
    }
  },

  // ACTIVITY LOGS
  getActivityLogs: async (): Promise<ActivityLog[]> => {
    if (isFirebaseConfigured) {
      const ref = collection(db, 'activity_logs');
      const snap = await getDocs(ref);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }) as ActivityLog);
    } else {
      seedMockData();
      return getLocal('petflow_logs', []);
    }
  },

  saveActivityLog: async (tenantId: string, item: ActivityLog): Promise<void> => {
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'activity_logs', item.id), item);
    } else {
      const items = getLocal('petflow_logs', []);
      items.push(item);
      setLocal('petflow_logs', items.slice(-50)); // Keep only latest 50
    }
  }
};
