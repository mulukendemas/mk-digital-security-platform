/**
 * Secure Token Service
 * 
 * This service provides a more secure way to handle JWT tokens:
 * - Access tokens are stored in memory only (not localStorage)
 * - Refresh tokens can be stored in HttpOnly cookies (when supported by the backend)
 * - Implements token expiry tracking
 */

interface TokenData {
  token: string;
  expiresAt: number; // timestamp in milliseconds
}

class TokenService {
  private accessToken: TokenData | null = null;
  
  /**
   * Set the access token with expiry time
   */
  setAccessToken(token: string, expiresInSeconds: number = 900): void {
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    this.accessToken = { token, expiresAt };
    
    // Schedule token expiry check
    this.scheduleTokenExpiryCheck();
  }
  
  /**
   * Get the current access token if it's still valid
   */
  getAccessToken(): string | null {
    if (!this.accessToken) return null;
    
    // Check if token is expired
    if (Date.now() >= this.accessToken.expiresAt) {
      this.clearTokens();
      return null;
    }
    
    return this.accessToken.token;
  }
  
  /**
   * Check if the access token is valid and not expired
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
  
  /**
   * Get the token expiry time in milliseconds
   */
  getTokenExpiryTime(): number | null {
    return this.accessToken?.expiresAt || null;
  }
  
  /**
   * Get the remaining time until token expiry in seconds
   */
  getTokenRemainingTime(): number {
    if (!this.accessToken) return 0;
    const remainingMs = this.accessToken.expiresAt - Date.now();
    return Math.max(0, Math.floor(remainingMs / 1000));
  }
  
  /**
   * Clear all tokens (logout)
   */
  clearTokens(): void {
    this.accessToken = null;
    
    // If using HttpOnly cookies for refresh tokens, you would call an API endpoint
    // to clear the cookie on the server side
  }
  
  /**
   * Schedule a check for token expiry
   */
  private scheduleTokenExpiryCheck(): void {
    if (!this.accessToken) return;
    
    const timeUntilExpiry = this.accessToken.expiresAt - Date.now();
    if (timeUntilExpiry <= 0) return;
    
    // Schedule a token check at 90% of the token's lifetime
    const checkTime = Math.min(timeUntilExpiry * 0.9, 60000); // Max 1 minute
    
    setTimeout(() => {
      // Dispatch an event when token is about to expire
      if (this.getTokenRemainingTime() < 60) { // Less than 60 seconds remaining
        const event = new CustomEvent('token:expiring', { 
          detail: { remainingTime: this.getTokenRemainingTime() } 
        });
        window.dispatchEvent(event);
      }
    }, checkTime);
  }
}

// Create a singleton instance
const tokenService = new TokenService();

export default tokenService;
