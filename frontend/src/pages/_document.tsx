import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="robots" content="index,follow" />
        <meta name="googlebot" content="index,follow" />
        
        {/* Preconnect to API domain */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} />
        
        {/* PWA meta tags */}
        <meta name="application-name" content="Heinz Boilerplate" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Heinz Boilerplate" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#dc2626" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Heinz Boilerplate" />
        <meta property="og:description" content="Production-ready FastAPI + Next.js boilerplate" />
        <meta property="og:site_name" content="Heinz Boilerplate" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Heinz Boilerplate" />
        <meta name="twitter:description" content="Production-ready FastAPI + Next.js boilerplate" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}