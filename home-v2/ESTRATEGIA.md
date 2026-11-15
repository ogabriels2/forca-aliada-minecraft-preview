# Nova home Força Aliada — análise e proposta

Pesquisa e inspeção: 15 de novembro de 2026. Escopo: protótipo público, separado do domínio principal. As conclusões comerciais são hipóteses fundamentadas, não resultados de experimento com o público da Força Aliada.

## Recomendação

A Força Aliada precisa de uma **home de produto para visitantes**: mostrar o que a pessoa pode fazer, deixar entrar imediatamente e apresentar a assinatura como ampliação da experiência. O Manager recebe destaque comercial; Minecraft oferece descoberta e criação; Community oferece identidade, conteúdo e conversas. A empresa sustenta a marca, mas sua apresentação institucional não deve ocupar a abertura.

Não transformar a raiz simplesmente na página do Manager nem na lista de servidores. Manter `/minecraft` como experiência de uso e destino padrão após login sem contexto; respeitar sempre o destino que motivou a autenticação. O usuário recorrente não deve atravessar uma apresentação obrigatória. Visitar a home explicitamente continua possível.

O servidor próprio é uma demonstração real de uso das tecnologias. Não é a principal promessa comercial, nem deve ocupar a home como se fosse um grande jogo comercial independente. A assinatura é a fonte direta de receita; participar, descobrir e compartilhar são formas de conhecer a plataforma e retornar.

## O que foi entendido dos produtos

Inspecionados os textos, navegação e páginas públicas atuais, e os contratos relevantes no código, antes de escrever a proposta.

| Produto | Entrega atual | Papel na home | Limite que precisa ficar claro |
|---|---|---|---|
| Manager | Aplicativo Windows, criação/importação de servidores, endereço protegido por proxy, console remoto, backups e rotinas | Demonstração principal; motivo concreto para assinar | Hospeda no PC do cliente. Precisa ficar ligado; não equivale a hospedagem na nuvem |
| Minecraft | Catálogo e páginas de servidores, busca, histórico/favoritos, skins, editor e ferramentas; integração social | Entrada para jogar ou criar; busca direta sem cadastro obrigatório para explorar | Página básica gratuita; disponibilidade e regras dependem de cada servidor |
| Community | Perfis, publicações, mídia, respostas, amigos e mensagens | Dar continuidade às relações e às criações; não reduzir a chat de suporte | Não é necessário comprar o Manager para participar; não se limita a Minecraft |
| Assinatura | Pro e Team: Manager, equipe/servidores, benefícios pessoais no Community e personalização da página Minecraft | Relacionar pagamento a utilidade concreta, com valor e condições legíveis | Perfil verificado da assinatura não significa controle verificado do domínio de um servidor |
| Servidor próprio | Mundo Survival Vanilla desde 2021, Java e Bedrock, cidades, farms e transportes feitos pela comunidade | Prova de uso e origem da marca, em uma seção curta | Pequeno, sem receita direta; não afirmar escala, disponibilidade contínua ou desempenho sem evidência |

