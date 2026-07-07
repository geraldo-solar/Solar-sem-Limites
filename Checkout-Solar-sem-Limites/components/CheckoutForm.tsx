import React, { useState, useMemo, useRef } from 'react';
import { Icons, UNIT_PRICE, CREDIT_CARD_SURCHARGE, formatCurrency } from '../constants';
import { CustomerData } from '../types';

interface CheckoutFormProps {
  onSubmit: (data: CustomerData) => Promise<void>;
  isLoading: boolean;
}

// Updated Policy Text
const POLICY_TEXT = `
POLÍTICA DE CANCELAMENTO E CONDIÇÕES GERAIS - HOTEL SOLAR

1. COMPOSIÇÃO DO PACOTE

1.1. Diárias
O pacote é composto por:
• 5 diárias para uso em qualquer data, exceto no período do Réveillon;
• + 1 diária bônus.

Vigência para utilização:
• 1 ano corrido a partir da compra;
• 2 anos corridos a partir da compra para quem adquirir a partir de 2 pacotes.

1.2. Ocupação
Permitida hospedagem de até 4 pessoas em apartamento tipo Quádruplo.

2. DIÁRIA BÔNUS
As diárias bônus são cortesia, válidas exclusivamente para períodos de baixa temporada (fora de férias e feriados).

3. VALOR E PAGAMENTO
O pacote custa R$ 3.100,00, podendo ser parcelado em até 6x no cartão de crédito, acrescido das taxas da operadora.

4. CANCELAMENTO DE RESERVA
• Cancelamentos podem ser feitos até 7 dias antes do check-in.
• Cancelamentos com menos de 7 dias implicam desconto de 1 diária do pacote.

5. TRANSFERÊNCIA DO PACOTE
O titular pode transferir o pacote para terceiros mediante aviso prévio no ato da reserva, via e-mail.

6. GARANTIAS E CRÉDITOS

6.1. Após o término da vigência do pacote, o valor das diárias não utilizadas ficam como crédito por mais 360 dias para futuras reservas.
6.2. Em caso de arrependimento imediatamente após o primeiro check-in, o Hotel Solar efetuará o cancelamento da compra e fará o reembolso do valor restante proporcionalmente.
6.3. Se cancelar dentro de 30 dias após a compra, devolvemos 100% do seu valor sem perguntas e sem burocracia.

7. DISPONIBILIDADE
A reserva será garantida mediante disponibilidade para a data solicitada.
Solicitações podem ser feitas pelo WhatsApp (91 98100-0800) ou e-mail (reserva@hotelsolar.tur.br).

8. OBRIGAÇÕES DO HOTEL SOLAR

8.1. Fornecer acomodações conforme especificado no pacote e neste regulamento.
8.2. Garantir a qualidade dos serviços e das instalações.

9. OBSERVAÇÕES GERAIS
• A utilização das diárias está sujeita às condições gerais de hospedagem do Hotel Solar.
• As diárias incluem café da manhã, passeio de barco e bikes à disposição dos hóspedes.
• Recomenda-se que o comprador contrate seguro viagem para eventuais imprevistos.
• Endereço: Av. Atlântica, 634–672, Salinópolis – PA, 68721-000
• Contatos: reserva@hotelsolar.tur.br | 91 98100-0800
`.trim();

// CPF Validation Algorithm
const isValidCPF = (cpf: string) => {
  if (typeof cpf !== "string") return false;

  // Remove non-digits
  cpf = cpf.replace(/[^\d]+/g, '');

  // Check if length is 11 or if all digits are equal
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;

  // Validate 1st digit
  let sum = 0;
  let remainder;
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;

  // Validate 2nd digit
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;

  return true;
};

