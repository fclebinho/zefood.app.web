'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Store, Shield } from 'lucide-react';
import { appConfig } from '@/config/app';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isAdmin = appConfig.mode === 'admin';
  const Icon = isAdmin ? Shield : Store;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login(email, password);

      // Verificar se o usuário tem permissão para acessar este modo
      if (!appConfig.allowedRoles.includes(user.role)) {
        toast.error(`Acesso negado. Este portal é exclusivo para ${isAdmin ? 'administradores' : 'restaurantes'}.`);
        return;
      }

      toast.success('Login realizado com sucesso!');
      const redirect = searchParams.get('redirect') || appConfig.loginRedirect;
      router.push(redirect);
    } catch (error) {
      toast.error('Email ou senha inválidos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${isAdmin ? 'bg-blue-100' : 'bg-orange-100'}`}>
          <Icon className={`h-6 w-6 ${isAdmin ? 'text-blue-600' : 'text-orange-600'}`} />
        </div>
        <CardTitle className="text-2xl">{appConfig.title}</CardTitle>
        <CardDescription>
          {isAdmin
            ? 'Entre com suas credenciais de administrador'
            : 'Entre com sua conta para gerenciar seu restaurante'
          }
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className={`w-full ${isAdmin ? 'bg-blue-500 hover:bg-blue-600' : 'bg-orange-500 hover:bg-orange-600'}`}
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
          {!isAdmin && (
            <p className="text-sm text-muted-foreground text-center">
              Ainda não tem seu restaurante cadastrado?{' '}
              <Link href="/auth/register" className="text-orange-500 hover:underline">
                Cadastre-se
              </Link>
            </p>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Entrar</CardTitle>
            <CardDescription>Carregando...</CardDescription>
          </CardHeader>
        </Card>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
