export const defaultLocale = localStorage.getItem('mps-locale') || 'en'

export const locales = [
  {
    code: 'en',
    name: 'English',
    dir: 'ltr'
  },
  {
    code: 'ru',
    name: 'Русский',
    dir: 'ltr'
  },
  {
    code: 'kg',
    name: 'Кыргыз',
    dir: 'ltr'
  }  
]
