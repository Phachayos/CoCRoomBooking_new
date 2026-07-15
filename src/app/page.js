"use client";

import Link from 'next/link';
import Timetable from '../components/Timetable';
import { useLanguage } from '../providers/LanguageProvider';
import styles from './page.module.css';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className={`container ${styles['home-container']}`}>
      <header className={`${styles.hero} glass-panel animate-fade-in`}>
        <div className={styles['hero-content']}>
          <h1 className={`${styles['hero-title']} animate-fade-in-up delay-100`}>{t("homeTitle")}</h1>
          <p className={`${styles['hero-subtitle']} animate-fade-in-up delay-200`}>
            {t("homeSubtitle")}
          </p>
          <div className={`${styles['hero-actions']} animate-fade-in-up delay-300`}>
            <Link href="/book" className={`btn btn-primary ${styles['hero-btn']}`}>
              {t("btnBook")}
            </Link>
            <Link href="/report" className={`btn btn-secondary ${styles['hero-btn']}`}>
              {t("btnReport")}
            </Link>
          </div>
        </div>
      </header>
      
      <section className={`${styles['schedule-section']} animate-fade-in-up delay-300`}>
        <Timetable />
      </section>
    </div>
  );
}
