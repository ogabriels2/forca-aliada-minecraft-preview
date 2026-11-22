# Força Aliada — home v4

[Abrir a prévia](https://ogabriels2.github.io/forca-aliada-minecraft-preview/home-v4/) · [Versão anterior preservada](https://ogabriels2.github.io/forca-aliada-minecraft-preview/home-v3/)

Revisão de apresentação de 22/11/2026. Evolução da v4 aprovada: abertura mais compacta, prioridade para cadastro, interface real do Manager e skins Minecraft 64×64. Público jovem, sem estética infantil. Produção, catálogo, v2 e v3 preservados.

## Executar

Servir a raiz do repositório por HTTP e abrir /home-v4/. Sem build, credenciais, autenticação real ou rastreamento.

- `index.html`, `home.css`, `v4.css`, `refinement.css`: base, conteúdo e direção visual.
- `presentation.css/js`: enquadramento, apresentação dos produtos e entradas animadas.
- `home.js`: navegação, conta compartilhada e feedback.
- `motion.js`: movimento reduzido, pausa, visibilidade e economia de dados.
- `demos.js`: busca, favoritos, Community, planos e galeria.
- `manager/`: exportação pública do HTML/CSS do aplicativo. Apenas scripts demonstrativos, sem Electron ou ponte nativa.
- `skin-textures.js`, `skin-demo.js`: texturas originais 64×64, renderização 3D, pintura, desfazer e PNG.
- `vendor/`: visualizador já usado na plataforma; licenças MIT incluídas.
- `shared/`: menu de conta aprovado, idêntico à v3.

## Interações disponíveis

Manager: navegação, editar nome/MOTD, iniciar/parar estado fictício, terminal local (`list`, `help`, `save-all`), backup ilustrativo, campos de configuração, pausa de ações e busca nas listas. Operações exclusivas do aplicativo instalado mostram aviso. O demonstrador não é o aplicativo completo e não cria servidores ou arquivos no PC.

Skins: três desenhos originais, rotação por arraste/setas/teclado, cores, pintura por pixel no modelo 3D, histórico de desfazer e download PNG 64×64. O arquivo é real; nenhuma skin da conta é alterada. Sem WebGL, permanece a prévia 2D com cores e download.

Catálogo: quatro exemplos, busca/filtros e favoritos locais. Community: feed, curtir, comentário e mensagens que ficam somente na demonstração. Galeria ampliada, planos mensal/anual, FAQ, menu mobile e conta fictícia continuam disponíveis.

Os ciclos param fora da tela, com a aba inativa, movimento reduzido ou economia de dados. Há um único botão compacto de pausa geral. Os controles específicos ficam dentro do produto. Sem JavaScript, cadastro, links, navegação, FAQ e imagens continuam disponíveis; as demonstrações interativas não funcionam.

## Antes da home oficial

Aprovação visual; sessão verdadeira preservando o componente aprovado; preços/benefícios vinculados à oferta; tradução; metadados e indexação definitivos; validação de compreensão e conversão com pessoas externas. `noindex` permanece na prévia. Consulte DESIGN, CAPTURAS, CREDITOS, PESQUISA e VALIDACAO.
