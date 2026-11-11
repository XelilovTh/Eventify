const TEST_USER_EMAIL_RE = /^(user\d+_\d+|test\w*|testmcp\w*|mcp[_\w]*|demo\d*|seed\d*)@/i;

export const isTestUser = (email: string): boolean =>
  TEST_USER_EMAIL_RE.test(email.trim());
