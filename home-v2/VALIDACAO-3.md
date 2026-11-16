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

PageSpeed: resultado externo será registrado apenas se o serviço concluir a medição da versão publicada. Não há nota presumida.
