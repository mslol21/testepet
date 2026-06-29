export interface Tenant {
  id: string; // matches slug
  slug: string; // e.g. "calixto"
  name: string;
  logoUrl?: string;
  theme: {
    primaryColor: string; // HEX e.g., "#10b981"
    secondaryColor: string; // HEX e.g., "#f1f5f9"
    accentColor: string; // HEX e.g., "#f8fafc"
    themeMode: 'light' | 'dark';
  };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    instagram?: string;
    facebook?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  businessHours: {
    [dayOfWeek: string]: { open: string; close: string; isOpen: boolean };
  };
  loyaltySettings: {
    pointsPerReal: number;
    pointsToReward: number;
    rewardValue: number;
    hasBathPackage: boolean;
    bathPackagePrice: number;
    bathPackageSize: number;
  };
  subscriptionActive: boolean;
  plan?: 'basico' | 'profissional' | 'premium';
  subscriptionStatus?: 'trial' | 'active' | 'past_due' | 'canceled';
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  maxPets?: number;
  maxEmployees?: number;
  features?: string[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'employee' | 'receptionist' | 'client' | 'finance';
  tenantId: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // minutes
  description: string;
  imageUrl?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minStockAlert: number;
  barcode?: string;
  imageUrls: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  cpf?: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
  loyaltyPoints: number;
  avatarUrl?: string;
  createdAt: string;
}

export interface Pet {
  id: string;
  clientId: string;
  name: string;
  species: string; // "Cão" | "Gato" | "Outros"
  breed: string;
  gender: 'Macho' | 'Fêmea';
  weight: number;
  size: 'Pequeno' | 'Médio' | 'Grande' | 'Gigante';
  birthDate?: string;
  color?: string;
  photoUrl?: string;
  vaccines: Array<{ name: string; date: string; nextDose?: string }>;
  allergies: string[];
  medications: string[];
  veterinarianName?: string;
  notes?: string;
  photoUrlBefore?: string;
  photoUrlAfter?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  petId: string;
  petName: string;
  serviceId: string;
  serviceName: string;
  employeeId?: string;
  employeeName?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'Agendado' | 'Confirmado' | 'Em atendimento' | 'Finalizado' | 'Cancelado' | 'Não compareceu';
  price: number;
  notes?: string;
  usedProducts?: string[];
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  role: 'admin' | 'employee' | 'receptionist' | 'finance';
  email: string;
  phone: string;
  services: string[];
  workHours: {
    [dayOfWeek: string]: { start: string; end: string; isWorking: boolean };
  };
  isActive: boolean;
}

export interface FinancialTransaction {
  id: string;
  type: 'Entrada' | 'Saída';
  category: string;
  amount: number;
  date: string; // YYYY-MM-DD
  status: 'Pago' | 'Pendente';
  description: string;
  relatedId?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  cnpj?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  category: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  status: 'Rascunho' | 'Publicado';
  publishedAt?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  clientName: string;
  rating: number; // 1-5
  comment: string;
  appointmentId?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}
