/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Evita ataques de MIME sniffing
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Previene ataques de Clickjacking (no permite iframes)
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block', // Detiene ataques de Cross-Site Scripting (XSS) detectados por el navegador
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload', // Fuerza conexiones HTTPS (HSTS)
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Controla cuánta información de enrutamiento se envía
          }
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' }, // En producción, es recomendable cambiar '*' por tu dominio oficial
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
