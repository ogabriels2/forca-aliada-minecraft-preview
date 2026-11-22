(() => {
  'use strict';
  // Native HTML/CSS snapshot; synthetic state only. No Electron bridge or network.
  const q = (selector) => document.querySelector(selector);
  const byId = (id) => document.getElementById(id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const names = ['Arquiteta', 'Mineiro', 'Jardineira'];
  let online = true,
    playing = false,
    visible = true,
    phase = 0,
    timer;
  let current = [],
    uptime = 0;
  const history = [0, 0, 1, 1, 1, 2, 3, 1, 0, 0, 1, 1, 2, 1, 0, 0, 1];
  const sequence = [[0], [0, 1], [0, 1, 2], [1, 2], [2], [], [0, 2]];
  set('saasOverviewServer', 'Vale dos Aliados');
  set('saasActiveServerName', 'Vale dos Aliados');
  set('saasActiveServerMeta', 'Java · servidor de exemplo');
  const nativeIcon = byId('saasOverviewIdentityIcon');
  if (nativeIcon) {
    nativeIcon.innerHTML = '<img src="../media/server-thumb.webp" alt="">';
    nativeIcon.hidden = false;
    nativeIcon.style.display = 'block';
    nativeIcon.nextElementSibling &&
      (nativeIcon.nextElementSibling.hidden = true);
  }
  byId('saasActiveServerIcon').innerHTML =
    '<img src="../media/server-thumb.webp" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:4px">';
  byId('saasOverviewPing').dataset.quality = 'good';
  byId('tpsBadge').className = 'tps-badge status-online';
  function set(id, value) {
    const el = byId(id);
    if (el) el.textContent = value;
  }
  function tell(message) {
    parent.postMessage(
      { type: 'manager-preview', event: 'activity', message },
      location.origin,
    );
  }
  function info(
    title,
    text = 'Para usar este recurso, abra o Manager no Windows.',
  ) {
    setDialog(title, text);
  }
  function setDialog(title, text) {
    const dialog = byId('previewDialog');
    if (!dialog.open) dialogOpener = dialogTrigger || document.activeElement;
    q('[data-preview-dialog-title]').textContent = title;
    q('[data-preview-dialog-copy]').textContent = text;
    if (!dialog.open) dialog.showModal();
    parent.postMessage({ type: 'manager-preview', event: 'notice' }, location.origin);
  }
  let dialogOpener, dialogTrigger;
  const previewDialog = byId('previewDialog');
  document.addEventListener('click', (event) => {
    if (!event.target.closest('#previewDialog'))
      dialogTrigger = event.target.closest('button,[role="button"]');
  }, true);
  const closeInfo = () => previewDialog.close();
  previewDialog.querySelectorAll('[data-preview-dismiss]').forEach((button) =>
    button.addEventListener('click', closeInfo),
  );
  previewDialog.addEventListener('close', () => {
    if (dialogOpener?.isConnected) dialogOpener.focus({ preventScroll: true });
    dialogOpener = undefined;
  });
  previewDialog.addEventListener('click', (event) => {
    if (event.target !== previewDialog) return;
    const box = previewDialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right ||
        event.clientY < box.top || event.clientY > box.bottom) closeInfo();
  });
  const face = (id) =>
    `<svg class="preview-player-face" viewBox="0 0 8 8" aria-hidden="true"><path fill="${['#b97655', '#c58b68', '#e9b295'][id]}" d="M0 0h8v8H0z"/><path fill="#e9b295" d="M1 2h6v6H1z"/><path fill="${['#71442f', '#423527', '#ab6a32'][id]}" d="M0 0h8v2H3v1H1v2H0z"/><path fill="#fff" d="M1 4h2v1H1zm4 0h2v1H5z"/><path fill="#3a4d4c" d="M2 4h1v1H2zm3 0h1v1H5z"/><path fill="#a8664a" d="M3 6h2v1H3z"/></svg>`;
  function drawChart() {
    const canvas = byId('playerHistoryChart');
    if (!canvas) return;
    const r = canvas.getBoundingClientRect(),
      dpr = devicePixelRatio || 1;
    if (!r.width || !r.height) return;
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const w = r.width,
      h = r.height,
      pad = 16;
    ctx.strokeStyle = 'rgba(180,190,180,.12)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(pad, (h * i) / 4);
      ctx.lineTo(w - pad, (h * i) / 4);
      ctx.stroke();
    }
    ctx.font = '13px Segoe UI';ctx.fillStyle='#ababab';
    ctx.fillText('Sem jogadores neste exemplo',pad,h/2);
  }

  function renderPlayers() {
    const target = byId('onlinePlayersSidebar');
    target.innerHTML = current.length
      ? current
          .map(
            (id) =>
              `<div class="online-player-item">${face(id)}<div class="online-player-info"><span class="online-player-name">${names[id]}</span><span class="online-player-session">${id + 1} min</span></div></div>`,
          )
          .join('')
      : '<div class="online-player-empty">Pronto para receber jogadores.<br>Compartilhe o endereço do servidor.</div>';
    set('onlinePlayersCount', current.length);
    set('playerCount', current.length);
    set('saasOverviewPlayerCount', current.length + ' / 20');
    set('playersOnlineCount', current.length);
    document.querySelectorAll('[data-preview-player]').forEach((row) => {
      const id = Number(row.dataset.previewPlayer);
      row.querySelector('[data-presence]').textContent = current.includes(id)
        ? 'Online agora'
        : 'Desconectado';
      row
        .querySelector('[data-presence]')
        .classList.toggle('status-online', current.includes(id));
    });
  }
  function render() {
    const badge = byId('serverStatusBadge');
    badge.className =
      'status-badge ' + (online ? 'status-online' : 'status-offline');
    badge.innerHTML =
      '<span class="status-dot"></span>' + (online ? 'Online' : 'Offline');
    for (const id of [
      'workspaceServerState',
      'saasOverviewStatus',
      'navServerSummary',
    ])
      byId(id).dataset.state = online ? 'online' : 'offline';
    byId('workspaceServerState').lastChild.textContent = online
      ? 'Online'
      : 'Offline';
    byId('saasOverviewStatus').querySelector('span').textContent = online
      ? 'Online'
      : 'Desligado';
    byId('navServerSummary').querySelector('strong').textContent = online
      ? 'Servidor ligado'
      : 'Servidor desligado';
    byId('navServerSummary').querySelector('small').textContent = online
      ? 'Online'
      : 'Offline';
    byId('ctrlStopped').style.display = online ? 'none' : '';
    byId('ctrlRunning').classList.toggle('hidden', !online);
    set(
      'uptimeLabel',
      '—',
    );
    set('tpsDisplay', '—');
    set('saasOverviewPingValue', '—');
    byId('tpsBadge').style.display = 'none';
    document
      .querySelectorAll('[data-preview-resource]')
      .forEach((b) => (b.disabled = online));
    renderPlayers();
    drawChart();
    updateShareState();
  }
  function updateShareState() {
    document.querySelectorAll('.fa-share-server').forEach((row) => {
      if (!row.querySelector('[data-share-local]')) return;
      const status = row.querySelector('.fa-share-status');
      if (status)
        status.innerHTML =
          '<span class="fa-share-dot ' +
          (online ? 'online' : '') +
          '"></span>' +
          (online ? 'Servidor em execução' : 'Servidor parado');
    });
  }
  function log(message, command = false) {
    const log = byId('console');
    if (!log) return;
    const row = document.createElement('div');
    row.className = 'preview-log-line';
    const time = document.createElement('time');
    time.textContent = new Date().toLocaleTimeString('pt-BR');
    const label = document.createElement('b');
    label.textContent = command ? '›' : '[Server/INFO]';
    row.append(time, label, document.createTextNode(' ' + message));
    log.append(row);
    while (log.children.length > 28) log.firstElementChild.remove();
    log.scrollTop = log.scrollHeight;
  }
  function schedule() { clearTimeout(timer); }
  function setOnline(value) {
    online = value;
    current = [];
    render();
    log(
      online
        ? 'Servidor de exemplo iniciado.'
        : 'Servidor de exemplo parado.',
    );
    tell(
      online
        ? 'Servidor de exemplo iniciado.'
        : 'Servidor de exemplo parado.',
    );
    schedule();
  }
  function show(view) {
    const tab =
      view === 'overview'
        ? 'server'
        : view === 'files'
          ? 'fileeditor'
          : view === 'extensions'
            ? 'mods'
            : view === 'access'
              ? 'sync'
              : view;
    document.body.dataset.workspace =
      tab === 'terminal' ? 'terminal' : 'content';
    document
      .querySelectorAll('.tab-page')
      .forEach((p) => p.classList.toggle('active', p.id === 'tab-' + tab));
    document.querySelectorAll('.nav-btn').forEach((b) => {
      const active =
        b.dataset.tab === tab ||
        (tab === 'terminal' && b.id === 'navTerminalButton');
      b.classList.toggle('active', active);
      b.setAttribute('aria-current', active ? 'page' : 'false');
    });
    const button = q('.nav-btn.active');
    if (button) {
      set('workspaceTitle', button.dataset.navTitle);
      set('workspaceDescription', button.dataset.navDescription);
    }
    parent.postMessage(
      { type: 'manager-preview', event: 'view', view },
      location.origin,
    );
    requestAnimationFrame(drawChart);
  }
  document
    .querySelectorAll('.nav-btn[data-tab]')
    .forEach((button) =>
      button.addEventListener('click', () => show(button.dataset.tab)),
    );
  byId('navTerminalButton').addEventListener('click', () => show('terminal'));
  byId('btnStart').addEventListener('click', () => setOnline(true));
  for (const id of ['btnStop', 'btnStopBackend'])
    byId(id).addEventListener('click', () => setOnline(false));
  byId('btnThemeToggle').addEventListener('click', () => {
    const light = document.documentElement.dataset.theme !== 'light';
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    set('themeModeLabel', light ? 'Modo claro' : 'Modo escuro');
    drawChart();
  });
  byId('saasOverviewPlayers').addEventListener('click', () => show('players'));
  byId('saasOverviewToggle').addEventListener('click', () => {
    const card = byId('saasOverviewIdentity');
    card.classList.toggle('is-collapsed');
    byId('saasOverviewToggle').setAttribute(
      'aria-expanded',
      String(!card.classList.contains('is-collapsed')),
    );
  });
  byId('saasServerAddressCopyButton').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('vale-demo.play.forcaaliada.com');
      tell('Endereço ilustrativo copiado.');
    } catch {
      info('Endereço de exemplo', 'vale-demo.play.forcaaliada.com');
    }
  });
  byId('btnOpenAccountDevices').addEventListener('click', () => {
    const menu = byId('managerAccountMenu');
    menu.hidden = !menu.hidden;
    byId('btnOpenAccountDevices').setAttribute(
      'aria-expanded',
      String(!menu.hidden),
    );
  });
  for (const id of [
    'saasOverviewBrowseBackups',
    'saasOverviewOpenFolder',
    'saasOverviewCreateBackup',
  ])
    byId(id).addEventListener('click', () => {
      show('files');
      if (id === 'saasOverviewCreateBackup') createBackup();
    });
  const playerList = byId('playerHistoryList');
  playerList.innerHTML = names
    .map(
      (name, id) =>
        `<article class="players-row" data-preview-player="${id}"><div class="players-person"><input type="checkbox" class="players-row-select" aria-label="Selecionar ${name}"><button class="players-person-button" data-preview-details="${name}" aria-label="Ver detalhes de ${name}">${face(id)}<span class="players-row-copy"><strong class="players-row-name">${name}</strong><small class="players-edition">Java</small></span></button></div><div class="players-row-activity"><span class="players-state" data-presence>Desconectado</span><small>${id + 1} entradas</small></div><div class="players-row-access"><span class="players-state">Permitido</span></div><div class="players-row-actions"><button class="btn btn-ghost players-icon-button" data-preview-details="${name}" aria-label="Ações para ${name}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg></button></div></article>`,
    )
    .join('');
  set('historyTabCount', '3');
  set('playerHistoryTotal', '3 jogadores · dados de exemplo');
  document
    .querySelectorAll('[data-player-icon="plus"]')
    .forEach(
      (e) =>
        (e.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 5v14M5 12h14"/></svg>'),
    );
  document
    .querySelectorAll('[data-player-icon="refresh"]')
    .forEach(
      (e) =>
        (e.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5"/></svg>'),
    );
  document
    .querySelectorAll('[data-player-icon="search"]')
    .forEach(
      (e) =>
        (e.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></svg>'),
    );
  set('wlCount', '3');
  set('banCount', '0');
  byId('wlList').innerHTML = playerList.innerHTML;
  byId('banList') &&
    (byId('banList').innerHTML =
      '<div class="player-list-empty">Nenhum bloqueio neste exemplo.</div>');
  document.querySelectorAll('.players-sub-tab').forEach((button) =>
    button.addEventListener('click', () => {
      document.querySelectorAll('.players-sub-tab').forEach((b) => {
        b.classList.toggle('active', b === button);
        b.setAttribute('aria-selected', String(b === button));
      });
      document
        .querySelectorAll('.players-sub-page')
        .forEach((p) =>
          p.classList.toggle('active', p.id === 'sub-' + button.dataset.sub),
        );
    }),
  );
  byId('playerHistorySearch').addEventListener('input', (event) =>
    playerList
      .querySelectorAll('[data-preview-player]')
      .forEach(
        (row) =>
          (row.hidden = !row.textContent
            .toLowerCase()
            .includes(event.target.value.toLowerCase())),
      ),
  );
  // These panels are the native app's prepared DOM, including every field and tab.
  const filePage = byId('tab-fileeditor');
  byId('fePropsNoFile').hidden = true;
  byId('fePropsContent').style.display = 'flex';
  byId('fePropsPathHint').textContent =
    'C:\\Servidores\\Vale dos Aliados\\server.properties';
  byId('fePropsSaveText').textContent = 'Configurações de exemplo';
  byId('backupWorkspaceSource').textContent =
    'C:\\Servidores\\Vale dos Aliados';
  byId('backupWorkspaceDestination').textContent =
    'C:\\Backups\\Vale dos Aliados';
  byId('backupWorkspaceLast').textContent = 'Hoje, 06:00 · exemplo';
  byId('backupWorkspaceStatus').textContent = 'Pastas de exemplo';
  const fileTabs = [...filePage.querySelectorAll('.file-editor-tab')];
  function fileView(value) {
    fileTabs.forEach((button) => {
      const active = button.dataset.fe === value;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    filePage
      .querySelectorAll('.file-editor-page')
      .forEach((panel) =>
        panel.classList.toggle('active', panel.id === 'fePage-' + value),
      );
  }
  fileTabs.forEach((button) =>
    button.addEventListener('click', () => fileView(button.dataset.fe)),
  );
  byId('btnSaveProps').disabled = false;
  byId('btnSaveProps').addEventListener('click', () => {
    set('fePropsSaveText', 'Exemplo salvo');
    tell('Configurações salvas nesta prévia.');
  });
  byId('btnBackupNow').disabled = false;
  byId('btnBackupNow').addEventListener('click', createBackup);
  function createBackup() {
    fileView('backups');
    const button = byId('btnBackupNow');
    button.disabled = true;
    const label = button.textContent;
    button.textContent = 'Criando cópia de exemplo…';
    byId('backupWorkspaceStatus').textContent = 'Preparando cópia de exemplo…';
    setTimeout(() => {
      button.disabled = false;
      button.textContent = label;
      set('backupWorkspaceLast', 'Agora · exemplo');
      set('backupWorkspaceStatus', 'Cópia de exemplo concluída');
      set('saasOverviewLastBackup', 'Agora · exemplo');
      tell('Backup de exemplo concluído.');
    }, 700);
  }
  const scheduledPanel = byId('agendaScheduledPanel'),
    historyPanel = byId('agendaHistoryPanel');
  if (scheduledPanel) {
    for (const id of ['agendaScheduledTab', 'agendaHistoryTab'])
      byId(id).addEventListener('click', () => {
        const history = id === 'agendaHistoryTab';
        scheduledPanel.hidden = history;
        historyPanel.hidden = !history;
        byId('agendaScheduledTab').setAttribute(
          'aria-selected',
          String(!history),
        );
        byId('agendaHistoryTab').setAttribute('aria-selected', String(history));
      });
    document.querySelectorAll('.sched-toggle').forEach((input) =>
      input.addEventListener('change', () => {
        input
          .closest('.agenda-row')
          .querySelector('.agenda-row-state>span').textContent = input.checked
          ? 'Ativa'
          : 'Pausada';
        input
          .closest('.agenda-row')
          .classList.toggle('is-paused', !input.checked);
      }),
    );
    byId('agendaSearch').addEventListener('input', (e) =>
      scheduledPanel
        .querySelectorAll('.agenda-row')
        .forEach(
          (row) =>
            (row.hidden = !row.textContent
              .toLowerCase()
              .includes(e.target.value.toLowerCase())),
        ),
    );
    const catalog = byId('agendaCatalogOverlay');
    if (catalog) {
      byId('agendaNewAction').addEventListener('click', () => {
        catalog.hidden = false;
        catalog.querySelector('button').focus();
      });
      catalog
        .querySelector('[data-close-catalog]')
        ?.addEventListener('click', () => {
          catalog.hidden = true;
          byId('agendaNewAction').focus();
        });
      catalog.querySelectorAll('[data-preset]').forEach((button) =>
        button.addEventListener('click', () => {
          catalog.hidden = true;
          const title =
            button.querySelector('strong')?.textContent || 'Programar ação';
          info(
            title,
            'Abra o Manager para escolher os horários e as condições da tarefa.',
          );
        }),
      );
      catalog.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          catalog.hidden = true;
          byId('agendaNewAction').focus();
        }
        if (event.key === 'Tab') {
          const controls = [...catalog.querySelectorAll('button')].filter(
            (e) => !e.disabled,
          );
          const i = controls.indexOf(document.activeElement);
          if (
            (!event.shiftKey && i === controls.length - 1) ||
            (event.shiftKey && i === 0)
          ) {
            event.preventDefault();
            controls[event.shiftKey ? controls.length - 1 : 0].focus();
          }
        }
      });
    }
  }
  const list = byId('modsManagedList');
  document.querySelectorAll('[data-preview-resource]').forEach((button) =>
    button.addEventListener('click', () => {
      if (online) return;
      const active = button.getAttribute('aria-checked') !== 'true';
      button.setAttribute('aria-checked', String(active));
      button
        .closest('.extension-control')
        .querySelector('.extension-state').textContent = active
        ? 'Ativo'
        : 'Desativado';
      tell(
        button.dataset.previewResource +
          (active ? ' ativado' : ' desativado') +
          ' no exemplo.',
      );
    }),
  );
  byId('modsSearch').addEventListener('input', (event) =>
    list
      .querySelectorAll('.extension-row')
      .forEach(
        (row) =>
          (row.hidden = !row.textContent
            .toLowerCase()
            .includes(event.target.value.toLowerCase())),
      ),
  );
  const shareViews = window.managerPreviewSharing || {};
  document.querySelectorAll('[data-share-tab]').forEach((button) =>
    button.addEventListener('click', () => {
      const tab = button.dataset.shareTab;
      byId('shareContent').innerHTML = shareViews[tab] || '';
      byId('shareContent').dataset.view = tab;
      byId('shareContent').setAttribute('aria-labelledby', button.id);
      document
        .querySelectorAll('[data-share-tab]')
        .forEach((item) =>
          item.setAttribute('aria-selected', String(item === button)),
        );
      updateShareState();
    }),
  );
  const command = byId('consoleInput');
  if (command)
    command.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const text = command.value.trim();
      if (!text) return;
      log(text, true);
      log(
        !online
          ? 'Servidor de exemplo parado.'
          : text === 'list'
            ? current.length +
              ' jogadores online: ' +
              current.map((id) => names[id]).join(', ')
            : text === 'save-all'
              ? 'Mundo de demonstração salvo.'
              : 'Comandos neste exemplo: list, help, save-all.',
      );
      command.value = '';
    });
  byId('btnClearConsole')?.addEventListener('click', () => {
    const log = byId('console');
    if (log) log.replaceChildren();
  });
  document.addEventListener('click', (event) => {
    const button = event.target.closest('button,[role="button"]');
    if (!button || button.disabled || button.closest('#previewDialog') || button.closest('[data-local-demo]') || button.matches('#saasOverviewEditServer,#saasOverviewEditMotd')) return;
    if (button.dataset.previewInfo) info(button.dataset.previewInfo);
    else if (button.dataset.previewDetails)
      info(
        button.dataset.previewDetails,
        'No Manager, aqui aparecem o status, o histórico e o acesso do jogador.',
      );
    else if (
      button.matches(
        '.titlebar-btn,#saasOverviewDeleteServer,#saasOverviewEditName,#saasOverviewEditIcon,#saasOverviewEditMotd,#saasServerAddressEdit,#saasServerSwitcher,#notifBellBtn,.manager-account-menu button',
      )
    )
      info(
        button.getAttribute('title') ||
          button.getAttribute('aria-label') ||
          button.textContent.trim(),
      );
    else if (
      !button.matches(
        '.nav-btn,#navTerminalButton,#btnStart,#btnStop,#btnStopBackend,#btnThemeToggle,#saasOverviewPlayers,#saasOverviewToggle,#saasServerAddressCopyButton,#btnOpenAccountDevices,#saasOverviewBrowseBackups,#saasOverviewOpenFolder,#saasOverviewCreateBackup,.players-sub-tab,.file-editor-tab,#btnSaveProps,#btnBackupNow,#agendaScheduledTab,#agendaHistoryTab,#agendaNewAction,[data-preset],[data-close-catalog],[data-preview-resource],[data-share-tab],#btnClearConsole',
      )
    ) {
      info(
        button.getAttribute('title') ||
          button.getAttribute('aria-label') ||
          button.textContent.trim() ||
          'Ação do Manager',
      );
    }
  });
  document.addEventListener('submit', (event) => {
    if (!event.target.closest('#previewDialog')) event.preventDefault();
  });
  window.addEventListener('message', (event) => {
    if (
      event.source !== parent ||
      event.origin !== location.origin ||
      event.data?.type !== 'manager-preview-control'
    )
      return;
    const data = event.data;
    if (data.requestReady) parent.postMessage({ type: 'manager-preview', event: 'ready' }, location.origin);
    if (data.view) show(data.view);
    if (typeof data.playing === 'boolean') playing = data.playing;
    if (typeof data.visible === 'boolean') visible = data.visible;
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('resize', drawChart);
  reduced.addEventListener('change', () => {
    if (reduced.matches) playing = false;
    schedule();
  });
  render();
  show('overview');
  log('Mundo carregado. Servidor pronto para receber jogadores.');
  log('Arquiteta entrou no servidor de exemplo.');
  schedule();
  parent.postMessage(
    { type: 'manager-preview', event: 'ready' },
    location.origin,
  );
})();
