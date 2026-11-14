import { createCreationsClient } from "./creations-client.mjs?v=reports-20261113";

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

  async function queue() {
    const request = ++generation;
    const shell = document.createElement("section");
    shell.className = "container server-section directory-review-queue";
    shell.innerHTML = `<a class="text-link" href="#/revisoes">${icon("arrow-left")} Revisão de servidores</a><h1>Denúncias de skins e roupas</h1><div data-queue role="status">Carregando denúncias…</div>`;
    main.replaceChildren(shell);
    paintIcons(shell);
    const body = shell.querySelector("[data-queue]");
    const active = () => shell.isConnected && request === generation;
    try {
      const { rows } = await api.reports();
      if (!active()) return;
      body.removeAttribute("role");
      body.innerHTML = rows.length ? rows.map(row => `<article class="notice creation-review">
        <h2>${esc(row.name)}</h2><p>${row.kind === "part" ? "Peça" : "Skin"} de ${esc(row.publisher)} · versão denunciada ${row.reportedRevision}</p>
        <p><strong>${reasons[row.reason] || "Outro motivo"}</strong>${row.detail ? ` · ${esc(row.detail)}` : ""}</p>
        ${row.canHide ? `<a class="text-link" href="${api.textureUrl(row)}" target="_blank" rel="noopener">Conferir PNG da versão denunciada</a>` : "<p>A versão denunciada já mudou ou saiu do catálogo.</p>"}
        <form data-review-id="${esc(row.id)}"><label class="field"><span>Motivo da decisão (interno)</span><textarea name="note" maxlength="500" rows="2" required></textarea></label>
        <p data-error class="invalid-box" role="alert" hidden></p><div class="dialog-actions">
        <button type="submit" value="dismiss" class="button secondary">Encerrar denúncia</button>
        ${row.canHide ? '<button type="submit" value="hide" class="button">Ocultar criação</button>' : ""}
        </div></form></article>`).join("") : "<p>Nenhuma denúncia pendente para sua conta.</p>";
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
          await api.reviewReport(row, event.submitter.value, form.elements.note.value.trim());
          if (active()) { toast("Decisão registrada."); void queue(); }
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
        button.addEventListener("click", failure.status === 401 ? signIn : queue);
        shell.append(button);
      }
    }
  }
  return { report, queue };
}
