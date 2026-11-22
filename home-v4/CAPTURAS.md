# Origem e fidelidade das demonstrações

Atualizado em 22/11/2026. Nenhuma conta real, credencial ou mensagem privada foi usada na entrega.

## Manager

O clone autorizado do aplicativo, commit 6745fc6 (2.4.18), foi consultado para entender a interface. O código privado não é distribuído. A pasta `manager/` reaproveita a [exportação estrutural pública do site](https://forcaaliada.com/assets/manager-native/): DOM e estilos reais, com estado fictício. A fonte original e hashes estão em `manager/source.json`.

Adaptações da v4: caminhos relativos, enquadramento, navegação compacta no celular, semântica/contraste, edição local de nome/MOTD e desativação dos ciclos que inventavam entradas de jogadores. Latência, TPS e tempo de sessão não são apresentados como medições reais. O hero mostra a janela completa em escala; abaixo, a janela pode ser usada e ampliada em outra aba.

Terminal e backups alteram somente a demonstração. Configurações do Windows, instalação, autenticação, criação efetiva, compartilhamento e rotinas reais exigem o aplicativo. A política de conteúdo bloqueia conexões e envios de formulário. Não há ponte Electron, acesso ao disco ou chamadas de produção.

## Skins e editor

Órbita, Aurora e Trilha usam texturas originais no padrão Minecraft 64×64 e proporções corretas de cabeça, tronco, braços e pernas. `skinview3d`, Three.js e skinview-utils vêm do mesmo visualizador usado pelo catálogo; licenças incluídas. Carregamento próximo da seção, renderização pausada fora da tela, densidade limitada.

Pintar e baixar produzem PNG válido, sem aplicar à conta. Esse recorte não substitui o editor completo do catálogo. PNGs frontais servem de alternativa estática. Não há geometria CSS fingindo ser uma skin.

## Outros materiais

Fotos: capturas do próprio mundo, sem adição de construções. Catálogo: quatro exemplos identificados. Community: anatomia do produto com personagens SVG fictícios e mensagens locais; nenhuma notificação real. Interfaces públicas foram conferidas em navegador isolado, sem publicar fotos ou perfis de terceiros.

Capturas de revisão, relatórios e pesquisas ficam no diretório local `home-research/v4`. Não foi gravado um vídeo do ciclo real de instalação nem aberta uma sessão remota autenticada. O menu de conta é o componente aprovado no Manager, sem redesenho.
