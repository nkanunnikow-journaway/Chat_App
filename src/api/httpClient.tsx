const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function httpClient<TResponse>(
  path: string,
  options?: RequestInit,
  isFormData?: boolean
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: isFormData
      ? {}
      : {
          'Content-Type': 'application/json',
          ...options?.headers
        }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText} `);
  }

  return response.json() as Promise<TResponse>;
}
