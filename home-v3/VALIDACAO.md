# Validação da variante — 16/11/2026

Registro de execução, sem promessa de perfeição absoluta ou certificação. Esta é uma proposta navegável isolada; produção e v2 preservadas.

## Rodada 1 — dez problemas encontrados e corrigidos

1. Aviso do hero juntava palavras ao ocultar uma quebra de linha no celular: espaço textual corrigido.
2. Endereço e botão de copiar disputavam a mesma linha em 390px: endereço ocupa uma linha própria em contêiner estreito.
3. Avançar a demo mantinha o novo título fora do viewport: foco acompanha o título da etapa acionada.
4. No celular, a demonstração vinha depois de todos os textos explicativos: prioridade invertida, mantendo os passos empilhados logo depois.
5. Rotas genéricas `/en/` e `/es/` não constavam do registro real: links para páginas traduzidas existentes, com destino informado.
6. Toast vazio aparecia como pequena marca em captura longa: oculto até conter feedback.
7. Nome sobre mensagem dourada tinha contraste 4,36:1: cor escurecida; auditoria seguinte sem esse erro.
8. Ícone de servidor carregava uma foto de 640px para mostrar 40px: miniatura própria de 128px; imagem LCP móvel recebeu recorte e AVIF.
9. Controle de pausa e menu móvel tinham alvo ligeiramente inferior à meta de 44px: dimensões mínimas corrigidas.
10. O espaço mínimo do preço afastava excessivamente “/mês”: largura artificial removida.

Evidências locais: `home-research/v3/round1-1440.jpg`, `round1-390.jpg`, `round1-320.jpg`, `round1-full1440.jpg` e relatórios Lighthouse r1/r2. A captura longa inicial não carregou imagens lazy fora da tela; não foi tratada como evidência de falha de imagem.

## Rodada 2 — revisão crítica

1. A conversa sobreposta encobria o texto do post: legenda passou para antes da foto e o espaço inferior foi ajustado.
2. A resposta adicional do chat podia subir sobre a publicação: a composição reserva espaço ao expandir a conversa.
3. “Experimente a demonstração” levava à introdução da seção: agora abre diretamente o demonstrador.
4. Âncoras deixavam excesso de espaço acima dos títulos: compensação do cabeçalho e do padding ajustada.
5. Navegação móvel podia permanecer aberta após o foco sair dela: fechamento ao sair por teclado.
6. Redimensionar para desktop podia preservar estado aberto do drawer: fechamento no breakpoint.
7. Mudança de período só atualizava os números visualmente: resumo acessível anuncia total e equivalente mensal.
8. Auditoria axe encontrou a faixa de prévia fora dos landmarks: convertida em região complementar nomeada.
9. Lighthouse móvel ainda media LCP de 2,6s após a primeira otimização: AVIF responsivo reduziu para 2,4s na execução seguinte.
10. Texto “Idioma / Language” quebrava demais no menu estreito: rótulo reduzido, mantendo explicação dos destinos no seletor.

## Testes executados até este registro

- Sintaxe JavaScript com `node --check`.
- Edge real: abertura desktop/mobile, menu móvel, três etapas da demo, criação/importação, nome editado, cópia com feedback, backup, seleção de skin, conversa, preço anual e lightbox com próximo/escape/retorno de foco.
- Navegação ARIA de abas com setas; retorno correto do foco após fechar a galeria.
- Galeria: início sem seta anterior ativa e final sem seta seguinte ativa.
- Primeiro Lighthouse móvel local: **92 desempenho / 97 acessibilidade / 100 boas práticas**, LCP 3,2s, CLS 0.
- Segunda execução: **95 / 100 / 100**, LCP 2,6s, CLS 0.
- Terceira execução: **97 / 100 / 100**, LCP 2,4s, CLS 0, TBT 0ms. Relatório `home-research/v3/lighthouse-mobile-r3.json`.

Lighthouse usa CPU/rede simuladas; não mede INP real de campo. Sem tráfego e coleta apropriada, não se pode declarar INP p75 abaixo de 200ms. Condições locais e cache de produção podem alterar os números. Checagens finais de publicação e responsividade são acrescentadas ao fim deste arquivo.

## Limites

