// Security utilities for input validation and sanitization

export class SecurityUtils {
  // Validate filename to prevent path traversal and injection
  static validateFilename(filename: string): boolean {
    if (!filename || filename.length === 0) return false;
    if (filename.length > 255) return false;
    
    // Check for path traversal attempts
    const pathTraversalPattern = /(\.\.|\/|\\|<|>|:|"|'|\||\?|\*)/;
    if (pathTraversalPattern.test(filename)) return false;
    
    // Check for control characters
    if (/[\x00-\x1f\x7f]/.test(filename)) return false;
    
    return true;
  }

  // Sanitize project names
  static sanitizeProjectName(name: string): string {
    if (!name || typeof name !== 'string') return 'Untitled Project';
    
    // Limit length
    const sanitized = name.slice(0, 100);
    
    // Remove potentially dangerous characters but keep basic punctuation
    return sanitized.replace(/[<>:"/\\|?*\x00-\x1f\x7f]/g, '');
  }

  // Validate and sanitize text input
  static sanitizeTextInput(input: string, maxLength: number = 1000): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .slice(0, maxLength)
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .trim();
  }

  // Generate secure filename with timestamp
  static generateSecureFilename(prefix: string = 'recording', extension: string = 'webm'): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${randomSuffix}.${extension}`;
  }

  // Validate blob size to prevent memory exhaustion
  static validateBlobSize(blob: Blob, maxSizeBytes: number = 500 * 1024 * 1024): boolean {
    return blob.size <= maxSizeBytes; // Default 500MB limit
  }
}
