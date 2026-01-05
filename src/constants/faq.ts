import type { FAQItem } from '@/src/domain/tour';

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'how-to-get-api-key',
    question: 'Como obter minha API Key do Clockify?',
    answer: 'Acesse Clockify → Settings → API → Generate New API Key. Copie a chave gerada e cole no campo "API Key" desta aplicação.',
    category: 'getting-started',
    order: 1,
  },
  {
    id: 'what-are-profiles',
    question: 'O que são Perfis de Exportação?',
    answer: 'Perfis permitem salvar diferentes configurações de exportação. Por exemplo, você pode ter um perfil "Cliente A" que exporta apenas projetos daquele cliente, e outro "Cliente B" com projetos diferentes.',
    category: 'features',
    order: 1,
  },
  {
    id: 'api-key-not-working',
    question: 'Minha API Key não está funcionando',
    answer: 'Verifique se: (1) A chave foi copiada corretamente sem espaços extras, (2) Você tem permissões no Clockify, (3) A chave não expirou. Se o problema persistir, gere uma nova chave.',
    category: 'troubleshooting',
    order: 1,
  },
  {
    id: 'tour-restart',
    question: 'Como reiniciar o tour inicial?',
    answer: 'Clique no botão "Ajuda" (?) no canto superior direito e selecione "Reiniciar Tour".',
    category: 'getting-started',
    order: 2,
  },
  {
    id: 'data-privacy',
    question: 'Meus dados são enviados para algum servidor?',
    answer: 'Não. Esta aplicação funciona 100% no seu navegador. Todos os dados (API Key, perfis, configurações) são armazenados localmente no seu computador.',
    category: 'getting-started',
    order: 3,
  },
];