Não testado com leitores de tela por uma pessoa usuária nem em aparelhos físicos. Firefox/WebKit não confirmados nesta estação. As fontes de contraste sobre imagem exigem julgamento além do axe; a camada escura de leitura foi conferida visualmente. Não existe pesquisa de conversão ou teste dos cinco segundos com participantes externos; houve revisão heurística das duas primeiras telas solicitadas.


## Fechamento da revisão

- Lighthouse desktop local: **100 desempenho / 100 acessibilidade / 100 boas práticas**, LCP **0,7s**, CLS **0**, TBT **0ms**.
- Axe 4.14 no Edge, com regras WCAG 2 A/AA, 2.1 AA, 2.2 AA e boas práticas: **zero violações**, 49 verificações aprovadas. O motor deixou contraste de elementos sobre imagens e um atributo ARIA como revisão manual/incompleta. Isso não equivale a certificação WCAG. A galeria recebeu `role="group"` explícito na revisão final.
- Menu compartilhado: modo assinante de exemplo abriu com selo Pro, links de conta/assinatura/console/Community e saída para visitante. O menu foi mantido idêntico ao componente da v2. Nenhuma sessão de produção foi acessada.
- Capturas finais em **320, 390, 768, 1024, 1440, 1920 e 2560px**, obtidas pelo diagnóstico Lighthouse em Chromium. Em todas, os controles de tamanho, contraste automatizável, atributos ARIA e erros de console passaram. Arquivos `home-research/v3/viewport-{largura}.json`, `page-{largura}-final.jpg` e `opening-{largura}-final.jpg`.
- Nas medições realizadas no Edge, documento sem transbordamento horizontal em 320, 390, 768, 1024, 1920 e 2560px. A medição final de 1440px confirmou largura de documento e área útil iguais (1425px, descontada a barra vertical). A galeria mantém sua própria rolagem lateral, por projeto.
- Auditoria estática: 68 IDs únicos, 197 referências locais/âncoras válidas, 18 imagens com `alt`, sintaxe JS válida e duas cópias do componente compartilhado idênticas às originais. Nenhuma alteração em `/home-v2/` comparada ao commit `58ae71a`.
- Refinamentos finais: título sem quebra desnecessária em tablet/tela grande; texto de leitura mínimo de 16px também em tablets; destino em português do seletor consistente com os demais; acesso alternativo ao catálogo sem script; galeria sem barra horizontal visual redundante.

### O que não foi executado

O acesso interativo ao navegador ficou indisponível no encerramento. Por isso, a verificação dinâmica com JavaScript efetivamente desativado e com a preferência de movimento reduzido emulada não foi concluída. As alternativas foram implementadas e revisadas no código, mas não são apresentadas como testes executados. As capturas finais e auditorias Chromium foram concluídas pela ferramenta Lighthouse solicitada no brief. Firefox e WebKit, dispositivos físicos, leitor de tela humano, teste externo dos cinco segundos e INP de campo continuam fora da evidência desta prévia.

### Antes de produção

Aprovar a direção visual; integrar sessão real preservando o componente aprovado e o destino do login; consumir preços/limites da oferta central; concluir tradução e rotas; testar Firefox/WebKit e preferências de acessibilidade; decidir indexação. Caso haja medição futura, definir consentimento/base legal e objetivos. Não há rastreamento nesta variante. Os módulos de produto são demonstrações explicitamente identificadas, e os CTAs abrem destinos reais sem executar ações na conta.


## Publicação conferida

GitHub Pages: https://ogabriels2.github.io/forca-aliada-minecraft-preview/home-v3/?v=025bf9a

A publicação do código `025bf9a` concluiu com sucesso. HTML, CSS e JS públicos responderam 200 e coincidiram com os arquivos locais, normalizadas somente as quebras de linha. A versão anterior permanece em `/home-v2/`.

Lighthouse **na URL pública**, em perfil móvel com rede/CPU simuladas: **100 desempenho / 100 acessibilidade / 100 boas práticas**, **LCP 1,6s**, **CLS 0**, **TBT 0ms**, FCP 1,0s e transferência inicial de aproximadamente **196 KiB**. Arquivo local: `home-research/v3/lighthouse-public-mobile.json`. Uma execução de laboratório, não garantia de resultado em todos os aparelhos. Permanecem recomendações diagnósticas de cache e cadeia de carregamento; nenhuma falha pontuada em acessibilidade ou boas práticas. A política de cache pertence ao GitHub Pages desta prévia.
