export interface ApiResponse<T> {
  code: number;
  data?: T;
  path?: string;
  fName?: string;
  errMsg?: string;
}
