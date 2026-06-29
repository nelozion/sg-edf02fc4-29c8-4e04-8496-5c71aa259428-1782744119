import { NextApiRequest, NextApiResponse } from "next";

export function checkAuth(req: NextApiRequest, res: NextApiResponse): boolean {
  const password = req.headers.authorization?.replace("Bearer ", "");
  const correctPassword = process.env.APP_LOGIN_PASSWORD || "admin";
  
  if (password !== correctPassword) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  
  return true;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
}

export function isAuthenticated(): boolean {
  return getAuthToken() === (process.env.NEXT_PUBLIC_APP_LOGIN_PASSWORD || "admin");
}