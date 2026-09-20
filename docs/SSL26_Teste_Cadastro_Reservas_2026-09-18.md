# SSL26 — teste real de cadastro e boa-vinda

18/09/2026. Autorização explícita de Geraldo para cadastro real, novo e-mail do formulário, uma boa-vinda WhatsApp e retirada do contato de teste da lista comercial. Campanha, anúncios e processadores globais permanecem desligados.

## Resultado atual

- Fluxo `SSL26_02_WA_BOAS_VINDAS` (`content20260918144151_090401`) convertido para o modelo aprovado `ssl26_guia_boas_vindas_v1`. As três conexões foram refeitas e reabertas para conferir os destinos. Publicado e relido; **sem gatilho público**, painel `STOPPED`/`Salvo`.
- Entrada e respostas de guia/canal mantêm as oito condições de consentimento, cadastro, canal e bloqueios. Saída mantém tag/data/origem e callback autenticado; a credencial não foi copiada ou alterada.
- Carteira tinha saldo suficiente; não houve recarga, alteração de plano ou de cobrança.
- Migração `202609181830_ssl26_welcome_dispatch.sql` aplicada em consulta nova, preservando a consulta anterior. Supabase confirmou sucesso; colunas novas relidas pela API. Sem agendamento ou disparo causado pela migração.
- Cadastro real realizado pela página pública, com origem `qa_interno`, campanha `ssl26_teste_autorizado` e conteúdo `reservas_vinculado_20260918`. Tela de sucesso, guia e canal novo conferidos. Lead e consentimento versionado persistidos no ERP; duas listas anteriores do Brevo preservadas. Perfil opcional não foi inventado.
- Sincronização controlada de **um contato existente**, seguida de uma boa-vinda: ManyChat retornou `accepted`, exatamente **um POST de envio**. Repetição do despachante foi barrada no registro durável, antes de chamar o provedor.
- **Aceite concluído:** Geraldo respondeu “Chegou e os três botões funcionaram” para Baixar guia → Canal VIP → Parar avisos. Recebimento e links confirmados pelo destinatário, não inferidos do `accepted` da API.
- **Saída completa do QA confirmada:** campo de origem identifica o botão real do fluxo principal; registro de saída no ERP antecede a limpeza controlada, comprovando recebimento do callback real. ManyChat com tag de saída; Brevo com `SSL26_OPT_OUT=true`, fora da lista 24. Dois trabalhos de supressão concluídos, uma tentativa por provedor. Duas listas anteriores, tags não SSL26 e permissões globais preservadas. Nenhuma mensagem adicional na limpeza.
- Preparação geral reavaliada em **74%**: +1 integração (14/15) pelo envio/fluxo/saída reais validados; +1 mensuração (3/5) pela prova integrada e de não repetição. Não equivale à ativação ou homologação do processamento automático. Meta de 80% ainda não atingida.

## Conflito de identidade resolvido sem mesclar contatos

O primeiro formulário usou e-mail de reservas com o WhatsApp final 0800. A API Brevo recusou a gravação de `/contacts` com HTTP 400; a página retornou 502 em 961 ms. Consulta posterior confirmou atributos/listas originais intactos e ausência de lead no ERP. Pela ordem do código publicado, a falha ocorreu antes de e-mail/webhook. Nenhum WhatsApp foi tentado nessa primeira identidade.

A consulta pelo telefone encontrou outro contato Brevo, com e-mail diferente. Não houve mesclagem, exclusão, troca de telefone ou alteração do contato de reservas. Geraldo escolheu explicitamente **usar o e-mail já associado ao final 0800**. Esse par foi novamente conferido, estava sem saída/bloqueio e fora da lista SSL26. Dados e recibos completos ficam somente em arquivos `.local` ignorados pelo Git, com permissão 600.

O erro genérico apresentado pela página para conflitos de identidade é uma melhoria pendente: tratar de forma clara e privada, sem revelar o e-mail de terceiros nem mesclar registros automaticamente. Não foi publicada correção do formulário nesta rodada.

## Correção identificada na integração

A primeira sincronização ficou `unknown`, sem envio: releituras do contato mostraram ausência de todos os campos/tags SSL26. O consentimento do ERP continha milissegundos, enquanto o contrato da API de assinantes ManyChat especifica `YYYY-MM-DDTHH:MM:SSP`.

Implementado `manychatDateTime.ts`: transmite segundos inteiros e fuso; **preserva a precisão original no ERP**. O despachante compara a representação exata suportada pelo provedor, sem tolerância ampla de horário.

Após conciliação explícita do estado remoto, somente o evento QA foi liberado por atualização condicional (`unknown`, motivo esperado, uma tentativa, sem claim). O retrato anterior foi preservado no recibo privado; contador e marcador da primeira tentativa permaneceram. Não foi instalado retry automático. A sincronização seguinte retornou `synced` e a releitura confirmou os valores.

119 testes aprovados, nenhum ignorado; TypeScript completo e `git diff --check` aprovados. O primeiro teste PostgreSQL após a mudança detectou fixture que simulava precisão inexistente no provedor; fixture corrigida para segundos inteiros e suíte integral repetida com sucesso.

Fonte técnica: [contrato oficial ManyChat, métodos setCustomField/setCustomFields](https://api.manychat.com/swagger).

## Limites e próxima etapa

- O teste usa os núcleos do ERP localmente, com serviços e registro de banco reais, adaptadores limitados ao contato/fluxo/evento autorizados. **Não comprova processamento automático em produção.**
- Rota nova de boas-vindas e correção de formato ainda não publicadas na Vercel. Migração de banco e fluxo ManyChat foram publicados separadamente.
- `SSL26_SYNC_ENABLED`, `SSL26_SUPPRESSION_ENABLED` e `SSL26_AUTOMATIONS_REVIEWED` continuam false em produção, conferidos antes das ações. Nenhum novo agendamento, gatilho, audiência ou disparo para a base.
- Conta pessoal de Geraldo permanece fora do teste; seu descadastro não foi revertido.
- Recebimento/links/saída e preservação concluídos. Não reintroduzir o QA na lista nem reenviar a boa-vinda aceita.
- Publicar seletivamente o ajuste do ERP e terminar a auditoria de automações/audiências antes de ativar aquisição. Não contar os 80% nem homologação integral com base apenas no aceite da API.

## Coordenação do repositório

Durante esta rodada apareceu o commit local concorrente `3b7a4b3` (tarefa de Pessoal), que incluiu também os arquivos SSL26 deste teste. Não foi criado, revertido ou enviado por esta rodada. Conferência posterior: `origin/main` permanecia em `7fd263b` e a Vercel não listava novos deployments ERP no intervalo consultado. Não publicar o diretório inteiro: preservar o trabalho concorrente e selecionar o escopo de publicação na próxima etapa.

Na conferência final, o trabalho concorrente deixou `docs/ssl26-ponte-captacao.md` com status `UU`/marcadores de conflito; os arquivos novos de boas-vindas voltaram a ficar não rastreados. Esse conflito não foi editado nem resolvido por esta rodada. `git diff --check` passou no escopo de arquivos alterados por este teste, mas a checagem global do ERP ficou bloqueada por esse documento. Resolver a coordenação/merge antes de qualquer publicação do repositório.
