import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";

/** Validates the bearer token supplied by the browser before using the admin client. */
export async function getAuthenticatedUser(
  request: NextRequest,
): Promise<{ user: User } | { response: NextResponse }> {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;

  if (!token) {
    return {
      response: NextResponse.json({ error: "Authentification requise" }, { status: 401 }),
    };
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return {
      response: NextResponse.json({ error: "Session invalide ou expirée" }, { status: 401 }),
    };
  }

  return { user: data.user };
}

/** Returns only the entreprise identifiers owned by the authenticated user. */
export async function getOwnedEntrepriseIds(userId: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from("entreprises")
    .select("id")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []).map((entreprise) => entreprise.id);
}

export function isAuthenticated(
  result: Awaited<ReturnType<typeof getAuthenticatedUser>>,
): result is { user: User } {
  return "user" in result;
}
