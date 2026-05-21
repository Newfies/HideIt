let blacklist = [];

function load() {
  chrome.storage.sync.get(["blacklist"], (data) => {
    blacklist = data.blacklist || [];
    render();
  });
}

function save() {
  chrome.storage.sync.set(
    {
      blacklist,
    },
    render
  );
}

function render() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  blacklist.forEach((entry, index) => {
    const div = document.createElement("div");
    div.className = "entry";

    div.innerHTML = `
      <strong>Blocking</strong>
      <span class="entry-term">${escapeHtml(entry.term)}</span>
      <div class="entry-meta">
        ${entry.caseSensitive ? "Strict Case" : "Any Case"} &bull; 
        Replaced with: ${
          entry.replacement ? escapeHtml(entry.replacement) : "Random Symbols"
        }
      </div>
    `;

    const remove = document.createElement("button");
    remove.textContent = "Remove";
    remove.className = "remove";

    remove.onclick = () => {
      blacklist.splice(index, 1);
      save();
    };

    div.appendChild(remove);
    list.appendChild(div);
  });
}

document.getElementById("add").onclick = () => {
  const termInput = document.getElementById("term");
  const replacementInput = document.getElementById("replacement");
  const caseInput = document.getElementById("caseSensitive");

  const term = termInput.value.trim();
  let replacement = replacementInput.value.trim();

  if (!term) return;

  blacklist.push({
    term,
    replacement: replacement || null,
    caseSensitive: caseInput.checked,
  });

  // Reset UI
  termInput.value = "";
  replacementInput.value = "";
  caseInput.checked = false;

  save();
};

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

load();