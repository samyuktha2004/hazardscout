// Hazard Management Service with Resolution Workflow
// Handles user confirmations and time-based auto-resolution

export interface HazardLocation {
  latitude: number;
  longitude: number;
}

export type HazardStatus = 'active' | 'resolving' | 'resolved';
export type HazardSeverity = 'high' | 'medium' | 'low';
export type HazardSource = 'network' | 'v2x' | 'your-car' | 'user-report';

export interface UserConfirmation {
  userId: string; // In production, use actual user ID
  timestamp: number;
  type: 'still-there' | 'gone';
  deviceId?: string;
}

export interface HazardData {
  id: string;
  type: string;
  severity: HazardSeverity;
  location: HazardLocation;
  locationName: string; // Human-readable location
  distance?: string; // Distance from user (calculated)
  
  // Lifecycle tracking
  status: HazardStatus;
  firstDetectedAt: number; // Unix timestamp
  lastConfirmedAt: number; // Last time someone confirmed it's still there
  lastUpdatedAt: number; // Any update to the hazard
  
  // User validation
  confirmations: UserConfirmation[];
  confirmationCount: number; // Count of "still there"
  reportedGoneCount: number; // Count of "gone"
  
  // Source tracking
  source: HazardSource;
  detectionCount: number; // How many times detected by sensors
  
  // Auto-resolution config
  autoResolveAfterHours: number; // Default 24 hours
  requireConfirmationsForResolution: number; // Default 3 "gone" reports
}

export interface HazardServiceSettings {
  autoResolutionEnabled: boolean;
  defaultAutoResolveHours: number; // 24 hours default
  confirmationsNeededToResolve: number; // 3 "gone" reports needed
  reconfirmationExtensionHours: number; // 12 hours extension per "still there" confirmation
  showResolvedHazards: boolean;
  resolvedHazardRetentionDays: number; // Keep resolved hazards for 7 days
}

