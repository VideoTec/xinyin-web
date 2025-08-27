export interface ApiResponse<T> {
  code: number;
  data?: T;
  path?: string;
  fName?: string;
  errMsg?: string;
}

export async function getData<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error("getData must be called with a successful response");
  }
  const responseJson: ApiResponse<T> = await response.json();
  if (responseJson.code !== 0) {
    throw new Error(`response code is not 0, but ${responseJson.code}`);
  }
  if (responseJson.data === undefined) {
    throw new Error("response has no data");
  }
  return responseJson.data;
}

export async function getErrorMsg(response: Response) {
  if (response.ok) {
    throw new Error(
      "getErrorMsg must be called with a failed response, should never happen"
    );
  }
  const responseJson: ApiResponse<null> = await response.json();
  if (responseJson.code !== 0) {
    return responseJson.errMsg || "Unknown error";
  }
  return "";
}
