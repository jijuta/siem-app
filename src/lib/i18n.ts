import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import koCommon from '../../public/locales/ko/common.json';
import enCommon from '../../public/locales/en/common.json';
import jaCommon from '../../public/locales/ja/common.json';
import zhCommon from '../../public/locales/zh/common.json';

import koLogin from '../../public/locales/ko/login.json';
import enLogin from '../../public/locales/en/login.json';
import jaLogin from '../../public/locales/ja/login.json';
import zhLogin from '../../public/locales/zh/login.json';

import koUserManagement from '../../public/locales/ko/user-management.json';
import enUserManagement from '../../public/locales/en/user-management.json';
import jaUserManagement from '../../public/locales/ja/user-management.json';
import zhUserManagement from '../../public/locales/zh/user-management.json';

import koCompanyManagement from '../../public/locales/ko/company-management.json';
import enCompanyManagement from '../../public/locales/en/company-management.json';
import jaCompanyManagement from '../../public/locales/ja/company-management.json';
import zhCompanyManagement from '../../public/locales/zh/company-management.json';

import koDepartmentManagement from '../../public/locales/ko/department-management.json';
import enDepartmentManagement from '../../public/locales/en/department-management.json';
import jaDepartmentManagement from '../../public/locales/ja/department-management.json';
import zhDepartmentManagement from '../../public/locales/zh/department-management.json';

const resources = {
  ko: {
    translation: koCommon,
    login: koLogin,
    userManagement: koUserManagement,
    companyManagement: koCompanyManagement,
    departmentManagement: koDepartmentManagement
  },
  en: {
    translation: enCommon,
    login: enLogin,
    userManagement: enUserManagement,
    companyManagement: enCompanyManagement,
    departmentManagement: enDepartmentManagement
  },
  ja: {
    translation: jaCommon,
    login: jaLogin,
    userManagement: jaUserManagement,
    companyManagement: jaCompanyManagement,
    departmentManagement: jaDepartmentManagement
  },
  zh: {
    translation: zhCommon,
    login: zhLogin,
    userManagement: zhUserManagement,
    companyManagement: zhCompanyManagement,
    departmentManagement: zhDepartmentManagement
  },
};

// Get saved language from localStorage or use default
const getSavedLanguage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('i18n-language') || 'ko';
  }
  return 'ko';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getSavedLanguage(), // Use saved language or default to Korean
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Save language to localStorage when it changes
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('i18n-language', lng);
  }
});

export default i18n;