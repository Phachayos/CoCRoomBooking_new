"use client";

import { useState } from "react";
import { useLanguage } from "../providers/LanguageProvider";
import styles from "../app/book/book.module.css";

export default function BookingForm({ onSuccess }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    reason: "",
    room: "Room 1",
    date: "",
    startHour: "08:00",
    endHour: "09:00",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const startDateTime = new Date(`${formData.date}T${formData.startHour}:00`);
      const endDateTime = new Date(`${formData.date}T${formData.endHour}:00`);
      
      const payload = {
        ...formData,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to book room");
      }

      onSuccess(data.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <div className={styles['error-message']}>{error}</div>}
      <form onSubmit={handleSubmit} className={styles['booking-form']}>
        <div className="form-group">
          <label className="label">{t("lblRoom")}</label>
          <select name="room" className="input-field" value={formData.room} onChange={handleChange} required>
            <option value="Room 1">Room 1</option>
            <option value="Room 2">Room 2</option>
          </select>
        </div>

        <div className="form-group">
          <label className="label">{t("lblStudentId")}</label>
          <input type="text" name="studentId" className="input-field" value={formData.studentId} onChange={handleChange} maxLength={10} minLength={10} required placeholder={t("phStudentId")} />
        </div>

        <div className={styles['form-row']}>
          <div className="form-group">
            <label className="label">{t("lblFirstName")}</label>
            <input type="text" name="firstName" className="input-field" value={formData.firstName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="label">{t("lblLastName")}</label>
            <input type="text" name="lastName" className="input-field" value={formData.lastName} onChange={handleChange} required />
          </div>
        </div>

        <div className={styles['form-row']}>
          <div className="form-group">
            <label className="label">{t("lblEmail")}</label>
            <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} required placeholder={t("phEmail")} />
          </div>
          <div className="form-group">
            <label className="label">{t("lblPhone")}</label>
            <input type="tel" name="phone" className="input-field" value={formData.phone} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
          <label className="label">{t("lblReason")}</label>
          <input type="text" name="reason" className="input-field" value={formData.reason} onChange={handleChange} required placeholder={t("phReason")} />
        </div>

        <div className="form-group">
          <label className="label">วันที่จอง / Date</label>
          <input type="date" name="date" className="input-field" value={formData.date} onChange={handleChange} required />
        </div>

        <div className={styles['form-row']}>
          <div className="form-group">
            <label className="label">{t("lblStart")}</label>
            <select name="startHour" className="input-field" value={formData.startHour} onChange={handleChange} required>
              {Array.from({ length: 30 }, (_, i) => {
                const hour = Math.floor(i / 2) + 8;
                const min = i % 2 === 0 ? "00" : "30";
                return `${hour.toString().padStart(2, "0")}:${min}`;
              }).map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">{t("lblEnd")}</label>
            <select name="endHour" className="input-field" value={formData.endHour} onChange={handleChange} required>
              {Array.from({ length: 30 }, (_, i) => {
                const hour = Math.floor((i + 1) / 2) + 8;
                const min = (i + 1) % 2 === 0 ? "00" : "30";
                return `${hour.toString().padStart(2, "0")}:${min}`;
              }).map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" className={`btn btn-primary ${styles['submit-btn']}`} disabled={loading}>
          {loading ? t("btnProcessing") : t("btnConfirm")}
        </button>
      </form>
    </>
  );
}
