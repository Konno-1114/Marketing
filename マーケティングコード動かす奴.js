// データ読み込み
function loadData() {
  return JSON.parse(localStorage.getItem("attendance") || "[]");
}

// データ保存
function saveData(data) {
  localStorage.setItem("attendance", JSON.stringify(data));
}

// 1件追加＋名前保存
function addEntry(name, type) {
  const data = loadData();
  const now = new Date();

  // 名前を保存（次回自動入力用）
  localStorage.setItem("lastName", name);

  data.push({
    name,
    type,
    timeISO: now.toISOString(),
    timeDisplay: now.toLocaleString()
  });

  saveData(data);
  render();
  renderLogs();
}

// 参加
function checkIn() {
  const name = document.getElementById("name").value;
  addEntry(name, "参加");
}

// 帰宅
function checkOut() {
  const name = document.getElementById("name").value;
  addEntry(name, "帰宅");
}

// 今日の記録だけ表示
function render() {
  const data = loadData();
  const list = document.getElementById("attendanceList");
  if (!list) return;
  list.innerHTML = "";

  const today = new Date().toLocaleDateString();

  data
    .filter(entry => new Date(entry.timeISO).toLocaleDateString() === today)
    .forEach(entry => {
      const li = document.createElement("li");
      li.textContent = `${entry.name} - ${entry.type} - ${entry.timeDisplay}`;
      list.appendChild(li);
    });
}

// 全ログを日付ごとに表示
function renderLogs() {
  const data = loadData();
  const logList = document.getElementById("logList");
  if (!logList) return;
  logList.innerHTML = "";

  const grouped = {};

  data.forEach(entry => {
    const date = new Date(entry.timeISO).toLocaleDateString();
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(entry);
  });

  Object.keys(grouped).forEach(date => {
    const dateTitle = document.createElement("h3");
    dateTitle.textContent = date;
    logList.appendChild(dateTitle);

    grouped[date].forEach(entry => {
      const li = document.createElement("li");
      li.textContent = `${entry.name} - ${entry.type} - ${entry.timeDisplay}`;

      const delBtn = document.createElement("button");
      delBtn.textContent = "削除";
      delBtn.addEventListener("click", () => {
        deleteLogByIso(entry.timeISO, entry.name, entry.type);
      });

      li.appendChild(delBtn);
      logList.appendChild(li);
    });
  });
}

// ログ削除
function deleteLogByIso(timeISO, name, type) {
  const data = loadData();
  const index = data.findIndex(e => e.timeISO === timeISO && e.name === name && e.type === type);
  if (index !== -1) {
    data.splice(index, 1);
    saveData(data);
    render();
    renderLogs();
  }
}

// 初期描画
render();
renderLogs();

// ★ 前回の名前を自動入力（ここが重要）
window.addEventListener("DOMContentLoaded", () => {
  const lastName = localStorage.getItem("lastName");
  if (lastName) {
    document.getElementById("name").value = lastName;
  }
});