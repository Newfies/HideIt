const processedNodes = new WeakSet();
let blacklist = [];

// Hide page instantly to prevent flash of un-filtered content
const style = document.createElement("style");
style.textContent = `
html {
    visibility: hidden !important;
}
`;
document.documentElement.appendChild(style);

chrome.storage.sync.get(["blacklist"], (data) => {
  blacklist = data.blacklist || [];
  start();
});

// Update the blacklist in real-time if settings change
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.blacklist) {
    blacklist = changes.blacklist.newValue || [];
    filterDocument(document.body);
  }
});

function start() {
  filterDocument(document.body);

  requestAnimationFrame(() => {
    style.remove();
    document.documentElement.style.visibility = "visible";
  });

  observePage();
}

function filterDocument(root) {
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;

  while ((node = walker.nextNode())) {
    if (processedNodes.has(node)) continue;
    if (!node.parentElement) continue;

    const tag = node.parentElement.tagName;
    if (
      tag === "SCRIPT" ||
      tag === "STYLE" ||
      tag === "NOSCRIPT" ||
      tag === "TEXTAREA"
    ) {
      continue;
    }

    let original = node.nodeValue;
    let modified = original;

    blacklist.forEach((entry) => {
      if (!entry.term) return;

      const escaped = escapeRegExp(entry.term);
      const flags = entry.caseSensitive ? "g" : "gi";
      const regex = new RegExp(escaped, flags);

      modified = modified.replace(regex, (match) => {
        if (entry.replacement) {
          return entry.replacement;
        }
        return generateRandomCensor(match.length);
      });
    });

    if (modified !== original) {
      node.nodeValue = modified;
    }

    processedNodes.add(node);
  }
}

function observePage() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          filterDocument(node.parentElement);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          filterDocument(node);
        }
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function generateRandomCensor(length) {
  let output = "";
  for (let i = 0; i < length; i++) {
    const amount = Math.floor(Math.random() * 3) + 1;
    output += "#".repeat(amount);
  }
  return output;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}