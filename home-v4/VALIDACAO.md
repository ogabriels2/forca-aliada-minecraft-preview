# Validação da home v4

21/11/2026. Registro do que foi executado; não é certificação, teste de conversão ou garantia de perfeição. Prévia isolada, sem alterações em produção, v2, v3 ou aplicação Minecraft.

## Primeira revisão — construção e responsividade

1. Grandes cartões verde/azul/ouro competiam com a marca. Convertidos em áreas brancas com interface e pequenos acentos por produto.
2. Sombras duras nos botões deixavam o desenho infantil. Removidas; mantido feedback discreto de pressão.
3. Bordas de 2px e raios excessivos repetiam a mesma linguagem em todas as seções. Reduzidos, preservando a diferença entre app, navegador, editor e telefone.
4. Adesivos e inclinações decorativas do Community distraíam. Removidos; telefone e fundo dourado localizado organizam a composição.
5. Criação do Manager cortava conteúdo no celular. Altura e distribuição dos campos corrigidas em 320/390px.
6. Amostras de cor do editor eram comprimidas por uma regra genérica. Grade corrigida com alvos de 44px.
7. Quarto servidor desaparecia em 1024px mesmo sendo resultado de um filtro. Grade passa a duas colunas nessa faixa, sem ocultar resultados.
8. Link de checkout anual usava yearly, mas o produto espera annual. Corrigido.
9. Recortes herdados e créditos ainda citavam skins baseadas em Steve. PNGs removidos da variante e procedência atualizada para geometria original.
10. Documentação copiada da v3 e plano visual inicial não representavam a entrega. Reescritos para o escopo real e a correção posterior do dono.

Evidências locais: r1/r2-{320,390,768,1024,1440,1920,2560}.png e section-{1440,390}-*.png em home-research/v4. As imagens iniciais são registros históricos, não o resultado final.

## Segunda revisão — uso, contraste e semântica

1. Painéis de abas usavam article com role tabpanel incompatível. Substituídos por contêineres apropriados.
2. Título de janela no hero saltava a hierarquia de headings. Convertido em texto de interface, mantendo o título principal da página.
3. Fotos da galeria repetiam a legenda no alt. Descrições visuais específicas substituem a duplicação.
4. Controles de pausa continuavam aparecendo quando o sistema já desabilitava movimento. Agora desaparecem nesse estado.
5. Pausa geral podia deixar o ponteiro animado terminar seu ciclo. Animação em andamento é cancelada na pausa.
6. Escolher Bedrock mantinha as opções Paper/Vanilla de Java. A demonstração agora segue a orientação real por edição do Manager.
7. A criação excedia em 12px a altura reservada numa tela intermediária. Corrigida a altura desktop e conferidas sete larguras.
8. Legenda do trilho de etapas tinha contraste 4,3:1 no fundo novo. Cor escurecida.
9. Extremo claro do selo Team não atingia 4,5:1 com texto branco. Gradiente ajustado; contraste manual e automatizável revisados.
10. Indicadores de tarefa ativa usavam aria-label num span sem papel adequado. Marcados como representações de estado, sem fingir que são switches operacionais.

## Verificações executadas

- Chromium/Edge, Firefox e WebKit em perfis isolados: 22 verificações de fluxos por motor passaram; sem erros JavaScript. Abas/setas/Home/End, foco, cópia com fallback, pesquisa vazia e com resultado, filtro, favorito, cor e rotação, feed/chat/curtir/comentar, mensal/anual, galeria/Escape/foco, conta de exemplo e drawer móvel.
- Axe no fluxo móvel: zero violações, 52 verificações aprovadas nos três motores. No desktop, todos os quatro painéis do Manager passaram após correções.
- 320, 390, 768, 1024, 1440, 1920 e 2560px: sem transbordamento da página; quatro servidores disponíveis; conteúdo da criação cabe na janela.
- Sem JavaScript em 390px: quatro etapas visíveis, cadastro acessível, menu e FAQ funcionando, sem transbordamento.
- Movimento reduzido: não avança automaticamente. Pausa geral mantém o hero parado; Manager visível avança, fora da tela para; economia de dados desliga ciclos.
- Sintaxe dos três módulos conferida. Menu compartilhado comparado por hash à v3. Arquivos e âncoras locais auditados.
- Detector visual executado uma vez. Corrigidos os achados reais de contraste. Avisos de padding de seções ignoram o contêiner interno; imagem do lightbox recebe src ao abrir; estilos herdados não usados/ sobrescritos geram outros alertas estáticos. A decisão usa também a renderização e axe, não apenas esse detector.

## Desempenho

Primeira medição local móvel com servidor Python sem compressão: **92 desempenho / 100 acessibilidade / 100 boas práticas**; LCP 3,10s; CLS 0; TBT 6ms; transferência total observada 386KiB. Ainda não atingia o critério de LCP local. A medição da versão publicada e eventuais correções serão registradas abaixo.

## Limites reais

WebKit foi testado no Windows; isso não equivale a testar um iPhone físico. Não houve teste com participantes externos, leitor de tela humano, medição de conversão ou INP de campo. Lighthouse é uma medição de laboratório com rede/CPU simuladas. Axe sem violações não certifica WCAG completa. Áreas demonstrativas não substituem testes do backend dos produtos.

Antes da produção: aprovação visual, sessão real, contrato da oferta, tradução, decisão de indexação e validação de compreensão com usuários. Não há rastreamento instalado nesta prévia.
