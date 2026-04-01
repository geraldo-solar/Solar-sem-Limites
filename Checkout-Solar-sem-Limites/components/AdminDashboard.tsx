import React, { useEffect, useState } from 'react';
import { CustomerData } from '../types';
import { getOrders, updateOrderStatus } from '../services/orderService';
import { sendOrderToGoogleSheets } from '../services/googleSheetsService';
import { notifyPaymentStatus } from '../services/notifyStatusService';
import { Icons, formatCurrency, UNIT_PRICE, CREDIT_CARD_SURCHARGE } from '../constants';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [orders, setOrders] = useState<CustomerData[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('📥 Buscando pedidos do Google Sheets...');
      
      // Fetch directly from Google Sheets API
      const SPREADSHEET_ID = '1gadR_c-fLhfbDpgZB9abcFA0e7F9febcHIB4_p5Rk60';
      const SHEET_NAME = 'Página 1';
      const API_KEY = 'AIzaSyBqKZlwWXjhGqZq1_-3VpJQqmqKEfDqKPMmZ5Hs6Zt-F0xAd';
      const range = `${SHEET_NAME}!A2:N1000`;
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        const rows = data.values || [];
        
        console.log(`✅ ${rows.length} pedidos encontrados`);
        
        // Transform rows into order objects
        const orders = rows.map((row: string[]) => {
          const [date, id, name, email, phone, cpf, quantity, total, paymentMethod, status, paymentDetails] = row;
          
          const nameParts = (name || '').split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          const qty = parseInt(quantity) || 1;
          
          let installments = 1;
          if (paymentMethod === 'Cartão' && paymentDetails) {
            const match = paymentDetails.match(/(\d+)x/);
            if (match) installments = parseInt(match[1]);
          }
          
          return {
            id: id || `order-${Date.now()}`,
            firstName,
            lastName,
            email: email || '',
            phone: phone || '',
            cpf: cpf || '',
            quantity: qty,
            paymentMethod: paymentMethod === 'Cartão' ? 'credit_card' : 'pix',
            installments,
            paymentStatus: status || 'pending',
            createdAt: date || new Date().toISOString(),
            cardNumber: paymentDetails?.includes('Final:') ? paymentDetails.split('Final:')[1]?.trim() : undefined
          };
        });
        
        // Sort by newest first
        orders.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        
        setOrders(orders);
      } else {
        console.warn('⚠️ Erro ao buscar do Google Sheets, usando localStorage');
        const localOrders = getOrders();
        setOrders(localOrders);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar pedidos:', error);
      // Fallback to localStorage
      const localOrders = getOrders();
      setOrders(localOrders);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    const updatedOrder = updateOrderStatus(id, status);
    if (updatedOrder) {
        // Send the updated status to Google Sheets
        // This will append a new row with the updated status, creating a history log
        sendOrderToGoogleSheets(updatedOrder).catch(err => console.error("Error updating sheet:", err));
        
        // Send email notification to customer
        try {
            await notifyPaymentStatus({
                orderId: id,
                status,
                customerData: updatedOrder
            });
            alert(`E-mail de ${status === 'approved' ? 'aprovação' : 'recusa'} enviado para ${updatedOrder.email}`);
        } catch (error) {
            console.error('Erro ao enviar e-mail:', error);
            alert('Status atualizado, mas houve erro ao enviar e-mail. Verifique o console.');
        }
        
        loadOrders(); // Refresh table
        
        // If modal is open, update local state too so it reflects immediately
        if (selectedOrder && selectedOrder.id === id) {
            setSelectedOrder({...selectedOrder, paymentStatus: status});
        }
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('pt-BR');
  };

  const calculateTotal = (order: CustomerData) => {
    const base = order.quantity * UNIT_PRICE;
    if (order.paymentMethod === 'credit_card') {
      return base * (1 + CREDIT_CARD_SURCHARGE);
    }
    return base;
  };

  const renderStatusBadge = (status?: string) => {
      switch(status) {
          case 'approved':
              return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200 uppercase">Aprovado</span>;
          case 'rejected':
              return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 uppercase">Recusado</span>;
          default:
              return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200 uppercase">Pendente</span>;
      }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header */}
      <header className="bg-brand-dark text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="text-gold-500"><Icons.Sun className="w-8 h-8"/></div>
             <div>
               <h1 className="text-xl font-serif font-bold text-gold-500">Solar Admin</h1>
               <p className="text-xs text-gray-400 tracking-widest uppercase">Gestão de Vendas</p>
             </div>
          </div>
          <button 
            onClick={onLogout}
            className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded transition-colors text-white"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-end">
           <h2 className="text-2xl font-bold text-gray-800">
             Pedidos Realizados ({orders.length})
             {loading && <span className="ml-2 text-sm text-gray-500">Carregando...</span>}
           </h2>
           <button 
             onClick={() => {
                if(confirm('Tem certeza? Isso apagará todos os pedidos deste navegador.')) {
                    localStorage.removeItem('solar_orders_db');
                    setOrders([]);
                }
             }}
             className="text-xs text-red-500 underline hover:text-red-700"
           >
             Limpar Dados
           </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <p className="text-lg">Nenhum pedido encontrado.</p>
            <p className="text-sm">Realize uma compra no formulário para testar.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                    <th className="p-4">Data</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Pagamento</th>
                    <th className="p-4">Total</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {orders.map((order, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 whitespace-nowrap text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="p-4 font-bold text-brand-dark">
                      {order.firstName} {order.lastName}
                      <div className="text-xs font-normal text-gray-400">{order.cpf}</div>
                    </td>
                    <td className="p-4">
                        {renderStatusBadge(order.paymentStatus)}
                    </td>
                    <td className="p-4">
                      <span className={`
                        inline-block px-2 py-1 rounded text-xs font-bold uppercase
                        ${order.paymentMethod === 'pix' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                      `}>
                        {order.paymentMethod === 'credit_card' ? 'Cartão' : 'Pix'}
                      </span>
                      {order.paymentMethod === 'credit_card' && (
                        <div className="text-xs text-gray-500 mt-1">{order.installments}x</div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-moss-800">
                      {formatCurrency(calculateTotal(order))}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="text-gray-500 hover:text-brand-dark px-2 py-1 text-xs underline"
                            title="Ver Detalhes"
                          >
                            Detalhes
                          </button>
                          
                          {/* Action Buttons */}
                          <button 
                             onClick={() => order.id && handleStatusUpdate(order.id, 'approved')}
                             className="w-8 h-8 rounded-full bg-green-50 text-green-600 hover:bg-green-500 hover:text-white flex items-center justify-center transition-all shadow-sm border border-green-200"
                             title="Aprovar Pagamento"
                          >
                             <Icons.Check className="w-4 h-4" />
                          </button>
                          <button 
                             onClick={() => order.id && handleStatusUpdate(order.id, 'rejected')}
                             className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm border border-red-200"
                             title="Recusar Pagamento"
                          >
                             <Icons.X className="w-4 h-4" />
                          </button>
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {orders.map((order, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-brand-dark text-base">
                        {order.firstName} {order.lastName}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{order.cpf}</div>
                      <div className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)}</div>
                    </div>
                    <div>
                      {renderStatusBadge(order.paymentStatus)}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`
                        inline-block px-2 py-1 rounded text-xs font-bold uppercase
                        ${order.paymentMethod === 'pix' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                      `}>
                        {order.paymentMethod === 'credit_card' ? 'Cartão' : 'Pix'}
                      </span>
                      {order.paymentMethod === 'credit_card' && (
                        <span className="text-xs text-gray-500">{order.installments}x</span>
                      )}
                    </div>
                    <div className="font-bold text-moss-800 text-lg">
                      {formatCurrency(calculateTotal(order))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="flex-1 text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 text-sm rounded transition-colors"
                    >
                      Ver Detalhes
                    </button>
                    <button 
                      onClick={() => order.id && handleStatusUpdate(order.id, 'approved')}
                      className="w-10 h-10 rounded-full bg-green-50 text-green-600 hover:bg-green-500 hover:text-white flex items-center justify-center transition-all shadow-sm border border-green-200"
                      title="Aprovar Pagamento"
                    >
                      <Icons.Check className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => order.id && handleStatusUpdate(order.id, 'rejected')}
                      className="w-10 h-10 rounded-full bg-red-50 text-red-600 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm border border-red-200"
                      title="Recusar Pagamento"
                    >
                      <Icons.X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-brand-dark text-white p-4 flex justify-between items-center sticky top-0">
              <h3 className="font-serif font-bold text-lg">Detalhes do Pedido</h3>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-white/70 hover:text-white text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              
              {/* Order Info */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                   <p className="text-sm text-gray-500 uppercase">ID do Pedido</p>
                   <p className="font-mono text-xs">{selectedOrder.id || 'N/A'}</p>
                   <p className="text-sm text-gray-500 uppercase mt-2">Data</p>
                   <p className="font-bold">{formatDate(selectedOrder.createdAt)}</p>
                   <div className="mt-2">{renderStatusBadge(selectedOrder.paymentStatus)}</div>
                </div>
                <div className="text-right">
                   <p className="text-sm text-gray-500 uppercase">Valor Total</p>
                   <p className="text-2xl font-serif font-bold text-moss-800">
                     {formatCurrency(calculateTotal(selectedOrder))}
                   </p>
                   <p className="text-xs text-gray-500">{selectedOrder.quantity} pacotes ({selectedOrder.quantity * 6} diárias)</p>
                </div>
              </div>

              {/* Personal Data */}
              <div>
                <h4 className="font-bold text-brand-dark border-b border-gray-100 pb-2 mb-3">Dados Pessoais</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-gray-500 text-xs">Nome Completo</span>
                    <span className="font-medium">{selectedOrder.firstName} {selectedOrder.lastName}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs">CPF</span>
                    <span className="font-medium">{selectedOrder.cpf}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs">Email</span>
                    <span className="font-medium">{selectedOrder.email}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs">Telefone</span>
                    <span className="font-medium">{selectedOrder.phone}</span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="font-bold text-brand-dark border-b border-gray-100 pb-2 mb-3">Endereço</h4>
                <p className="text-sm text-gray-700">
                  {selectedOrder.address}<br/>
                  {selectedOrder.city} - {selectedOrder.state}<br/>
                  CEP: {selectedOrder.zipCode}<br/>
                  {selectedOrder.country}
                </p>
              </div>

              {/* Payment Data - Sensitive */}
              <div className="bg-red-50 border border-red-100 rounded p-4">
                 <h4 className="font-bold text-red-800 border-b border-red-200 pb-2 mb-3 flex items-center gap-2">
                   <Icons.Lock className="w-4 h-4"/> Dados de Pagamento
                 </h4>
                 
                 {selectedOrder.paymentMethod === 'pix' ? (
                   <div className="flex items-center gap-2 text-green-700 font-bold">
                     <Icons.Pix /> Pagamento via PIX
                   </div>
                 ) : (
                   <div className="space-y-3">
                      <div className="flex items-center gap-2 text-blue-800 font-bold mb-2">
                        <Icons.CreditCard /> Cartão de Crédito
                        <span className="text-xs font-normal text-gray-600 bg-white px-2 py-0.5 rounded border">
                          {selectedOrder.installments}x de {formatCurrency(calculateTotal(selectedOrder) / Number(selectedOrder.installments || 1))}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm bg-white p-3 rounded border border-gray-200">
                         <div>
                            <span className="block text-xs text-gray-500">Número do Cartão</span>
                            <span className="font-mono font-bold text-gray-800 text-lg">{selectedOrder.cardNumber}</span>
                         </div>
                         <div>
                            <span className="block text-xs text-gray-500">Titular</span>
                            <span className="font-bold text-gray-800 uppercase">{selectedOrder.cardHolder}</span>
                         </div>
                         <div>
                            <span className="block text-xs text-gray-500">Validade</span>
                            <span className="font-bold text-gray-800">{selectedOrder.cardExpiryMonth}/{selectedOrder.cardExpiryYear}</span>
                         </div>
                         <div>
                            <span className="block text-xs text-gray-500">CVV</span>
                            <span className="font-bold text-red-600">{selectedOrder.cardCvv}</span>
                         </div>
                      </div>
                   </div>
                 )}
              </div>

              {selectedOrder.comments && (
                <div>
                   <h4 className="font-bold text-brand-dark border-b border-gray-100 pb-2 mb-3">Comentários</h4>
                   <p className="text-sm text-gray-600 italic">"{selectedOrder.comments}"</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 flex justify-between">
               {/* Quick Actions in Modal too */}
               <div className="flex gap-2">
                  <button 
                     onClick={() => handleStatusUpdate(selectedOrder.id || '', 'approved')}
                     className="px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 text-sm"
                  >
                     Aprovar
                  </button>
                  <button 
                     onClick={() => handleStatusUpdate(selectedOrder.id || '', 'rejected')}
                     className="px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700 text-sm"
                  >
                     Recusar
                  </button>
               </div>

              <button 
                onClick={() => setSelectedOrder(null)}
                className="bg-brand-dark text-white font-bold py-2 px-6 rounded hover:bg-gray-800 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};