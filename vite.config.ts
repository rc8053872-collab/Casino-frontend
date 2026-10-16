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
    proxy: {
      '/api': {
        target: 'http://casino-baac-env.eba-9kvg9eap.ap-southeast-2.elasticbeanstalk.com',
        changeOrigin: true,
        secure: false,
        timeout: 60000,
        proxyTimeout: 60000,
      },
    },
  },
})