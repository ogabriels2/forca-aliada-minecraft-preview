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
Manager     campo verde claro / janela escura / quatro etapas e controles
Minecraft   branco / navegador de catálogo / busca, filtros e favoritos
Skins       branco / editor 3D à esquerda / catálogo e acesso à direita
Community   papel quente / benefício social à esquerda / telefone à direita
Caso real   faixa escura curta / fotos do mundo usado pela própria equipe
Planos      branco / Grátis, Pro, Team / preço e capacidade explícitos
FAQ         papel claro / dúvidas de uso e cobrança
Fechamento  fotografia e cadastro / rodapé completo
```

No celular, o hero empilha os elementos, a visão de produtos conserva miniaturas ao lado da explicação, as etapas têm abas 2×2 e a janela mostra somente o recorte útil. Os planos formam uma coluna. Nenhum texto essencial depende de hover. A expansão teatral de cartões foi reduzida a elevação da prévia: mantém previsibilidade e evita a estética infantil apontada pelo usuário.

## Movimento com função

A abertura conserva profundidade e deslocamento fotográfico discreto. A janela do Manager se endireita ao entrar em cena; as etapas demonstram criar, conectar, operar e programar. O catálogo alterna busca, filtro e favorito. O Community demonstra feed e mensagem. A skin gira e muda de cor quando acionada. Trocas usam CSS/WAAPI, sem vídeo ou WebGL obrigatório e sem rolagem sequestrada.

Ciclos só executam visíveis, com aba ativa e sem foco de edição. Interação manual pausa a demonstração correspondente. Há pausa geral e local. Preferência de movimento reduzido e economia de dados desligam os ciclos. Isso também evita que a página dispute atenção enquanto a pessoa lê ou usa controles.

## Texto que deve permanecer explícito

Preço, total anual, capacidades, necessidade do PC ligado, ausência de hospedagem, diferenciação entre grátis e assinatura, e indicação de dados demonstrativos. Esses fatos não podem ser substituídos por símbolos. Ícones acompanham ações e rótulos; controles universais isolados recebem nome acessível e foco visível.

Não afirmar que os recortes HTML são o aplicativo completo. O Manager real tem etapas adicionais e o terminal local não é o console remoto. CAPTURAS.md registra os recortes e limitações.
