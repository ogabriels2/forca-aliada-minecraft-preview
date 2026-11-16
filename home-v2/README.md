# Nova home da Força Aliada

Protótipo público isolado em `/home-v2/`. Não modifica a aplicação Minecraft da raiz, a prévia antiga em `/home/` ou a home do domínio principal.

- `index.html`, `home.css`, `cinema.css`, `platform-home.css`, `home.js`: interface e comportamentos da prévia.
- `src/`, `hero-campaigns.js`, `build/`: cena 3D, demonstração de skins, movimentos e destaques por ocasião. `npm ci && npm run build` atualiza os módulos publicados; nomes com hash evitam versões antigas no cache.
- `HERO-3D.md`, `REVISAO.md`: execução da arte, critérios de composição e hierarquia de produto.
- `ESTRATEGIA.md` / `estrategia.html`: pesquisa, alternativas, critérios, limites e recomendação.
- `PRODUCT.md` / `BRIEF.md`: escopo confirmado e direção de produto/arte.
- `DESIGN.md` / `.impeccable/design.json`: sistema visual observado na entrega.
- `shared/`: componente de conta aprovado do Manager. A única adaptação interna é resolver sua folha de estilo relativamente ao próprio script. O adaptador da home resolve os links para produção e fornece uma conta explicitamente fictícia.
- `media/`: imagens próprias existentes e fonte Manrope com licença. Os WebP têm arquivos de origem `.json`; o PNG inclui metadados. `avatar-demo.svg` é um monograma autoral para a conta demonstrativa, não uma pessoa real.

Abra com qualquer servidor estático. Exemplo: `python -m http.server 8876 --bind 127.0.0.1` na raiz do repositório e acesse `/home-v2/`.

## O que funciona nesta prévia

Cenário 3D real de duas cidades com quatro enquadramentos; pausa e exploração sem sobreposição de texto; imagens alternativas quando 3D não estiver disponível; destaques editoriais por ocasião; demonstração de skin com troca de roupa e giro; navegação móvel; funções ilustrativas do Manager; busca e estilos com destino no catálogo real; comparação mensal/anual; seleção visual de visitante/assinante; menu compartilhado de conta; interface do Manager ampliada; perguntas expansíveis; movimento reduzido.

Não há autenticação ou pagamento na prévia. Links abrem produtos reais, e `Entrar` aponta ao login de produção com retorno para `/minecraft`. O seletor superior só muda a demonstração visual. A regra global de retorno para o destino anterior é uma decisão documentada para a implementação de produção, não foi alterada nesta entrega.

Não há rastreadores, analytics, cookies publicitários, conteúdo privado ou credenciais. Fontes, bibliotecas e imagens são locais. `noindex,nofollow` é intencional. O mundo original não é alterado nem disponibilizado; somente dois recortes arquitetônicos simplificados são publicados.

## Verificação

Ver `VALIDACAO.md` para o alcance dos testes e suas limitações. Aprovação visual e teste com pessoas que não conhecem a marca ainda são necessários para validar a proposta comercial; inspeção técnica não demonstra conversão.
