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
