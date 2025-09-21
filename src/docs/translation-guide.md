# CalmPulse Translation System Guide

This guide explains how to use the translation system implemented in CalmPulse to ensure all text in the application is translatable across multiple languages.

## Overview

The translation system in CalmPulse is built around the following components:

1. **LanguageContext.js** - Central context managing the current language and handling API translations
2. **useTranslate** - A hook that facilitates text translation in components
3. **useCommonTranslations** - A hook that provides pre-translated common phrases
4. **TranslatedText** - A component that wraps text content to be translated

## How to Make Text Translatable

### 1. Using the TranslatedText Component

The simplest way to make text translatable is to wrap it with the `TranslatedText` component:

```jsx
import TranslatedText from '../components/TranslatedText';

// Example usage:
<h1><TranslatedText text="Welcome to CalmPulse" /></h1>

// With different HTML element:
<TranslatedText text="Start your journey" as="button" />

// With additional props:
<TranslatedText 
  text="Click here to continue" 
  as="button"
  className="action-button" 
  onClick={handleClick} 
/>
```

### 2. Using the useTranslate Hook

For more dynamic text translations or conditional translations:

```jsx
import { useTranslate } from '../hooks/useTranslate';

function MyComponent() {
  const { translate, currentLanguage } = useTranslate();
  const [translatedMessage, setTranslatedMessage] = useState('');
  
  useEffect(() => {
    async function translateText() {
      const result = await translate('Your message here');
      setTranslatedMessage(result);
    }
    
    translateText();
  }, [translate]);
  
  return <div>{translatedMessage}</div>;
}
```

### 3. Using Common Translations

For frequently used phrases like navigation items, page titles, and actions:

```jsx
import { useCommonTranslations } from '../hooks/useCommonTranslations';

function Navigation() {
  const { translations } = useCommonTranslations();
  
  return (
    <nav>
      <ul>
        <li>{translations.home}</li>
        <li>{translations.profile}</li>
        <li>{translations.settings}</li>
      </ul>
    </nav>
  );
}
```

## Guidelines for Translatable Text

1. **Make all user-facing text translatable** - This includes:
   - Headings and titles
   - Button and link text
   - Form labels and placeholders
   - Messages and notifications
   - Content text

2. **Keep text concise and clear** - Avoid idioms or culturally specific references that may not translate well.

3. **Handle dynamic content properly** - For text with variables, use template strings with the translated parts:
   ```jsx
   <p>
     <TranslatedText text="Hello" /> {userName}! 
     <TranslatedText text="You have" /> {messageCount} 
     <TranslatedText text="unread messages" />
   </p>
   ```

4. **Ensure proper context** - Sometimes the same word in English can have different meanings in other languages. Provide context in your translations.

## Language Selector

The language selector is available in the application navbar, allowing users to switch between available languages:

- English
- Hindi
- Kannada
- Telugu
- Tamil
- Marathi
- Gujarati
- Bengali

## Adding New Languages

To add support for additional languages:

1. Update the `languages` array in `LanguageContext.js` with the new language and its ISO code
2. Ensure the Google Translate API supports the target language
3. Test the translations with native speakers if possible

## Translation Caching

The translation system includes caching to improve performance and reduce API calls:

- Translations are cached both in the `LanguageContext` and in the `useTranslate` hook
- The cache is cleared when the language is changed

## Best Practices

1. Always use the `TranslatedText` component for static text
2. For dynamic content, use the `useTranslate` hook
3. For common UI elements, leverage the `useCommonTranslations` hook
4. Test your UI with different languages to ensure layouts handle longer translated text
5. Keep an eye on translation quotas with the Google Translate API

By following these guidelines, you'll ensure that CalmPulse provides a consistent multilingual experience for all users. 