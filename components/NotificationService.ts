// Notification Service for Hazard Scout Critical Alerts

export interface HazardNotificationData {
  id: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  distance: number; // in meters
  location: string;
  latitude?: number;
  longitude?: number;
}

export interface NotificationSettings {
  enabled: boolean;
  proximityThreshold: number; // in meters (500, 1000, 2000)
  criticalOnly: boolean; // Only Tier 1/2 (high/medium severity)
  doNotDisturb: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  };
}

export class HazardNotificationService {
  private static instance: HazardNotificationService;
  private notifiedHazards: Set<string> = new Set();
  private settings: NotificationSettings;

  private constructor() {
    this.settings = this.loadSettings();
  }

  static getInstance(): HazardNotificationService {
    if (!HazardNotificationService.instance) {
      HazardNotificationService.instance = new HazardNotificationService();
    }
    return HazardNotificationService.instance;
  }

  // Request notification permission from the user
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      // Browser doesn't support notifications
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  // Check if we're in Do Not Disturb period
  private isInDoNotDisturb(): boolean {
    if (!this.settings.doNotDisturb.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const { startTime, endTime } = this.settings.doNotDisturb;

    // Handle overnight DND (e.g., 22:00 to 07:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime < endTime;
    }

    // Handle same-day DND (e.g., 13:00 to 14:00)
    return currentTime >= startTime && currentTime < endTime;
  }

  // Calculate if hazard is within proximity threshold
  private isWithinProximity(hazard: HazardNotificationData): boolean {
    return hazard.distance <= this.settings.proximityThreshold;
  }

  // Check if hazard meets severity criteria
  private meetsSeverityCriteria(hazard: HazardNotificationData): boolean {
    if (!this.settings.criticalOnly) {
      return true;
    }
    // Critical only means high or medium severity (Tier 1/2)
    return hazard.severity === 'high' || hazard.severity === 'medium';
  }

  // Show notification for a critical hazard
  async notifyHazard(hazard: HazardNotificationData): Promise<void> {
    // Check if notifications are enabled
    if (!this.settings.enabled) {
      return;
    }

    // Check if already notified for this hazard
    if (this.notifiedHazards.has(hazard.id)) {
      return;
    }

    // Check Do Not Disturb
    if (this.isInDoNotDisturb()) {
      return;
    }

    // Check proximity
    if (!this.isWithinProximity(hazard)) {
      return;
    }

    // Check severity criteria
    if (!this.meetsSeverityCriteria(hazard)) {
      return;
    }

    // Check permission
    if (Notification.permission !== 'granted') {
      // Permission not granted - silently skip notification
      return;
    }

    // Create notification
    const title = this.getNotificationTitle(hazard);
    const body = this.getNotificationBody(hazard);
    const icon = this.getNotificationIcon(hazard.severity);

    try {
      const notification = new Notification(title, {
        body,
        icon,
        badge: icon,
        tag: `hazard-${hazard.id}`, // Prevents duplicate notifications
        requireInteraction: hazard.severity === 'high', // High severity stays visible
        silent: false,
        vibrate: hazard.severity === 'high' ? [200, 100, 200] : [200],
        data: hazard,
      });

      // Mark as notified
      this.notifiedHazards.add(hazard.id);

      // Auto-close after delay (except for high severity)
      if (hazard.severity !== 'high') {
        setTimeout(() => {
          notification.close();
        }, 8000);
      }

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
        // Could navigate to map view showing the hazard
      };
    } catch (error) {
      // Failed to show notification - silently skip
    }
  }

  // Get notification title based on hazard
  private getNotificationTitle(hazard: HazardNotificationData): string {
    const urgency = hazard.severity === 'high' ? '⚠️ CRITICAL: ' : '⚠️ ';
    return `${urgency}${hazard.type} Ahead`;
  }

  // Get notification body
  private getNotificationBody(hazard: HazardNotificationData): string {
    const distanceText = hazard.distance < 1000 
      ? `${Math.round(hazard.distance)}m ahead`
      : `${(hazard.distance / 1000).toFixed(1)}km ahead`;
    
    return `${distanceText} on ${hazard.location}. Drive with caution.`;
  }

  // Get notification icon based on severity
  private getNotificationIcon(severity: string): string {
    // In production, use actual icon files
    // For now, we'll use data URIs or default browser icons
    return '/hazard-icon.png'; // Placeholder
  }

  // Update notification settings
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  // Get current settings
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Load settings from localStorage
  private loadSettings(): NotificationSettings {
    const saved = localStorage.getItem('hazard-notification-settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Failed to parse settings - will use defaults
      }
    }
    
    // Default settings
    return {
      enabled: true,
      proximityThreshold: 1000, // 1km default
      criticalOnly: true, // Only Tier 1/2 by default
      doNotDisturb: {
        enabled: false,
        startTime: '22:00',
        endTime: '07:00',
      },
    };
  }

  // Save settings to localStorage
  private saveSettings(): void {
    try {
      localStorage.setItem('hazard-notification-settings', JSON.stringify(this.settings));
    } catch (e) {
      // Failed to save settings - will retry next time
    }
  }

  // Clear notification history (useful when hazards are resolved)
  clearNotifiedHazard(hazardId: string): void {
    this.notifiedHazards.delete(hazardId);
  }

  // Clear all notification history
  clearAllNotified(): void {
    this.notifiedHazards.clear();
  }

  // Check multiple hazards and notify if needed
  async checkHazards(hazards: HazardNotificationData[]): Promise<void> {
    for (const hazard of hazards) {
      await this.notifyHazard(hazard);
    }
  }
}

// Export singleton instance
export const notificationService = HazardNotificationService.getInstance();
