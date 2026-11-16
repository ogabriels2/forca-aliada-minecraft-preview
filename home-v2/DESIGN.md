---
name: "Força Aliada — home, direção 3"
description: "Produtos conectados, interfaces reais e acesso direto. Proposta de 16/11/2026."
colors:
  ink: "#202428"
  paper: "#f7f8fa"
  white: "#ffffff"
  line: "#d9dde1"
  green: "#37d17a"
  action-ink: "#102a1c"
  blue: "#3262d9"
  blue-surface: "#e4ebfc"
  community-surface: "#eee8fa"
  community-ink: "#7355b4"
typography:
  family: "Manrope"
  heading-weight: 800
  body-weight: 400
---

# Direção vigente

Fonte visual da proposta atual, ainda em avaliação. Substitui a direção cinematográfica verde anterior, preservada no histórico Git. Fundamentação em [DIRECAO-3.md](DIRECAO-3.md); conferência em [VALIDACAO-3.md](VALIDACAO-3.md).

## Oferta e hierarquia

A empresa reúne Manager, plataforma Minecraft e Community. Uma conta conecta o uso; a assinatura inclui Manager e benefícios avançados. Cadastro é a ação principal; planos são a segunda ação. Links diretos atendem quem já sabe onde quer entrar.

A demonstração inicial mostra a interface real do Manager e permite selecionar catálogo e Community, sem rotação automática. Sequência: abertura e acessos → Manager e simulação → descoberta → skins e Community → exemplo do servidor próprio → planos → dúvidas → cadastro.

O mundo próprio fornece imagens e contexto. Não é o protagonista comercial nem prova de escala. Login conserva o destino solicitado; sem destino, encaminha para /minecraft. A prévia usa personas demonstrativas e não lê contas reais.

## Composição

Abertura ampla com título firme à esquerda e demonstrador à direita. Alternância entre área clara e faixa grafite do Manager; descoberta com imagem e busca; skins em âmbar e conversa em violeta; planos sobre branco. Não repetir uma sequência inteira de três cards iguais nem transformar tudo em superfície verde.

Conteúdo geral até 1280 px; abertura até 1480 px. Em celular, leitura vertical, navegação compacta, demonstrações com espaço reservado e controles por toque. Conta usa o componente aprovado do Manager; ajustes locais corrigem apenas o encaixe.

## Cor e tipografia

Papel neutro e grafite estruturam. Verde forte identifica ações. Azul acompanha software/seleção; âmbar, skins e Pro; violeta, conversa e Team. Cor nunca é o único identificador. Não aplicar filtros verdes às imagens, texto em degradê ou brilho ornamental por toda a página.

Manrope local mantém continuidade de marca. Títulos de peso 800, entrelinha curta e tracking até -0.04em. Texto comercial de 14–17 px conforme tela; detalhes de demonstrações e notas menores são secundários. Priorizar legibilidade sobre densidade, especialmente em 320 px.

## Movimento

GSAP é o único motor de coreografia; CSS cuida de hover e estados simples. Entrada única e breve, com conteúdo visível por padrão. Abas usam 24 px e 200/320 ms, com interrupção permitida. Fluxo de três etapas usa 250 ms. Backup demonstrativo repete com pausa manual e para fora da tela/aba oculta. Sob redução de movimento, conteúdo fica estático e todas as escolhas continuam disponíveis.

Skin usa Three.js sob demanda: carrega perto da seção, desenha quando necessário e gira por ação. Imagem alternativa permite selecionar visuais sem WebGL. Não adicionar rolagem artificial, loading falso ou movimento que esconda preços e instruções.

## Conteúdo e integridade

Usar capturas, mundo e skins existentes da Força Aliada. Conversas e simulação identificadas como exemplos. Nenhum público, status, depoimento, avaliação ou garantia inventados. Manager depende do PC Windows ligado e conectado; não é hospedagem na nuvem.

Pro: R$ 29,90/mês ou R$ 299/ano; até 2 servidores e 3 pessoas. Team: R$ 79,90/mês ou R$ 799/ano; até 5 servidores e 10 pessoas. Equivalentes mensais anuais permanecem junto do total cobrado. Reconfirmar oferta antes da promoção à home pública.

## Implementação

Ativos: index.html, home-3.css, home.js, src/home-experience.js, src/skin.js e build gerado. Folhas e cena 3D antigas são referência histórica, não carregadas.

npm run build compila, limpa bundles obsoletos e atualiza hashes. A fonte Cult guardada em pesquisa não é executada. Licenças em THIRD-PARTY.md. Não editar o catálogo da raiz nem publicar no domínio principal sem aprovação.
