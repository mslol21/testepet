import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { TenantProvider } from '../context/TenantContext';
import { brandConfig } from '../config/brand';

export const metadata: Metadata = {
  title: brandConfig.seo.metaTitle,
  description: brandConfig.seo.metaDescription,
  keywords: brandConfig.seo.keywords,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { googleAnalyticsId, metaPixelId, googleTagManagerId } = brandConfig.marketing;

  return (
    <html
      lang="pt-BR"
      className="h-full antialiased"
    >
      <head>
        <link rel="shortcut icon" href={brandConfig.faviconUrl} type="image/x-icon" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        
        {/* Dynamic Typography Injection */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --font-sans: ${brandConfig.theme.fontFamily || "'Inter', sans-serif"};
          }
        `}} />

        {/* Google Analytics (gtag.js) */}
        {googleAnalyticsId && googleAnalyticsId !== 'G-XXXXXXXXXX' && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}></script>
            <script dangerouslySetInnerHTML={{ __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}');
            `}} />
          </>
        )}

        {/* Google Tag Manager */}
        {googleTagManagerId && googleTagManagerId !== 'GTM-XXXXXXXXXX' && (
          <script dangerouslySetInnerHTML={{ __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${googleTagManagerId}');
          `}} />
        )}

        {/* Meta Pixel */}
        {metaPixelId && metaPixelId !== 'FB-XXXXXXXXXX' && (
          <script dangerouslySetInnerHTML={{ __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}} />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {/* Google Tag Manager (noscript fallback) */}
        {googleTagManagerId && googleTagManagerId !== 'GTM-XXXXXXXXXX' && (
          <noscript>
            <iframe 
              src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`}
              height="0" 
              width="0" 
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        
        <AuthProvider>
          <TenantProvider>
            {children}
          </TenantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
