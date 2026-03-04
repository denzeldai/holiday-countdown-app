async function loadHoliday() {
  const nameEl = document.getElementById("holidayName");
  const daysEl = document.getElementById("daysLeft");
  const dateEl = document.getElementById("holidayDate");
  const statusEl = document.getElementById("status");
  const upcomingListEl = document.getElementById("upcomingList");

  nameEl.textContent = "加载中...";
  daysEl.textContent = "--";
  dateEl.textContent = "----";
  statusEl.textContent = "正在获取节假日数据...";
  upcomingListEl.innerHTML = "";

  try {
    const response = await fetch("/api/holiday");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    nameEl.textContent = data.name;
    daysEl.textContent = data.daysLeft;
    dateEl.textContent = `日期：${data.date}`;
    statusEl.textContent = "";
    renderUpcomingList(upcomingListEl, data.upcoming || []);
  } catch (error) {
    nameEl.textContent = "加载失败";
    daysEl.textContent = "--";
    dateEl.textContent = "请检查后端服务是否启动";
    statusEl.textContent = `错误：${error.message}`;
    upcomingListEl.innerHTML = "";
  }
}

function renderUpcomingList(listEl, holidays) {
  if (!holidays.length) {
    listEl.innerHTML = '<li class="upcoming-item">暂无未来假期数据</li>';
    return;
  }

  listEl.innerHTML = holidays
    .map(
      (holiday) =>
        `<li class="upcoming-item"><span>${holiday.name}</span><span class="upcoming-meta">${holiday.date} · ${holiday.daysLeft} 天</span></li>`
    )
    .join("");
}

loadHoliday();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("/service-worker.js");
    } catch (error) {
      console.error("Service Worker 注册失败:", error);
    }
  });
}
