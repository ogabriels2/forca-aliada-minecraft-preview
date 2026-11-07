// First reference page. It deliberately has no editor bindings: its content and
// composition must be reviewed before they become builder capabilities.
export function officialPage(d, { icon, connection, gallery }) {
  return `<article class="official-server"><nav class="container official-breadcrumb" aria-label="Caminho"><a href="#/">Servidores de Minecraft</a>${icon("chevron-right")}<span>Força Aliada</span></nav>
  <section class="official-hero"><img class="official-landscape" src="./shared/images/hero.webp" alt="Vista do mundo da Força Aliada, com suas cidades e construções" width="1920" height="1080" fetchpriority="high"><div class="official-hero-shade"></div><div class="container official-hero-copy"><div class="official-wordmark"><img src="./shared/images/fa-icon-dark.png" alt="" width="36" height="44"><strong>Força Aliada</strong><span>Servidor da Força Aliada</span></div><h1>Um mundo inteiro.<br>Com espaço para você.</h1><p>Survival vanilla com farms, cidades e caminhos construídos em comunidade.</p><div class="official-hero-actions"><button class="button" data-action="page-section" data-id="section-connect">Quero jogar ${icon("arrow-right")}</button><button class="button secondary" data-action="page-section" data-id="official-world">Conhecer o mundo ${icon("arrow-down")}</button></div></div><div class="official-photo-credit">Construções reais do nosso servidor</div></section>
  <div class="container server-play-band">${connection(d)}</div>
  <div class="official-principles"><div class="container"><span><strong>Survival vanilla</strong>Sobreviva, construa e explore.</span><span><strong>Java + Bedrock</strong>No computador e no celular.</span><span><strong>Cidades conectadas</strong>Transportes que interligam o mundo.</span></div></div>
  <section class="container official-world" id="official-world"><div class="official-section-heading"><h2>Farms, cidades<br>e caminhos entre elas.</h2><p>Farms bem planejadas, cidades cheias de detalhes e caminhos que conectam tudo. Um mundo construído por quem joga, para continuar sendo explorado.</p></div><div class="official-stories"><div class="official-story-nav" role="tablist" aria-label="Conheça o mundo"><button id="world-tab-0" role="tab" aria-selected="true" aria-controls="world-story" data-official-story="0"><strong>Construa em boa companhia.</strong><span>Encontre seu lugar entre projetos pequenos e grandes ideias.</span>${icon("arrow-right")}</button><button id="world-tab-1" role="tab" aria-selected="false" tabindex="-1" aria-controls="world-story" data-official-story="1"><strong>Faça as coisas funcionarem.</strong><span>Farms, infraestrutura e aquela satisfação de ver tudo pronto.</span>${icon("arrow-right")}</button><button id="world-tab-2" role="tab" aria-selected="false" tabindex="-1" aria-controls="world-story" data-official-story="2"><strong>Vá além da sua base.</strong><span>Conheça cidades, construções e os caminhos entre elas.</span>${icon("arrow-right")}</button></div><figure id="world-story" role="tabpanel" aria-labelledby="world-tab-0"><img src="./shared/images/galeria10.webp" alt="Construções do mundo da Força Aliada" width="960" height="540"><figcaption>Construções feitas por quem joga aqui.</figcaption></figure></div></section>
  <section class="official-gallery-section"><div class="container"><div class="official-section-heading"><h2>É melhor ver<br>com os próprios olhos.</h2><p>Imagens do mundo em que a gente joga. Abra as capturas para ver de perto as construções, os detalhes e as ideias da comunidade.</p></div>${gallery(d)}</div></section>
  <section class="container official-entry"><div class="official-entry-copy"><h2>O próximo passo<br>é dentro do jogo.</h2><p>Você não precisa assinar a Força Aliada nem instalar o Manager para jogar. Tenha uma edição compatível do Minecraft e confira as orientações de entrada.</p><p class="official-content-note">Algumas áreas do mundo têm humor sarcástico e referências adultas. Considere isso ao decidir se a experiência combina com você.</p><ol class="official-steps"><li><strong>Escolha sua edição.</strong><span>Java no computador ou Bedrock em dispositivo compatível.</span></li><li><strong>Adicione o endereço.</strong><span>No Bedrock, informe também a porta 19132. As opções variam por plataforma.</span></li><li><strong>Conheça o lugar.</strong><span>Veja as regras, encontre a comunidade e escolha por onde começar.</span></li></ol><a class="text-link" href="https://discord.gg/xZmRkB7PWd" target="_blank" rel="noopener">Confirmar orientações com a equipe ${icon("external-link")}</a></div></section>
  <section class="official-community"><div class="container"><div><h2>O melhor do mundo<br>é quem está nele.</h2><p>Combine uma sessão, mostre uma construção ou encontre gente para tirar uma ideia do papel. A conversa continua fora do Minecraft também.</p><div class="official-community-actions"><a class="button" href="https://discord.gg/xZmRkB7PWd" target="_blank" rel="noopener">${icon("brand-discord")} Encontrar a comunidade</a><a class="text-link" href="https://forcaaliada.com/community" target="_blank" rel="noopener">Conhecer a Community ${icon("external-link")}</a></div></div><div class="official-community-photo"><img src="./shared/images/galeria19.webp" alt="Mais uma das construções no servidor Força Aliada" width="800" height="450" loading="lazy"><span>Seu próximo projeto pode fazer parte desse mundo.</span></div></div></section>
  <section class="container official-faq"><div><h2>Antes de entrar.</h2><p>O essencial, sem complicar.</p></div><div><details><summary>O servidor tem proteção de terrenos ou sistemas de claims?</summary><p>Não. A proposta é survival vanilla, sem proteções de terreno adicionadas por plugins. Conheça as orientações da comunidade e converse com a equipe antes de começar um projeto.</p></details><details><summary>Posso jogar pelo Java e pelo Bedrock?</summary><p>Sim. Confira a edição na área de conexão. O Bedrock usa o mesmo endereço, com a porta 19132. Em consoles, adicionar servidores externos pode exigir opções que não estão disponíveis em todos os dispositivos.</p></details><details><summary>Preciso pagar ou usar o Manager?</summary><p>O acesso ao jogo não depende de assinar ou instalar o Manager. A assinatura Força Aliada e o aplicativo são produtos separados.</p></details><details><summary>Qual é o estilo da comunidade?</summary><p>Construção, farms e infraestrutura têm bastante espaço por aqui. O mundo também tem humor sarcástico e referências para adultos em algumas áreas. Tenha isso em conta ao decidir se a experiência combina com você.</p></details><details><summary>Quais versões são aceitas?</summary><p>A compatibilidade muda conforme o servidor é atualizado. Consulte a equipe no Discord para confirmar a versão antes de entrar. A área de conexão consulta a disponibilidade de cada edição. O status pode levar alguns instantes para refletir uma mudança.</p></details></div></section>
  <section class="official-last"><div class="container"><h2>Venha conhecer.<br>Depois, faça parte.</h2><button class="button" data-action="page-section" data-id="section-connect">Ver como entrar ${icon("arrow-right")}</button></div></section><div class="container official-platform-credit"><span>Página de referência em desenvolvimento · dados de conexão aguardam confirmação.</span><a href="https://forcaaliada.com/manager" target="_blank" rel="noopener">Tem seu próprio servidor? Conheça o Manager ${icon("external-link")}</a></div></article>`;
}

