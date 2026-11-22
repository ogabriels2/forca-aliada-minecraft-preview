# Direção final — home v4

21/11/2026. Modo da superfície: apresentação e decisão. O visitante deve reconhecer os produtos, entender a conta gratuita e encontrar a assinatura sem perder acesso direto ao que já usa.

## Correção de direção

O primeiro desenho da v4 aplicava verde, azul e ouro em grandes cartões, com contornos pesados, sombras duras e inclinação. O dono apontou corretamente o efeito infantil e a perda de unidade. Esta revisão substitui essa aplicação, preservando a composição do hero e as demonstrações. O plano inicial permanece no histórico de trabalho; não é a referência visual vigente.

Branco e grafite dominam. Verde identifica a Força Aliada e as ações principais. Azul apoia descoberta/editor; ouro aparece na experiência social e na assinatura. Cor não precisa preencher cada seção nem todo botão. Fotografias e interfaces reais também fazem parte da paleta.

## Tokens e composição

| Papel | Decisão |
|---|---|
| Marca e leitura | Grafite #151b20, branco, papel #f7f8f5 |
| Ação principal | Verde #43cd75 com texto escuro #10251b |
| Manager | Campo #eaf2eb; interface escura, detalhes verdes |
| Minecraft/skins | Seção branca, azul em detalhes de interface, editor violeta claro |
| Community | Papel quente #f6f3e9 e campo dourado localizado atrás do telefone |
| Planos | Grátis neutro, Pro ouro discreto, Team roxo com contraste corrigido |
| Tipo | Manrope local; texto 16–18px, auxiliar >=13px; Segoe UI no recorte do aplicativo |
| Espaço | 4/8/12/16/24/32/48/64/88; conteúdo até 1280px; margem móvel 16–20px |
| Forma | Bordas de 1px, raio 9px nas ações e 12–16px nas janelas; sombra suave localizada |
| Movimento | Feedback 160–240ms; entrada da janela 950ms; ciclos espaçados e pausáveis |

Uma segunda fonte foi descartada: escala, peso e a interface nativa já fornecem contraste suficiente. O verde dos botões fica restrito às decisões principais. Ações secundárias usam grafite ou links. O ouro não transforma todos os elementos do Community em destaque.

```
Cabeçalho   marca / acesso direto aos produtos / entrar e criar conta
Hero        fotografia própria + promessa / Manager legível + conversa curta
Produtos    três áreas brancas / miniaturas de interfaces / uma conta
Manager     campo verde claro / janela escura / DOM nativo interativo e acesso aos planos
Minecraft   branco / navegador de catálogo / busca, filtros e favoritos
Skins       branco / editor 3D à esquerda / catálogo e acesso à direita
Community   papel quente / benefício social à esquerda / telefone à direita
Caso real   faixa escura curta / fotos do mundo usado pela própria equipe
Planos      branco / Grátis, Pro, Team / preço e capacidade explícitos
FAQ         papel claro / dúvidas de uso e cobrança
Fechamento  fotografia e cadastro / rodapé completo
```

No celular, o hero empilha os elementos, a visão de produtos conserva miniaturas ao lado da explicação, a janela do aplicativo usa navegação interna compacta. Os planos formam uma coluna. Nenhum texto essencial depende de hover. A expansão teatral de cartões foi reduzida a elevação da prévia: mantém previsibilidade e evita a estética infantil apontada pelo usuário.

## Movimento com função

A abertura conserva profundidade e deslocamento fotográfico discreto. A janela do Manager se endireita ao entrar em cena; a janela do hero alterna visão geral, terminal e arquivos. O catálogo alterna busca, filtro e favorito. O Community demonstra feed e mensagem. A skin gira e muda de cor quando acionada. Trocas usam CSS/WAAPI, com WebGL carregado apenas para o editor e alternativa 2D e sem rolagem sequestrada.

Ciclos só executam visíveis, com aba ativa e sem foco de edição. Interação manual pausa a demonstração correspondente. Há uma pausa geral compacta; controles repetidos de reprodução foram retirados. Preferência de movimento reduzido e economia de dados desligam os ciclos. Isso também evita que a página dispute atenção enquanto a pessoa lê ou usa controles.

