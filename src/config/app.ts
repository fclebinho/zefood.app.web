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

export function getAppMode(): AppMode {
  const mode = process.env.NEXT_PUBLIC_APP_MODE as AppMode;
  return mode === 'admin' ? 'admin' : 'restaurant';
}

export function getAppConfig(): AppConfig {
  return configs[getAppMode()];
}

export const appConfig = getAppConfig();