export function bindOfficialStories(root) {
  const stories = [
    [
      "./shared/images/galeria10.webp",
      "Construções do mundo da Força Aliada",
      "Construções feitas por quem joga aqui.",
    ],
    [
      "./shared/images/galeria14.webp",
      "Construções, cultivo e infraestrutura no mundo da Força Aliada",
      "Cultivo, construções e infraestrutura no mesmo lugar.",
    ],
    [
      "./shared/images/galeria26.webp",
      "Caminhos entre construções no servidor Força Aliada",
      "Caminhos que levam de um projeto ao próximo.",
    ],
  ];
  function select(button) {
    const row = stories[Number(button.dataset.officialStory)];
    if (!row) return;
    root.querySelectorAll("[data-official-story]").forEach((b) => {
      b.setAttribute("aria-selected", String(b === button));
      b.tabIndex = b === button ? 0 : -1;
    });
    const panel = root.querySelector("#world-story");
    panel.setAttribute("aria-labelledby", button.id);
    const image = panel.querySelector("img");
    image.src = row[0];
    image.alt = row[1];
    panel.querySelector("figcaption").textContent = row[2];
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
      image.animate(
        [
          { opacity: 0.45, transform: "scale(1.025)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: 240, easing: "cubic-bezier(.16,1,.3,1)" },
      );
  }
  root.querySelectorAll("[data-official-story]").forEach((button) => {
    button.addEventListener("click", () => select(button));
    button.addEventListener("keydown", (e) => {
      if (
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        ![
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "Home",
          "End",
        ].includes(e.key)
      )
        return;
      e.preventDefault();
      const all = [...root.querySelectorAll("[data-official-story]")],
        n = all.indexOf(button),
        index =
          e.key === "Home"
            ? 0
            : e.key === "End"
              ? 2
              : (n + (["ArrowDown", "ArrowRight"].includes(e.key) ? 1 : 2)) % 3;
      all[index].click();
      all[index].focus();
    });
  });
}
