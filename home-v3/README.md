# Força Aliada — variante 3 da home

Proposta independente em `/home-v3/`, baseada no brief de 16/11/2026. A versão `/home-v2/` foi preservada integralmente no commit `58ae71a`. Esta pasta não substitui a home principal nem altera o catálogo Minecraft.

## Abrir

Prévia pública: https://ogabriels2.github.io/forca-aliada-minecraft-preview/home-v3/

Versão preservada: https://ogabriels2.github.io/forca-aliada-minecraft-preview/home-v2/

HTML, CSS e JavaScript estáticos. Nenhum build ou instalação é necessário. Servir a raiz do repositório com qualquer servidor estático e abrir `/home-v3/`.

- `index.html`: conteúdo semântico, navegação, produtos, planos e perguntas.
- `home.css`: sistema visual, sete faixas responsivas, animações nativas e redução de movimento.
- `home.js`: demonstração do Manager, galeria, preços, skins, conversa e adaptador do menu aprovado.
- `shared/`: cópia sem alteração do componente de conta da v2/Manager.
- `media/`: imagens próprias responsivas, fonte local e créditos.
- `PESQUISA.md`: fontes e decisões; `DESIGN.md`: plano visual e wireframes; `VALIDACAO.md`: evidências e limites; `CREDITOS.md`: direitos e proveniência.

## O que é funcional

Navegação desktop/móvel, links reais dos produtos, busca encaminhada ao catálogo, categorias, demo instalar/criar/importar/compartilhar, nome demonstrativo editável, cópia do endereço fictício, simulação de backup, três visuais de skin, conversa ilustrativa expansível, galeria com scroll e lightbox nativo, mensal/anual com total explícito, FAQ e menu compartilhado de conta. O cenário tem pausa e respeita redução de movimento, economia de dados, visibilidade da aba e saída da primeira seção.

As demonstrações não fazem instalações, não criam servidores, não enviam mensagens, não modificam skins e não acessam sessão de produção. O controle “Assinante de exemplo”, no rodapé, só demonstra o componente aprovado; sair retorna ao modo visitante. Os CTAs levam à produção, sem concluir cadastro, assinatura ou pagamento.

Sem JavaScript, o conteúdo e links principais continuam disponíveis, inclusive navegação móvel, FAQ, fotos, oferta mensal e totais anuais. A busca aprimorada depende de script; sem ele, é substituída por um acesso direto ao catálogo. A navegação por categorias continua disponível. Interações exclusivas da demo ficam ocultas. Nenhuma animação é condição para leitura.

## Publicação definitiva

Ainda depende de aprovação da direção, integração à sessão real sem trocar o menu, oferta por contrato/API, tradução completa, decisão de indexação e validação comercial com pessoas que não conhecem a marca. A variante não tem medição; caso seja adicionada, definir base legal/consentimento antes. Firefox e WebKit devem ser verificados antes da promoção à home principal. Não interpretar Lighthouse ou a pesquisa de referências como prova de conversão ou garantia de ausência de bugs.

## Decisões deliberadas

Fotografia real em vez de uma cena WebGL obrigatória: atende ao brief desta variante, melhora a primeira carga e conserva o foco no software. Manrope permanece como única família. Nada de carrossel automático, bibliotecas de animação, contagens inventadas, depoimentos fictícios ou imagens geradas.

O seletor de idiomas informa que esta variante é portuguesa e oferece acesso às páginas existentes do Manager em inglês/espanhol; não promete uma home traduzida inexistente. Login sem destino específico segue para `/minecraft`. O retorno de cada fluxo deve ser preservado na integração de produção.
