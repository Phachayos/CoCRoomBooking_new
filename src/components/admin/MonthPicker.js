"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../providers/LanguageProvider";
import styles from "./MonthPicker.module.css";

const MONTHS_TH = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];
const MONTHS_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const FULL_MONTHS_TH = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];
const FULL_MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function MonthPicker({ value, onChange }) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // value is expected to be "YYYY-MM"
  const currentYear = value ? parseInt(value.split("-")[0], 10) : new Date().getFullYear();
  const currentMonth = value ? parseInt(value.split("-")[1], 10) - 1 : new Date().getMonth();

  const [viewYear, setViewYear] = useState(currentYear);

  const monthNames = language === "th" ? MONTHS_TH : MONTHS_EN;
  const fullMonthNames = language === "th" ? FULL_MONTHS_TH : FULL_MONTHS_EN;
  const displayYear = currentYear + (language === "th" ? 543 : 0);
  const displayViewYear = viewYear + (language === "th" ? 543 : 0);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMonthSelect = (monthIndex) => {
    const mm = String(monthIndex + 1).padStart(2, "0");
    onChange(`${viewYear}-${mm}`);
    setIsOpen(false);
  };

  const handlePrevYear = (e) => {
    e.stopPropagation();
    setViewYear(prev => prev - 1);
  };

  const handleNextYear = (e) => {
    e.stopPropagation();
    setViewYear(prev => prev + 1);
  };

  const toggleOpen = () => {
    if (!isOpen) {
      setViewYear(currentYear); // Reset view year to selected year when opening
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button 
        type="button" 
        className={`${styles.trigger} ${isOpen ? styles.active : ""}`} 
        onClick={toggleOpen}
      >
        <span className={styles.icon}>📅</span>
        <span className={styles.label}>
          {fullMonthNames[currentMonth]} {displayYear}
        </span>
        <span className={styles.chevron}>▼</span>
      </button>

      {isOpen && (
        <div className={styles.popover}>
          <div className={styles.header}>
            <button type="button" className={styles.navBtn} onClick={handlePrevYear}>‹</button>
            <span className={styles.yearLabel}>{displayViewYear}</span>
            <button type="button" className={styles.navBtn} onClick={handleNextYear}>›</button>
          </div>
          <div className={styles.grid}>
            {monthNames.map((month, index) => {
              const isSelected = viewYear === currentYear && index === currentMonth;
              const isFuture = viewYear > new Date().getFullYear() || (viewYear === new Date().getFullYear() && index > new Date().getMonth());
              
              return (
                <button
                  key={index}
                  type="button"
                  className={`${styles.monthBtn} ${isSelected ? styles.selected : ""}`}
                  onClick={() => handleMonthSelect(index)}
                >
                  {month}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
