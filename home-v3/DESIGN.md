# Home v3 — jogar, criar, se encontrar

Modo: persuadir e encaminhar. Variante completa, não substituição da v2. A plataforma é o produto principal; Manager é o principal motivo comercial de assinatura; Community integra as relações. O mundo da empresa é exemplo de uso, não oferta principal.

## Sistema

- Grafite #151b20: estrutura e texto; papel #f7f8f5 e branco #fff: leitura e interfaces.
- Verde #43cd75 com texto #10251b: ações; azul #dceafb/#315d9d: descoberta; dourado #f0c45b/#785414: conversa e benefícios; Team usa violeta #7751c8 apenas no selo.
- Manrope local 400–800. Corpo 16–20px; apoio mínimo 13px; títulos 32–76px conforme espaço, entrelinha 1.05, tracking -0.045em; preços tabulares. Máximo de texto 65ch.
- Escala 4/8/12/16/24/32/48/64/96. Controle raio 10px, cartão 18px, moldura 24px. Linhas só para agrupar; nenhuma grade decorativa.
- Conteúdo até 1280px, abertura até 1440px, cena sem margens. Verde não tinge a fotografia.
- Movimento de entrada 720ms transform, conteúdo presente desde primeiro paint. Cena lenta 28s, pausável. Ações 180–320ms. Sem scroll artificial. Pausar em aba oculta, fora do hero, economia de dados e movimento reduzido.

## Wireframes antes da construção

```text
HEADER  marca | Manager Community Minecraft Assinatura Empresa | idioma conta cadastro
HERO    [ CIDADE REAL DE PONTA A PONTA.................................]
        [ promessa curta             app Manager legível             ]
        [ explicação dos 3 produtos   nome / endereço / backup         ]
        [ criar conta / planos        experimente a demonstração      ]
        [ uso grátis + Manager pago   fotografia com crédito          ]
FATOS   gratuito para entrar | Manager para Windows | Java e Bedrock
MANAGER título/aviso-PC/preço | demo sticky, 3 etapas operáveis
        instalar             | [instalação/novo/importar/compartilhar]
        criar/importar       | [mesma interface, nenhuma captura mini]
        compartilhar         | [endereço e backup com feedback real  ]
MINECRAFT   título+busca; uma composição assimétrica:
            [ servidor real largo + estilos ] [ skin/editor alto ]
COMMUNITY   [ feed visual + conversa sobreposta ]  título/explicação/acesso
GALERIA     título curto → faixa nativa de 5 fotos reais → página do servidor
PLANOS      gratuito separado | mensal/anual | Pro + Team | aviso de PC
FAQ         título/ajuda | perguntas nativas empilhadas
FECHAMENTO  [ foto de rua ] chamada de cadastro e acesso ao Discord
FOOTER      produtos, ajuda, empresa, redes, idioma, termos e independência
MOBILE      cabeçalho compacto; hero texto→demo→fatos; tudo empilhado;
            galeria arrastável; preços sem tabela larga; footer completo.
```

## Crítica prévia

Não usar cena escura sozinha: ela confunde produto com servidor. Não usar três cartões de produto pastel iguais. Não usar faixas vazias para criar falsa sofisticação. Não colocar réplica de 1440px dentro de 400px. Não usar imagem gerada de cidade ou retratos como se fossem usuários reais. A demo não consulta computador nem cria servidor. As falas são exemplos, nunca depoimentos.

Discord é acesso de comunidade e suporte informal, não substitui Community nem promete atendimento imediato. A seção de planos explica grátis versus assinatura antes de comparar preços. O idioma leva às páginas públicas existentes, não finge traduzir a variante. Ver PESQUISA.md para as decisões fundamentadas e VALIDACAO.md para os testes realmente executados.
