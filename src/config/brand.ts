import { Tenant } from '../types';

/**
 * PetFlow White Label - Premium Single-Tenant Brand Configuration
 * 
 * Adjust the details below to fully customize the deployment for your pet shop client.
 * All settings, visual identities, pixels, and section layouts will load automatically.
 */
export const brandConfig = {
  id: 'calixto',
  slug: 'calixto',
  name: 'Calixto Pet Shop',
  logoUrl: '', // URL path, e.g. "/images/logo.png" (placed in public folder)
  faviconUrl: '/favicon.ico',
  theme: {
    primaryColor: '#3b82f6', // Brand color code (Premium Blue)
    secondaryColor: '#f8fafc',
    accentColor: '#eff6ff',
    fontFamily: "'Inter', sans-serif", // Typography styling
    themeMode: 'light' as const
  },
  contact: {
    phone: '(11) 98888-7777',
    whatsapp: '5511988887777',
    email: 'contato@calixtopet.com.br',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    instagram: 'calixtopetshop',
    facebook: 'calixtopetshop',
    tiktok: 'calixtopetshop'
  },
  seo: {
    metaTitle: 'Calixto Pet Shop | Estética Canina & Saúde Animal',
    metaDescription: 'O melhor tratamento para seu pet com profissionais qualificados. Banho, tosa, táxi dog e consultas na região de São Paulo.',
    keywords: ['pet shop', 'tosa', 'banho', 'veterinário', 'são paulo']
  },
  // Script tags for business marketing analytics
  marketing: {
    googleAnalyticsId: 'G-XXXXXXXXXX',
    metaPixelId: 'FB-XXXXXXXXXX',
    googleTagManagerId: 'GTM-XXXXXXXXXX'
  },
  // Order of section modules to render on the Landing Page storefront
  sectionsOrder: ['hero', 'services', 'products', 'gallery', 'team', 'testimonials', 'faq', 'contact'] as string[],
  
  businessHours: {
    segunda: { open: '08:00', close: '18:00', isOpen: true },
    terca: { open: '08:00', close: '18:00', isOpen: true },
    quarta: { open: '08:00', close: '18:00', isOpen: true },
    quinta: { open: '08:00', close: '18:00', isOpen: true },
    sexta: { open: '08:00', close: '19:00', isOpen: true },
    sabado: { open: '08:00', close: '16:00', isOpen: true },
    domingo: { open: '08:00', close: '12:00', isOpen: false }
  },
  loyaltySettings: {
    pointsPerReal: 1,
    pointsToReward: 200,
    rewardValue: 20,
    hasBathPackage: true,
    bathPackagePrice: 320,
    bathPackageSize: 4
  },
  subscriptionActive: true,
  createdAt: new Date().toISOString()
};

// Always true for this single-client configuration positioning.
export const IS_STATIC_WHITE_LABEL_INSTALLATION = true;
