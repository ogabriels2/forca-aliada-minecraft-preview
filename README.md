# Força Aliada Minecraft — desenvolvimento

A aplicação original está na raiz deste repositório e é a base do produto. O catálogo, o criador em seis etapas, a edição na página, as ferramentas e os menus preservam a interface aprovada.

`directory-integration.mjs` conecta login, páginas e rascunhos à API de desenvolvimento, sem substituir os componentes existentes. O menu de conta é o componente compartilhado aprovado no Manager.

O ambiente ainda contém servidores, perfis e funcionalidades demonstrativos identificados como exemplos. Login e páginas usam contas de teste e banco separado da produção. Ícone, capa e galeria agora são enviados à Cloudinary, persistidos na conta e recuperados ao reabrir o criador ou a página. Imagens de rascunhos ficam privadas; remover uma imagem não apaga arquivos ainda usados pela versão publicada.

O criador retoma a etapa salva, preserva as etapas já liberadas e permite abrir uma página concluída diretamente no editor original. A visualização como visitante usa o próprio rascunho, sem liberar sua publicação. O menu da conta e os estilos aprovados permanecem os mesmos.

`/beta/` redireciona para a raiz; a interface reduzida criada anteriormente deixou de ser o caminho de desenvolvimento.
