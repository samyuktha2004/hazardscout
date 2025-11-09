export type VehicleType = 'electric' | 'petrol' | 'diesel';

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  plateNumber: string;
  type: VehicleType;
  fuelLevel: number;
  mileage: number;
  range?: number; // Only for electric
  imageUrl: string;
  isLocked: boolean;
}
