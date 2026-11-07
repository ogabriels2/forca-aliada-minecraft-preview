const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("#mobile-nav");

if (menuToggle && mobileNav) {
  function setMenuOpen(open, { restoreFocus = false } = {}) {
    mobileNav.hidden = !open;
    menuToggle.setAttribute("aria-expanded", String(open));
    if (restoreFocus) menuToggle.focus({ preventScroll: true });
  }

  menuToggle.setAttribute("aria-controls", mobileNav.id);
  setMenuOpen(!mobileNav.hidden);
  menuToggle.addEventListener("click", () => setMenuOpen(mobileNav.hidden));

  document.addEventListener("click", (event) => {
    if (mobileNav.hidden || menuToggle.contains(event.target)) return;
    const selectedLink = event.target.closest?.("a[href]");
    if (!mobileNav.contains(event.target) || selectedLink) setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !mobileNav.hidden) {
      event.preventDefault();
      setMenuOpen(false, { restoreFocus: true });
    }
  });

  window.addEventListener("resize", () => {
    if (!mobileNav.hidden && menuToggle.getClientRects().length === 0)
      setMenuOpen(false);
  });
}

function connectGallery(buttonSelector, photoSelector, captionSelector) {
  const buttons = [...document.querySelectorAll(buttonSelector)];
  const photo = document.querySelector(photoSelector);
  const caption = document.querySelector(captionSelector);
  if (!buttons.length || !photo || !caption) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let requestedPhoto = 0;
  let photoAnimation;

  if (!caption.hasAttribute("aria-live"))
    caption.setAttribute("aria-live", "polite");

  async function showPhoto(button) {
    const request = ++requestedPhoto;
    if (button.getAttribute("aria-pressed") === "true") return;

    // Keep the displayed photo intact while decoding the requested image.
    const nextPhoto = new Image();
    if (button.dataset.srcset) {
      nextPhoto.sizes = button.dataset.sizes || photo.sizes;
      nextPhoto.srcset = button.dataset.srcset;
    }
    nextPhoto.src = button.dataset.src;
    try {
      await nextPhoto.decode();
    } catch {
      return;
    }
    if (request !== requestedPhoto) return;

    if (button.dataset.srcset) {
      photo.sizes = nextPhoto.sizes;
      photo.srcset = nextPhoto.srcset;
    } else {
      photo.removeAttribute("srcset");
    }
    photo.src = nextPhoto.src;
    photo.alt = button.dataset.alt || "";
    caption.textContent = button.dataset.caption || "";
    for (const tab of buttons)
      tab.setAttribute("aria-pressed", String(tab === button));

    photoAnimation?.cancel();
    if (!reducedMotion.matches && typeof photo.animate === "function") {
      photoAnimation = photo.animate([{ opacity: 0.76 }, { opacity: 1 }], {
        duration: 200,
        easing: "ease-out",
      });
    }
  }

  for (const [index, button] of buttons.entries()) {
    button.addEventListener("click", () => void showPhoto(button));
    button.addEventListener("keydown", (event) => {
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      let nextIndex;
      switch (event.key) {
        case "ArrowLeft":
          nextIndex = (index - 1 + buttons.length) % buttons.length;
          break;
        case "ArrowRight":
          nextIndex = (index + 1) % buttons.length;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = buttons.length - 1;
          break;
        default:
          return;
      }
      event.preventDefault();
      const next = buttons[nextIndex];
      next.focus();
      void showPhoto(next);
    });
  }
}

connectGallery("[data-world-tab][data-src]", "#world-photo", "#world-caption");
connectGallery("[data-manager-view][data-src]", "#manager-photo", "#manager-caption");

for (const button of document.querySelectorAll("[data-copy-address]")) {
  const feedback =
    button.closest("[data-copy-group]")?.querySelector("[data-copy-feedback]") ??
    document.querySelector("[data-copy-feedback]");
  if (feedback && !feedback.hasAttribute("aria-live"))
    feedback.setAttribute("aria-live", "polite");

  button.addEventListener("click", async () => {
    const address = button.dataset.copyAddress?.trim();
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      if (feedback) feedback.textContent = "Endereço copiado.";
    } catch {
      if (feedback) feedback.textContent = `Copie manualmente: ${address}`;
    }
  });
}
