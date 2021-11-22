export function logCloudAgentError(
  context: string,
  response: Response,
  detail?: string,
): void {
  console.error(`
    ${context}
    Reported HTTP status : ${response.status}
    Status text : ${response.statusText}
    ${detail ? `Details : ${detail}` : ''} 
  `);
}

export function logCloudAgentInfo(
  context: string,
  response: Response,
  detail?: string,
): void {
  console.info(`
    ${context}
    Reported HTTP status : ${response.status}
    Status text : ${response.statusText}
    ${detail ? `Details : ${detail}` : ''} 
  `);
}

export async function reportCloudAgentError(
  context: string,
  httpResponse: Response,
): Promise<Error> {
  // When the agent returns 422 it usually includes a
  // body explaining why the request was not processible
  let reason422;
  try {
    reason422 =
      httpResponse.status === 422
        ? JSON.stringify(await httpResponse.json())
        : undefined;
  } catch (err) {
    reason422 = `JSON.stringify failed to convert 422 response body, ${(
      err as Error
    ).toString()}`;
  }
  logCloudAgentError(context, httpResponse, reason422);
  return Error(reason422 ? reason422 : httpResponse.statusText);
}
