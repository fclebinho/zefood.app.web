import Link from 'next/link';
import {
  Store,
  Smartphone,
  TrendingUp,
  Clock,
  CreditCard,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Zap,
  Shield,
  Users
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-orange-500 flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ZeFood</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2"
            >
              Entrar
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors"
            >
              Cadastrar Restaurante
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Plataforma completa para seu delivery
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Gerencie seu restaurante e
              <span className="text-orange-500"> aumente suas vendas</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              A plataforma mais completa para restaurantes gerenciarem pedidos,
              cardápio e entregas. Simplifique sua operação e foque no que importa: sua comida.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
              >
                Comece Grátis
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
              >
                Já tenho conta
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              Teste grátis por 14 dias. Sem cartão de crédito.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-400">500+</div>
              <div className="text-gray-400 mt-1">Restaurantes</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-400">50k+</div>
              <div className="text-gray-400 mt-1">Pedidos/mês</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-400">98%</div>
              <div className="text-gray-400 mt-1">Satisfação</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-400">24/7</div>
              <div className="text-gray-400 mt-1">Suporte</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ferramentas poderosas para gerenciar seu restaurante de forma eficiente
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border bg-white hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Gestão de Pedidos
              </h3>
              <p className="text-gray-600">
                Receba e gerencie pedidos em tempo real. Aceite, prepare e acompanhe cada entrega.
              </p>
            </div>

            <div className="p-6 rounded-2xl border bg-white hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <Store className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Cardápio Digital
              </h3>
              <p className="text-gray-600">
                Crie e atualize seu cardápio facilmente. Adicione fotos, preços e categorias.
              </p>
            </div>

            <div className="p-6 rounded-2xl border bg-white hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                App para Clientes
              </h3>
              <p className="text-gray-600">
                Seus clientes fazem pedidos pelo app. Experiência moderna e intuitiva.
              </p>
            </div>

            <div className="p-6 rounded-2xl border bg-white hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Relatórios Completos
              </h3>
              <p className="text-gray-600">
                Acompanhe vendas, produtos mais pedidos e métricas importantes do seu negócio.
              </p>
            </div>

            <div className="p-6 rounded-2xl border bg-white hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Pagamentos Online
              </h3>
              <p className="text-gray-600">
                Receba pagamentos via Pix, cartão de crédito e débito de forma segura.
              </p>
            </div>

            <div className="p-6 rounded-2xl border bg-white hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aumente suas Vendas
              </h3>
              <p className="text-gray-600">
                Promoções, cupons de desconto e fidelização de clientes para crescer seu negócio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Como funciona
            </h2>
            <p className="text-xl text-gray-600">
              Comece a receber pedidos em poucos minutos
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cadastre-se</h3>
              <p className="text-gray-600">
                Crie sua conta em poucos minutos e configure seu restaurante
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Monte seu Cardápio</h3>
              <p className="text-gray-600">
                Adicione seus produtos, fotos, preços e categorias
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fique Online</h3>
              <p className="text-gray-600">
                Ative seu restaurante e comece a aparecer para clientes
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Receba Pedidos</h3>
              <p className="text-gray-600">
                Gerencie pedidos e acompanhe suas vendas crescerem
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Por que escolher o ZeFood?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Sem taxas abusivas</h4>
                    <p className="text-gray-600">Taxas justas e transparentes para seu negócio crescer</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Suporte dedicado</h4>
                    <p className="text-gray-600">Equipe pronta para ajudar 24 horas por dia</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Tecnologia de ponta</h4>
                    <p className="text-gray-600">Plataforma moderna, rápida e sempre atualizada</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Controle total</h4>
                    <p className="text-gray-600">Você decide preços, promoções e horários</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100">
                <Shield className="h-8 w-8 text-orange-500 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">Seguro</h4>
                <p className="text-sm text-gray-600">Dados protegidos</p>
              </div>
              <div className="p-6 rounded-2xl bg-green-50 border border-green-100">
                <Zap className="h-8 w-8 text-green-500 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">Rápido</h4>
                <p className="text-sm text-gray-600">Em tempo real</p>
              </div>
              <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
                <Users className="h-8 w-8 text-blue-500 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">Simples</h4>
                <p className="text-sm text-gray-600">Fácil de usar</p>
              </div>
              <div className="p-6 rounded-2xl bg-purple-50 border border-purple-100">
                <TrendingUp className="h-8 w-8 text-purple-500 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">Crescimento</h4>
                <p className="text-sm text-gray-600">Escale seu negócio</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de restaurantes que já estão crescendo com o ZeFood
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-orange-500 px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
          >
            Cadastrar meu Restaurante
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                <Store className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">ZeFood</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/auth/login" className="hover:text-white transition-colors">
                Entrar
              </Link>
              <Link href="/auth/register" className="hover:text-white transition-colors">
                Cadastrar
              </Link>
            </div>
            <p className="text-sm">
              © 2024 ZeFood. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
