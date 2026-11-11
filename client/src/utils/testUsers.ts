/**
 * Avtomatik yaradılmış test hesablarını aşkarlayır (məs. "user1_1699999999999@example.com").
 * Bu hesablar SİLİNMİR — yalnız admin siyahısında filtr/etiket üçün istifadə olunur.
 */
const TEST_USER_EMAIL_RE = /^(user\d+_\d+|test\w*|testmcp\w*|mcp[_\w]*|demo\d*|seed\d*)@/i;

export const isTestUser = (email: string): boolean =>
  TEST_USER_EMAIL_RE.test(email.trim());
