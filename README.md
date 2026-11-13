# Força Aliada Minecraft — desenvolvimento

A aplicação original está na raiz deste repositório e é a base do produto. O catálogo, o criador em seis etapas, a edição na página, as ferramentas e os menus preservam a interface aprovada.

`directory-integration.mjs` conecta login, páginas e rascunhos à API de desenvolvimento, sem substituir os componentes existentes. O menu de conta é o componente compartilhado aprovado no Manager.

O ambiente ainda contém servidores, perfis e funcionalidades demonstrativos identificados como exemplos. Login e páginas usam contas de teste e banco separado da produção. Ícone, capa e galeria agora são enviados à Cloudinary, persistidos na conta e recuperados ao reabrir o criador ou a página. Imagens de rascunhos ficam privadas; remover uma imagem não apaga arquivos ainda usados pela versão publicada.

O criador retoma a etapa salva, preserva as etapas já liberadas e permite abrir uma página concluída diretamente no editor original. A visualização como visitante usa o próprio rascunho, sem liberar sua publicação. O menu da conta e os estilos aprovados permanecem os mesmos.

O percurso de publicação foi validado com o servidor real da Força Aliada: confirmação temporária no MOTD, envio por uma conta, revisão completa por outra e acesso público sem login. A equipe usa `#/revisoes`, com a versão exata enviada, fotos e orientações ao criador. A API impede a aprovação da própria página e de versões alteradas depois da submissão.

Páginas aprovadas entram primeiro nas recomendações e nas categorias existentes. A seção exclusiva “Publicados na Força Aliada” aparece a partir de três páginas, preservando o equilíbrio da home quando há poucas publicações. Busca e paginação consultam a API, preservam todos os filtros disponíveis e descartam respostas de buscas antigas. Os exemplos do protótipo continuam identificados. Páginas aprovadas como “apenas por link” abrem pelo endereço direto, sem entrar no catálogo. Entrar na conta, sozinho, não cria um rascunho.

Verificação local da coordenação da busca: `node tests/directory-catalog.test.mjs`. A consulta de status respeita o limite publicado pelo [mcstatus.io](https://mcstatus.io/docs) e não representa o número de jogadores demonstrativo como atividade real.

`/beta/` redireciona para a raiz; a interface reduzida criada anteriormente deixou de ser o caminho de desenvolvimento.
