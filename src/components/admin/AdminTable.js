"use client";

import { useLanguage } from "../../providers/LanguageProvider";
import Skeleton from "../ui/Skeleton";
import styles from "../../app/admin/admin.module.css";

export default function AdminTable({ 
  bookings, 
  loading, 
  selectedMonth, 
  setSelectedMonth, 
  onExport, 
  onDelete, 
  onSelectBooking 
}) {
  const { t } = useLanguage();

  // Filter bookings based on selected month
  const filteredBookings = bookings.filter((b) => {
    // Get start time in BKK to correctly match the YYYY-MM
    const d = new Date(b.startTime);
    const bkkTime = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    const bkkMonth = bkkTime.toISOString().slice(0, 7);
    return bkkMonth === selectedMonth;
  });

  return (
    <>
      {/* Admin Controls: Month Filter and Excel Export */}
      {!loading && (
        <div className="admin-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="month-filter" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="month-select" className="label" style={{ marginBottom: 0 }}>เลือกเดือน:</label>
            <input 
              id="month-select"
              type="month" 
              className="input-field" 
              style={{ width: 'auto', marginTop: 0 }}
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)} 
            />
          </div>
          <button className="btn btn-primary" onClick={() => onExport(filteredBookings)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5.884 6.68a.5.5 0 1 0-.768.64L7.349 10l-2.233 2.68a.5.5 0 0 0 .768.64L8 10.781l2.116 2.54a.5.5 0 0 0 .768-.641L8.651 10l2.233-2.68a.5.5 0 0 0-.768-.64L8 9.219l-2.116-2.54z"/>
              <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
            </svg>
            Export to Excel
          </button>
        </div>
      )}

      {loading ? (
        <div className={styles['bookings-table-wrapper']}>
           <Skeleton height="300px" borderRadius="var(--radius-md)" />
        </div>
      ) : (
        <div className={`${styles['bookings-table-wrapper']} card`}>
          <table className={styles['bookings-table']}>
            <thead>
              <tr>
                <th>{t("thBookingId")}</th>
                <th>Room</th>
                <th>{t("thStudentInfo")}</th>
                <th>{t("thDateTime")}</th>
                <th>{t("thStatus")}</th>
                <th>{t("thReport")}</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} onClick={() => onSelectBooking(booking)}>
                  <td className={styles['id-cell']} title={booking.id}>{booking.id.substring(0, 8)}...</td>
                  <td>
                    <strong>{booking.room}</strong>
                  </td>
                  <td>
                    <div className={styles['student-info']}>
                      <strong>{booking.firstName} {booking.lastName}</strong>
                      <span className={`${styles['text-sm']} ${styles['text-secondary']}`}>{booking.studentId} | {booking.phone}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles['time-info']}>
                      <span>{new Date(booking.startTime).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' })}</span>
                      <span className={styles['text-sm']}>
                        {new Date(booking.startTime).toLocaleTimeString('th-TH', {timeZone: 'Asia/Bangkok', hour: '2-digit', minute:'2-digit', hour12: false})} - 
                        {new Date(booking.endTime).toLocaleTimeString('th-TH', {timeZone: 'Asia/Bangkok', hour: '2-digit', minute:'2-digit', hour12: false})}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles['status-badge']} ${styles[`status-${booking.status.toLowerCase()}`]}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    {booking.postUsageImage ? (
                      <a href={booking.postUsageImage} target="_blank" rel="noreferrer" className={styles['view-photo-link']} onClick={(e) => e.stopPropagation()}>
                        {t("viewPhoto")}
                      </a>
                    ) : (
                      <span className={`${styles['text-secondary']} ${styles['text-sm']}`}>{t("noPhoto")}</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} 
                      onClick={(e) => onDelete(booking.id, e)}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan="7" className={`${styles['text-center']} ${styles['p-4']}`}>{t("noBookings")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
