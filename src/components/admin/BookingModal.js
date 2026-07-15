"use client";

import { useLanguage } from "../../providers/LanguageProvider";
import styles from "../../app/admin/admin.module.css";

export default function BookingModal({ booking, onClose }) {
  const { t } = useLanguage();

  if (!booking) return null;

  return (
    <div className={styles['modal-overlay']} onClick={onClose}>
      <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['modal-header']}>
          <h3>{t("adminDetailsTitle")}</h3>
          <button className={styles['close-btn']} onClick={onClose}>&times;</button>
        </div>
        <div className={styles['modal-body']}>
          <div className={styles['detail-row']}>
            <span className={styles['detail-label']}>{t("thBookingId")}</span>
            <span className={`${styles['detail-value']} ${styles['id-cell']}`}>{booking.id}</span>
          </div>
          <div className={styles['detail-row']}>
            <span className={styles['detail-label']}>Room</span>
            <span className={styles['detail-value']}><strong>{booking.room}</strong></span>
          </div>
          <div className={styles['detail-row']}>
            <span className={styles['detail-label']}>{t("lblStudentId")}</span>
            <span className={styles['detail-value']}>{booking.studentId}</span>
          </div>
          <div className={styles['detail-row']}>
            <span className={styles['detail-label']}>Name</span>
            <span className={styles['detail-value']}>{booking.firstName} {booking.lastName}</span>
          </div>
          <div className={styles['detail-row']}>
            <span className={styles['detail-label']}>{t("lblEmail")}</span>
            <span className={styles['detail-value']}>{booking.email}</span>
          </div>
          <div className={styles['detail-row']}>
            <span className={styles['detail-label']}>{t("lblPhone")}</span>
            <span className={styles['detail-value']}>{booking.phone}</span>
          </div>
          <div className={styles['detail-row']}>
            <span className={styles['detail-label']}>{t("lblReason")}</span>
            <span className={styles['detail-value']}>{booking.reason}</span>
          </div>
          <div className={styles['detail-row']}>
            <span className={styles['detail-label']}>{t("thDateTime")}</span>
            <span className={styles['detail-value']}>
              {new Date(booking.startTime).toLocaleDateString('th-TH')} | {new Date(booking.startTime).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit', hour12: false})} - {new Date(booking.endTime).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit', hour12: false})}
            </span>
          </div>
          <div className={styles['detail-row']}>
            <span className={styles['detail-label']}>{t("thStatus")}</span>
            <span className={styles['detail-value']}>
              <span className={`${styles['status-badge']} ${styles[`status-${booking.status.toLowerCase()}`]}`}>
                {booking.status}
              </span>
            </span>
          </div>
          {booking.postUsageImage && (
            <div className={styles['detail-row']}>
              <span className={styles['detail-label']}>Post-Usage Photo</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={booking.postUsageImage} alt="Room condition" style={{ width: '100%', borderRadius: '8px', marginTop: '0.5rem' }} />
            </div>
          )}
        </div>
        <div className={styles['modal-footer']}>
          <button className="btn btn-secondary" onClick={onClose}>
            {t("btnClose")}
          </button>
        </div>
      </div>
    </div>
  );
}
