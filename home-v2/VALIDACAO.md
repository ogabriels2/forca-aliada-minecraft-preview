# Verificação do protótipo

## Revisão atual: cena 3D e hierarquia de produto — 16/11/2026

Esta seção substitui as afirmações da primeira versão sobre a abertura e os recursos carregados. A interface principal é a mesma prévia pública isolada, com a plataforma para quem joga liderando a apresentação.

- 45 verificações na matriz atual, todas aprovadas: quatro vistas, trocas rápidas, pausa, retomada, exploração/Escape, interrupção fora da tela, movimento reduzido, falha de geometria com imagem alternativa, três destaques editoriais, navegação móvel, conta compartilhada, assinatura e ampliação da interface.
- Nove verificações adicionais aprovadas: exemplos de roupas e publicação visíveis, imagens carregadas com área efetiva, destinos distintos para assinante e identificação correta da vista estática. A inspeção das capturas revelou e corrigiu miniaturas que o layout flexível reduzia a largura zero.
- Falha parcial também verificada: com a primeira cidade já carregada e a segunda indisponível, a vista selecionada aparece como imagem, a renderização oculta para e uma nova tentativa recupera o 3D. Integridade dos dois arquivos de geometria conferida por tamanho e SHA-256.
- Testes de composição em 320, 390, 768, 1024, 1440 e 1920px, incluindo as três campanhas: sem rolagem horizontal da página ou sobreposição entre texto principal e demonstração.
- Demonstração de skin usa peças já existentes no editor sobre uma textura clássica; troca de visual e rotação verificadas. Corrigida uma seleção inicial incorreta de imagem de apresentação em lugar de textura. Recursos versionados evitam a reutilização desse estado pelo cache.
- Zero erros JavaScript na execução normal. O erro de rede deliberado do cenário de indisponibilidade é esperado e não interrompe cadastro ou navegação.
- Axe-core 4.10.3 (WCAG 2 A/AA e 2.1 AA): zero violações detectadas na revisão atual. Não equivale a certificação de acessibilidade.
- Capturas completas de desktop e celular e de abertura em tablet/1920px; estados de menu e alternativa estática inspecionados.
- Geometria comprimida: aproximadamente 2,17 MB para a cidade central e 2,10 MB para a segunda, requisitada somente quando escolhida. Imagem inicial: aproximadamente 321 KB em desktop e 78 KB em celular. Biblioteca 3D e demonstração carregam em módulos separados; GSAP/Three são compartilhados.
- O render 3D usa três chamadas de desenho na vista conferida e cerca de 1 milhão de triângulos; câmera limitada a aproximadamente 30 quadros/s. Isso é contagem de renderização, não uma promessa de desempenho em qualquer aparelho. A pausa, a interrupção fora da tela e o fallback reduzem o trabalho desnecessário.
- Nenhuma alteração de home de produção, autenticação real ou pagamento. A geometria é uma aproximação em blocos da arquitetura própria; não se apresenta como captura do jogo com shaders.
- Revisão visual independente dos quatro ajustes solicitados: demonstrações concretas na abertura, publicação/conversa do Community, transparência do histórico de direção e documentação atualizada. Todos resolvidos; sem regressão material visível nas capturas. Parecer final: pronto para publicar esta prévia. Esse parecer não constitui validação comercial ou certificação do produto completo.

## Registro da primeira versão, anterior à revisão 3D

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
