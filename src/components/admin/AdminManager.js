"use client";

import { useState, useEffect } from "react";
import styles from "../../app/admin/admin.module.css";
import { toast } from 'react-hot-toast';
import Skeleton from "../../components/ui/Skeleton";

export default function AdminManager({ currentUser }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Admin Form State
  const [newStudentId, setNewStudentId] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [updatePassword, setUpdatePassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: newStudentId, name: newName, password: newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("เพิ่มแอดมินสำเร็จ");
        setNewStudentId("");
        setNewName("");
        setNewPassword("");
        fetchAdmins(); // Refresh list
      } else {
        toast.error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบแอดมินรายนี้?")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("ลบแอดมินสำเร็จ");
        setAdmins(prev => prev.filter(a => a.id !== id));
      } else {
        const data = await res.json();
        toast.error(data.error || "ไม่สามารถลบได้");
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    try {
      const res = await fetch("/api/admin/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword: updatePassword })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("เปลี่ยนรหัสผ่านสำเร็จ!");
        setCurrentPassword("");
        setUpdatePassword("");
      } else {
        toast.error(data.error || "รหัสผ่านเดิมไม่ถูกต้อง");
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className={styles['manager-container']}>
      {/* List of Admins */}
      <div className={`card ${styles['mb-4']}`}>
        <h3 className={styles['manager-title']}>รายชื่อผู้ดูแลระบบทั้งหมด</h3>
        {loading ? (
          <Skeleton height="150px" className="mt-4" />
        ) : (
          <div className={styles['bookings-table-wrapper']}>
            <table className={styles['bookings-table']}>
              <thead>
                <tr>
                  <th>รหัสนักศึกษา</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>วันที่เพิ่ม</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id}>
                    <td><strong>{admin.studentId}</strong></td>
                    <td>{admin.name} {admin.id === currentUser.id && <span className={styles['status-active']}> (คุณ)</span>}</td>
                    <td>{new Date(admin.createdAt).toLocaleDateString('th-TH')}</td>
                    <td>
                      {admin.id !== currentUser.id && (
                        <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} onClick={() => handleDeleteAdmin(admin.id)}>
                          ลบสิทธิ์
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={styles['manager-grid']}>
        {/* Add New Admin Form */}
        <div className="card">
          <h3 className={styles['manager-title']}>เพิ่มผู้ดูแลระบบ (Admin)</h3>
          <form onSubmit={handleAddAdmin}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="label">รหัสนักศึกษา</label>
              <input type="text" className="input-field" value={newStudentId} onChange={e => setNewStudentId(e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="label">ชื่อ-นามสกุล</label>
              <input type="text" className="input-field" value={newName} onChange={e => setNewName(e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="label">รหัสผ่านเริ่มต้น</label>
              <input type="password" className="input-field" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={addLoading}>
              {addLoading ? "กำลังเพิ่ม..." : "เพิ่มสิทธิ์ Admin"}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card">
          <h3 className={styles['manager-title']}>เปลี่ยนรหัสผ่านส่วนตัว</h3>
          <form onSubmit={handleChangePassword}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="label">รหัสผ่านปัจจุบัน</label>
              <input type="password" className="input-field" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="label">รหัสผ่านใหม่</label>
              <input type="password" className="input-field" value={updatePassword} onChange={e => setUpdatePassword(e.target.value)} required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={passLoading}>
              {passLoading ? "กำลังเปลี่ยนรหัส..." : "บันทึกรหัสผ่าน"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
