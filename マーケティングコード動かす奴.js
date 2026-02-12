// ▼ Firestore からデータを読み込む
async function loadData() {
  const snapshot = await getDocs(collection(db, "attendance"));
  const data = [];
  snapshot.forEach(docSnap => {
    data.push({ id: docSnap.id, ...docSnap.data() });
  });
  return data;
}

// ▼ Firestore にデータを追加
async function addEntry(name, type) {
  const now = new Date();

  // 名前は localStorage に保存（自動入力用）
  localStorage.setItem("lastName", name);

  await addDoc(collection(db, "attendance"), {
    name,
    type,
    timeISO: now.toISOString(),
    timeDisplay: now.toLocaleString()
  });

  await render();
  await renderLogs();
}

// ▼ 参加
function checkIn() {
  const name = document.getElementById("name").value;
  if (!name) return;
  addEntry(name, "参加");
}

// ▼ 帰宅
function checkOut() {
  const name = document.getElementById("name").value;
  if (!name) return;
  addEntry(name, "帰宅");
}

// ▼ 今日の記録を表示
async function render() {
  const data = await loadData();
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

// ▼ 全ログを日付ごとに折りたたみ表示
async function renderLogs() {
  const data = await loadData();
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
    // ▼ 日付タイトル（クリックで開閉）
    const dateTitle = document.createElement("h3");
    dateTitle.textContent = date;
    dateTitle.style.cursor = "pointer";

    // ▼ 折りたたみ用コンテナ
    const container = document.createElement("div");
    container.style.display = "none"; // 初期状態は閉じる

    // ▼ タイトルクリックで開閉
    dateTitle.addEventListener("click", () => {
      container.style.display =
        container.style.display === "none" ? "block" : "none";
    });

    logList.appendChild(dateTitle);
    logList.appendChild(container);

    // ▼ ログを追加
    grouped[date].forEach(entry => {
      const li = document.createElement("li");
      li.textContent = `${entry.name} - ${entry.type} - ${entry.timeDisplay}`;

      const delBtn = document.createElement("button");
      delBtn.textContent = "削除";
      delBtn.addEventListener("click", () => {
        deleteLogById(entry.id);
      });

      li.appendChild(delBtn);
      container.appendChild(li);
    });
  });
}

// ▼ Firestore のログ削除
async function deleteLogById(id) {
  await deleteDoc(doc(db, "attendance", id));
  await render();
  await renderLogs();
}

// ▼ ページ読み込み後に初期描画
window.addEventListener("DOMContentLoaded", () => {
  const lastName = localStorage.getItem("lastName");
  if (lastName) {
    document.getElementById("name").value = lastName;
  }

  render();
  renderLogs();
});
// ▼ メモ保存
function saveMemo() {
  const text = document.getElementById("memoInput").value;
  localStorage.setItem("memo", text);
  document.getElementById("memoDisplay").textContent =
    text || "まだ予定がありません";
}

// ▼ ページ読み込み時にメモを復元
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("memo");
  document.getElementById("memoDisplay").textContent =
    saved || "まだ予定がありません";
});






