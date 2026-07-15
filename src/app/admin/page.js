"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "../../providers/LanguageProvider";
import AdminLogin from "../../components/admin/AdminLogin";
import AdminTable from "../../components/admin/AdminTable";
import BookingModal from "../../components/admin/BookingModal";
import styles from "./admin.module.css";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';
import Skeleton from "../../components/ui/Skeleton";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const bkkTime = new Date(today.getTime() + 7 * 60 * 60 * 1000);
    return bkkTime.toISOString().slice(0, 7); 
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setAdminUser({ uid: user.uid, email: user.email, name: user.email.split('@')[0] });
        fetchBookings();
      } else {
        setIsAuthenticated(false);
        setAdminUser(null);
        setLoading(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (user) => {
    // onAuthStateChanged will handle this, but we can set loading here
    setLoading(true);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
    setAdminUser(null);
    setBookings([]);
  };

  const fetchBookings = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin/bookings", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async (filteredBookings) => {
    if (filteredBookings.length === 0) {
      toast.error("ไม่มีข้อมูลสำหรับส่งออกในเดือนนี้");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bookings Report');

    worksheet.columns = [
      { header: 'Booking ID', key: 'id', width: 40 },
      { header: 'Room', key: 'room', width: 12 },
      { header: 'Student ID', key: 'studentId', width: 15 },
      { header: 'First Name', key: 'firstName', width: 20 },
      { header: 'Last Name', key: 'lastName', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Reason', key: 'reason', width: 25 },
      { header: 'Date', key: 'dateStr', width: 15 },
      { header: 'Start Time', key: 'startTimeStr', width: 12 },
      { header: 'End Time', key: 'endTimeStr', width: 12 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFD966' } // Yellow background
      };
      cell.font = { bold: true, color: { argb: 'FF000000' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    filteredBookings.forEach((b) => {
      const d = new Date(b.startTime);
      const e = new Date(b.endTime);
      
      const bkkStart = new Date(d.getTime() + 7 * 60 * 60 * 1000);
      const bkkEnd = new Date(e.getTime() + 7 * 60 * 60 * 1000);
      
      const dateStr = bkkStart.toISOString().split('T')[0];
      const startTimeStr = bkkStart.toISOString().split('T')[1].substring(0, 5);
      const endTimeStr = bkkEnd.toISOString().split('T')[1].substring(0, 5);

      const row = worksheet.addRow({
        id: b.id,
        room: b.room,
        studentId: b.studentId,
        firstName: b.firstName,
        lastName: b.lastName,
        email: b.email,
        phone: b.phone,
        reason: b.reason,
        dateStr: dateStr,
        startTimeStr: startTimeStr,
        endTimeStr: endTimeStr,
        status: b.status
      });

      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle' };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `bookings_report_${selectedMonth}.xlsx`);
  };

  const handleDeleteBooking = async (id, e) => {
    e.stopPropagation();
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบการจองนี้อย่างถาวร?")) {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`/api/admin/bookings?id=${id}`, { 
          method: 'DELETE',
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          toast.success("ลบการจองเรียบร้อยแล้ว");
          setBookings(prev => prev.filter(b => b.id !== id));
        } else if (res.status === 401) {
          handleLogout();
        } else {
          toast.error("ไม่สามารถลบการจองได้ กรุณาลองใหม่อีกครั้ง");
        }
      } catch (err) {
        toast.error("เกิดข้อผิดพลาดในการลบการจอง");
        console.error("Error deleting booking:", err);
      }
    }
  };

  if (authLoading) {
    return (
      <div className={`container ${styles['admin-container']}`}>
        <Skeleton width="100%" height="400px" borderRadius="var(--radius-lg)" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className={`container ${styles['admin-container']}`}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className={styles['admin-title']} style={{ margin: 0 }}>{t("navAdmin") || "Admin Dashboard"}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            ยินดีต้อนรับ, <strong>{adminUser?.name}</strong>
          </span>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Content */}
      <p className={styles['admin-subtitle']} style={{ marginBottom: '1rem' }}>{t("adminSubtitle")}</p>
      <AdminTable 
        bookings={bookings}
        loading={loading}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        onExport={exportToExcel}
        onDelete={handleDeleteBooking}
        onSelectBooking={setSelectedBooking}
      />

      {/* Modal */}
      {selectedBooking && (
        <BookingModal 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)} 
        />
      )}
    </div>
  );
}