// Luhn Algorithm for Credit Card Validation
const isValidCreditCard = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');
  // Standard cards are between 13 and 19 digits. Most are 16.
  if (cleanValue.length < 13 || cleanValue.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = cleanValue.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanValue.charAt(i));

    if (shouldDouble) {
      if ((digit *= 2) > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return (sum % 10) === 0;
};

// Helper to detect card brand based on BIN (First few digits)
const detectCardBrand = (number: string): 'visa' | 'mastercard' | 'amex' | 'elo' | 'unknown' => {
  const clean = number.replace(/\D/g, '');

  // Elo checks (Common BINs for Brazil)
  if (/^4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550/.test(clean)) {
    return 'elo';
  }

  if (/^4/.test(clean)) return 'visa';
  if (/^5[1-5]|^2[2-7]/.test(clean)) return 'mastercard';
  if (/^3[47]/.test(clean)) return 'amex';

  return 'unknown';
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<CustomerData>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'Brasil',
    state: '',
    email: '',
    phone: '',
    cpf: '',
    comments: '',
    quantity: 1, // Default quantity
    paymentMethod: 'pix', // Defaulted to Pix based on layout changes
    installments: '1',
    cardNumber: '',
    cardHolder: '',
    cardExpiryMonth: '',
    cardExpiryYear: '',
    cardCvv: ''
  });

  const [cardBrand, setCardBrand] = useState<'visa' | 'mastercard' | 'amex' | 'elo' | 'unknown'>('unknown');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerData | 'terms', string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CustomerData, boolean>>>({});
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [fullNameText, setFullNameText] = useState('');

  // Calculations
  const baseTotal = formData.quantity * UNIT_PRICE;
  const creditCardTotal = baseTotal * (1 + CREDIT_CARD_SURCHARGE);
  const totalDailyStays = formData.quantity * 6;

  // Validation Logic
  const validateField = (field: keyof CustomerData, value: any): string => {
    switch (field) {
      case 'firstName': return !value.trim() ? "Primeiro nome é obrigatório" : "";
      case 'lastName': return !value.trim() ? "Sobrenome é obrigatório" : "";
      case 'email': return !String(value).match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) ? "Email inválido" : "";
      case 'phone': return String(value).replace(/\D/g, '').length < 10 ? "Telefone inválido" : "";
      case 'cpf':
        if (!value.trim()) return "CPF é obrigatório";
        if (!isValidCPF(value)) return "CPF inválido";
        return "";
      case 'address': return !value.trim() ? "Endereço é obrigatório" : "";
      case 'city': return !value.trim() ? "Cidade é obrigatória" : "";
      case 'zipCode': return !value.trim() ? "CEP é obrigatório" : "";
      case 'state': return !value.trim() ? "UF é obrigatória" : "";
      case 'quantity': return Number(value) < 1 ? "Quantidade mínima é 1" : "";
      case 'cardNumber':
        if (formData.paymentMethod === 'credit_card') {
          if (!value) return "Número do cartão é obrigatório";
          if (!isValidCreditCard(value)) return "Número de cartão inválido";
        }
        return "";
      case 'cardHolder': return formData.paymentMethod === 'credit_card' && !value ? "Titular do cartão é obrigatório" : "";
      case 'cardCvv': return formData.paymentMethod === 'credit_card' && !value ? "CVV é obrigatório" : "";
      case 'cardExpiryMonth': return formData.paymentMethod === 'credit_card' && (!value || value === 'mês') ? "Mês é obrigatório" : "";
      case 'cardExpiryYear': return formData.paymentMethod === 'credit_card' && (!value || value === 'ano') ? "Ano é obrigatório" : "";
      default: return "";
    }
  };

  const isFormValid = useMemo(() => {
    // Check personal data
    if (!formData.firstName.trim()) return false;
    if (!formData.lastName.trim()) return false;
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return false;
    if (formData.phone.replace(/\D/g, '').length < 10) return false;
    if (!isValidCPF(formData.cpf)) return false;
    if (!formData.address.trim()) return false;
    if (!formData.city.trim()) return false;
    if (!formData.zipCode.trim()) return false;
    if (!formData.state.trim()) return false;
    if (formData.quantity < 1) return false;

    // Check payment data (credit_card now requires no card fields — payment is done in person)

    // Check terms
    if (!acceptedTerms) return false;

    return true;
  }, [formData, acceptedTerms]);

  const handleBlur = (field: keyof CustomerData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit(formData);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 2) value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    if (value.length > 9) value = `${value.substring(0, 10)}-${value.substring(10)}`;
    setFormData(prev => ({ ...prev, phone: value }));

    if (touched.phone) {
      setErrors(prev => ({ ...prev, phone: value.replace(/\D/g, '').length < 10 ? "Telefone inválido" : "" }));
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    // Mask: 000.000.000-00
    if (value.length > 9) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
    } else if (value.length > 6) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
    } else if (value.length > 3) {
      value = `${value.slice(0, 3)}.${value.slice(3)}`;
    }

    setFormData(prev => ({ ...prev, cpf: value }));

    if (touched.cpf) {
      setErrors(prev => ({ ...prev, cpf: !isValidCPF(value) ? "CPF inválido" : "" }));
    }
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);

    // Mask: 00000-000
    let formattedValue = value;
    if (value.length > 5) {
      formattedValue = `${value.slice(0, 5)}-${value.slice(5)}`;
    }

    setFormData(prev => ({ ...prev, zipCode: formattedValue }));

    // Fetch Address if complete
    if (value.length === 8) {
      setIsCepLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            zipCode: formattedValue,
            address: data.logradouro || prev.address,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));

          // Clear errors for fields we just filled
          setErrors(prev => ({
            ...prev,
            zipCode: "",
            address: "",
            city: "",
            state: ""
          }));
        } else {
          setErrors(prev => ({ ...prev, zipCode: "CEP não encontrado" }));
        }
      } catch (error) {
        console.error("Error fetching CEP", error);
        // Silent fail or optional user notification
      } finally {
        setIsCepLoading(false);
      }
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 19) value = value.slice(0, 19);

    setCardBrand(detectCardBrand(value));

    // Format: 0000 0000 0000 0000
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');

    setFormData(prev => ({ ...prev, cardNumber: formatted }));

    if (touched.cardNumber) {
      setErrors(prev => ({
        ...prev,
        cardNumber: !isValidCreditCard(value) ? "Número de cartão inválido" : ""
      }));
    }
  };

  const handlePrintPolicy = () => {
    // Create a new window for printing the policy
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Política de Cancelamento - Hotel Solar</title>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; color: #333; }
              h1 { text-align: center; color: #2A3C24; font-size: 24px; margin-bottom: 30px; }
              p, li { font-size: 14px; margin-bottom: 10px; }
              .logo { text-align: center; margin-bottom: 20px; font-weight: bold; color: #D4AF37; }
            </style>
          </head>
          <body>
            <div class="logo">HOTEL SOLAR</div>
            <pre style="white-space: pre-wrap; font-family: inherit;">${POLICY_TEXT}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const inputClass = (error?: string) => `
    w-full p-3 bg-white border ${error ? 'border-red-400' : 'border-gray-300'} 
    rounded-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 
    transition-all text-gray-700 text-sm placeholder-gray-400
  `;

  const labelClass = "block text-sm font-bold text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Urgency Banner */}
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center gap-4 shadow-sm animate-pulse-slow">
        <span className="text-2xl" role="img" aria-label="Atenção">⚠️</span>
        <div>
          <p className="text-red-800 font-bold text-sm md:text-base uppercase tracking-wide mb-1">Finalize seu pagamento imediatamente</p>
          <p className="text-red-700 text-xs md:text-sm">Seu convite para o Grupo Seleto VIP está pré-reservado. Complete os dados abaixo (Pix, Transferência ou Cartão de Crédito) para garantir uma das últimas vagas remanescentes.</p>
        </div>
      </div>
      {/* Personal Data Section */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-sand-100 p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Preencha com os seus dados</h2>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div>
            <label className={labelClass}>Nome completo *</label>
            <input
              type="text"
              className={inputClass(errors.firstName || errors.lastName)}
              value={fullNameText}
              onChange={e => {
                setFullNameText(e.target.value);
                const parts = e.target.value.trimStart().split(' ');
                setFormData({
                  ...formData,
                  firstName: parts[0] || '',
                  lastName: parts.slice(1).join(' ') || ''
                });
              }}
              onBlur={() => {
                handleBlur('firstName');
                handleBlur('lastName');
              }}
              placeholder="Ex: João da Silva"
            />
            {(errors.firstName || errors.lastName) && (
              <p className="text-red-500 text-xs mt-1">Por favor, informe seu nome e sobrenome.</p>
            )}
          </div>

          <div>
            <label className={labelClass}>CPF *</label>
            <input
              type="text"
              className={inputClass(errors.cpf)}
              value={formData.cpf}
              onChange={handleCpfChange}
              onBlur={() => handleBlur('cpf')}
              placeholder="000.000.000-00"
              maxLength={14}
            />
            {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <label className={labelClass}>
                CEP * {isCepLoading && <span className="animate-pulse text-gold-500 text-xs ml-1">...</span>}
              </label>
              <input
                type="text"
                className={inputClass(errors.zipCode)}
                value={formData.zipCode}
                onChange={handleCepChange}
                onBlur={() => handleBlur('zipCode')}
                placeholder="00000-000"
                maxLength={9}
              />
              {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Endereço *</label>
              <input
                type="text"
                className={inputClass(errors.address)}
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                onBlur={() => handleBlur('address')}
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Cidade *</label>
              <input
                type="text"
                className={inputClass(errors.city)}
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                onBlur={() => handleBlur('city')}
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
            <div className="md:col-span-1">
              <label className={labelClass}>UF *</label>
              <select
                className={inputClass(errors.state)}
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
                onBlur={() => handleBlur('state')}
              >
                <option value="">Selecione</option>
                <option value="AC">AC</option>
                <option value="AL">AL</option>
                <option value="AP">AP</option>
                <option value="AM">AM</option>
                <option value="BA">BA</option>
                <option value="CE">CE</option>
                <option value="DF">DF</option>
                <option value="ES">ES</option>
                <option value="GO">GO</option>
                <option value="MA">MA</option>
                <option value="MT">MT</option>
                <option value="MS">MS</option>
                <option value="MG">MG</option>
                <option value="PA">PA</option>
                <option value="PB">PB</option>
                <option value="PR">PR</option>
                <option value="PE">PE</option>
                <option value="PI">PI</option>
                <option value="RJ">RJ</option>
                <option value="RN">RN</option>
                <option value="RS">RS</option>
                <option value="RO">RO</option>
                <option value="RR">RR</option>
                <option value="SC">SC</option>
                <option value="SP">SP</option>
                <option value="SE">SE</option>
                <option value="TO">TO</option>
              </select>
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
            </div>
            <div className="md:col-span-1">
              <label className={labelClass}>País *</label>
              <select
                className={inputClass()}
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
              >
                <option value="Brasil">Brasil</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Email *</label>
            <input
              type="email"
              className={inputClass(errors.email)}
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              onBlur={() => handleBlur('email')}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            <p className="text-xs text-gray-500 mt-1">Para esse email será enviada a confirmação da reserva</p>
          </div>

          <div>
            <label className={labelClass}>Tel *</label>
            <input
              type="tel"
              className={inputClass(errors.phone)}
              value={formData.phone}
              onChange={handlePhoneChange}
              onBlur={() => handleBlur('phone')}
              placeholder="(00) 00000-0000"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            <p className="text-xs text-gray-500 mt-1">Necessário para contato sobre assuntos relativos à reserva. Informe também o DDD</p>
          </div>

          <div>
            <label className={labelClass}>Comentários</label>
            <textarea
              className={inputClass()}
              rows={4}
              value={formData.comments}
              onChange={e => setFormData({ ...formData, comments: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Payment Method Section */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-sand-100 p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Metodo de pagamento</h2>
        </div>

        {/* Quantity Selection Section */}
        <div className="p-6 md:p-8 border-b border-gray-100 bg-white/50">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex-1 w-full md:w-auto">
              <label className={`${labelClass} mb-1 text-base font-serif text-moss-900`}>
                Quantos pacotes deseja adquirir?
              </label>
              <p className="text-xs text-gray-500 mb-4 italic">
                Limitado a 2 pacotes por pessoa para que mais pessoas possam aproveitar esta oportunidade.
              </p>
              <div className="flex items-center gap-3">
                {[1, 2].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, quantity: num }))}
                    className={`
                              w-12 h-12 rounded-full flex items-center justify-center text-lg font-serif transition-all duration-300
                              ${formData.quantity === num
                        ? 'bg-gold-500 text-white shadow-lg ring-4 ring-gold-100 scale-110 font-bold'
                        : 'bg-white border border-gray-200 text-gray-400 hover:border-gold-400 hover:text-gold-600'
                      }
                            `}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400 font-medium ml-1">
                Valor Unitário: {formatCurrency(UNIT_PRICE)}
              </p>
            </div>

            {/* Total & Benefits Display */}
            <div className="w-full md:w-auto flex flex-col md:flex-row items-center md:items-end justify-end gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Total (Pix)</p>
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-sm text-gray-400 font-light">R$</span>
                  <span className="text-4xl font-serif font-bold text-moss-800 tracking-tight">
                    {formatCurrency(baseTotal).replace('R$', '').trim()}
                  </span>
                </div>
              </div>

              {/* Highlighted Benefit Badge - Side by Side on Desktop */}
              <div className="
                        bg-gradient-to-r from-gold-400 to-gold-500 
                        text-white px-5 py-3 rounded-lg shadow-md shadow-gold-200
                        flex items-center gap-3 transform transition-transform hover:scale-105 cursor-default
                        min-w-[180px] justify-center
                    ">
                <Icons.Sun className="w-6 h-6 text-white/90" />
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] uppercase tracking-wider opacity-90 font-bold mb-0.5">Convite Especial VIP</span>
                  <span className="text-xl font-bold font-serif whitespace-nowrap">{totalDailyStays} Diárias</span>
                  <span className="text-[10px] font-medium opacity-90 mt-1 bg-white/20 px-1 py-0.5 rounded text-center">
                    {formData.quantity * 5} Pagas + {formData.quantity} Bônus
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          {/* Pix Header/Selection (First Position) */}
          <div
            className={`p-4 flex items-center gap-3 cursor-pointer border-b transition-colors duration-200 ${formData.paymentMethod === 'pix' ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}`}
            onClick={() => setFormData({ ...formData, paymentMethod: 'pix' })}
          >
            <div className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'pix' ? 'border-moss-800 bg-moss-50' : 'border-gray-300 bg-white'}`}>
              {formData.paymentMethod === 'pix' && <div className="w-3 h-3 rounded-full bg-moss-800 shadow-sm"></div>}
            </div>
            <span className={`font-bold ${formData.paymentMethod === 'pix' ? 'text-moss-800' : 'text-gray-600'}`}>Pix, transferência ou depósito bancário</span>
          </div>

          {formData.paymentMethod === 'pix' && (
            <div className="p-6 md:p-8 space-y-6 animate-in slide-in-from-top-2">
              <div className="bg-success-100 border border-success-500/20 p-4 rounded text-moss-900 text-sm font-medium flex items-start gap-3">
                <Icons.CheckCircle />
                <span>É previsto o pagamento do valor total de <strong>{formatCurrency(baseTotal)}</strong> no ato da confirmação da reserva.</span>
              </div>
              <p className="text-sm text-gray-600">
                Não conseguiu usar tudo no prazo de validade? O valor das diárias vira crédito integral para abater em viagens futuras.
              </p>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 text-sm text-gray-700 space-y-1 font-mono">
                <p className="font-bold mb-2 text-moss-800">Coordenadas bancárias:</p>
                <p>Pix</p>
                <p>Chave: <span className="font-bold">91981000800</span> (Celular)</p>
                <div className="h-px bg-gray-200 my-2"></div>
                <p>Caixa Econômica Federal</p>
                <p>Agência: 3632</p>
                <p>Conta Corrente: 386-6</p>
                <p>Op: 003</p>
                <p>Favorecido: J Ramos Barros Hotelaria e Eventos Me</p>
                <p>CNPJ: 97.519.659/0001-90</p>
              </div>
            </div>
          )}

          {/* Credit Card Header/Selection (Second Position) */}
          <div
            className={`p-4 flex items-center gap-3 cursor-pointer border-b border-t transition-colors duration-200 ${formData.paymentMethod === 'credit_card' ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}`}
            onClick={() => setFormData({ ...formData, paymentMethod: 'credit_card' })}
          >
            <div className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'credit_card' ? 'border-moss-800 bg-moss-50' : 'border-gray-300 bg-white'}`}>
              {formData.paymentMethod === 'credit_card' && <div className="w-3 h-3 rounded-full bg-moss-800 shadow-sm"></div>}
            </div>
            <span className={`font-bold ${formData.paymentMethod === 'credit_card' ? 'text-moss-800' : 'text-gray-600'}`}>Cartão de crédito</span>
          </div>

          {formData.paymentMethod === 'credit_card' && (
            <div className="p-6 md:p-8 space-y-6 animate-in slide-in-from-top-2">
              <div className="bg-sand-100 border border-gold-500/30 p-4 rounded text-moss-900 text-sm font-medium flex items-start gap-3">
                <Icons.CheckCircle className="text-gold-600 w-5 h-5 flex-shrink-0" />
                <span><strong>Pagamento Presencial na Recepção:</strong> O pagamento no cartão de crédito é realizado diretamente na nossa recepção. Você apenas garante a sua vaga agora preenchendo os dados pessoais acima, e efetua o pagamento presencialmente. <strong>Atenção:</strong> é acrescido 10% referente às taxas administrativas da operadora do cartão.</span>
              </div>
            </div>
          )}

          {/* Multi-Payment Header/Selection (Third Position) */}
          <div
            className={`p-4 flex items-center gap-3 cursor-pointer border-t transition-colors duration-200 ${formData.paymentMethod === 'pix_credit_card' ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}`}
            onClick={() => setFormData({ ...formData, paymentMethod: 'pix_credit_card' })}
          >
            <div className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'pix_credit_card' ? 'border-moss-800 bg-moss-50' : 'border-gray-300 bg-white'}`}>
              {formData.paymentMethod === 'pix_credit_card' && <div className="w-3 h-3 rounded-full bg-moss-800 shadow-sm"></div>}
            </div>
            <span className={`font-bold ${formData.paymentMethod === 'pix_credit_card' ? 'text-moss-800' : 'text-gray-600'}`}>Dividir Pagamento (Entrada no Pix + Restante no Cartão)</span>
          </div>

          {formData.paymentMethod === 'pix_credit_card' && (
            <div className="p-6 md:p-8 space-y-6 animate-in slide-in-from-top-2">
               <div className="bg-sand-100 border border-gold-500/30 p-4 rounded text-moss-900 text-sm font-medium flex items-start gap-3">
                <Icons.CheckCircle className="text-gold-600 w-5 h-5 flex-shrink-0" />
                <span><strong>Pagamento Presencial Exclusivo:</strong> Como sabemos que o limite do cartão pode ficar restrito no fim da viagem, nossa equipe da recepção finalizará o seu pagamento pessoalmente dividindo em 2 meios diferentes. Você apenas resguarda a sua vaga promocional agora, e realiza o pagamento misto na hora do seu check-out.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Terms */}
      <div className="space-y-6 pt-4">

        {/* Terms Container - White Box */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
                className="appearance-none w-5 h-5 bg-white border border-gray-300 rounded cursor-pointer checked:bg-moss-800 checked:border-moss-800 transition-colors focus:ring-2 focus:ring-moss-800/20 outline-none"
              />
              <div className={`pointer-events-none absolute text-white transition-opacity duration-200 ${acceptedTerms ? 'opacity-100' : 'opacity-0'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="terms" className={`text-sm font-bold cursor-pointer select-none ${errors.terms ? 'text-red-600' : 'text-gray-700'}`}>
                Concordo com a política de cancelamento e as condições de pagamento *
              </label>

              {/* Expand/Collapse Button - Styled as a small white box */}
              <button
                type="button"
                onClick={() => setShowPolicy(!showPolicy)}
                className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded hover:border-gold-500 transition-colors text-moss-800 shadow-sm flex-shrink-0"
                title={showPolicy ? "Ocultar política" : "Ler política completa"}
              >
                <div className={`transition-transform duration-300 ${showPolicy ? 'rotate-180' : ''}`}>
                  <Icons.ChevronDown className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>

          {/* Expandable Policy Section */}
          <div
            className={`
                    transition-all duration-500 ease-in-out overflow-hidden 
                    ${showPolicy ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'}
                `}
          >
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-inner">
              <div className="prose prose-sm max-w-none text-gray-600 mb-6 font-serif max-h-96 overflow-y-auto pr-2 custom-scrollbar whitespace-pre-line">
                {POLICY_TEXT}
              </div>

              <div className="flex justify-end border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={handlePrintPolicy}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-moss-800 border border-moss-800 rounded hover:bg-moss-50 transition-colors"
                >
                  <Icons.Download />
                  Salvar em PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-moss-900 font-bold mb-1">A sua privacidade está garantida</h3>
          <p className="text-sm text-gray-500">Todos os dados informados não serão utilizados para outras finalidades/reservas que não se trata da solicitação acima.</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-full flex justify-end">
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`
                    font-bold py-4 px-10 rounded shadow-sm uppercase tracking-wide transition-all
                    ${!isFormValid || isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-success-500 hover:bg-success-600 text-white hover:shadow-md'
                }
                `}
            >
              {isLoading ? "Processando..." : "CONCLUIR COMPRA"}
            </button>
          </div>

          {/* Trust Seal / Security Badge */}
          <div className="w-full mt-8 flex flex-col items-center gap-5 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-center gap-2 text-moss-800/80 bg-sand-50 py-2 px-5 rounded-full border border-sand-200">
              <Icons.Lock className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Ambiente 100% Seguro</span>
            </div>

            <div className="flex flex-wrap justify-center gap-8 opacity-75 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Data Protection */}
              <div className="flex items-center gap-2 group cursor-default">
                <Icons.Shield className="w-6 h-6 text-moss-800 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold leading-none text-gray-500">DADOS</span>
                  <span className="text-[10px] font-bold leading-none text-moss-800">PROTEGIDOS</span>
                </div>
              </div>

              {/* Encrypted Payment */}
              <div className="flex items-center gap-2 group cursor-default">
                <Icons.SafetyBadge className="w-6 h-6 text-gold-500 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold leading-none text-gray-500">PAGAMENTO</span>
                  <span className="text-[10px] font-bold leading-none text-gold-600">SEGURO</span>
                </div>
              </div>

              {/* Verified */}
              <div className="flex items-center gap-2 group cursor-default">
                <Icons.CheckCircle className="w-6 h-6 text-success-600 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold leading-none text-gray-500">COMPRA</span>
                  <span className="text-[10px] font-bold leading-none text-success-600">VERIFICADA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </form>
  );
};
