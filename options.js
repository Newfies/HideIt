let blacklist = [];

function load() {
  chrome.storage.sync.get(["blacklist"], (data) => {
    blacklist = data.blacklist || [];
    render();
  });
}

function render() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  blacklist.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = t;

    const btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.onclick = () => {
      blacklist.splice(i, 1);
      save();
    };

    li.appendChild(btn);
    list.appendChild(li);
  });
}

function save() {
  chrome.storage.sync.set({ blacklist }, render);
}

document.getElementById("add").onclick = () => {
  const val = document.getElementById("term").value.trim();
  if (!val) return;

  blacklist.push(val);
  document.getElementById("term").value = "";
  save();
};

load();