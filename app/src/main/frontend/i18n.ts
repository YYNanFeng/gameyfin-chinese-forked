import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import zhCN from './locales/zh-CN.json';

// 从 localStorage 读取用户偏好的语言，如果没有则默认为简体中文
const savedLanguage = localStorage.getItem('preferred-language') || 'zh-CN';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            'zh-CN': { translation: zhCN }
        },
        lng: savedLanguage, // 使用保存的语言偏好或默认简体中文
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
