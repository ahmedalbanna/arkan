/**
 * Translation utilities for handling multi-language support.
 */

type Locale = 'en' | 'ar';

/**
 * Finds a translation by key in the specified locale's translations.
 * @param locale The locale to search in
 * @param translations The translations object
 * @param keys Array of nested keys to traverse
 * @returns The translated string or undefined if not found
 */
export function findTranslation(
  locale: Locale,
  translations: Record<Locale, Record<string, any>>,
  keys: string[]
): string | undefined {
  let result: any = translations[locale];
  for (const k of keys) {
    result = result?.[k];
    if (result === undefined) return undefined;
  }
  return typeof result === 'string' ? result : undefined;
}

/**
 * Interpolates variables into a translated string.
 * @param translated The translated string with placeholders like {varName}
 * @param variables Object with variable names and values
 * @returns The string with variables interpolated
 */
export function interpolateVariables(
  translated: string,
  variables?: Record<string, any>
): string {
  if (!variables) return translated;

  let result = translated;
  Object.keys(variables).forEach((varName) => {
    result = result.replace(`{${varName}}`, variables[varName]);
  });
  return result;
}

/**
 * Translates a nested key with optional variable interpolation.
 * @param key Dot-separated translation key (e.g., 'builder.buttons.save')
 * @param locale The current locale
 * @param translations The translations object
 * @param variables Optional variables for interpolation
 * @returns The translated string or the key if translation not found
 */
export function translate(
  key: string,
  locale: Locale,
  translations: Record<Locale, Record<string, any>>,
  variables?: Record<string, any>
): string {
  const keys = key.split('.');
  
  // Attempt to find translation, then fallback to English, finally default to key
  let translated: string = 
    findTranslation(locale, translations, keys) ||
    findTranslation('en', translations, keys) ||
    key;

  return interpolateVariables(translated, variables);
}
