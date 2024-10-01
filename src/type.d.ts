
export interface ChartData {
  "10_Min_Std_Dev": number;
  "Time": number;
  "Date_Time": string;
  "10_Min_Sampled_Avg": number;
}

export interface ChartDataResponse {
  data: ChartData[];
}
