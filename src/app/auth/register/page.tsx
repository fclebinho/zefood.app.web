'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Store, MapPin, Loader2 } from 'lucide-react';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [step, setStep] = useState(1);

  // User data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Restaurant data
  const [restaurantName, setRestaurantName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  // Address data
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('As senhas não conferem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const fetchAddressFromCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      return;
    }

    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }

      setStreet(data.logradouro || '');
      setNeighborhood(data.bairro || '');
      setCity(data.localidade || '');
      setState(data.uf || '');

      if (data.logradouro) {
        toast.success('Endereço preenchido automaticamente');
      }
    } catch {
      toast.error('Erro ao buscar CEP');
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleCepChange = (value: string) => {
    // Format CEP as user types: 00000-000
    const cleanValue = value.replace(/\D/g, '');
    let formattedValue = cleanValue;

    if (cleanValue.length > 5) {
      formattedValue = `${cleanValue.slice(0, 5)}-${cleanValue.slice(5, 8)}`;
    }

    setZipCode(formattedValue);

    // Auto-fetch when CEP is complete
    if (cleanValue.length === 8) {
      fetchAddressFromCep(cleanValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post('/auth/register/restaurant', {
        name,
        email,
        password,
        phone: phone || undefined,
        restaurantName,
        description: description || undefined,
        category: category || undefined,
        zipCode,
        street,
        number,
        complement: complement || undefined,
        neighborhood,
        city,
        state,
      });
      toast.success('Restaurante cadastrado com sucesso!');
      router.push('/auth/login');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const message = Array.isArray(err.response?.data?.message)
        ? err.response?.data?.message[0]
        : err.response?.data?.message;
      toast.error(message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return 'Preencha seus dados pessoais';
      case 2:
        return 'Informações do restaurante';
      case 3:
        return 'Endereço do restaurante';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            {step === 3 ? (
              <MapPin className="h-6 w-6 text-orange-600" />
            ) : (
              <Store className="h-6 w-6 text-orange-600" />
            )}
          </div>
          <CardTitle className="text-2xl">Cadastrar Restaurante</CardTitle>
          <CardDescription>{getStepDescription()}</CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            <div className={`h-2 w-10 rounded-full ${step >= 1 ? 'bg-orange-500' : 'bg-gray-200'}`} />
            <div className={`h-2 w-10 rounded-full ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
            <div className={`h-2 w-10 rounded-full ${step >= 3 ? 'bg-orange-500' : 'bg-gray-200'}`} />
          </div>
        </CardHeader>

        {step === 1 && (
          <form onSubmit={handleStep1}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
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
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                Continuar
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Já tem uma conta?{' '}
                <Link href="/auth/login" className="text-orange-500 hover:underline">
                  Entre aqui
                </Link>
              </p>
            </CardFooter>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurantName">Nome do Restaurante</Label>
                <Input
                  id="restaurantName"
                  type="text"
                  placeholder="Ex: Pizzaria do João"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Selecione uma categoria (opcional)</option>
                  <option value="pizza">Pizza</option>
                  <option value="lanches">Lanches</option>
                  <option value="japonesa">Japonesa</option>
                  <option value="brasileira">Brasileira</option>
                  <option value="sobremesas">Sobremesas</option>
                  <option value="bebidas">Bebidas</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <textarea
                  id="description"
                  placeholder="Conte um pouco sobre seu restaurante..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="flex gap-2 w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  Continuar
                </Button>
              </div>
            </CardFooter>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP</Label>
                <div className="relative">
                  <Input
                    id="zipCode"
                    type="text"
                    placeholder="00000-000"
                    value={zipCode}
                    onChange={(e) => handleCepChange(e.target.value)}
                    maxLength={9}
                    required
                  />
                  {isLoadingCep && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Digite o CEP para preencher automaticamente
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="street">Rua/Avenida</Label>
                <Input
                  id="street"
                  type="text"
                  placeholder="Nome da rua"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    type="text"
                    placeholder="123"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    type="text"
                    placeholder="Sala 101"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  type="text"
                  placeholder="Nome do bairro"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Nome da cidade"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">UF</Label>
                  <Input
                    id="state"
                    type="text"
                    placeholder="SP"
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    maxLength={2}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="flex gap-2 w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(2)}
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  disabled={isLoading}
                >
                  {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
