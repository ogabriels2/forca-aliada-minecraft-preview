# Pesquisa e decisões da v4

Pesquisa iniciada em 16–17/11 e revisão final em 21/11/2026. Combina o brief, os produtos públicos, código do site e clone isolado do Manager. A versão final incorpora a correção posterior do dono: jovem, não infantil. Referências são estudo de padrões, não evidência de que esta página converterá como empresas estabelecidas.

## Produtos próprios

Foram capturadas em navegador isolado as páginas [Manager](https://forcaaliada.com/manager), [catálogo](https://forcaaliada.com/minecraft), [skins](https://forcaaliada.com/minecraft#/skins), [editor](https://forcaaliada.com/minecraft#/skins/editor), [Community](https://forcaaliada.com/community), [assinatura](https://forcaaliada.com/assinatura) e [empresa](https://forcaaliada.com/fundacao). Capturas de referência com conteúdo de pessoas reais ficam somente na pesquisa local, fora da entrega pública.

Manager: código 2.4.18, commit 6745fc6, index.html e saas-shell.js. Instalador sem cobrança separada; operação incluída em Pro/Team. Criação real tem três etapas. Java, Bedrock e ambos têm preparação diferente. Oferta conferida no site/código: Pro R$29,90 ou R$299/ano, 2 servidores/3 pessoas; Team R$79,90 ou R$799/ano, 5/10. Parâmetro anual do checkout é annual. Não apresentar Manager como hospedagem ou teste gratuito.

## Referências e aplicação

| Fonte consultada | O que ajuda nesta home | O que não adotar |
|---|---|---|
| [Hostinger](https://www.hostinger.com/) | Demonstração e próximo passo visíveis; hierarquia de compra clara | Descontos, contagem regressiva e promessas de hospedagem |
| [Framer](https://www.framer.com/) | O produto em ação explica melhor que uma lista extensa | Reproduzir peso de mídia ou efeitos em todas as seções |
| [Webflow](https://webflow.com/) | Contexto, interface e acesso ao produto juntos | Linguagem empresarial de grande equipe |
| [Linear](https://linear.app/) | Detalhes de interface sustentam credibilidade tecnológica | Microtexto, baixo contraste e excesso de preto |
| [Vercel](https://vercel.com/) | Separação por tarefa e acesso rápido para quem já conhece | Jargão de infraestrutura e métricas alheias |
| [Raycast](https://www.raycast.com/) | Demonstrações focadas em uma ação concreta | Vender atalhos ou extensões que não temos |
| [Apple](https://www.apple.com/macbook-pro/) | Produto grande, composição precisa e espaço controlado | Filme pesado obrigatório e exclusividade copiada |
| [Stripe](https://stripe.com/) | Uma marca consegue apresentar ofertas distintas com unidade | Clientes, números ou linguagem financeira como prova nossa |
| [Notion planos](https://www.notion.com/pricing) | Plano grátis comparável e unidade de cobrança explícita | Complexidade por assento sem relação com nossa oferta |
| [Figma planos](https://www.figma.com/pricing/) | Tipo de uso antes de lista extensa; período explícito | Licenças e assentos fictícios |
| [Canva planos](https://www.canva.com/pricing/) | Acesso gratuito como entrada e benefícios pagos reconhecíveis | Promessas de acervo ou uso ilimitado |
| [Discord](https://discord.com/) | Conversas demonstram valor social rapidamente | Voz, vídeo ou capacidades não confirmadas |
| [Roblox](https://www.roblox.com/) | Relação imediata entre cadastro e o que se pode fazer | Linguagem infantil e volume de conteúdo que ainda não existe |
| [Duolingo](https://www.duolingo.com/) | Ações imediatas e estado de progresso compreensível | Mascotes, gamificação e estética infantil; leitura web limitada nesta consulta |
| [Medal](https://medal.tv/) | Uma ação visual mostra por que compartilhar | Estatísticas ou desempenho emprestados |
| [Modrinth](https://modrinth.com/) | Organização por interesses e conteúdo identificável | Excesso de filtros e catálogo artificialmente inflado |

Não foram copiados os ativos comerciais desses sites. Framer/Webflow/Hostinger orientam a demonstração, não o desenho de uma suposta hospedagem. Apple/Stripe orientam proporção e unidade, não estética empresarial. Discord/Roblox ajudam a apresentar uso social, sem transportar seu público infantil ou sua escala. Páginas com renderização limitada na ferramenta não foram tratadas como análise visual completa.

## Convenções e critérios

- [WAI-ARIA APG — abas](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/): sequência das etapas com setas, Home/End, foco e seleção. Os painéis não usam article com um papel incompatível.
- [APG — disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/): menu e perguntas com details/summary; funcionam sem JavaScript.
- [APG — dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): lightbox com dialog nativo, Escape e retorno ao elemento que abriu.
- [APG — tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) e [WCAG 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html): informações essenciais não ficam escondidas em tooltip. Não adicionar popover só para adornar.
- [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): alvos espaçados e controles principais de 44px; links em texto conservam contexto.
- [MDN — movimento reduzido](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion): preservar conteúdo e interromper ciclos quando solicitado.
- [MDN — Web Animations](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) e [animação ligada ao scroll](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations): animação progressiva, nunca requisito de leitura. Nesta versão, IntersectionObserver é suficiente; não foi necessária uma biblioteca.
- [web.dev — animações](https://web.dev/articles/animations-guide): priorizar transform/opacity, trabalhar apenas na seção visível e limitar loops.
- [NN/g — homepage](https://www.nngroup.com/articles/homepage-design-principles/): mostrar propósito e próximos passos reconhecíveis. Aplicação heurística, sem teste externo de cinco segundos realizado.
- [Baymard — homepage e categorias](https://baymard.com/research/homepage-and-category-usability): mostrar a amplitude da oferta sem exigir leitura profunda. Adaptação de pesquisa de comércio eletrônico; não extrapolar seus números para nossa conversão.
- [Minecraft — diretrizes de uso](https://www.minecraft.net/en-us/usage-guidelines): marca própria, aviso de independência, nenhuma atribuição de personagens oficiais como criação nossa. Consulta de contexto, sem representar parecer jurídico.

## Decisões que diferem do brief inicial

Os grandes cartões coloridos e as sombras de botão foram retirados após feedback explícito. A animação permanece, mas a cor se concentra em produto e ação. A cena é fotografia do mundo real, com profundidade CSS; o editor passou a usar texturas originais no formato Minecraft e skinview3d sob demanda, com alternativa 2D. O telefone é genérico e sem marca. O terminal exibido é local, identificado como tal; o console web é citado e vinculado, sem simular uma sessão remota inexistente.

## Revisão das demonstrações

- [skinview3d](https://github.com/bs-community/skinview3d): formato real de skin e controles do visualizador já usado pela plataforma. Aplicação local, sem CDN adicional.
- [WCAG — Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html): manter uma forma clara de interromper movimento prolongado; reduzir o peso visual dos controles não autoriza remover a pausa.
- [Raycast](https://www.raycast.com/) e [Linear](https://linear.app/): referências de apresentação do produto por sua própria interface. A decisão de adaptar o Manager real é uma interpretação de design, não uma alegação de aumento comprovado de conversão.

Não foram adicionadas bibliotecas externas de animação: CSS e Web Animations bastam para a coreografia desta página. O pacote adicional é o renderizador do produto Minecraft, utilizado para funcionalidade demonstrável, não decoração.
