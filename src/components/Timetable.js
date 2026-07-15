"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../providers/LanguageProvider";
import Skeleton from "./ui/Skeleton";
import styles from "./Timetable.module.css";

// Generate a stable hue based on the user's name
const getHueForName = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
};

export default function Timetable() {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Sort bookings by startTime ascending so they appear sequentially
          const sorted = data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
          setBookings(sorted);
        } else {
          console.error("API returned non-array:", data);
          setBookings([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={styles['timetable-container']}>
        <Skeleton height="2rem" width="150px" className="mb-4" />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Skeleton height="200px" width="100%" borderRadius="var(--radius-md)" />
          <Skeleton height="200px" width="100%" borderRadius="var(--radius-md)" />
        </div>
      </div>
    );
  }

  // Filter today's bookings
  const today = new Date();
  const todayBookings = bookings.filter((b) => {
    const d = new Date(b.startTime);
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  });

  const room1Bookings = todayBookings.filter(b => b.room === "Room 1");
  const room2Bookings = todayBookings.filter(b => b.room === "Room 2");

  const renderBookingCard = (booking) => {
    const name = `${booking.firstName} ${booking.lastName}`;
    const hue = getHueForName(name);
    return (
      <div 
        key={booking.id} 
        className={styles['booking-card']}
        style={{ 
          backgroundColor: `hsla(${hue}, 70%, 50%, 0.15)`,
          borderLeftColor: `hsl(${hue}, 70%, 50%)`
        }}
      >
        <div className={styles['booking-info']}>
          <strong>{name}</strong>
          <span>
            {new Date(booking.startTime).toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false })} - {new Date(booking.endTime).toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={styles['timetable-container']}>
      <h2 className={styles['timetable-title']}>{t("scheduleTitle")}</h2>
      
      <div className={styles['rooms-header']}>
        <div className={styles['room-title']}>Room 1</div>
        <div className={styles['room-title']}>Room 2</div>
      </div>

      <div className={styles['timeline-wrapper']}>
        <div className={styles['room-column']}>
          {room1Bookings.length > 0 ? (
            room1Bookings.map(renderBookingCard)
          ) : (
            <div className={styles['empty-state']}>ไม่มีการจองในวันนี้</div>
          )}
        </div>

        <div className={styles['room-column']}>
          {room2Bookings.length > 0 ? (
            room2Bookings.map(renderBookingCard)
          ) : (
            <div className={styles['empty-state']}>ไม่มีการจองในวันนี้</div>
          )}
        </div>
      </div>
    </div>
  );
}
