# Alterações de texto em relação à v3

Comparação dos textos do HTML, em ordem de leitura; sinais `-` indicam remoção e `+` adição. Extração automática inclui rótulos das interfaces demonstrativas. Textos mantidos não são reescritos para soar jovens.

As mudanças concentram-se na visão dos três produtos, recortes reais do Manager, exemplos do catálogo/editor/Community, faixa compacta do mundo e coluna gratuita dos planos. Permanecem a promessa do hero, a hierarquia de cadastro/planos, preços, condições e perguntas. A correção de direção de arte posterior não acrescentou promessas comerciais.

Mensagens dinâmicas acrescentadas: feedback de edição selecionada/nenhum servidor criado; endereço de exemplo copiado; favorito restrito à demonstração; cor alterada; estado de cobrança mensal/anual. A orientação Java/Bedrock/ambos reproduz a lógica do Manager.

```diff
--- home-v3/index.html
+++ home-v4/index.html
@@ -1,3 +1,3 @@
 Pular para o conteúdo
-Prévia da home · Variante 3
+Prévia da home · Variante 4
 Ver versão anterior
@@ -25,31 +25,46 @@
 Criar conta grátis
-Conhecer os planos
+Ver planos
 A plataforma é grátis para entrar.
 O Manager faz parte da assinatura.
-Força Aliada
-Manager
-Demonstração
-O mundo da turma
-Servidor de exemplo
-Pronto
-Endereço protegido
-sua-turma.play.forcaaliada.com
-Backup agendado
-Todos os dias, às 06h
-Console remoto
-Também no navegador
+Força Aliada Manager
+Visão geral
+Status e controles do servidor selecionado.
+Online
+Vale dos Aliados
+Um mundo para construir juntos.
+Java
+vale-demo.play.forcaaliada.com
+Disponível pela Internet · endereço de exemplo
+Último backup
+Hoje, 06:00
 Experimente a demonstração
-L
-R
-J
-O próximo encontro começa aqui.
-Servidor, amigos e chat na mesma plataforma.
+Interface demonstrativa
+Lia
+Community
+O mundo está pronto. Vamos?
 Um mundo real da Força Aliada
 Pausar movimento
-Uma conta
-para os três produtos
-Manager
-para Windows
+Tudo se encontra aqui.
+Três produtos. Uma conta Força Aliada.
+Manager
+Crie e cuide do seu servidor.
+Força Aliada Manager
+Vale dos Aliados
+Endereço para jogar
+Criar backup
+06:00
+Para Windows · incluído no Pro
 Minecraft
-Java e Bedrock
+Encontre onde jogar. Crie sua skin.
+Nome, IP ou estilo de jogo
+Servidores e skins
+Explore grátis
+Community
+Compartilhe. Converse. Fique perto.
+Lia
+Pro
+Participe grátis
+Seu perfil conecta os três.
+Pro e Team ampliam o que você pode fazer.
+Interfaces demonstrativas
 Força Aliada Manager
@@ -57,110 +72,198 @@
 começa no seu PC.
-Crie ou importe o servidor, compartilhe o endereço e cuide de tudo em um só aplicativo.
+Crie ou importe um servidor, compartilhe o endereço e cuide de tudo em um só aplicativo.
+Interface demonstrativa
+Força Aliada Manager
+Força Aliada
+Manager
+Vale dos Aliados
+Servidor de exemplo
+Servidor
+Visão geral
+Jogadores
+Terminal
+Gerenciar
+Agenda
+Arquivos e backups
+Mods e plugins
+Criar novo servidor
+1 de 3
+Como vocês vão jogar?
+Escolha a edição dos seus amigos. Nós preparamos o necessário.
+Edição do Minecraft na demonstração
+Java
+No computador
+Bedrock
+Celular e Windows
+As duas edições
+No mesmo mundo
+Paper · Recomendado
+Desempenho e plugins
+Vanilla
+Regras originais
+Continuar
+Recorte da primeira etapa. Nenhum servidor é criado nesta prévia.
+Visão geral
+Status e controles do servidor selecionado.
+Online
+Vale dos Aliados
+Um mundo para construir juntos.
+Java
+vale-demo.play.forcaaliada.com
+Disponível pela Internet · endereço de exemplo
+Último backup
+Hoje, 06:00
+Compartilhe o endereço. Seu IP fica protegido.
+Endereço fictício. O servidor roda no computador do dono.
+Terminal
+Acompanhe o servidor e execute comandos.
+Online
+[Server]
+Preparando o mundo…
+[Server]
+Mundo carregado.
+[Server]
+Servidor pronto.
+> save-all
+[Server]
+Mundo salvo.
+_
+Comando do servidor
+Logs demonstrativos. O console web também permite operar à distância.
+Agenda
+Automatize tarefas do seu servidor.
+Criar backup
+Usa as pastas de Arquivos e backups.
+06:00
+Todos os dias
+Reiniciar servidor
+Avisa antes de reiniciar.
+04:30
+Todos os dias
+Uma rotina definida. Menos tarefas para lembrar.
+Horários de exemplo. Backups usam as pastas configuradas no aplicativo.
+1
+Criar
+2
+Conectar
+3
+Operar
+4
+Programar
+Escolha uma etapa para explorar.
+PC ligado e conectado.
+Windows 10/11 · 64 bits.
+Incluído no Pro e Team. Não é hospedagem na nuvem.
+Ver planos
 Conhecer o Manager
-Incluído no Pro, a partir de R$ 29,90/mês.
-O PC precisa ficar ligado e conectado.
-1
-Instale e entre na sua conta.
-O Manager roda no Windows. Você usa seu computador para hospedar o mundo e a mesma conta para administrar.
-Ver download para Windows
-2
-Um mundo novo.
-Ou aquele que já é seu.
-Comece do zero ou conecte um servidor existente. Você escolhe o caminho; o aplicativo reúne a configuração.
-Java e Bedrock
-3
-Chame a turma.
-A rotina fica organizada.
-Compartilhe o endereço protegido, programe backups e acompanhe pelo console, mesmo longe do computador.
-Guia para começar
-Manager
-Prévia interativa
-Instalar
-Criar ou importar
-Compartilhar
-Seu PC. Seu servidor.
-Instale o Manager e conecte sua conta Força Aliada com Pro ou Team.
-Windows 10 ou 11, 64 bits
-Criação e importação no aplicativo
-Controle remoto pelo navegador
-Experimentar a criação
-É uma demonstração. Nada é instalado ou criado no seu computador.
-Como você quer começar?
-Escolha um caminho para experimentar.
-Um novo mundo
-Começar do zero
-Meu mundo atual
-Continuar a construção
-Na criação real, você escolhe a edição e configura seu mundo.
-Nome do servidor de exemplo
-Ver como fica
-No aplicativo, é possível começar do zero ou conectar um servidor existente.
-Pronto na demonstração
-Mundo da turma
-Endereço de exemplo
-sua-turma.play.forcaaliada.com
-Copiar exemplo
-Backup diário
-Agendado para 06h
-No aplicativo, compartilhe o endereço com quem vai jogar.
-Conhecer os planos
-Experimentar de novo
-Hospedado no seu PC, ligado e conectado.
-Ver a interface do aplicativo
 Força Aliada Minecraft
-Hoje vocês vão
-jogar onde?
-Encontre servidores pelo seu estilo, salve os favoritos e dê uma cara nova ao seu personagem.
-Explorar a plataforma
-Buscar servidores
-Buscar no catálogo de servidores
+Seu próximo mundo.
+Do seu jeito.
+Encontre um servidor por estilo de jogo, salve seus favoritos e leve sua própria skin.
+forcaaliada.com/minecraft
+Servidores
+Skins
+Sua biblioteca
+Favoritos
+Histórico
+Criar e publicar
+Criar página
+Servidores de Minecraft
+Encontre seu próximo mundo.
+Interface demonstrativa
+Buscar nos servidores de exemplo
+Buscar
+Estilo de jogo dos exemplos
+Todos
 Survival
 Criativo
-Minigames
-RPG
-Força Aliada
-Survival vanilla · Nosso servidor
+Aventura
+Exemplo
+V
+Vale dos Aliados
+Java e Bedrock
+Survival
+Exemplo
+A
+Ateliê
 Java
+Criativo
+Exemplo
+F
+Força Aliada
+Java e Bedrock
+Survival
+Exemplo
+V
+Vila das Pontes
 Bedrock
-Você pode explorar o catálogo antes de criar uma conta.
+Aventura
+Servidores ilustrativos; fotos do nosso mundo. Explore o catálogo para ver as páginas publicadas.
+Página básica grátis.
+Pro acrescenta capa ampliada e ícone em alta resolução.
+Explorar servidores
 Editor de skins
-Prévia visual
-Do seu jeito,
-bloco por bloco.
-Encontre uma skin, personalize no editor e compartilhe sua criação.
-Abrir editor de skins
-L
+Interface demonstrativa
+Vestir
+Pintar
+Rascunho local
+Modelo
+Clássico
+Gire para ver
+Pintar
+Pincel
+Cor da roupa
+Peças de textura
+PNG 64 × 64
+Skins e editor
+Crie uma skin
+com a sua cara.
+Escolha no catálogo, combine peças ou pinte direto no editor 3D.
+Órbita
+Aurora
+Trilha
+Criações originais para esta demonstração.
+Abrir editor grátis
+Ver skins
+Força Aliada Community
+O jogo acaba.
+A conversa continua.
+Compartilhe suas criações, acompanhe os amigos e continue a conversa pelo chat integrado.
+Seu perfil, com mais possibilidades.
+No Pro: selo, destaques e insights no Community.
+Entrar no Community
+Ver planos
+Publicações
+Mensagens
+Do perfil à conversa.
+9:41
+▰
+Community
+Para você
+Em alta
 Lia
-Publicação ilustrativa
-O caminho ficou pronto.
-Agora só falta combinar a próxima partida.
-R
-J
-A turma de sempre
-Conversa ilustrativa
-Ravi
-Vamos conhecer esse mundo?
-Júlia
-Manda o endereço!
-Lia
-Já salvei nos favoritos. Bora!
-Continuar a conversa de exemplo
-Força Aliada Community
-A partida acaba.
-O papo continua.
-Poste suas ideias, acompanhe os amigos e converse pelo chat integrado. Dentro e fora do Minecraft.
-Entrar no Community
-Seu perfil também tem personalidade.
-Pro e Team incluem selo, destaques e insights no Community.
+Pro
+@lia.exemplo
+···
+Uma rua nova, feita em boa companhia.
+Rui
+Gostei de como a praça ficou.
+Noa
+@noa.exemplo
+Os detalhes fazem parte da história.
+Rui
+Conversa demonstrativa
+Terminei a ponte. Quer ver?
+Quero! Já estou entrando.
+Te encontro na praça.
+Escreva uma mensagem
+Interface demonstrativa · perfis fictícios
+Feito com a Força Aliada
 A gente também
-joga por aqui.
-É no nosso servidor que usamos as ferramentas que criamos.
-Estas construções fazem parte desse mundo.
-Conhecer o servidor
-Uma cidade inteira para explorar
-Os detalhes pelo caminho
-Inspiração que vira construção
-Um ponto de encontro
-Espaço para o próximo projeto
-Explore as fotos
+constrói por aqui.
+Nosso pequeno servidor é onde usamos nossas próprias ferramentas.
+Conhecer nosso mundo
+Cidade central
+Ruas da segunda cidade
+Arte e arquitetura
+Prefeitura
 Uma assinatura.
@@ -168,5 +271,2 @@
 Manager, personalização da página do servidor e benefícios no Community. Escolha o espaço para sua equipe.
-Só quer jogar e encontrar sua turma?
-Explorar servidores, criar uma página básica, usar skins e participar do Community é grátis.
-Criar conta grátis
 Mensal
@@ -174,2 +274,15 @@
 O anual custa o equivalente a 10 mensalidades.
+Grátis
+Para jogar e participar
+Força Aliada
+R$
+0
+/mês
+Conta gratuita. Sem cartão.
+Explore, crie e compartilhe.
+Criar conta grátis
+Catálogo e página básica de servidor
+Catálogo e editor de skins
+Publicações, amigos e mensagens
+O uso do Manager requer Pro ou Team. O instalador não tem cobrança separada.
 Pro
@@ -188,3 +301,3 @@
 Endereço protegido, backups e automações
-Personalização avançada da página do servidor
+Capa ampliada e ícone em alta resolução
 Selo, destaques e insights no Community
@@ -207,3 +320,3 @@
 O Manager roda no seu PC, que precisa ficar ligado e conectado à internet. A assinatura não inclui hospedagem em nuvem.
-Valores de referência. No anual: Pro R$ 299/ano e Team R$ 799/ano.
+Cancele a renovação quando precisar. Valores de referência. No anual: Pro R$ 299/ano e Team R$ 799/ano.
 Preço, disponibilidade e condições são confirmados na contratação.
@@ -265,3 +378,3 @@
 Sobre esta prévia e fontes
-Variante independente; as demonstrações não criam servidores, não enviam mensagens e não acessam sua conta.
+Variante 4; as demonstrações não criam servidores, não enviam mensagens e não acessam sua conta.
 Pesquisa
```
