"use client";

import { useState } from "react";
import { useLanguage } from "../../providers/LanguageProvider";
import styles from "../../app/admin/admin.module.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function AdminLogin({ onLogin }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onLogin({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: userCredential.user.email.split('@')[0]
      });
    } catch (err) {
      console.error(err);
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`container ${styles['admin-login-container']}`}>
      <div className={`card glass-panel ${styles['admin-login-card']} animate-fade-in-up`}>
        <h2 className={`${styles['admin-title']} text-center`}>{t("adminAccess") || "Admin Access"}</h2>
        
        {error && (
          <div className="error-message" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '6px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="admin-form">
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="label">Admin Email (อีเมลผู้ดูแลระบบ)</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="e.g. admin@coc.psu.ac.th" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="label">Password (รหัสผ่าน)</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder={t("lblPassword") || "Password"} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className={`btn btn-primary ${styles['w-100']}`} disabled={loading} style={{ padding: '1rem', borderRadius: 'var(--radius-full)'}}>
            {loading ? "กำลังเข้าสู่ระบบ..." : (t("btnLogin") || "Login")}
          </button>
        </form>
      </div>
    </div>
  );
}
