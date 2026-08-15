export type BodyMeasurements = {
  waistCm?: number;
  hipsCm?: number;
  chestCm?: number;
  thighCm?: number;
  armCm?: number;
};

export type ProgressEntry = {
  id: string;
  date: string;
  weightKg?: number;
  bodyFatPercentage?: number;
  muscleMassKg?: number;
  bodyWaterPercentage?: number;
  measurements: BodyMeasurements;
  createdAt: string;
};
