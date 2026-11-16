// Editorial content, not a carousel. Change defaultCampaign to publish another occasion.
// Each campaign keeps the same accessible structure and direct product destinations.
export const defaultCampaign = 'aliada';
export const campaigns = {
  aliada: {
    label: 'Força Aliada', title: ['Jogue junto.', 'Crie do seu jeito.'],
    description: 'Encontre onde jogar, crie sua skin e reúna os amigos. Seus mundos, suas criações e suas conversas na mesma plataforma.',
    primary: {label: 'Criar conta grátis', href: 'https://forcaaliada.com/signup?next=%2Fminecraft'},
    secondary: {label: 'Explorar Minecraft', href: 'https://forcaaliada.com/minecraft'},
    note: 'Catálogo e Community grátis. Manager incluído nos planos.', scene: 'central',
  },
  manager: {
    label: 'Manager', title: ['Seu servidor.', 'Sua próxima história.'],
    description: 'Do primeiro mundo ao encontro com os amigos. Crie e cuide do seu servidor no PC com o Manager.',
    primary: {label: 'Conhecer o Manager', href: 'https://forcaaliada.com/manager'},
    secondary: {label: 'Ver planos', href: '#assinatura'},
    note: 'Incluído na assinatura. Windows · PC ligado para hospedar.', scene: 'central',
  },
  community: {
    label: 'Community', title: ['O jogo termina.', 'A conversa continua.'],
    description: 'Mostre o que você criou, encontre sua turma e combine a próxima partida.',
    primary: {label: 'Entrar no Community', href: 'https://forcaaliada.com/community'},
    secondary: {label: 'Criar conta grátis', href: 'https://forcaaliada.com/signup?next=%2Fcommunity'},
    note: 'Participar do Community é grátis.', scene: 'cidade-dois',
  },
};
