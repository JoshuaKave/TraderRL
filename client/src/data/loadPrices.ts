import Papa from "papaparse";

export async function loadPrices(ticker: string): Promise<number[]> {
  const res = await fetch(`/${ticker}.csv`);
  const text = await res.text();

  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });

  const prices = parsed.data
    .map((row: any) => parseFloat(row["Close"]))
    .filter((p: number) => !isNaN(p));

  return prices;
}