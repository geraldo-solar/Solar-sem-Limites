import React, { useState, useEffect } from 'react';
import JulhoLP from './JulhoLP';
import CheckoutPage from './CheckoutPage';
import CapturaNovembro from './CapturaNovembro';
import VendasNovembro from './VendasNovembro';
import PagamentoConcluido from './PagamentoConcluido';
import { quantidadeDoLinkCheckout } from './testeManualCheckout';

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error: Error | null; }

class ErrorBoundary extends React.Component<Props, State> {
  declare readonly props: Readonly<Props>;
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#ffebee', color: '#c62828', fontFamily: 'monospace' }}>
          <h2>Algo deu errado (React Crash)</h2>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash);
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const isMainSiteCaptureRoute = pathname === '/solarsemlimitescadastro';
  // Página de vendas do Solar Sem Limites 2027. Desde 06/10/2026 o endereço
  // oficial é /solarsemlimites2027; o antigo /solarsemlimites2026 redireciona
  // para ele no site principal e continua aceito aqui por segurança.
  const isSalesRoute = pathname === '/solarsemlimites2027' || pathname === '/solarsemlimites2026';

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // O checkout vem primeiro de propósito: as outras rotas são decididas pelo
  // caminho da URL, e enquanto essa checagem ficava por último o link
  // #/checkout era ignorado dentro de /solarsemlimites2026 — o botão de
  // comprar não levava a lugar nenhum.
  let content = <JulhoLP />;
  if (hash.split('?')[0] === '#/checkout') {
    content = <CheckoutPage quantidadeInicial={quantidadeDoLinkCheckout(hash)} />;
  } else if (hash === '#/obrigado') {
    // Retorno da página de pagamento da Cielo.
    content = <PagamentoConcluido />;
  } else if (hash.startsWith('#/vendas') || isSalesRoute) {
    content = <VendasNovembro />;
  } else if (isMainSiteCaptureRoute || hash.startsWith('#/lista-vip')) {
    content = <CapturaNovembro />;
  }

  return <ErrorBoundary>{content}</ErrorBoundary>;
}
