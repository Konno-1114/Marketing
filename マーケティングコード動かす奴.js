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

// ▼ 全ログを日付ごとに表示
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
    const dateTitle = document.createElement("h3");
    dateTitle.textContent = date;
    logList.appendChild(dateTitle);

    grouped[date].forEach(entry => {
      const li = document.createElement("li");
      li.textContent = `${entry.name} - ${entry.type} - ${entry.timeDisplay}`;

      const delBtn = document.createElement("button");
      delBtn.textContent = "削除";
      delBtn.addEventListener("click", () => {
        deleteLogById(entry.id);
      });

      li.appendChild(delBtn);
      logList.appendChild(li);
    });
  });
}

// ▼ Firestore のログ削除
async function deleteLogById(id) {
  await deleteDoc(doc(db, "attendance", id));
  await render();
  await renderLogs();
}

// ▼ 初期描画
render();
renderLogs();

// ▼ 前回の名前を自動入力
window.addEventListener("DOMContentLoaded", () => {
  const lastName = localStorage.getItem("lastName");
  if (lastName) {
    document.getElementById("name").value = lastName;
  }
});
