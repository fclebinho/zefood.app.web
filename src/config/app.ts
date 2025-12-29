export type AppMode = 'restaurant' | 'admin';

export interface AppConfig {
  mode: AppMode;
  title: string;
  description: string;
  loginRedirect: string;
  dashboardPath: string;
  allowedRoles: string[];
}

const configs: Record<AppMode, AppConfig> = {
  restaurant: {
    mode: 'restaurant',
    title: 'Portal do Restaurante',
    description: 'Gerencie seu restaurante',
    loginRedirect: '/restaurant',
    dashboardPath: '/restaurant',
    allowedRoles: ['RESTAURANT'],
  },
  admin: {
    mode: 'admin',
    title: 'Painel Administrativo',
    description: 'Administração da plataforma ZeFood',
    loginRedirect: '/admin',
    dashboardPath: '/admin',
    allowedRoles: ['ADMIN'],
  },
};

// Detect app mode dynamically based on hostname
// This allows the same build to work on different hosts
export function getAppMode(): AppMode {
  if (typeof window !== 'undefined') {
    // Client-side: detect from hostname
    const hostname = window.location.hostname;
    if (hostname.startsWith('admin.') || hostname.includes('admin')) {
      return 'admin';
    }
    return 'restaurant';
  }
  // Server-side: use env variable as fallback
  const mode = process.env.NEXT_PUBLIC_APP_MODE as AppMode;
  return mode === 'admin' ? 'admin' : 'restaurant';
}

export function getAppConfig(): AppConfig {
  return configs[getAppMode()];
}

// Note: appConfig is evaluated at module load time
// For dynamic mode detection, use getAppConfig() directly in components
export const appConfig = getAppConfig();
