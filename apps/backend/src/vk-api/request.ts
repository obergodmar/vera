export async function request(
  url: string,
  params: Record<string, any>,
  abortSignal?: AbortSignal,
): Promise<any> {
  const headers = new Headers();
  headers.append('Content-Type', 'application/x-www-form-urlencoded');

  const formData = Object.keys(params).reduce((acc, param) => {
    if (typeof params[param] !== 'undefined') {
      acc.append(param, params[param]);
    }
    return acc;
  }, new URLSearchParams());

  const res = await fetch(url, {
    method: 'POST',
    headers,
    signal: abortSignal,
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`ServerError ${res.status}`);
  }

  return await res.json();
}
