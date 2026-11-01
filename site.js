// The reader shows one parameter by layer, the tabs switch command output, the switches open
// a finding, the button copies.
const said = {
  declared: '10.0 wins, set at <code>bringup.launch.py:28</code>. The 8.0 in <code>rover.yaml:4</code> never applies.',
  coded: 'The code declares 12.0 as the default at <code>scan_filter.cpp:21</code>. It applies only when nothing sets the parameter.',
  observed: 'Run <code>rosio probe</code> beside the robot and the value the node really holds appears here.',
  recorded: 'A bag records topics, not parameters, so this layer has nothing to say about this one.',
};

function arrows(items, act) {
  for (const [i, item] of items.entries()) {
    item.addEventListener("click", () => act(item));
    item.addEventListener("keydown", (event) => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
      if (!step) return;
      event.preventDefault();
      const next = items[(i + step + items.length) % items.length];
      next.focus();
      act(next);
    });
  }
}

const layers = [...document.querySelectorAll(".scale button")];
const readout = document.querySelector(".readout");
arrows(layers, (button) => {
  for (const other of layers) {
    other.setAttribute("aria-checked", String(other === button));
    other.tabIndex = other === button ? 0 : -1;
  }
  readout.innerHTML = said[button.dataset.layer];
  document.dispatchEvent(new CustomEvent("rosio:layer", { detail: button.dataset.layer }));
});

const tabs = [...document.querySelectorAll(".tabs button")];
arrows(tabs, (tab) => {
  for (const other of tabs) {
    const on = other === tab;
    other.setAttribute("aria-selected", String(on));
    other.tabIndex = on ? 0 : -1;
    document.getElementById(other.getAttribute("aria-controls")).classList.toggle("is-on", on);
  }
});

for (const flip of document.querySelectorAll(".switch")) {
  flip.addEventListener("click", () => {
    const on = flip.getAttribute("aria-checked") !== "true";
    flip.setAttribute("aria-checked", String(on));
    flip.closest(".band").toggleAttribute("data-on", on);
  });
}

const copy = document.querySelector(".copy");
copy.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(copy.dataset.copy);
    copy.textContent = "Copied";
    copy.classList.add("done");
  } catch {
    copy.textContent = copy.dataset.copy;
  }
});

const parts = document.querySelectorAll("section h2, .show-words p, .plate, .tabs, .cells, .card, .clause, .band, .shot, .needs div, .close p, .links");
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  parts.forEach((part) => part.classList.add("reveal"));
  const seen = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const siblings = [...entry.target.parentElement.children].filter((c) => c.classList.contains("reveal"));
      entry.target.style.transitionDelay = `${Math.min(siblings.indexOf(entry.target), 5) * 80}ms`;
      entry.target.classList.add("in");
      seen.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -8% 0px" });
  parts.forEach((part) => seen.observe(part));
}
