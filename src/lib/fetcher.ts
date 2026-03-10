export const fetcher = <TData>(url: string): Promise<TData> => {
  return fetch(url).then((res) => {
    if (!res.ok) {
      return res.text().then((text) => {
        throw new Error(text || "Request failed");
      });
    }
    return res.json();
  });
};
