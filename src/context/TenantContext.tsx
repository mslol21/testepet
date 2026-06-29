'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { Tenant } from '../types';
import { api } from '../lib/db';
import { IS_STATIC_WHITE_LABEL_INSTALLATION, brandConfig } from '../config/brand';

interface TenantContextProps {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  reloadTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextProps | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode; fallbackSlug?: string }> = ({ 
  children,
  fallbackSlug 
}) => {
  const params = useParams();
  const pathname = usePathname();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine the slug
  let slug = (params?.slug as string) || fallbackSlug;

  // Fallback check: if we are on root landing page and no slug is resolved
  // but if the URL has subdomain, we could resolve it.
  // In our setup, params.slug is the standard for both subdomain rewrites and path fallback.
  if (!slug && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Check if it's a subdomain (e.g., "calixto.localhost" or "calixto.petflow.com")
    const parts = hostname.split('.');
    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'localhost') {
      slug = parts[0];
    }
  }

  const loadTenant = async () => {
    if (IS_STATIC_WHITE_LABEL_INSTALLATION) {
      setTenant(brandConfig);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (!slug) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await api.getTenant(slug);
      if (data) {
        setTenant(data);
        setError(null);
      } else {
        setError('Tenant not found');
      }
    } catch (err: any) {
      console.error('Error loading tenant context:', err);
      setError(err?.message || 'Failed to load tenant configurations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenant();
  }, [slug]);

  // Inject CSS Variables for the dynamic White Label theme
  useEffect(() => {
    if (tenant && typeof window !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--primary', tenant.theme.primaryColor);
      root.style.setProperty('--primary-foreground', '#ffffff');
      root.style.setProperty('--secondary', tenant.theme.secondaryColor);
      root.style.setProperty('--accent', tenant.theme.accentColor);
      
      // Compute helper shades if needed
      root.style.setProperty('--ring', tenant.theme.primaryColor);
    }
  }, [tenant]);

  return (
    <TenantContext.Provider value={{ tenant, isLoading, error, reloadTenant: loadTenant }}>
      {/* Inject Style Tag to avoid flashes of unstyled colors during SSR */}
      {tenant && (
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary: ${tenant.theme.primaryColor};
            --primary-foreground: #ffffff;
            --secondary: ${tenant.theme.secondaryColor};
            --accent: ${tenant.theme.accentColor};
            --ring: ${tenant.theme.primaryColor};
          }
        `}} />
      )}
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
export { TenantContext };
