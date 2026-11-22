# Interface pública de demonstração

Esta pasta contém uma captura estrutural da interface do aplicativo `forca-aliada-manager`, preparada em 5 de novembro de 2026. O HTML e os estilos em `source/` vêm do aplicativo do proprietário deste site. As telas simplificadas da apresentação anterior foram substituídas por essa estrutura para manter a aparência da navegação, visão geral, terminal, jogadores, agenda, arquivos, recursos, acessos e configurações.

O HTML foi preparado localmente a partir de `index.html` e das rotinas de apresentação `manager-ui.js`, `agenda-model.js`, `agenda-workspace.js`, `files-workspace.js`, `extensions-workspace.js`, `server-update-view.js` e `account-sharing.js`. Os scripts originais e seus eventos inline foram retirados da captura. O site não executa Electron, não expõe uma ponte nativa e não consulta conta, rede de servidores ou arquivos do visitante. `preview.js` aplica somente estados ilustrativos à interface; `preview-data.js` contém as views de compartilhamento com dados sintéticos.

As adaptações da exportação pública ficam em `preview.css`: dimensões, contraste dos textos auxiliares, avatar ilustrativo, linhas de log, diálogo informativo e recortes legíveis até 760 px. O modo móvel usa o mesmo DOM do aplicativo, prioriza identidade/endereço, jogadores e agenda e não representa um aplicativo móvel nativo. A janela desktop completa continua disponível no zoom. O enquadramento e o zoom do iframe pertencem a `assets/css/manager-scenes.css` e `assets/js/manager-live-demo.js`, fora do estilo do aplicativo.

Os dados são fictícios: Vale dos Aliados, Arquiteta, Mineiro e Jardineira; endereços e caminhos são exemplos. O estado do processo Minecraft é separado da conexão do PC. Recursos da biblioteca não podem ser ativados/desativados durante a execução. Os comandos do terminal são interpretados apenas na página, com saída textual segura. As outras ações explicam sua disponibilidade no aplicativo.

`source.json` registra os arquivos de origem e seus hashes. Atualizações futuras devem exportar novamente a estrutura do aplicativo e preservar esse isolamento. Esta exportação é um ativo versionado do site; não altera o repositório do aplicativo.

As fontes Minecraft vêm de `IdreesInc/Minecraft-Font`, sob SIL Open Font License 1.1. A atribuição e o texto completo estão em `source/assets/fonts/minecraft/LICENSE`. O ícone Força Aliada e as capturas do Minecraft já pertenciam aos projetos do proprietário. Não foram utilizados recursos visuais de Hostinger, Raycast ou Discord.

## Adaptação para home-v4 — 22/11/2026

Nesta variante, o enquadramento fica em ../presentation.css/js. embed.css/js adicionam navegação interna móvel e edição de nome/MOTD, sem alterar source/*.css. preview.js não inventa atividade periódica; métricas sem sessão são traços. As ações locais permanecem isoladas por CSP (connect-src none e form-action none). O iframe permite eventos de formulário para a edição local, mas não envia dados.
