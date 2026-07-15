"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "../locales/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    // Check local storage on mount
    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage && (storedLanguage === "en" || storedLanguage === "th")) {
      // eslint-disable-next-line
      setLanguage(storedLanguage);
    } else {
      // Default to Thai if no preference
      // eslint-disable-next-line
      setLanguage("th");
      localStorage.setItem("language", "th");
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === "en" ? "th" : "en";
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