Fontes próprias: [Manager](https://forcaaliada.com/manager), [Minecraft](https://forcaaliada.com/minecraft), [Community](https://forcaaliada.com/community), [assinaturas](https://forcaaliada.com/assinatura), [benefícios do Community](https://forcaaliada.com/ajuda/community/beneficios-da-community), [empresa](https://forcaaliada.com/fundacao). Valores públicos conferidos: Pro R$29,90/mês ou R$299/ano; Team R$79,90/mês ou R$799/ano. O protótipo não consulta cobrança e não processa pagamentos.

## Alternativas comparadas

| Modelo | Vantagem | Custo / risco para a Força Aliada | Decisão |
|---|---|---|---|
| Catálogo como única home | Dá conteúdo e uso imediatamente, bom para recorrência | Pode parecer apenas uma lista Minecraft; explica pouco por que assinar | Manter como aplicação de chegada, sem eliminar a apresentação pública |
| Manager como home | Proposta comercial simples, caminho curto ao pagamento | Esconde a entrada gratuita e reduz Community a acessório | Destaque principal, sem monopolizar a marca |
| Community como home | Conteúdo social pode gerar hábito | Depende de volume, qualidade e interesse do feed; pouco contexto para desconhecidos | Acesso fácil e demonstração; feed completo dentro do produto |
| Home institucional | Explica empresa, visão e portfólio | Aumenta a distância até jogar ou usar; risco corporativo que o usuário rejeitou | Reservar a `/fundacao` |
| Home de produto com demonstração e assinatura | Explica o mínimo, mostra uso e oferece caminhos concretos | Exige hierarquia; pode virar um portal de cartões se mal executada | Recomendada e prototipada |

Não há um formato universal vencedor. O critério é reduzir o esforço até a primeira ação útil sem esconder a proposta paga ou confundir o visitante sobre o tipo de produto.

## O que as referências ensinam — e o que não copiar

**Netflix.** A página pública abre com oferta clara, preço e início da assinatura; usa conteúdo para tornar a promessa concreta. Aplicação: assinatura compreensível e caminho visível. Diferença: quase todo o consumo depende da assinatura, enquanto a Força Aliada tem portas gratuitas. Não copiar um bloqueio por e-mail para explorar nem presumir notoriedade. [Página observada](https://www.netflix.com/br/).

**Roblox.** A visita pública mostra a experiência visual de jogar/criar, acesso e conteúdo de descoberta. Aplicação: deixar a pessoa ver o universo e entrar, com poucas palavras. Diferença: Roblox é uma plataforma de jogos própria com grande acervo, não uma empresa com aplicativo Windows e catálogo Minecraft. Não sugerir que a Força Aliada inclui a licença do Minecraft. [Página observada também no navegador](https://www.roblox.com/).

**Riot.** A home organiza jogos, novidades e entretenimento sob uma marca conhecida, com linguagem visual própria dos produtos. Aplicação: mostrar produtos reais e preservar suas identidades sob a marca-mãe. Diferença: jogos reconhecíveis dispensam explicações que “Manager” e “Community” ainda precisam. Não copiar uma grande área de notícias sem uma operação editorial real. [Página observada](https://www.riotgames.com/pt-br).

**Figma.** A home articula múltiplos produtos por tarefas e demonstra interfaces. Aplicação: uma proposta conjunta não exige uma explicação longa da estrutura empresarial. Diferença: contexto profissional e marca consolidada; não transplantar estética de software empresarial. [Página observada](https://www.figma.com/).

**Modrinth.** Une descoberta, aplicação e hospedagem com conteúdo Minecraft concreto. Aplicação: valor imediato no catálogo e ferramentas próximas da intenção de uso. Diferença: escala de catálogo e modelo de hospedagem distintos. A Força Aliada deve ampliar conteúdo autorizado sem fingir acervo já existente. [Página observada](https://modrinth.com/).

**Discord e Medal.** Começam pelo resultado e mostram a experiência de conversar ou compartilhar, com uma ação simples. Aplicação: produto em uso e linguagem acessível. Não importar humor, superlativos ou contadores de escala que não pertencem à marca. [Discord](https://discord.com/), [Medal](https://medal.tv/).

**Overwolf.** Demonstra como vários produtos podem compartilhar uma marca e atender públicos diferentes. Aplicação: clareza de destino. Sua segmentação extensa para estúdios, anunciantes e criadores seria excesso para a Força Aliada agora. [Página observada](https://www.overwolf.com/).

As práticas observadas não provam aumento de conversão para a Força Aliada. São referências de organização e apresentação; notoriedade, público, oferta e investimento mudam o resultado.

## Fundamentos de UX aplicados

- **Propósito + exemplo + ação.** Quem chega deve reconhecer o que o site oferece e como começar. A demonstração aparece junto da abertura, sem exigir leitura institucional. [NN/g: princípios de home](https://www.nngroup.com/articles/homepage-design-principles/).
- **Nomes desconhecidos precisam de contexto.** “Manager” ganha “Seu servidor no PC”; “Minecraft”, “Encontre onde jogar”; “Community”, “A conversa continua”. Familiaridade anterior ajuda marcas conhecidas, mas não pode ser presumida aqui. [NN/g: information scent](https://www.nngroup.com/articles/information-scent/).
- **Mostrar a amplitude sem esgotar o catálogo.** Os três usos aparecem cedo e os recursos secundários vêm depois. A pesquisa Baymard é de comércio eletrônico; usamos a conclusão qualitativa sobre percepção de escopo, não transplantamos seus percentuais ou previsões de venda. [Baymard: amplitude na home](https://baymard.com/research-articles/inferring-product-catalog-from-homepage).
- **Detalhes sob demanda.** Opções avançadas e dúvidas ficam em seus produtos ou em perguntas expansíveis; condições essenciais do preço e do PC ligado permanecem visíveis. [NN/g: divulgação progressiva](https://www.nngroup.com/articles/progressive-disclosure/).
- **Movimento controlado.** A pessoa troca as perspectivas. Não há carrossel automático, sequestro de rolagem ou texto sumindo durante a leitura. [NN/g: problemas de carrosséis automáticos](https://www.nngroup.com/articles/auto-forwarding/).

## O que mudou em relação à conversa com Claude

Mantivemos a marca conectando os produtos, a assinatura unificada e o mundo próprio como prova concreta. Mudamos quatro decisões: não há sete telas de explicação obrigatórias; nenhum funil pressupõe que todos precisem criar servidor antes de participar; a home não se torna um painel de atalhos para quem já entrou; e a verificação do servidor não é vendida como se fosse um selo comprado.

Depois das respostas do usuário, o destino padrão de login passou a ser o catálogo, preservando o destino original quando existente. A interface de assinante na prévia é apenas uma ferramenta para avaliar os CTAs e o componente compartilhado de conta; não cria uma nova tela inicial autenticada.

## Arquitetura da experiência

1. **Primeiro contato:** proposta curta, entrada, assinatura e acesso gratuito. Um panorama com demonstrações selecionáveis dos três produtos.
2. **Primeira ação:** conhecer o aplicativo ou buscar servidores diretamente; acessar Community e ferramentas sem uma etapa intermediária obrigatória.
3. **Decisão comercial:** benefícios distribuídos pelos produtos, Pro em destaque e Team para maior capacidade. Anual informa o total cobrado e o equivalente mensal.
4. **Confiança:** mundo real próprio, explicação breve da relação com a empresa, suporte e condições acessíveis.
5. **Dúvidas:** respostas curtas às diferenças entre gratuito/pago, hospedagem local e conta compartilhada.

O cabeçalho mantém produtos reconhecíveis e entrada. A navegação móvel contém função junto do nome. Conteúdo público continua acessível sem login. Os destinos da prévia apontam para os produtos reais; a home de produção não é alterada.

## Catálogo e Community com mais conteúdo

A ausência temporária de volume não determina a identidade final. Com servidores autorizados e publicações adequadas, a perspectiva Minecraft poderá apresentar uma seleção pequena e variada, e Community poderá apresentar conteúdo público relevante. Isso deve manter a mesma área visual, sem transformar a home em outro feed infinito.

Para produção: usar os serviços existentes de catálogo e recomendação, respeitar moderação, privacidade, bloqueios, conteúdo removido e direitos de imagem; filtrar publicações automáticas de teste; manter uma rotação estável por janela, não a cada F5. Nunca inventar atividade online. Falha na consulta deve manter caminhos de navegação e um exemplo editorial real, sem renderizar um espaço vazio ou métricas antigas como atuais. Curadoria inicial pode coexistir com recomendação, desde que não seja anunciada como personalização quando não for.

## Engenharia e limites desta entrega

Protótipo estático, sem coleta de dados ou chamadas autenticadas, com fonte local, imagens existentes da Força Aliada, ícones SVG e animações leves. O menu de conta é o componente compartilhado do Manager, com adaptação de caminhos para a prévia. Funciona por teclado e respeita movimento reduzido. Conteúdo e links principais continuam disponíveis sem JavaScript.

Simulados e identificados: sessão/assinatura de exemplo, aplicativo e publicação ilustrativa. Preços refletem a página pública no momento da pesquisa. Não há pagamento, novo backend, alteração de sessão real nem redirecionamento global ativado.

Antes de substituir a home: aprovar direção e texto; conectar sessão e preços ao contrato existente; aplicar a regra de retorno ao login; fornecer seleções reais moderadas quando forem utilizadas; traduzir PT/EN/ES; substituir noindex por metadados/canonicals/hreflang de produção e integrar consentimento de medição existente. Essas são integrações posteriores de produção, não funcionalidades alegadas nesta prévia.

## Como saber se funciona de verdade

Em um teste com pessoas que não conhecem a marca, pedir que identifiquem o que a Força Aliada faz, o que é gratuito, onde o servidor roda e o que a assinatura acrescenta. Depois pedir três tarefas: encontrar onde jogar, conhecer o Manager e entender o plano anual. Observar hesitações, destino incorreto e expectativa errada, não apenas “gostou da cor?”.

Quando houver tráfego suficiente, acompanhar primeira ação útil, acessos ao Manager/catálogo/Community, contratação concluída e retorno. Segmentar por origem, dispositivo e visitante/usuário, com consentimento. Não otimizar somente cliques em planos se isso aumentar abandono ou confusão. Sem volume suficiente, usar entrevistas e testes moderados em vez de declarar vencedor de A/B com amostra pequena.

## Recursos de design

Foram consultados os recursos locais de estratégia, direção visual, padrões de interface e verificação. Também foi examinada a orientação pública [Frontend Design da Anthropic](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md); não houve necessidade de instalar pacotes desconhecidos. A identidade veio dos produtos existentes, do público e do conteúdo real, não de um template externo.
