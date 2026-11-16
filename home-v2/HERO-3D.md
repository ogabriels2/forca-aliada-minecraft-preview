# Abertura e demonstrações da home

Esta é uma prévia de comunicação e interação. A plataforma Minecraft é a entrada principal para jogar, descobrir servidores, personalizar skins e encontrar amigos. Manager e Community são produtos integrados; a assinatura viabiliza o Manager e os benefícios adicionais. O servidor próprio é identidade e exemplo de uso, não a oferta principal.

## Arte e execução

A cidade não foi gerada por IA. `tools/export-world.py` lê uma cópia do mundo próprio e extrai superfícies visíveis, sem modificar o mundo original. São dois recortes: 544 × 544 blocos da cidade central e 512 × 512 da segunda cidade. A geometria é uma interpretação simplificada em blocos; escadas, vegetação e peças menores não reproduzem todos os modelos do jogo. Não é uma captura do Minecraft com shaders nem um vídeo renderizado offline.

`src/world.js` desenha essa geometria com Three.js, luz, sombras, neblina e quatro trajetórias. As imagens iniciais são renderizações do mesmo modelo. Nenhuma imagem de terceiros é apresentada como uma construção da Força Aliada. Não são publicados arquivos do mundo, inventários, jogadores ou textos de placas. A geometria pública, como qualquer recurso visual de uma página, pode ser baixada pelo visitante.

O passeio é um cenário da marca. Seus controles de escolha de câmera só aparecem em “Explorar cenário”; essa opção recolhe a mensagem comercial e permite olhar o mundo. Escape retorna à página. A chamada principal é criar conta, com retorno à plataforma Minecraft; o acesso sem cadastro também está visível.

## Destaques por ocasião

Edite `hero-campaigns.js` para mudar texto, destino e cena. `defaultCampaign` escolhe a abertura publicada. As opções atuais são `aliada`, `manager` e `community`. `?campaign=community` permite revisar uma opção por URL. O seletor superior pertence à prévia, não é um painel de administração de produção. O conteúdo comercial não troca automaticamente.

Depois de editar: `npm ci` e `npm run build`. Os arquivos prontos ficam em `build/`; a publicação estática usa esses arquivos. Câmeras e luz ficam em `src/world.js`; comportamento editorial, pausa e demonstrações ficam em `src/hero.js`; o personagem está em `src/skin.js`. Todas as bibliotecas são locais.

## Movimento e carregamento

- O texto e as ações principais já estão no HTML. A imagem de abertura carrega antes do 3D.
- A biblioteca 3D é separada do controle da interface. A segunda cidade só é requisitada quando selecionada.
- O render do passeio é limitado a aproximadamente 30 quadros/s e para ao sair da tela ou ocultar a aba. Pausa e preferência por movimento reduzido são respeitadas.
- As sombras do cenário estático não são recalculadas a cada quadro. A resolução diminui se o orçamento de quadros não for mantido.
- Se a geometria falhar, os mesmos ângulos continuam disponíveis como imagens. A navegação não depende de WebGL.
- O personagem não gira sozinho. A pessoa troca o visual e gira com controles explícitos; o movimento reduzido torna a rotação imediata.
- As mensagens ilustrativas não são conversas reais. O aplicativo usa a imagem demonstrativa já existente no Manager. A prévia não abre sessões ou grava dados de produção.

## Limites da proposta

A confiança comercial depende também de produto, suporte e experiência reais. Não foram inventados depoimentos, números de usuários, avaliações, parcerias ou resultados. A aprovação desta prévia não é substituída por testes automatizados. Tradução, sessão real, preços centralizados e métricas com consentimento continuam pertencendo à integração posterior da home de produção.
