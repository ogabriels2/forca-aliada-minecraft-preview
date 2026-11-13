# Força Aliada Minecraft

- Evolua o protótipo aprovado em produto. A interface principal é `app.mjs`, com seus componentes, wizard de seis etapas, edição direta, prateleiras e menus laterais existentes.
- Preserve direção de arte, estilos, composição e animações aprovadas. Integração de backend não autoriza redesenhar ou reduzir a interface, nem construir um frontend alternativo. `/beta/` apenas redireciona para a aplicação original.
- `directory-integration.mjs` conecta a API ao estado/renderização existente; `directory-client.mjs` cuida das requisições. Mantenha autenticação e persistência reais separadas dos dados explicitamente demonstrativos do catálogo/social/skins.
- A conta usa o mesmo `FAAccountMenu` e CSS aprovados no Manager. Sua fonte está no repositório privado do site em `assets/js/fa-account-menu.js` e `assets/css/fa-account-menu.css`. Sincronize por `scripts/sync-preview-account.mjs`; não desenvolva um segundo desenho de conta.
- Este repositório publica a prévia no GitHub Pages, separado do domínio principal. O backend dedicado de desenvolvimento usa banco e contas de teste próprios. Não misture credenciais/dados de produção nem publique segredos.
- Valide proporcionalmente ao que mudou. Para ajustes localizados, confira a sintaxe, o fluxo afetado e a interface em tamanho relevante. Preserve testes essenciais de autenticação, autorização, escrita e prevenção de perda de dados. Evite repetir auditorias, pesquisas e suítes amplas a cada ajuste visual.
- O objetivo é acelerar a construção do produto ainda não lançado, reaproveitando o que foi aprovado e sem representar funcionalidades simuladas como prontas.
