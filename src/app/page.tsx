import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import RestaurantLandingPage from '@/components/landing/restaurant-landing';

export default async function HomePage() {
  // Detect mode from host header (works on server-side)
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const isAdmin = host.startsWith('admin.') || host.includes('admin');

  // Se for modo admin, redireciona diretamente para login
  if (isAdmin) {
    redirect('/auth/login');
  }

  // Modo restaurant: mostra landing page
  return <RestaurantLandingPage />;
}
