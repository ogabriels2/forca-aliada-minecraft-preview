# Conferência da home — direção 3

16 de novembro de 2026. Prévia estática, sem gravações em produção.

## Conferido no navegador

- Layout em larguras de 320, 390, 768, 1024 e 1440 px, além da janela desktop ampla. Sem rolagem horizontal da página nas larguras medidas.
- Seleção dos três produtos e navegação pelas setas/Home/End; uma seleção ativa e conteúdo das outras abas retirado da navegação.
- Demonstração do Manager: criar/importar, avançar, voltar, preservar escolha e reiniciar após a terceira etapa.
- Troca de roupa e giro da skin em WebGL. Fallback por imagem mantido para falha de importação, textura ou contexto; esse caminho foi revisado no código, sem simulação de todos os drivers.
- Menu móvel e Escape; componente de conta aprovado. Destinos corrigidos, inclusive Gerenciar assinatura após trocar persona.
- Mensal/anual: R$ 24,92 e R$ 66,58 como equivalentes mensais, com totais de R$ 299 e R$ 799 exibidos. Período selecionado acompanha os links dos planos.
- Ampliação da interface, Escape, devolução do foco e restauração da rolagem.
- FAQ e explicação de que Manager roda no computador do usuário.

## Correções durante a revisão

- Espaço vertical ampliado nas demonstrações estreitas para não cortar a última mensagem.
- Menu de conta limitado à largura disponível, descontando a barra de rolagem em 320 px.
- Textos secundários com mais contraste e controles de toque ampliados.
- Pausa somente onde existe repetição; redução de movimento mostra o estado concluído e interrompe transições pendentes.
- Giro oculto quando 3D não está disponível; seleção dos exemplos por imagem preservada.
- Fonte e imagens com espaço reservado; 3D fora do carregamento inicial.

## Verificação técnica

Build local e análise de sintaxe executados. Conferência de caminhos locais, IDs e referências de ícones. Nenhuma mudança no catálogo da raiz, no backend ou em contas reais.

O navegador com extensões registrou mensagens de canal assíncrono; não se atribui ausência absoluta de erros a essa sessão. A conferência distingue essas mensagens dos scripts da página.

## Limites

Não é certificação universal de acessibilidade, compatibilidade ou conversão. A proposta precisa de aprovação de direção e observação com pessoas novas. Nenhum teste compra assinatura ou cria servidor real. Responsividade no Edge não substitui aparelhos iOS/Android físicos.

PageSpeed foi medido na URL pública. Resultados e limites abaixo.

## Medição externa e otimização

Primeira medição pública (16/11, 19:11 BRT): desempenho 74 no celular e 98 no desktop; acessibilidade 100; boas práticas 96. LCP móvel 6,6 s, TBT 0 ms e CLS 0. Relatório: https://pagespeed.web.dev/analysis/https-ogabriels2-github-io-forca-aliada-minecraft-preview-home-v2/wyzuq3ltjt?form_factor=mobile

A medição identificou arquivos de imagens maiores que a exibição e entrada tardia via JavaScript. Foram criadas variantes responsivas WebP a partir dos arquivos próprios, preservando enquadramento; cenas fechadas e imagens secundárias usam carregamento adiado. A entrada agora começa no primeiro desenho via CSS e não oculta a imagem principal. Duas imagens do escudo ganharam object-fit para preservar a proporção.

SEO reduzido na prévia é esperado: ela usa noindex/nofollow e as restrições do repositório de testes. Não removê-las para elevar pontuação. A versão pública da empresa exige metadados e indexação próprios após aprovação.

## Resultado após as correções

Relatório público de 16/11/2026, 19:16 BRT, versão 06b9531: [PageSpeed Insights](https://pagespeed.web.dev/analysis/https-ogabriels2-github-io-forca-aliada-minecraft-preview-home-v2/xx5nzmx1tp?form_factor=mobile).

| Medida | Celular | Desktop |
|---|---:|---:|
| Desempenho | 100 | 100 |
| Acessibilidade automática | 100 | 100 |
| Boas práticas | 100 | 100 |
| LCP | 1,4 s | 0,3 s |
| Total Blocking Time | 0 ms | 0 ms |
| Cumulative Layout Shift | 0 | 0 |

SEO 63: única reprovação exibida foi o bloqueio intencional de indexação da prévia. Restam recomendações de cache controladas pelo GitHub Pages e pequena economia possível em imagens; não prejudicaram as métricas desta execução. Dados de usuários reais não estavam disponíveis. Notas de laboratório variam e não demonstram conversão nem eliminam a necessidade de revisão humana.

Caminhos locais e fragmentos conferidos sem ausências ou IDs duplicados; destinos públicos de produto e páginas institucionais responderam HTTP 200. A página publicada foi aberta novamente e conferida em desktop e 390 px.
