"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../providers/LanguageProvider";
import BookingForm from "../../components/BookingForm";
import styles from "./book.module.css";

export default function BookRoom() {
  const router = useRouter();
  const { t } = useLanguage();
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSuccess = (id) => {
    setBookingId(id);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className={`container ${styles['book-container']} ${styles['success-container']}`}>
        <div className={`card glass-panel text-center animate-fade-in-up`}>
          <div className={styles['success-icon']}>✅</div>
          <h2 className={styles['success-title']}>{t("bookSuccessTitle")}</h2>
          <p className={styles['success-message']}>{t("bookSuccessMsg")}</p>
          <div className={styles['booking-id-box']} onClick={handleCopy} title="Click to copy">
            <span>{t("bookingIdLabel")}</span>
            <strong>{bookingId}</strong>
            <div className={styles['copy-indicator']}>
              {copied ? <span className="text-success">✓ Copied!</span> : <span>📋 Copy</span>}
            </div>
          </div>
          <p className={styles['success-note']}>{t("bookSuccessNote")}</p>
          <button className={`btn btn-primary mt-4`} onClick={() => router.push('/')}>
            {t("btnReturnHome")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles['book-container']}`}>
      <div className={`card glass-panel ${styles['form-card']} animate-fade-in-up`}>
        <h2 className={styles['form-title']}>{t("bookTitle")}</h2>
        <p className={styles['form-subtitle']}>{t("bookSubtitle")}</p>
        <BookingForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
