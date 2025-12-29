import { appConfig } from '@/config/app';
import { redirect } from 'next/navigation';
import RestaurantLandingPage from '@/components/landing/restaurant-landing';

export default function HomePage() {
  // Se for modo admin, redireciona diretamente para login
  if (appConfig.mode === 'admin') {
    redirect('/auth/login');
  }

  // Modo restaurant: mostra landing page
  return <RestaurantLandingPage />;
}
