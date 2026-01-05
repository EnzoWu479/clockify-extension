import type { HelpContent } from '@/src/domain/tour';

export const HELP_CONTENT: Record<string, HelpContent> = {
  'api-key': {
    id: 'api-key',
    title: 'API Key do Clockify',
    description: 'Sua chave de acesso pessoal permite que a aplicação busque suas entradas de tempo do Clockify.',
    example: 'Encontre em: Clockify → Settings → API → Generate New API Key',
    relatedLinks: [
      {
        label: 'Como obter API Key',
        url: 'https://clockify.me/help/api/api-keys',
      },
    ],
  },
  'export-profiles': {
    id: 'export-profiles',
    title: 'Perfis de Exportação',
    description: 'Crie perfis para diferentes contextos de trabalho. Cada perfil define quais projetos exportar e em qual coluna do Excel.',
    example: 'Ex: "Cliente A" com projetos XYZ na coluna 5',
  },
  'project-mapping': {
    id: 'project-mapping',
    title: 'De-Para de Projetos',
    description: 'Configure como os nomes dos projetos do Clockify aparecem no Excel. Útil para abreviar ou padronizar nomes.',
    example: 'Ex: "Projeto Interno XYZ" → "PI-XYZ"',
  },
  'hours-column': {
    id: 'hours-column',
    title: 'Coluna de Horas',
    description: 'Define em qual coluna do Excel as horas serão exportadas. A=1, B=2, C=3, etc.',
    example: 'Ex: Coluna 7 = Coluna G no Excel',
  },
};
