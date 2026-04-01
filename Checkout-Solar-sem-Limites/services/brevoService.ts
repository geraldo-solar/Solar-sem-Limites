/**
 * Serviço de integração com Brevo (Sendinblue)
 * Cadastra contatos e envia e-mails automaticamente via API serverless
 */

interface ContactData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  quantity: number;
  paymentMethod: string;
  installments?: string;
  cardNumber?: string;
  cardName?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cpf?: string;
}

/**
 * Adiciona contato à lista do Brevo e envia e-mail de confirmação
 * Chama a API serverless do Vercel para segurança
 */
export async function addContactAndSendEmail(contactData: ContactData): Promise<boolean> {
  try {
    const response = await fetch('/api/brevo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Contato cadastrado e e-mail enviado com sucesso!', data);
      return true;
    } else {
      const errorData = await response.json();
      console.error('❌ Erro ao integrar com Brevo:', errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro na integração com Brevo:', error);
    return false;
  }
}
