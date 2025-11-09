// This file defines the data structure for our entire app
export type HazardSeverity = 'critical' | 'high' | 'medium' | 'low';
export type HazardSource = 'your-car' | 'network' | 'v2x';
export type HazardStatus = 'Active' | 'Resolving' | 'Resolved';

export interface Hazard {
  id: string;
  type: string;
  severity: HazardSeverity;
  source: HazardSource;
  location: { latitude: number; longitude: number };
  timestamp: number;
  // --- Resolution & Confirmation Data ---
  resolutionStatus: HazardStatus;
  goneReports: number;
  stillThereReports: number;
  // --- UI/Demo State ---
  lastActionByDevice: string | null; // Stores device ID that last voted
  lastActionTime: number | null; // Timestamp of last vote
}