## Texto que deve permanecer explícito

Preço, total anual, capacidades, necessidade do PC ligado, ausência de hospedagem, diferenciação entre grátis e assinatura, e indicação de dados demonstrativos. Esses fatos não podem ser substituídos por símbolos. Ícones acompanham ações e rótulos; controles universais isolados recebem nome acessível e foco visível.

A exportação nativa preserva a interface, mas suas operações são demonstrativas. O terminal local não é o console remoto. CAPTURAS.md registra os recortes e limitações.

## Revisão de apresentação após avaliação da v4

Direção autorizada: a home é apresentação e convencimento, não um painel de operação. Reduzir título do hero de ~80px para 58–62px, estreitar a coluna editorial e ampliar a cena do produto. Manter cadastro verde como ação dominante; animação de entrada conduz da promessa ao botão, sem pulsação permanente. Identificadores de produto e condições permanecem claros.

Substituir o Manager aproximado pela exportação pública do HTML/CSS reais, interativa e isolada; os comandos nunca acessam o PC ou a rede de produção. Skins passam a texturas Minecraft 64×64 originais, renderizadas pelo mesmo visualizador 3D usado no editor do catálogo, com pintura e download local. Remover controles repetidos de reprodução; conservar um comando compacto de movimento sem ocupar uma faixa de layout. Ritmo e paleta aprovados permanecem.

## Critério final de apresentação — 22/11/2026

O título ocupa menos espaço e a ação de cadastro tem mais respiro. A imagem de fundo continua evidência própria, não o produto principal. A janela real do Manager substitui a interpretação aproximada. No hero ela apresenta; na seção do produto ela pode ser experimentada. A ausência de gráficos inventados não é preenchida com números artificiais.

Substituições visuais: modelos 3D e amostras reais de skins, paleta de cores, ícones de pintar/girar/desfazer/download, reação visual ao favorito, selos e capacidades dos planos. A navegação entre feed e conversa fica no próprio telefone, não na área de convencimento. Preço, cobrança, PC ligado e diferença entre grátis/pago continuam escritos: omiti-los reduziria a clareza.

Uma única pausa ocupa 44px no canto. Entradas finitas usam transform/opacity; o cadastro recebe um reflexo inicial breve, sem pulsação permanente. Hero alterna telas reais, catálogo demonstra busca/filtro/favorito e Community demonstra feed/conversa. Interação manual interrompe o ciclo correspondente. Não há controle de rolagem nem animação necessária para acessar conteúdo.


## Refinamento de composição — 22/11/2026

A direção permanece. As miniaturas dos três produtos compartilham uma mesma linha de base no desktop/tablet, e o Community conserva sua fotografia no celular. Os filtros da demonstração não alteram a altura do conteúdo; o visitante pode limpar a busca e a categoria numa única ação. Links internos descontam o cabeçalho fixo.

A comparação de planos usa três colunas acima de 1000px. Entre 761 e 1000px, a conta gratuita ocupa uma faixa horizontal e Pro/Team ficam lado a lado; no celular, os três ficam em coluna, com espaçamentos mais compactos. Símbolos repetidos do bloco grátis são dispensados nas telas menores, preservando a lista completa de benefícios. Preços, limites, cobrança e requisitos do PC continuam explícitos.

Os ícones de interface usam formas familiares e traço uniforme. O monitor identifica o Manager, o bloco identifica Minecraft e a camiseta identifica skins. Os servidores de exemplo usam iniciais discretas. Community e Team conservam seus símbolos aprovados, e o cartão do servidor da equipe usa o brasão com o selo dourado.

O painel lilás da demonstração de skins usa a cor da vitrine do catálogo real. A janela do editor é mais clara e as opções de visual ficam junto da apresentação. Vestir, Pintar, Desfazer e Baixar PNG ficam na mesma barra. A paleta indica se altera a roupa ou o pincel. A skin de Gabalarca tem um link para a publicação original. No celular, a ordem é apresentação, visuais, janela e links dos produtos.
