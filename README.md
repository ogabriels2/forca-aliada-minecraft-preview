# Força Aliada Minecraft — desenvolvimento

A aplicação original está na raiz deste repositório e é a base do produto. O catálogo, o criador em seis etapas, a edição na página, as ferramentas e os menus preservam a interface aprovada.

`directory-integration.mjs` conecta login, páginas e rascunhos à API de desenvolvimento, sem substituir os componentes existentes. O menu de conta é o componente compartilhado aprovado no Manager.

O ambiente ainda contém servidores, perfis e funcionalidades demonstrativos identificados como exemplos. Login e páginas usam contas de teste e banco separado da produção. Ícone, capa e galeria agora são enviados à Cloudinary, persistidos na conta e recuperados ao reabrir o criador ou a página. Imagens de rascunhos ficam privadas; remover uma imagem não apaga arquivos ainda usados pela versão publicada.

O criador retoma a etapa salva, preserva as etapas já liberadas e permite abrir uma página concluída diretamente no editor original. A visualização como visitante usa o próprio rascunho, sem liberar sua publicação. O menu da conta e os estilos aprovados permanecem os mesmos.

O percurso de publicação foi validado com o servidor real da Força Aliada: confirmação temporária no MOTD, envio por uma conta, revisão completa por outra e acesso público sem login. A equipe usa `#/revisoes`, com a versão exata enviada, fotos e orientações ao criador. A API impede a aprovação da própria página e de versões alteradas depois da submissão.

Páginas aprovadas entram primeiro nas recomendações e nas categorias existentes. A seção exclusiva “Publicados na Força Aliada” aparece a partir de três páginas, preservando o equilíbrio da home quando há poucas publicações. Busca e paginação consultam a API, preservam todos os filtros disponíveis e descartam respostas de buscas antigas. Os exemplos do protótipo continuam identificados. Páginas aprovadas como “apenas por link” abrem pelo endereço direto, sem entrar no catálogo. Entrar na conta, sozinho, não cria um rascunho.

Verificação local da coordenação da busca: `node tests/directory-catalog.test.mjs`. A consulta de status respeita o limite publicado pelo [mcstatus.io](https://mcstatus.io/docs) e não representa o número de jogadores demonstrativo como atividade real.

`/beta/` redireciona para a raiz; a interface reduzida criada anteriormente deixou de ser o caminho de desenvolvimento.

## Skins e guarda-roupa

- Skins e peças agora são persistidas na conta, com visibilidade privada, pública por link ou pública no catálogo/perfil. `#/minhas-skins` reúne a coleção e suas peças; `#/perfil/USUARIO/skins` mostra somente as publicações listadas. O editor continua usando a interface aprovada.
- O guarda-roupa começa com 15 peças autorais. Em `#/skins/roupas`, visitantes podem buscar por nome ou criador, filtrar por categoria, tipo e modelo e experimentar uma peça no editor. As peças publicadas pela comunidade vêm da API do beta. Modelos antigos ficam disponíveis apenas para recuperar um rascunho que já os usava. Importar uma skin não publica nada; a extração de uma peça mostra o recorte, permite incluir a camada base e mantém os créditos. A contribuição pública é uma escolha separada.
- PNGs mantêm os pixels, transparência, dimensão e modelo. Peças só podem ocupar a região UV da sua categoria. Não passam pela compressão de fotos. São texturas pequenas, limitadas a 32 KB após validação, guardadas com seus metadados no banco existente: até 50 criações por conta e mil neste beta, sem novo serviço pago.
- Edição/exclusão verificam dono e versão; favoritos de criações são sincronizados na conta. Rascunhos antigos do navegador não são enviados automaticamente para outro usuário.
- Importar a skin da conta Java e aplicar uma skin usam as conexões Microsoft existentes e exigem a conta correta. A aplicação tem confirmação explícita e preserva clássico/slim. Uma skin privada não precisa ser publicada para aplicar: somente o Minecraft recebe uma URL de textura válida por 60 segundos, vinculada à imagem e à versão.
- **Acesso ao beta:** o login Força Aliada está ativo para a conta piloto. A conexão Microsoft Java e a importação real foram verificadas nesse perfil. A troca efetiva no jogo ainda requer validação com consentimento do dono.

A validação cobre persistência PostgreSQL, privacidade entre contas, PNG/alpha, direitos/créditos, revisões, exclusão, máscaras UV e confirmação de conta/modelo. O percurso de navegador usou o armazenamento real, perfil público, download e outra pessoa vestindo uma peça publicada, em desktop/mobile. Antes de abrir cadastros, faltam ampliar o acesso unificado além da conta piloto e estabelecer moderação, denúncias e políticas de publicação.
