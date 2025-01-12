import { invoke } from "@tauri-apps/api/core";

export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export function rawDateFromMillis(millis: number): string {
  const date = new Date(millis);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

export function parseUTCTimeToSeconds(utc: string): string {
  const dateString = utc.replace("UTC ", "");
  const targetDate = new Date(dateString + "Z");
  if (isNaN(targetDate.getTime())) {
    throw new Error("Invalid date format");
  }
  const currentLocalDate = new Date();
  const differenceInMilliseconds = currentLocalDate.getTime() - targetDate.getTime();
  const differenceInSeconds = Math.floor(differenceInMilliseconds / 1000);
  return `${differenceInSeconds} s.`;
}

export function randomNumber(max: number, min: number): number {
  return min + Math.floor((max - min + 1) * Math.random());
}

export function randomChars(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}

export async function createDirectoriesAsync(path: string): Promise<void> {
  path = normalizePath(path);
  await invoke("create_recursive_dirs", { path: path.substring(0, path.lastIndexOf("/")) });
}

export function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}