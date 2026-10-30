export interface TrafficSeriesPoint {
  time: string;
  pps: number;
  syn_pps?: number;
  attack_pps?: number;
  normal_pps?: number;
  bps?: number;
}

