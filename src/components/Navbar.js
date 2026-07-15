"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "../providers/ThemeProvider";
import { useLanguage } from "../providers/LanguageProvider";
import styles from "./Navbar.module.css";

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles['nav-container']}`}>
        <Link href="/" className={styles['nav-logo']} onClick={closeMenu}>
          CoC Meeting Room
        </Link>
        
        <button className={styles.hamburger} onClick={toggleMenu} aria-label="Toggle menu">
          <span style={{ transform: isMenuOpen ? 'rotate(45deg) translate(5px, 6px)' : 'none' }}></span>
          <span style={{ opacity: isMenuOpen ? 0 : 1 }}></span>
          <span style={{ transform: isMenuOpen ? 'rotate(-45deg) translate(5px, -6px)' : 'none' }}></span>
        </button>

        <div className={`${styles['nav-links']} ${isMenuOpen ? styles.open : ''}`}>
          <Link href="/" className={styles['nav-link']} onClick={closeMenu}>{t("navHome")}</Link>
          <Link href="/cancel" className={styles['nav-link']} onClick={closeMenu}>{t("navCancel")}</Link>
          <Link href="/report" className={styles['nav-link']} onClick={closeMenu}>{t("navReport")}</Link>
          
          <button onClick={() => { toggleLanguage(); closeMenu(); }} className={styles['lang-toggle']} aria-label="Toggle Language" title="Change Language / เปลี่ยนภาษา">
            <GlobeIcon />
            {language === "en" ? "ไทย" : "EN"}
          </button>
          
          <button onClick={() => { toggleTheme(); closeMenu(); }} className={styles['theme-toggle']} aria-label="Toggle Theme">
            {theme === "light" ? t("themeDark") : t("themeLight")}
          </button>
        </div>
      </div>
    </nav>
  );
}
