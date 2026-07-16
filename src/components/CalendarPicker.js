"use client";

import { useState, useMemo } from "react";
import { useLanguage } from "../providers/LanguageProvider";
import styles from "./CalendarPicker.module.css";

const DAYS_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_TH = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];
const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function CalendarPicker({ value, onChange }) {
  const { language } = useLanguage();
  const dayNames = language === "th" ? DAYS_TH : DAYS_EN;
  const monthNames = language === "th" ? MONTHS_TH : MONTHS_EN;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Which month/year is being viewed
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const [y, m] = value.split("-");
      return new Date(parseInt(y), parseInt(m) - 1, 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Selected date string (YYYY-MM-DD)
  const selectedDate = value || "";

  // Calculate days in the currently viewed month
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        currentMonth: false,
        date: new Date(year, month - 1, daysInPrevMonth - i),
      });
    }

    // Current month's days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        currentMonth: true,
        date: new Date(year, month, d),
      });
    }

    // Next month's leading days (fill to complete the grid row)
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        days.push({
          day: i,
          currentMonth: false,
          date: new Date(year, month + 1, i),
        });
      }
    }

    return days;
  }, [viewDate]);

  const goToPrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDayClick = (dayObj) => {
    if (!dayObj.currentMonth) return;
    const d = dayObj.date;
    if (d < today) return; // Can't select past dates

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
  };

  const formatDateStr = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const isToday = (date) => {
    return formatDateStr(date) === formatDateStr(today);
  };

  const isSelected = (date) => {
    return formatDateStr(date) === selectedDate;
  };

  const isPast = (date) => {
    return date < today;
  };

  // Check if we can go to previous month (don't allow navigating before current month)
  const canGoPrev = viewDate.getFullYear() > today.getFullYear() ||
    (viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() > today.getMonth());

  return (
    <div className={styles.calendar}>
      {/* Header: Month Navigation */}
      <div className={styles.header}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className={styles.monthYear}>
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear() + (language === "th" ? 543 : 0)}
        </span>
        <button
          type="button"
          className={styles.navBtn}
          onClick={goToNextMonth}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day name headers */}
      <div className={styles.dayNames}>
        {dayNames.map((name, i) => (
          <div key={i} className={`${styles.dayName} ${i === 0 || i === 6 ? styles.weekend : ""}`}>
            {name}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className={styles.dayGrid}>
        {calendarDays.map((dayObj, idx) => {
          const past = isPast(dayObj.date) && dayObj.currentMonth;
          const selected = isSelected(dayObj.date) && dayObj.currentMonth;
          const todayMark = isToday(dayObj.date) && dayObj.currentMonth;
          const notCurrent = !dayObj.currentMonth;

          let className = styles.dayCell;
          if (notCurrent) className += ` ${styles.otherMonth}`;
          if (past) className += ` ${styles.pastDay}`;
          if (selected) className += ` ${styles.selectedDay}`;
          if (todayMark && !selected) className += ` ${styles.todayDay}`;

          return (
            <button
              type="button"
              key={idx}
              className={className}
              onClick={() => handleDayClick(dayObj)}
              disabled={past || notCurrent}
              aria-label={`${dayObj.day}`}
            >
              <span>{dayObj.day}</span>
              {todayMark && <div className={styles.todayDot} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
