/**
 * Input Sanitization and XSS Prevention
 *
 * Provides utilities to sanitize user input and prevent XSS attacks.
 * Used across all user-facing forms and API inputs.
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
  /(--|;|\/\*|\*\/|xp_|sp_)/gi,
  /('(\s)*(OR|AND)(\s)*')/gi,
];

const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
];

export const sanitize = {
  /**
   * Escape HTML special characters
   */
  escapeHtml(input: string): string {
    if (!input) return '';
    return String(input).replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
  },

  /**
   * Remove HTML tags from input
   */
  stripHtml(input: string): string {
    if (!input) return '';
    return String(input).replace(/<[^>]*>/g, '');
  },

  /**
   * Sanitize text input (removes HTML and dangerous patterns)
   */
  text(input: string): string {
    if (!input) return '';

    let sanitized = this.stripHtml(input);
    sanitized = sanitized.trim();

    XSS_PATTERNS.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized;
  },

  /**
   * Sanitize email input
   */
  email(input: string): string {
    if (!input) return '';
    const sanitized = this.text(input).toLowerCase().trim();
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

    if (!emailRegex.test(sanitized)) {
      throw new Error('Invalid email format');
    }

    return sanitized;
  },

  /**
   * Sanitize phone number
   */
  phone(input: string): string {
    if (!input) return '';
    return input.replace(/[^0-9+\-() ]/g, '').trim();
  },

  /**
   * Sanitize numeric input
   */
  number(input: string | number): number {
    const num = typeof input === 'string' ? parseFloat(input) : input;
    if (isNaN(num)) {
      throw new Error('Invalid number');
    }
    return num;
  },

  /**
   * Sanitize URL
   */
  url(input: string): string {
    if (!input) return '';
    const sanitized = input.trim();

    try {
      const url = new URL(sanitized);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
      }
      return url.toString();
    } catch {
      throw new Error('Invalid URL');
    }
  },

  /**
   * Check for SQL injection patterns
   */
  containsSqlInjection(input: string): boolean {
    return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
  },

  /**
   * Check for XSS patterns
   */
  containsXss(input: string): boolean {
    return XSS_PATTERNS.some((pattern) => pattern.test(input));
  },

  /**
   * Validate and sanitize object
   */
  object<T extends Record<string, any>>(input: T, schema: Record<keyof T, 'text' | 'email' | 'number' | 'phone' | 'url'>): T {
    const sanitized = {} as T;

    for (const key in schema) {
      const value = input[key];
      const type = schema[key];

      if (value === undefined || value === null) {
        continue;
      }

      try {
        switch (type) {
          case 'text':
            sanitized[key] = this.text(String(value)) as any;
            break;
          case 'email':
            sanitized[key] = this.email(String(value)) as any;
            break;
          case 'number':
            sanitized[key] = this.number(value) as any;
            break;
          case 'phone':
            sanitized[key] = this.phone(String(value)) as any;
            break;
          case 'url':
            sanitized[key] = this.url(String(value)) as any;
            break;
        }
      } catch (error) {
        throw new Error(`Validation failed for field "${String(key)}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return sanitized;
  },

  /**
   * Sanitize filename (prevent directory traversal)
   */
  filename(input: string): string {
    if (!input) return '';
    return input
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .replace(/\.\./g, '')
      .replace(/^\.+/, '')
      .substring(0, 255);
  },

  /**
   * Sanitize JSON input
   */
  json<T = any>(input: string): T {
    try {
      const parsed = JSON.parse(input);

      if (typeof parsed === 'string' && (this.containsXss(parsed) || this.containsSqlInjection(parsed))) {
        throw new Error('Potentially dangerous content detected');
      }

      return parsed;
    } catch (error) {
      throw new Error('Invalid JSON');
    }
  },
};

/**
 * CSRF Token Management
 */
export const csrf = {
  generateToken(): string {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  },

  setToken(): string {
    const token = this.generateToken();
    sessionStorage.setItem('__csrf_token', token);
    return token;
  },

  getToken(): string | null {
    return sessionStorage.getItem('__csrf_token');
  },

  verifyToken(token: string): boolean {
    const storedToken = this.getToken();
    return storedToken === token && token.length === 64;
  },

  clearToken(): void {
    sessionStorage.removeItem('__csrf_token');
  },
};

/**
 * Rate Limiting (Client-side basic protection)
 */
export const rateLimit = {
  attempts: new Map<string, { count: number; resetAt: number }>(),

  check(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetAt) {
      this.attempts.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  },

  reset(key: string): void {
    this.attempts.delete(key);
  },
};
