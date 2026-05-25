(function () {
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const pad = (value) => String(value).padStart(2, "0");
  const formatDateValue = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const formatDateLabel = (date) => `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${weekdays[date.getDay()]}）`;
  const formatMonthTitle = (start, end) => {
    const startLabel = `${start.getFullYear()}年${start.getMonth() + 1}月`;
    const endLabel = `${end.getFullYear()}年${end.getMonth() + 1}月`;
    return startLabel === endLabel ? `${startLabel}の予約日` : `${startLabel} - ${end.getMonth() + 1}月の予約日`;
  };

  const renderCalendar = (box) => {
    const days = Number(box.dataset.calendarDays || 30);
    const monthTitle = box.querySelector(".calendar-month strong");
    const selectedLabel = box.querySelector(".selected-date-label");
    const daysGrid = box.querySelector(".calendar-days");
    const form = box.closest("form");
    const dateField = form.querySelector("[name='date']");
    if (!daysGrid) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days - 1);
    if (monthTitle) monthTitle.textContent = formatMonthTitle(today, endDate);

    daysGrid.innerHTML = "";
    ["月", "火", "水", "木", "金", "土", "日"].forEach((weekday) => {
      const label = document.createElement("span");
      label.className = "weekday";
      label.textContent = weekday;
      daysGrid.appendChild(label);
    });

    const leadingBlanks = (today.getDay() + 6) % 7;
    for (let i = 0; i < leadingBlanks; i += 1) {
      const blank = document.createElement("span");
      blank.className = "calendar-blank";
      daysGrid.appendChild(blank);
    }

    for (let i = 0; i < days; i += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.date = formatDateValue(date);
      button.setAttribute("aria-label", `${formatDateLabel(date)}を選択`);
      button.innerHTML = `<span class="date-month">${date.getMonth() + 1}月</span><span class="date-day">${date.getDate()}</span>`;
      if (i === 0) {
        button.classList.add("is-selected");
        if (dateField) dateField.value = button.dataset.date;
        if (selectedLabel) selectedLabel.textContent = `選択中: ${formatDateLabel(date)}`;
      }
      daysGrid.appendChild(button);
    }
  };

  document.querySelectorAll(".calendar-box").forEach((box) => {
    renderCalendar(box);
    const form = box.closest("form");
    const timeField = form.querySelector("[name='time']");
    const selectedTime = box.querySelector(".time-grid .is-selected");
    if (timeField && selectedTime) timeField.value = selectedTime.dataset.time;
  });

  document.addEventListener("click", (event) => {
    const dateButton = event.target.closest(".calendar-days button[data-date]");
    if (dateButton) {
      const box = dateButton.closest(".calendar-box");
      const form = box.closest("form");
      const dateField = form.querySelector("[name='date']");
      const selectedLabel = box.querySelector(".selected-date-label");
      const date = new Date(`${dateButton.dataset.date}T00:00:00`);
      box.querySelectorAll(".calendar-days button").forEach((button) => button.classList.remove("is-selected"));
      dateButton.classList.add("is-selected");
      if (dateField) dateField.value = dateButton.dataset.date;
      if (selectedLabel) selectedLabel.textContent = `選択中: ${formatDateLabel(date)}`;
      return;
    }

    const timeButton = event.target.closest(".time-grid button[data-time]");
    if (timeButton) {
      const box = timeButton.closest(".calendar-box");
      const form = box.closest("form");
      const timeField = form.querySelector("[name='time']");
      box.querySelectorAll(".time-grid button").forEach((button) => button.classList.remove("is-selected"));
      timeButton.classList.add("is-selected");
      if (timeField) timeField.value = timeButton.dataset.time;
      return;
    }

    const faqButton = event.target.closest(".faq-q");
    if (faqButton) {
      faqButton.closest(".faq-item").classList.toggle("is-open");
    }
  });

  document.querySelectorAll('a[href="#booking"]').forEach((link) => {
    link.addEventListener("click", () => {
      setTimeout(() => {
        const firstField = document.querySelector("#booking input, #booking textarea");
        if (firstField && window.matchMedia("(min-width: 768px)").matches) firstField.focus({ preventScroll: true });
      }, 450);
    });
  });

  document.querySelectorAll(".booking-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const externalUrl = form.dataset.bookingUrl;
      if (externalUrl) {
        window.location.href = externalUrl;
        return;
      }
      let message = form.querySelector(".form-message");
      if (!message) {
        message = document.createElement("p");
        message.className = "form-message";
        form.appendChild(message);
      }
      message.textContent = "入力内容を確認しました。公開時はここから予約カレンダーまたは送信先へ連携します。";
      message.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  const observedSections = [document.querySelector("#faq"), document.querySelector("#booking")].filter(Boolean);
  const floatingCta = document.querySelector(".floating-cta");
  if (observedSections.length && floatingCta && "IntersectionObserver" in window) {
    const visibleSections = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.add(entry.target);
          } else {
            visibleSections.delete(entry.target);
          }
        });
        floatingCta.classList.toggle("is-hidden", visibleSections.size > 0);
      },
      { threshold: 0.08 }
    );
    observedSections.forEach((section) => observer.observe(section));
  }
})();
