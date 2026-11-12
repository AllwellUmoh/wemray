import '../styles/site.css';
import JsonLd from '../components/seo/JsonLd';
import { buildMetadata, organizationSchema, SITE, websiteSchema } from '../lib/seo';

export const metadata = {
  metadataBase: new URL(SITE.url),
  ...buildMetadata({ path: '/' }),
  applicationName: 'Wemray Technology',
  authors: [{ name: 'Wemray Technology', url: SITE.url }],
  creator: 'Wemray Technology',
  publisher: 'Wemray Technology',
  category: 'technology',
  formatDetection: { telephone: false },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  other: {
    'geo.region': 'NG-RI',
    'geo.placename': 'Port Harcourt, Rivers State, Nigeria',
    'geo.position': '4.8156;7.0498',
    ICBM: '4.8156, 7.0498',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000066',
  colorScheme: 'light',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
      </body>
    </html>
  );
}
