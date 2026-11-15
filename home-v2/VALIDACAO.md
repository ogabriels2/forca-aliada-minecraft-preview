# Verificação do protótipo

Data: 15/11/2026. Navegador: Chromium automatizado em ambiente isolado, com capturas de tela inspecionadas. Escopo: `/home-v2/`, não a plataforma inteira.

## Funcionamento

- 68 verificações de comportamento/layout cobertas: a execução principal confirmou 67; a verificação específica final confirmou a ausência de animações sob movimento reduzido depois da correção.
- Três perspectivas da abertura; seleção por teclado (setas/Home), somente um painel exposto, conteúdo e ações acessíveis.
- Menu móvel, fechamento com Escape e retorno do foco; menu compartilhado de conta permanece aberto ao clicar em conteúdo interno e fecha conforme esperado.
- Visitação e assinatura demonstrativas, links corretos para entrar/console/gestão da assinatura. Trocar a periodicidade no modo assinante mantém o destino de gestão, sem iniciar compra.
- Anual informa total cobrado e equivalente mensal; links de contratação recebem plano/período corretos.
- Busca confirmada navegando para `https://forcaaliada.com/minecraft#/?q=survival+amigos`.
- Cópia do endereço, FAQ, abertura/fechamento de foto, retorno do foco e liberação da rolagem.
- Nenhum erro JavaScript na execução da prévia. Imagens disponíveis.

## Responsividade e acessibilidade

- Larguras 320, 390, 640, 768, 1024, 1440 e 1920 px: nenhuma rolagem horizontal da página nas três perspectivas; ações do palco dentro dos limites visíveis.
- Capturas completas de desktop, celular, tablet e 1920px; capturas dos estados de menu/conta e preço anual.
- Axe-core 4.10.3, regras WCAG 2 A/AA e 2.1 AA: zero violações detectadas na conferência final. Isto não é certificação de acessibilidade nem substitui testes manuais com tecnologias assistivas.
- Preferência de movimento reduzido: nenhuma animação em execução na verificação específica final. Navegação principal usa links nativos e continua disponível sem JS.
- Textos auxiliares de controles elevados ao mínimo de 11px; texto principal usa escala maior. Contraste do hover da aba ativa corrigido.

## Conteúdo, destinos e recursos

- 11 destinos únicos conferidos com resposta HTTP 200: Manager, Community, catálogo, empresa, ajuda, servidor próprio, ferramenta de encantamentos, assinatura, contato, termos e privacidade. Não foi iniciada compra nem enviada informação pessoal.
- Arquivos de mídia locais somam aproximadamente 1,16 MB, incluindo fonte/licença/metadados; as mesmas fotos são reutilizadas sem duplicar downloads por seção. Nenhuma biblioteca 3D ou vídeo automático necessário para comunicar a oferta.
- Cinco imagens raster com origem registrada; nenhum material de terceiros foi apresentado como mundo da Força Aliada.
- `noindex,nofollow`, nenhuma medição ou autenticação real e isolamento do protótipo preservados.

## Limites

Não houve teste com visitantes reais, comparação estatística de conversão, medição em aparelhos físicos lentos ou revisão jurídica. As capturas e testes verificam a experiência proposta e sua implementação estática; não autorizam afirmar “perfeição” nem resultado comercial garantido. Integrações necessárias para substituir a home estão discriminadas em `ESTRATEGIA.md`.
