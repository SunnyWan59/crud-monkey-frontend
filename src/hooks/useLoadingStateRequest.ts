import { useState } from "react";

export type HttpMethod = "POST" | "PATCH" | "DELETE" | "PUT";

export function useLoadingStateRequest<TData, TBody>(url: string, method: HttpMethod = "POST") {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const execute = (body?: TBody) => {
    setIsLoading(true);
    setError(null);
    
    return fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(text || "Request failed");
          });
        }
        return res.json();
      })
      .then((responseData: TData) => {
        setData(responseData);
        return responseData;
      })
      .catch((err: Error) => {
        setError(err);
        throw err;
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return { isLoading, error, data, execute };
}
