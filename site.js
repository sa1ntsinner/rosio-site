// The instrument reads one parameter by layer, the panel switches command output, the button copies.
const said = {
  declared: '10.0 wins, set at <code>bringup.launch.py:28</code>. The 8.0 in <code>rover.yaml:4</code> never applies.',
  coded: 'The code declares 12.0 as the default at <code>scan_filter.cpp:21</code>. It applies only when nothing sets the parameter.',
  observed: 'Run <code>rosio probe</code> beside the robot and the value the node really holds appears here.',
  recorded: 'A bag records topics, not parameters, so this layer has nothing to say about this one.',
};
const layers = [...document.querySelectorAll(".scale button")];
const readout = document.querySelector(".readout");
function pick(button) {
  for (const other of layers) other.setAttribute("aria-checked", String(other === button));
  readout.innerHTML = said[button.dataset.layer];
}
for (const [i, button] of layers.entries()) {
  button.addEventListener("click", () => pick(button));
  button.addEventListener("keydown", (event) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = layers[(i + step + layers.length) % layers.length];
    next.focus();
    pick(next);
  });
}

const tabs = [...document.querySelectorAll(".commands button")];
function show(name) {
  for (const tab of tabs) {
    const on = tab.dataset.sheet === name;
    tab.setAttribute("aria-selected", String(on));
    tab.tabIndex = on ? 0 : -1;
    document.getElementById(`sheet-${tab.dataset.sheet}`).classList.toggle("is-on", on);
  }
}
for (const [i, tab] of tabs.entries()) {
  tab.addEventListener("click", () => show(tab.dataset.sheet));
  tab.addEventListener("keydown", (event) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = tabs[(i + step + tabs.length) % tabs.length];
    next.focus();
    show(next.dataset.sheet);
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

const parts = document.querySelectorAll("section h2, .column p, .panel, .names ul, .cell, .close p, .close .act");
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
  });
  parts.forEach((part) => seen.observe(part));
}
