let blacklist = [];
let streamerModeEnabled = false;

function load() {
  chrome.storage.sync.get(
    ["blacklist", "streamerMode"],
    (data) => {
      blacklist = data.blacklist || [];
      streamerModeEnabled = data.streamerMode === true;

      document.getElementById("streamerMode").checked =
        streamerModeEnabled;

      render();
    }
  );
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
  list.replaceChildren();

  blacklist.forEach((entry, index) => {
    const div = document.createElement("div");
    div.className = "entry";

    const heading = document.createElement("strong");
    heading.textContent = "Blocking";

    const term = document.createElement("span");
    term.className = "entry-term";

    // Never display the actual term while Streamer Mode is enabled.
    term.textContent = streamerModeEnabled
      ? "******"
      : entry.term;

    const meta = document.createElement("div");
    meta.className = "entry-meta";

    const caseText = entry.caseSensitive
      ? "Strict Case"
      : "Any Case";

    const replacementText = entry.replacement
      ? escapeHtml(entry.replacement)
      : "Random Symbols";

    meta.textContent =
      `${caseText} - Replaced with: ${
        streamerModeEnabled && entry.replacement
          ? "******"
          : replacementText
      }`;

    const remove = document.createElement("button");
    remove.textContent = "Remove";
    remove.className = "remove";

    remove.onclick = () => {
      blacklist.splice(index, 1);
      save();
    };

    div.appendChild(heading);
    div.appendChild(term);
    div.appendChild(meta);
    div.appendChild(remove);

    list.appendChild(div);
  });

  if (blacklist.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-list";
    empty.textContent = "No blacklisted phrases yet.";
    list.appendChild(empty);
  }
}

// Streamer Mode toggle
document.getElementById("streamerMode").onchange = (event) => {
  streamerModeEnabled = event.target.checked;

  chrome.storage.sync.set(
    {
      streamerMode: streamerModeEnabled,
    },
    render
  );
};

// Add a blacklisted phrase
document.getElementById("add").onclick = () => {
  const termInput = document.getElementById("term");
  const replacementInput = document.getElementById("replacement");
  const caseInput = document.getElementById("caseSensitive");

  const term = termInput.value.trim();
  const replacement = replacementInput.value.trim();

  if (!term) return;

  blacklist.push({
    term,
    replacement: replacement || null,
    caseSensitive: caseInput.checked,
  });

  // Reset the form.
  termInput.value = "";
  replacementInput.value = "";
  caseInput.checked = false;

  save();
};

// Escape HTML when displaying replacement text outside textContent.
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

load();