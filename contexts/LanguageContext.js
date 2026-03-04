'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState({});

  useEffect(() => {
    loadMessages(language);
  }, [language]);

  const loadMessages = async (lang) => {
    try {
      const messages = await import(`@/messages/${lang}.json`);
      setMessages(messages.default);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = messages;
    
    for (const k of keys) {
      value = value?.[k];
      if (!value) break;
    }

    if (!value) return key;

    if (params && typeof value === 'string') {
      return value.replace(/{(\w+)}/g, (_, key) => params[key] || `{${key}}`);
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);