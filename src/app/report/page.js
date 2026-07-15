"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../providers/LanguageProvider";
import styles from "./report.module.css";

export default function ReportUsage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    studentId: "",
    bookingId: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size should be less than 5MB");
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError(t("noFileChosen"));
      return;
    }

    setError("");
    setLoading(true);

    const submitData = new FormData();
    submitData.append("studentId", formData.studentId);
    submitData.append("bookingId", formData.bookingId);
    submitData.append("image", image);

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        body: submitData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit report");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`container ${styles['report-container']} ${styles['success-container']}`}>
        <div className={`card glass-panel text-center animate-fade-in-up`}>
          <div className={styles['success-icon']}>📸</div>
          <h2 className={styles['success-title']}>{t("reportSuccessTitle")}</h2>
          <p className={styles['success-message']}>{t("reportSuccessMsg")}</p>
          <button className={`btn btn-primary mt-4`} onClick={() => router.push('/')}>
            {t("btnReturnHome")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles['report-container']}`}>
      <div className={`card glass-panel ${styles['form-card']} animate-fade-in-up`}>
        <h2 className={styles['form-title']}>{t("reportTitle")}</h2>
        <p className={styles['form-subtitle']}>
          {t("reportSubtitle")}
        </p>

        {error && <div className={styles['error-message']}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles['report-form']}>
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

          <div className={`form-group ${styles['upload-group']}`}>
            <label className="label">{t("lblPhoto")}</label>
            <div className={styles['file-upload-wrapper']}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className={styles['file-input']} 
                id="file-upload"
              />
              <label htmlFor="file-upload" className={styles['file-upload-btn']}>
                {image ? t("btnChangePhoto") : t("btnChoosePhoto")}
              </label>
              <span className={styles['file-name']}>{image ? image.name : t("noFileChosen")}</span>
            </div>
          </div>

          {preview && (
            <div className={`${styles['report-photo-preview']} mt-4`}>
              <p className="text-sm text-secondary mb-2 font-bold">Photo Preview:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" style={{ maxWidth: '100%', borderRadius: '12px', maxHeight: '250px', objectFit: 'cover' }} />
            </div>
          )}

          <button type="submit" className={`btn btn-primary ${styles['submit-btn']}`} disabled={loading}>
            {loading ? t("btnUploading") : t("btnSubmitReport")}
          </button>
        </form>
      </div>
    </div>
  );
}