export class HazardManagementService {
  private static instance: HazardManagementService;
  private hazards: Map<string, HazardData> = new Map();
  private settings: HazardServiceSettings;
  private deviceId: string;
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.settings = this.loadSettings();
    this.deviceId = this.getOrCreateDeviceId();
    this.loadHazards();
    this.startAutoResolutionCheck();
  }

  static getInstance(): HazardManagementService {
    if (!HazardManagementService.instance) {
      HazardManagementService.instance = new HazardManagementService();
    }
    return HazardManagementService.instance;
  }

  // Get or create a device ID for tracking user confirmations
  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('hazard-scout-device-id');
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('hazard-scout-device-id', deviceId);
    }
    return deviceId;
  }

  // Start periodic check for auto-resolution
  private startAutoResolutionCheck(): void {
    // Check every 5 minutes
    this.checkInterval = setInterval(() => {
      this.checkAutoResolution();
    }, 5 * 60 * 1000);

    // Also check immediately
    this.checkAutoResolution();
  }

  // Check all hazards for auto-resolution conditions
  private checkAutoResolution(): void {
    if (!this.settings.autoResolutionEnabled) {
      return;
    }

    const now = Date.now();
    let hasChanges = false;

    this.hazards.forEach((hazard, id) => {
      if (hazard.status === 'resolved') {
        // Check if we should delete old resolved hazards
        const retentionMs = this.settings.resolvedHazardRetentionDays * 24 * 60 * 60 * 1000;
        if (now - hazard.lastUpdatedAt > retentionMs) {
          this.hazards.delete(id);
          hasChanges = true;
        }
        return;
      }

      if (hazard.status === 'active' || hazard.status === 'resolving') {
        const timeSinceLastConfirmation = now - hazard.lastConfirmedAt;
        const autoResolveMs = hazard.autoResolveAfterHours * 60 * 60 * 1000;

        // Check if enough time has passed without confirmation
        if (timeSinceLastConfirmation > autoResolveMs) {
          // Check if enough users reported it gone
          if (hazard.reportedGoneCount >= this.settings.confirmationsNeededToResolve) {
            this.resolveHazard(id, 'time-and-confirmation');
            hasChanges = true;
          } else {
            // Mark as resolving (awaiting confirmation)
            if (hazard.status !== 'resolving') {
              hazard.status = 'resolving';
              hazard.lastUpdatedAt = now;
              hasChanges = true;
            }
          }
        }
      }
    });

    if (hasChanges) {
      this.saveHazards();
    }
  }

  // User confirms hazard is still there
  confirmHazardStillThere(hazardId: string): boolean {
    const hazard = this.hazards.get(hazardId);
    if (!hazard || hazard.status === 'resolved') {
      return false;
    }

    // Check if this device already confirmed recently (prevent spam)
    const recentConfirmation = hazard.confirmations.find(
      c => c.deviceId === this.deviceId && 
           c.type === 'still-there' && 
           Date.now() - c.timestamp < 60 * 60 * 1000 // Within last hour
    );

    if (recentConfirmation) {
      console.log('Already confirmed within the last hour');
      return false;
    }

    const now = Date.now();
    const confirmation: UserConfirmation = {
      userId: this.deviceId,
      timestamp: now,
      type: 'still-there',
      deviceId: this.deviceId
    };

    hazard.confirmations.push(confirmation);
    hazard.confirmationCount += 1;
    hazard.lastConfirmedAt = now;
    hazard.lastUpdatedAt = now;

    // Extend the auto-resolve deadline
    const extension = this.settings.reconfirmationExtensionHours * 60 * 60 * 1000;
    // Reset status to active if it was resolving
    if (hazard.status === 'resolving') {
      hazard.status = 'active';
    }

    this.saveHazards();
    return true;
  }

  // User reports hazard is gone
  reportHazardGone(hazardId: string): boolean {
    const hazard = this.hazards.get(hazardId);
    if (!hazard || hazard.status === 'resolved') {
      return false;
    }

    // Check if this device already reported gone recently
    const recentReport = hazard.confirmations.find(
      c => c.deviceId === this.deviceId && 
           c.type === 'gone' && 
           Date.now() - c.timestamp < 60 * 60 * 1000 // Within last hour
    );

    if (recentReport) {
      console.log('Already reported gone within the last hour');
      return false;
    }

    const now = Date.now();
    const confirmation: UserConfirmation = {
      userId: this.deviceId,
      timestamp: now,
      type: 'gone',
      deviceId: this.deviceId
    };

    hazard.confirmations.push(confirmation);
    hazard.reportedGoneCount += 1;
    hazard.lastUpdatedAt = now;

    // Mark as resolving
    hazard.status = 'resolving';

    // Check if we have enough "gone" reports to resolve
    if (hazard.reportedGoneCount >= this.settings.confirmationsNeededToResolve) {
      this.resolveHazard(hazardId, 'user-confirmation');
    }

    this.saveHazards();
    return true;
  }

  // Resolve a hazard
  private resolveHazard(hazardId: string, reason: 'time-and-confirmation' | 'user-confirmation' | 'manual'): void {
    const hazard = this.hazards.get(hazardId);
    if (!hazard) return;

    hazard.status = 'resolved';
    hazard.lastUpdatedAt = Date.now();

    console.log(`Hazard ${hazardId} resolved due to: ${reason}`);
  }

  // Manually resolve a hazard (admin function)
  manuallyResolveHazard(hazardId: string): boolean {
    const hazard = this.hazards.get(hazardId);
    if (!hazard) return false;

    this.resolveHazard(hazardId, 'manual');
    this.saveHazards();
    return true;
  }

  // Add a new hazard
  addHazard(hazardData: Omit<HazardData, 'id' | 'status' | 'firstDetectedAt' | 'lastConfirmedAt' | 'lastUpdatedAt' | 'confirmations' | 'confirmationCount' | 'reportedGoneCount' | 'detectionCount'>): HazardData {
    const now = Date.now();
    const id = `hazard-${now}-${Math.random().toString(36).substr(2, 9)}`;

    const newHazard: HazardData = {
      ...hazardData,
      id,
      status: 'active',
      firstDetectedAt: now,
      lastConfirmedAt: now,
      lastUpdatedAt: now,
      confirmations: [],
      confirmationCount: 0,
      reportedGoneCount: 0,
      detectionCount: 1
    };

    this.hazards.set(id, newHazard);
    this.saveHazards();
    return newHazard;
  }

  // Increment detection count (when sensor re-detects same hazard)
  incrementDetectionCount(hazardId: string): void {
    const hazard = this.hazards.get(hazardId);
    if (!hazard || hazard.status === 'resolved') return;

    hazard.detectionCount += 1;
    hazard.lastConfirmedAt = Date.now(); // Sensor detection counts as confirmation
    hazard.lastUpdatedAt = Date.now();

    // Reset to active if it was resolving
    if (hazard.status === 'resolving') {
      hazard.status = 'active';
    }

    this.saveHazards();
  }

  // Get all hazards
  getAllHazards(): HazardData[] {
    return Array.from(this.hazards.values());
  }

  // Get active hazards only
  getActiveHazards(): HazardData[] {
    return Array.from(this.hazards.values()).filter(h => h.status === 'active' || h.status === 'resolving');
  }

  // Get hazard by ID
  getHazard(hazardId: string): HazardData | undefined {
    return this.hazards.get(hazardId);
  }

  // Get time until auto-resolution for a hazard
  getTimeUntilAutoResolve(hazardId: string): number | null {
    const hazard = this.hazards.get(hazardId);
    if (!hazard || hazard.status === 'resolved') return null;

    const autoResolveMs = hazard.autoResolveAfterHours * 60 * 60 * 1000;
    const timeSinceLastConfirmation = Date.now() - hazard.lastConfirmedAt;
    const timeRemaining = autoResolveMs - timeSinceLastConfirmation;

    return timeRemaining > 0 ? timeRemaining : 0;
  }

  // Check if user has already confirmed this hazard
  hasUserConfirmed(hazardId: string, type: 'still-there' | 'gone'): boolean {
    const hazard = this.hazards.get(hazardId);
    if (!hazard) return false;

    return hazard.confirmations.some(
      c => c.deviceId === this.deviceId && 
           c.type === type && 
           Date.now() - c.timestamp < 60 * 60 * 1000 // Within last hour
    );
  }

  // Get hazard resolution progress
  getResolutionProgress(hazardId: string): {
    confirmationsNeeded: number;
    currentGoneReports: number;
    currentStillThereReports: number;
    percentageToResolution: number;
    timeRemainingMs: number | null;
  } | null {
    const hazard = this.hazards.get(hazardId);
    if (!hazard) return null;

    const timeRemaining = this.getTimeUntilAutoResolve(hazardId);
    const percentageToResolution = Math.min(
      100,
      (hazard.reportedGoneCount / this.settings.confirmationsNeededToResolve) * 100
    );

    return {
      confirmationsNeeded: this.settings.confirmationsNeededToResolve,
      currentGoneReports: hazard.reportedGoneCount,
      currentStillThereReports: hazard.confirmationCount,
      percentageToResolution,
      timeRemainingMs: timeRemaining
    };
  }

  // Update settings
  updateSettings(newSettings: Partial<HazardServiceSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  // Get current settings
  getSettings(): HazardServiceSettings {
    return { ...this.settings };
  }

  // Load hazards from localStorage
  private loadHazards(): void {
    try {
      const saved = localStorage.getItem('hazard-scout-hazards');
      if (saved) {
        const hazardArray: HazardData[] = JSON.parse(saved);
        this.hazards = new Map(hazardArray.map(h => [h.id, h]));
      }
    } catch (e) {
      console.error('Failed to load hazards:', e);
    }
  }

  // Save hazards to localStorage
  private saveHazards(): void {
    try {
      const hazardArray = Array.from(this.hazards.values());
      localStorage.setItem('hazard-scout-hazards', JSON.stringify(hazardArray));
    } catch (e) {
      console.error('Failed to save hazards:', e);
    }
  }

  // Load settings from localStorage
  private loadSettings(): HazardServiceSettings {
    try {
      const saved = localStorage.getItem('hazard-scout-service-settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load hazard service settings:', e);
    }

    // Default settings
    return {
      autoResolutionEnabled: true,
      defaultAutoResolveHours: 24,
      confirmationsNeededToResolve: 3,
      reconfirmationExtensionHours: 12,
      showResolvedHazards: false,
      resolvedHazardRetentionDays: 7
    };
  }

  // Save settings to localStorage
  private saveSettings(): void {
    try {
      localStorage.setItem('hazard-scout-service-settings', JSON.stringify(this.settings));
    } catch (e) {
      console.error('Failed to save hazard service settings:', e);
    }
  }

  // Cleanup
  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

// Export singleton instance
export const hazardService = HazardManagementService.getInstance();

// Helper function to format time remaining
export function formatTimeRemaining(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Helper to get relative time
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}
