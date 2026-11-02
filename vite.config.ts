import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'apk-mime-type',
      configureServer(server) {
        server.middlewares.use((req: any, res: any, next: any) => {
          if (req.url && /\.apk(\?.*)?$/i.test(req.url)) {
            res.setHeader('Content-Type', 'application/vnd.android.package-archive');
            res.setHeader('Content-Disposition', 'attachment; filename="Maltiplayx.apk"');
          }
          next();
        });
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://casino-baac-env.eba-9kvg9eap.ap-southeast-2.elasticbeanstalk.com',
        changeOrigin: true,
        secure: false,
        timeout: 60000,
        proxyTimeout: 60000,
        configure: (proxy: any) => {
          proxy.on('error', (_err: any, _req: any, res: any) => {
            if (typeof (globalThis as any).console !== 'undefined') {
              (globalThis as any).console.warn('[Vite Proxy] Backend not responding on http://casino-baac-env.eba-9kvg9eap.ap-southeast-2.elasticbeanstalk.com.');
            }
            if (res && !res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'BACKEND_OFFLINE', message: 'Backend server is not responding.' }));
            }
          });
        },
      },
    },
  },
})
