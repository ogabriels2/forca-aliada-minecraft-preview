import { createCreationsClient } from "./creations-client.mjs?v=moderation-20261113";

const reasons = {
  rights: "Uso sem autorização",
  inappropriate: "Conteúdo impróprio",
  other: "Outro motivo",
};

export function createCreationModeration({ main, dialog, esc, icon, paintIcons, openDialog, closeDialog, toast, getUser, signIn }) {
  const api = createCreationsClient();
  let generation = 0;

  function report(item) {
    if (!getUser()) {
      openDialog('<h2 id="dialog-title">Entre para denunciar</h2><p>Envie sua denúncia à equipe da Força Aliada.</p><button type="button" class="button" data-report-sign-in>Entrar na conta</button>');
      dialog.querySelector("[data-report-sign-in]").addEventListener("click", () => { closeDialog(); signIn(); });
      return;
    }
    const user = getUser().id;
    openDialog(`<h2 id="dialog-title">Denunciar ${esc(item.name)}</h2><form data-creation-report>
      <label class="field"><span>Motivo</span><select name="reason" required><option value="">Selecione</option>${Object.entries(reasons).map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}</select></label>
      <label class="field"><span>Detalhes para a equipe (opcional)</span><textarea name="detail" maxlength="500" rows="3"></textarea></label>
      <p data-error class="invalid-box" role="alert" hidden></p>
      <div class="dialog-actions"><button type="button" class="button secondary" data-action="close-dialog">Cancelar</button><button class="button" type="submit">Enviar denúncia</button></div>
    </form>`);
    const form = dialog.querySelector("[data-creation-report]");
    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (getUser()?.id !== user) { closeDialog(); return; }
      const submit = form.querySelector('[type="submit"]');
      if (submit.disabled) return;
      const fields = new FormData(form);
      const error = form.querySelector("[data-error]");
      error.hidden = true;
      submit.disabled = true;
      try {
        await api.report(item, fields.get("reason"), fields.get("detail"));
        if (!form.isConnected || !dialog.open || getUser()?.id !== user) return;
        closeDialog();
        toast("Denúncia enviada à equipe.");
      } catch (failure) {
        if (!form.isConnected || !dialog.open) return;
        error.textContent = failure.message;
        error.hidden = false;
      } finally { submit.disabled = false; }
    });
  }

  async function reportHistory() {
    openDialog('<h2 id="dialog-title">Minhas denúncias</h2><div data-report-history role="status">Carregando…</div>');
    const content = dialog.querySelector("[data-report-history]");
    const identity = getUser()?.id;
    const active = () => content.isConnected && dialog.open && getUser()?.id === identity;
    const labels = {pending:"Em análise",closed:"Encerrada",hidden:"Criação ocultada",restored:"Criação restaurada"};
    try {
      const { rows } = await api.myReports();
      if (!active()) return;
      content.removeAttribute("role");
      content.innerHTML = rows.length ? `<ul class="creation-report-history">${rows.map(row => `<li><strong>${esc(row.name)}</strong><span>${reasons[row.reason] || "Outro motivo"}</span><small>${labels[row.status] || "Em análise"}</small></li>`).join("")}</ul>` : "<p>Você ainda não enviou denúncias.</p>";
    } catch (failure) {
      if (active()) content.textContent = failure.message;
    }
  }

  async function queue(appeals = false) {
    const request = ++generation;
    const shell = document.createElement("section");
    shell.className = "container server-section directory-review-queue";
    shell.innerHTML = `<a class="text-link" href="#/revisoes">${icon("arrow-left")} Revisão de servidores</a><h1>${appeals ? "Contestações de skins e roupas" : "Denúncias de skins e roupas"}</h1><a class="text-link" href="#/revisoes/criacoes${appeals ? "" : "/contestacoes"}">${appeals ? "Ver denúncias" : "Ver contestações"}</a><div data-queue role="status">Carregando…</div>`;
    main.replaceChildren(shell);
    paintIcons(shell);
    const body = shell.querySelector("[data-queue]");
    const active = () => shell.isConnected && request === generation;
    try {
      const { rows } = await (appeals ? api.appeals() : api.reports());
      if (!active()) return;
      body.removeAttribute("role");
      body.innerHTML = rows.length ? rows.map(row => `<article class="notice creation-review">
        <h2>${esc(row.name)}</h2><p>${row.kind === "part" ? "Peça" : "Skin"} de ${esc(row.publisher)}${!appeals ? ` · versão ${row.reportedRevision}` : ""}</p>
        ${!appeals && row.openReports > 1 ? `<p>${row.openReports} denúncias em aberto sobre esta versão. Ao ocultá-la, elas recebem o mesmo desfecho.</p>` : ""}
        <p><strong>${reasons[row.reason] || "Outro motivo"}</strong>${row.detail ? ` · ${esc(row.detail)}` : ""}</p>
        ${appeals ? `<p><strong>Decisão anterior</strong> · ${esc(row.previousNote || "")}</p><p><strong>Contestação do autor</strong> · ${esc(row.message)}</p><img width="128" alt="Textura da criação ocultada" src="data:image/png;base64,${esc(row.texture)}">` : row.canHide ? `<a class="text-link" href="${api.textureUrl(row)}" target="_blank" rel="noopener">Conferir PNG da versão denunciada</a>` : "<p>A versão denunciada já mudou ou saiu do catálogo.</p>"}
        <form data-review-id="${esc(row.id)}"><label class="field"><span>${appeals ? "Resposta ao autor" : "Motivo da decisão (interno)"}</span><textarea name="note" maxlength="500" rows="2" required></textarea></label>
        ${!appeals && row.canHide ? '<label class="field"><span>Explicação ao autor, caso oculte</span><textarea name="authorNotice" maxlength="500" rows="2"></textarea></label>' : ""}
        <p data-error class="invalid-box" role="alert" hidden></p><div class="dialog-actions">
        ${appeals ? '<button type="submit" value="uphold" class="button secondary">Manter oculta</button><button type="submit" value="restore" class="button">Restaurar criação</button>' : '<button type="submit" value="dismiss" class="button secondary">Encerrar denúncia</button>'}
        ${!appeals && row.canHide ? '<button type="submit" value="hide" class="button">Ocultar criação</button>' : ""}
        </div></form></article>`).join("") : `<p>Nenhuma ${appeals ? "contestação" : "denúncia"} pendente para sua conta.</p>`;
      body.addEventListener("submit", async event => {
        event.preventDefault();
        const form = event.target;
        const row = rows.find(item => item.id === form.dataset.reviewId);
        if (!row || !event.submitter || form.dataset.busy) return;
        const buttons = [...form.querySelectorAll("button")];
        const error = form.querySelector("[data-error]");
        form.dataset.busy = "true";
        buttons.forEach(button => { button.disabled = true; });
        error.hidden = true;
        try {
          const review = appeals ? api.reviewAppeal : api.reviewReport;
          const decision = event.submitter.value;
          const notice = decision === "hide" ? form.elements.authorNotice.value.trim() : undefined;
          if (decision === "hide" && !notice) throw Error("Explique ao autor por que a criação será ocultada.");
          await review(row, decision, form.elements.note.value.trim(), notice);
          if (active()) { toast("Decisão registrada."); void queue(appeals); }
        } catch (failure) {
          if (active()) { error.textContent = failure.message; error.hidden = false; }
        } finally {
          delete form.dataset.busy;
          buttons.forEach(button => { button.disabled = false; });
        }
      });
    } catch (failure) {
      if (!active()) return;
      body.textContent = failure.status === 403 ? "Esta área é reservada à equipe." : failure.message;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "text-link";
      button.textContent = failure.status === 401 ? "Entrar na conta" : "Atualizar fila";
      if (failure.status !== 403) {
        button.addEventListener("click", failure.status === 401 ? signIn : () => void queue(appeals));
        shell.append(button);
      }
    }
  }
  async function ownDecisions(anchor) {
    const identity = getUser()?.id;
    if (!identity || !anchor) return;
    const section = document.createElement("section");
    section.className = "container server-section";
    anchor.before(section);
    const active = () => section.isConnected && getUser()?.id === identity;
    async function load() {
      try {
        const {rows} = await api.myModeration();
        if (!active()) return;
        section.hidden = !rows.length;
        section.innerHTML = rows.length ? `<h2>Decisões sobre suas criações</h2>${rows.map(row => `<article class="notice creation-review">
          <h3>${esc(row.name)}</h3>
          <p>${row.decision === "restore" ? "Restaurada" : row.decision === "uphold" ? "Ocultação mantida" : row.appealedAt ? "Contestação em análise" : "Ocultada pela equipe"} · ${reasons[row.reason] || "Outro motivo"}</p>
          ${row.authorNotice ? `<p>${esc(row.authorNotice)}</p>` : ""}
          ${row.response ? `<p><strong>Resposta à contestação</strong> · ${esc(row.response)}</p>` : ""}
          ${row.state === "hidden" && !row.appealedAt ? `<details><summary>Contestar decisão</summary><form data-appeal-id="${esc(row.id)}"><label class="field"><span>O que a equipe deve reconsiderar?</span><textarea name="message" maxlength="500" rows="3" required></textarea></label><p data-error role="alert" hidden></p><button class="button" type="submit">Enviar contestação</button></form></details>` : ""}
        </article>`).join("")}` : "";
      } catch {
        if (!active()) return;
        section.hidden = false;
        section.innerHTML = '<button class="text-link" type="button">Tentar carregar decisões de moderação</button>';
        section.querySelector("button").addEventListener("click", load);
      }
    }
    section.addEventListener("submit", async event => {
      event.preventDefault();
      const form = event.target;
      const button = form.querySelector("button");
      if (!active() || button.disabled) return;
      button.disabled = true;
      const error = form.querySelector("[data-error]");
      error.hidden = true;
      try {
        await api.appeal(form.dataset.appealId, form.elements.message.value.trim());
        if (active()) { toast("Contestação enviada à equipe."); await load(); }
      } catch (failure) {
        if (active()) { error.textContent = failure.message; error.hidden = false; }
      } finally { button.disabled = false; }
    });
    await load();
  }
  return { report, queue, ownDecisions, reportHistory };
}
