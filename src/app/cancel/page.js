"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../providers/LanguageProvider";
import styles from "./cancel.module.css";

export default function CancelBooking() {
  const router = useRouter();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    studentId: "",
    bookingId: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      setSuccess("Booking cancelled successfully!");
      setFormData({ studentId: "", bookingId: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`container ${styles['cancel-container']}`}>
      <div className={`card glass-panel ${styles['cancel-card']} animate-fade-in-up`}>
        <h2 className={styles['cancel-title']}>{t("cancelTitle")}</h2>
        <p className={styles['cancel-subtitle']}>
          {t("cancelSubtitle")}
        </p>

        {error && <div className={styles['error-message']}>{error}</div>}
        {success && <div className={styles['success-banner']}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles['cancel-form']}>
          <div className="form-group">
            <label className="label">{t("lblStudentId")}</label>
            <input 
              type="text" 
              name="studentId" 
              className="input-field" 
              value={formData.studentId} 
              onChange={handleChange} 
              maxLength={10} 
              required 
              placeholder={t("phStudentId")} 
            />
          </div>

          <div className="form-group">
            <label className="label">{t("bookingIdLabel")}</label>
            <input 
              type="text" 
              name="bookingId" 
              className="input-field" 
              value={formData.bookingId} 
              onChange={handleChange} 
              required 
              placeholder={t("phBookingId")} 
            />
          </div>

          <button type="submit" className={`btn btn-danger ${styles['submit-btn']}`} disabled={loading}>
            {loading ? t("btnCancelling") : t("btnCancel")}
          </button>
        </form>
      </div>
    </div>
  );
}
