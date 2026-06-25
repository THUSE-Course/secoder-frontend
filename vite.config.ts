import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const devApiProxyTarget = env.VITE_DEV_API_PROXY_TARGET;

  return {
    plugins: [react()],
    server: devApiProxyTarget
      ? {
          proxy: {
            '/api': {
              target: devApiProxyTarget,
              changeOrigin: true,
              secure: true,
            },
          },
        }
      : undefined,
  };
});
