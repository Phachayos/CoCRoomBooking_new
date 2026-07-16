"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useLanguage } from "../providers/LanguageProvider";
import styles from "./Timetable.module.css";

// Operating hours: 08:00 - 23:00
const SLOT_START_HOUR = 8;
const SLOT_END_HOUR = 23;

// Generate hour blocks (1-hour each for cleaner display)
const generateHourBlocks = () => {
  const blocks = [];
  for (let h = SLOT_START_HOUR; h < SLOT_END_HOUR; h++) {
    blocks.push({
      hour: h,
      label: `${h.toString().padStart(2, "0")}:00`,
      endLabel: `${(h + 1).toString().padStart(2, "0")}:00`,
    });
  }
  return blocks;
};

const HOUR_BLOCKS = generateHourBlocks();

// Get Bangkok date string (YYYY-MM-DD)
const getBangkokDateStr = (date) => {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });
};

// Get Bangkok hour/minute from a Date
const getBangkokTime = (date) => {
  const str = date.toLocaleTimeString("en-GB", {
    timeZone: "Asia/Bangkok",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
  const [h, m] = str.split(":").map(Number);
  return { hour: h, minute: m, totalMinutes: h * 60 + m };
};

// Format time for display
const formatBKKTime = (date) => {
  return date.toLocaleTimeString("th-TH", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export default function Timetable() {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRealtime, setIsRealtime] = useState(false);
  const [todayStr, setTodayStr] = useState(() => getBangkokDateStr(new Date()));
  const [currentMinutes, setCurrentMinutes] = useState(() => getBangkokTime(new Date()).totalMinutes);
  const pollingRef = useRef(null);

  // Fetch from API (fallback)
  const fetchFromAPI = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch (err) {
      console.error("API fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Try real-time Firestore first, fallback to API polling
  useEffect(() => {
    let unsubscribe = null;

    try {
      const q = query(
        collection(db, "access_logs"),
        where("status", "==", "ACTIVE")
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map((doc) => {
            const d = doc.data();
            return {
              id: doc.id,
              ...d,
              startTime: d.startTime?.toDate?.() ? d.startTime.toDate().toISOString() : d.startTime,
              endTime: d.endTime?.toDate?.() ? d.endTime.toDate().toISOString() : d.endTime,
            };
          });
          setBookings(data);
          setLoading(false);
          setIsRealtime(true);
        },
        (error) => {
          console.warn("Firestore real-time not available, falling back to API polling:", error.message);
          setIsRealtime(false);
          // Fallback: fetch from API and start polling
          fetchFromAPI();
          pollingRef.current = setInterval(fetchFromAPI, 10000); // poll every 10s
        }
      );
    } catch (err) {
      console.warn("Firestore setup failed, using API polling:", err.message);
      fetchFromAPI();
      pollingRef.current = setInterval(fetchFromAPI, 10000);
    }

    return () => {
      if (unsubscribe) unsubscribe();
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchFromAPI]);

  // Update time every 30 seconds + midnight auto-reset
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const newTodayStr = getBangkokDateStr(now);
      const bkk = getBangkokTime(now);

      if (newTodayStr !== todayStr) {
        setTodayStr(newTodayStr);
      }
      setCurrentMinutes(bkk.totalMinutes);
    }, 30000);

    return () => clearInterval(timer);
  }, [todayStr]);

  // Filter bookings for today (Bangkok time)
  const todayBookings = bookings.filter((b) => {
    const bookingDate = getBangkokDateStr(new Date(b.startTime));
    return bookingDate === todayStr;
  });

  const room1Bookings = todayBookings.filter((b) => b.room === "Room 1");
  const room2Bookings = todayBookings.filter((b) => b.room === "Room 2");

  // Check if an hour block overlaps with any booking
  const getBlockStatus = useCallback((block, roomBookings) => {
    const blockStart = block.hour * 60;
    const blockEnd = blockStart + 60;

    const overlapping = [];
    for (const booking of roomBookings) {
      const bStart = getBangkokTime(new Date(booking.startTime));
      const bEnd = getBangkokTime(new Date(booking.endTime));

      if (blockStart < bEnd.totalMinutes && blockEnd > bStart.totalMinutes) {
        overlapping.push(booking);
      }
    }

    if (overlapping.length > 0) {
      return { booked: true, bookings: overlapping };
    }
    return { booked: false };
  }, []);

  const isPastBlock = (block) => (block.hour + 1) * 60 <= currentMinutes;
  const isCurrentBlock = (block) => {
    const s = block.hour * 60;
    return currentMinutes >= s && currentMinutes < s + 60;
  };

  const renderRoomTimeline = (roomBookings) => {
    return HOUR_BLOCKS.map((block, idx) => {
      const status = getBlockStatus(block, roomBookings);
      const past = isPastBlock(block);
      const current = isCurrentBlock(block);

      if (status.booked) {
        const booking = status.bookings[0];
        const name = `${booking.firstName} ${booking.lastName}`;
        const startStr = formatBKKTime(new Date(booking.startTime));
        const endStr = formatBKKTime(new Date(booking.endTime));

        return (
          <div
            key={idx}
            className={`${styles.block} ${styles.bookedBlock} ${past ? styles.pastBlock : ""} ${current ? styles.currentBlock : ""}`}
          >
            <div className={styles.blockTime}>{block.label}</div>
            <div className={styles.blockContent}>
              <div className={styles.bookedBadge}>
                <span className={styles.bookedIcon}>🔒</span>
                <span>{t("slotBooked")}</span>
              </div>
              <div className={styles.bookedName}>{name}</div>
              <div className={styles.bookedTimeRange}>{startStr} – {endStr}</div>
            </div>
          </div>
        );
      }

      return (
        <div
          key={idx}
          className={`${styles.block} ${styles.availableBlock} ${past ? styles.pastBlock : ""} ${current ? styles.currentBlock : ""}`}
        >
          <div className={styles.blockTime}>{block.label}</div>
          <div className={styles.blockContent}>
            <div className={styles.availableBadge}>
              <span className={styles.availableIcon}>✓</span>
              <span>{past ? t("slotPast") : t("slotAvailable")}</span>
            </div>
          </div>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t("scheduleTitle")}</h2>
        </div>
        <div className={styles.loadingPulse}>
          <div className={styles.loadingBar} />
          <div className={styles.loadingBar} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>{t("scheduleTitle")}</h2>
        <div className={styles.liveIndicator}>
          <span className={styles.liveDot} />
          <span>{isRealtime ? "LIVE" : "AUTO"}</span>
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendAvailable}`} />
          <span>{t("slotAvailable")}</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendBooked}`} />
          <span>{t("slotBooked")}</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendPast}`} />
          <span>{t("slotPast")}</span>
        </div>
      </div>

      {/* Room columns */}
      <div className={styles.roomsGrid}>
        <div className={styles.roomSection}>
          <div className={styles.roomHeader}>
            <span>🏢</span> Room 1
          </div>
          <div className={styles.timeline}>
            {renderRoomTimeline(room1Bookings)}
          </div>
        </div>

        <div className={styles.roomSection}>
          <div className={styles.roomHeader}>
            <span>🏢</span> Room 2
          </div>
          <div className={styles.timeline}>
            {renderRoomTimeline(room2Bookings)}
          </div>
        </div>
      </div>
    </div>
  );
}
