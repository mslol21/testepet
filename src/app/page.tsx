'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../lib/db';
import { Service, Product, Review } from '../types';
import { brandConfig } from '../config/brand';
import { useTenant } from '../context/TenantContext';
import { 
  Phone, Mail, MapPin, Clock, Calendar, ShieldCheck, Check, 
  MessageSquare, Star, ArrowRight, ShoppingBag 
} from 'lucide-react';

export default function StorefrontPage() {
  const { tenant } = useTenant();
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedServices = await api.getServices();
        const fetchedProducts = await api.getProducts();
        const fetchedReviews = await api.getReviews();
        setServices(fetchedServices.filter(s => s.isActive));
        setProducts(fetchedProducts.filter(p => p.isActive));
        setReviews(fetchedReviews.filter(r => r.isApproved));
      } catch (err) {
        console.error('Error loading storefront data:', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const faqs = [
    { q: 'Vocês atendem cães de grande porte?', a: 'Sim! Temos banheiras e sopradores de porte profissional adaptados para cães gigantes, com guias de segurança e equipe treinada para manejo gentil.' },
    { q: 'Preciso levar a carteira de vacinação?', a: 'Para consultas e banhos, é altamente recomendado trazer para mantermos o histórico em dia. Para hospedagem ou creche (se disponível), a vacinação anual contra Raiva, V10/V8 e Gripe é obrigatória.' },
    { q: 'Quanto tempo demora o banho e tosa?', a: 'O tempo estimado médio é de 1 hora para banho simples e de 1h30 a 2 horas para banho e tosa. Cães com subpelo denso ou nós podem demandar tempo adicional.' },
    { q: 'Quais as formas de pagamento aceitas?', a: 'Aceitamos dinheiro, PIX, cartões de débito e crédito (com parcelamento em até 3x para pacotes mensais).' }
  ];

  // SUBCOMPONENTS FOR MODULAR SECTIONS
  const HeroSection = () => (
    <section className="relative bg-gradient-to-b from-blue-50/30 to-white py-20 md:py-28 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12">
        <div className="space-y-6">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
            ✨ Agendamento de Estética e Saúde 100% Online
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            O amor e cuidado que o seu pet merece
          </h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-xl">
            Equipe apaixonada por animais de estimação. Oferecemos banhos relaxantes, tosas artísticas, consultas veterinárias e mimos premium para o seu melhor amigo.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link 
              href="/booking"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm text-center shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Agendar Horário Online
            </Link>
            <a 
              href={`https://wa.me/${brandConfig.contact.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm text-center transition-colors"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
        
        <div className="relative flex justify-center">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-blue-100 blur-3xl -z-10" />
          <div className="w-full max-w-md aspect-square rounded-3xl bg-slate-100 overflow-hidden shadow-2xl relative border-4 border-white">
            <img 
              src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600" 
              alt="Pet Grooming" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );

  const ServicesSection = () => (
    <section id="services" className="bg-slate-50 py-20 px-6 border-y border-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Nossos Serviços Estéticos & Clínicos</h2>
          <p className="text-slate-500 text-sm">Consulte nosso catálogo básico e agende com confirmação imediata.</p>
        </div>

        {loadingData ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">Nenhum serviço disponível no momento.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="p-6">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                    {service.category}
                  </span>
                  <h4 className="font-bold text-slate-800 text-lg mt-3">{service.name}</h4>
                  <p className="text-slate-500 text-xs mt-2 line-clamp-3 leading-relaxed">{service.description}</p>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Valor estimado</span>
                    <span className="font-extrabold text-slate-800 text-base">R$ {service.price.toFixed(2)}</span>
                  </div>
                  <Link 
                    href={`/booking?service=${service.id}`}
                    className="px-3.5 py-2 rounded-xl bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm shadow-blue-500/10 hover:opacity-95"
                  >
                    Agendar <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  const ProductsSection = () => (
    <section id="products" className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-4 flex items-center justify-center gap-2">
          <ShoppingBag className="w-8 h-8 text-blue-500" />
          Produtos Disponíveis na Loja
        </h2>
        <p className="text-slate-500 text-sm">Confira nossos principais produtos de alimentação e higiene. Compre e retire em nossa loja física ou solicite via WhatsApp.</p>
      </div>

      {loadingData ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">Nenhum produto em vitrine no momento.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow p-5">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">{product.category}</span>
                <h4 className="font-bold text-slate-800 text-sm mt-3 leading-snug">{product.name}</h4>
                <p className="text-[10px] text-slate-400 mt-1">Disp. no estoque: {product.stock} un</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 block">Preço</span>
                  <span className="font-extrabold text-slate-800 text-sm">R$ {product.price.toFixed(2)}</span>
                </div>
                <a 
                  href={`https://wa.me/${brandConfig.contact.whatsapp}?text=Ol%C3%A1%2C+tenho+interesse+em+comprar+o+produto+${product.name}.+Ainda+est%C3%A1+dispon%C3%ADvel%3F`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[10px] transition-colors"
                >
                  Tenho Interesse
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  const GallerySection = () => (
    <section id="gallery" className="bg-slate-50 py-20 px-6 border-y border-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Galeria de Transformações</h2>
          <p className="text-slate-500 text-sm">Acompanhe fotos reais de antes e depois dos banhos e tosas executadas por nossa equipe.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden p-4">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/55">
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/60 text-white font-bold text-[9px] uppercase tracking-wider rounded-md backdrop-blur-sm">Antes</span>
                <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=300" alt="Dog Before" className="w-full h-full object-cover" />
              </div>
              <div className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/55">
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-blue-500/80 text-white font-bold text-[9px] uppercase tracking-wider rounded-md backdrop-blur-sm">Depois</span>
                <img src="https://images.unsplash.com/photo-1537151608828-ea2b117b6297?auto=format&fit=crop&q=80&w=300" alt="Dog After" className="w-full h-full object-cover" />
              </div>
            </div>
            <h5 className="font-bold text-slate-800 text-sm text-center">Tosa Tesoura Teddy Bear - Maltês Billy</h5>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden p-4">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/55">
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/60 text-white font-bold text-[9px] uppercase tracking-wider rounded-md backdrop-blur-sm">Antes</span>
                <img src="https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&q=80&w=300" alt="Dog Before" className="w-full h-full object-cover" />
              </div>
              <div className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/55">
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-blue-500/80 text-white font-bold text-[9px] uppercase tracking-wider rounded-md backdrop-blur-sm">Depois</span>
                <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300" alt="Dog After" className="w-full h-full object-cover" />
              </div>
            </div>
            <h5 className="font-bold text-slate-800 text-sm text-center">Banho & Desembolo - Golden Retriever Bruce</h5>
          </div>
        </div>
      </div>
    </section>
  );

  const TeamSection = () => (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Equipe de Cuidadores</h2>
        <p className="text-slate-500 text-sm">Nossos profissionais especializados em fazer o seu pet se sentir em casa.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/60 text-center flex flex-col items-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden mb-4 border-2 border-slate-200">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" alt="Ana Souza" className="w-full h-full object-cover" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Ana Souza</h4>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">Especialista em Tosa</span>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200/60 text-center flex flex-col items-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden mb-4 border-2 border-slate-200">
            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200" alt="Dr. Rodrigo" className="w-full h-full object-cover" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Dr. Rodrigo Medeiros</h4>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">Médico Veterinário</span>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200/60 text-center flex flex-col items-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden mb-4 border-2 border-slate-200">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" alt="Camila Santos" className="w-full h-full object-cover" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Camila Santos</h4>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">Banhista & Recreadora</span>
        </div>
      </div>
    </section>
  );

  const TestimonialsSection = () => (
    <section id="testimonials" className="bg-slate-50 py-20 px-6 border-y border-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Opinião de Quem Confia</h2>
          <p className="text-slate-500 text-sm">Depoimentos que nossos clientes registram após os atendimentos.</p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">Nenhuma avaliação disponível.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-3xl p-6 border border-slate-200/60 flex flex-col justify-between shadow-sm">
                <p className="text-slate-600 italic text-sm leading-relaxed">"{review.comment}"</p>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                  <span className="font-bold text-slate-800 text-xs">{review.clientName}</span>
                  <div className="flex gap-0.5 text-amber-500">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  const FaqSection = () => (
    <section className="py-20 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Perguntas Frequentes</h2>
        <p className="text-slate-500 text-sm">Tire suas principais dúvidas sobre o funcionamento do pet shop.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <button 
              onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
              className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-slate-800 text-sm hover:bg-slate-50 outline-none"
            >
              <span>{faq.q}</span>
              <span className="text-slate-400 text-lg">{faqOpen === idx ? '−' : '+'}</span>
            </button>
            {faqOpen === idx && (
              <div className="px-6 pb-5 pt-1 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );

  const ContactSection = () => (
    <section id="contact" className="bg-slate-50 py-20 px-6 border-t border-slate-100">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-slate-900">Fale Conosco</h2>
          <p className="text-slate-500 text-sm">Estamos prontos para atender você e tirar dúvidas sobre horários ou pacotes.</p>
          
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-blue-500" />
              <span>{brandConfig.contact.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-blue-500" />
              <span>{brandConfig.contact.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>{brandConfig.contact.address}</span>
            </div>
          </div>

          {/* Social links */}
          <div className="flex gap-3 pt-2">
            {brandConfig.contact.instagram && (
              <a href={`https://instagram.com/${brandConfig.contact.instagram}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white hover:text-blue-500 text-slate-500 transition-all shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            )}
            {brandConfig.contact.facebook && (
              <a href={`https://facebook.com/${brandConfig.contact.facebook}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white hover:text-blue-500 text-slate-500 transition-all shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            )}
            {brandConfig.contact.tiktok && (
              <a href={`https://tiktok.com/@${brandConfig.contact.tiktok}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white hover:text-blue-500 text-slate-500 transition-all shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
              </a>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-6 border border-slate-200/60 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-blue-500" />
              <h4 className="font-bold text-slate-800 text-sm">Horário de Atendimento</h4>
            </div>
            <div className="space-y-2.5 text-xs text-slate-600">
              {Object.entries(brandConfig.businessHours).map(([day, hours]) => (
                <div key={day} className="flex justify-between border-b border-slate-100 pb-1.5 capitalize">
                  <span>{day}</span>
                  <span>{hours.isOpen ? `${hours.open} às ${hours.close}` : 'Fechado'}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="h-36 bg-slate-100 rounded-2xl flex items-center justify-center text-[10px] text-slate-400 mt-6 relative overflow-hidden border border-slate-200">
            <span className="z-10 font-medium">📍 Google Maps [{brandConfig.contact.address}]</span>
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
          </div>
        </div>
      </div>
    </section>
  );

  const renderSection = (sec: string) => {
    if (sec === 'products' && tenant && !tenant.features?.includes('store')) return null;

    switch (sec) {
      case 'hero': return <HeroSection key="hero" />;
      case 'services': return <ServicesSection key="services" />;
      case 'products': return <ProductsSection key="products" />;
      case 'gallery': return <GallerySection key="gallery" />;
      case 'team': return <TeamSection key="team" />;
      case 'testimonials': return <TestimonialsSection key="testimonials" />;
      case 'faq': return <FaqSection key="faq" />;
      case 'contact': return <ContactSection key="contact" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
            🐾
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">{brandConfig.name}</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#services" className="hover:text-blue-500 transition-colors">Serviços</a>
          {(!tenant || tenant.features?.includes('store')) && (
            <a href="#products" className="hover:text-blue-500 transition-colors">Produtos</a>
          )}
          <a href="#gallery" className="hover:text-blue-500 transition-colors">Galeria</a>
          <a href="#testimonials" className="hover:text-blue-500 transition-colors">Depoimentos</a>
          <a href="#contact" className="hover:text-blue-500 transition-colors">Contato</a>
        </nav>
        
        <div className="flex items-center gap-3">
          <Link 
            href="/client" 
            className="text-xs font-semibold text-slate-600 hover:text-blue-500 transition-colors px-3 py-2 rounded-xl"
          >
            Área do Cliente
          </Link>
          <Link 
            href="/booking"
            className="px-4 py-2.5 rounded-xl bg-blue-500 text-white font-semibold text-xs transition-all hover:opacity-95 shadow-md shadow-blue-500/10 flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            Agendar Online
          </Link>
        </div>
      </header>

      {/* Render modular sections dynamically in the requested order */}
      <main className="flex-1">
        {brandConfig.sectionsOrder.map((section) => renderSection(section))}
      </main>

      {/* Floating WhatsApp Button */}
      <a 
        href={`https://wa.me/${brandConfig.contact.whatsapp}`}
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl hover:scale-105 transition-transform"
        style={{ boxShadow: '0 8px 30px rgba(34, 197, 94, 0.4)' }}
      >
        💬
      </a>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6 border-t border-slate-800 text-xs mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span>© 2026 {brandConfig.name}. Todos os direitos reservados.</span>
          <span className="text-slate-600 font-semibold">Tecnologia KonnexyPet White Label</span>
        </div>
      </footer>
    </div>
  );
}
