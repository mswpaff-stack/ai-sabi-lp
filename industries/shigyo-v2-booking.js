(function () {
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatMonthTitle = (start, end) => {
    const startLabel = `${start.getFullYear()}年${start.getMonth() + 1}月`;
    const endLabel = `${end.getFullYear()}年${end.getMonth() + 1}月`;
    return startLabel === endLabel
      ? `${startLabel}の予約日`
      : `${startLabel} - ${end.getMonth() + 1}月の予約日`;
  };

  const formatSelectedLabel = (date) => {
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return `選択中: ${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${weekdays[date.getDay()]}）`;
  };

  const renderCalendar = (box) => {
    const days = Number(box.dataset.calendarDays || 30);
    const monthTitle = box.querySelector(".calendar-month strong");
    const selectedDateLabel = box.querySelector(".selected-date-label");
    const daysGrid = box.querySelector(".calendar-days");
    const form = box.closest("form");
    const dateField = form.querySelector("[name='date']");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days - 1);

    if (monthTitle) monthTitle.textContent = formatMonthTitle(today, endDate);
    if (!daysGrid) return;

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
      const value = formatDate(date);
      button.type = "button";
      button.dataset.date = value;
      button.innerHTML = `<span class="date-month">${date.getMonth() + 1}月</span><span class="date-day">${date.getDate()}</span>`;
      button.setAttribute("aria-label", `${formatSelectedLabel(date).replace("選択中: ", "")}を選択`);
      if (i === 0) {
        button.classList.add("is-selected");
        if (dateField) dateField.value = value;
        if (selectedDateLabel) selectedDateLabel.textContent = formatSelectedLabel(date);
      }
      daysGrid.appendChild(button);
    }
  };

  document.querySelectorAll(".calendar-box").forEach((box) => {
    renderCalendar(box);
    const timeField = box.closest("form").querySelector("[name='time']");
    const selectedTime = box.querySelector(".time-grid button.is-selected");
    if (timeField && selectedTime) timeField.value = selectedTime.dataset.time;
  });

  document.addEventListener("click", (event) => {
    const calendarButton = event.target.closest(".calendar-days button[data-date]");
    if (calendarButton) {
      const box = calendarButton.closest(".calendar-box");
      box.querySelectorAll(".calendar-days button").forEach((item) => item.classList.remove("is-selected"));
      calendarButton.classList.add("is-selected");
      const field = box.closest("form").querySelector("[name='date']");
      if (field) field.value = calendarButton.dataset.date;
      const selectedDateLabel = box.querySelector(".selected-date-label");
      if (selectedDateLabel) {
        selectedDateLabel.textContent = formatSelectedLabel(new Date(`${calendarButton.dataset.date}T00:00:00`));
      }
      return;
    }

    const timeButton = event.target.closest(".time-grid button[data-time]");
    if (timeButton) {
      const box = timeButton.closest(".calendar-box");
      box.querySelectorAll(".time-grid button").forEach((item) => item.classList.remove("is-selected"));
      timeButton.classList.add("is-selected");
      const field = box.closest("form").querySelector("[name='time']");
      if (field) field.value = timeButton.dataset.time;
      return;
    }

    const faqButton = event.target.closest(".faq-q");
    if (faqButton) {
      faqButton.closest(".faq-item").classList.toggle("is-open");
    }
  });

  document.querySelectorAll(".booking-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const status = form.querySelector(".form-status");
      const bookingUrl = form.dataset.bookingUrl;
      if (bookingUrl) {
        window.open(bookingUrl, "_blank", "noopener");
        return;
      }
      if (status) {
        status.textContent = "予約カレンダーURL設定後、このボタンから予約ページへ遷移します。";
      }
    });
  });
})();
