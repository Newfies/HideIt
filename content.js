let blacklist = [];

// Load blacklist from storage
chrome.storage.sync.get(["blacklist"], (data) => {
  blacklist = data.blacklist || [];
  runFilter();
});

// Watch for changes (important for dynamic sites like Amazon)
const observer = new MutationObserver(() => {
  runFilter();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

function runFilter() {
  if (!blacklist.length) return;

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  while ((node = walker.nextNode())) {
    let text = node.nodeValue;

    blacklist.forEach(term => {
      const regex = new RegExp(term, "gi");
      if (regex.test(text)) {
        text = text.replace(regex, "████");
      }
    });

    node.nodeValue = text;
  }

  hideSensitiveElements();
}

function hideSensitiveElements() {
  // optional: hide elements containing full address blocks
  document.querySelectorAll("body *").forEach(el => {
    const text = el.innerText?.toLowerCase() || "";

    blacklist.forEach(term => {
      if (text.includes(term.toLowerCase())) {
        el.style.filter = "blur(8px)";
        el.style.pointerEvents = "none";
      }
    });
  });
}