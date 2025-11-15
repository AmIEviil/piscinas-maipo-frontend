import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslations from "./locales/en.json";
import esTranslations from "./locales/es.json";

const getBrowserLanguage = () => {
  const navLang = navigator.language || navigator.language;
  return navLang.split("-")[0].toLowerCase();
};

const supportedLangs = ["es", "en"];
const browserLang = getBrowserLanguage();
const initialLang = supportedLangs.includes(browserLang) ? browserLang : "es";
const localStorageLang = localStorage.getItem("selectedLanguage") || "es";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: localStorageLang || initialLang,
    fallbackLng: "es",
    supportedLngs: supportedLangs,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: enTranslations,
      },
      es: {
        translation: esTranslations,
      },
    },
    detection: {
      order: ["navigator", "querystring", "cookie", "localStorage"],
      caches: ["localStorage", "cookie"],
      convertDetectedLanguage: (lng) => lng.split("-")[0],
    },
  });

export default i18n;
