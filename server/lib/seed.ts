import bcrypt from "bcryptjs";
import { supabaseAdmin } from "./supabase.js";

export async function ensureInitialOwner() {
  try {
    // Check for specific seeded owner by username
    const { data: existingOwner, error: ownerErr } = await supabaseAdmin
      .from("app_users")
      .select("id, username, role")
      .eq("username", "hoang")
      .maybeSingle();

    if (ownerErr) {
      console.warn("ensureInitialOwner: fetch owner failed", ownerErr.message);
    }

    if (existingOwner) {
      return; // Already seeded
    }

    const password_hash = await bcrypt.hash("Ww123123", 10);
    const { data, error } = await supabaseAdmin
      .from("app_users")
      .insert({ username: "hoang", password_hash, role: "owner", is_active: true })
      .select("id")
      .single();

    if (error) {
      console.warn("ensureInitialOwner: insert failed", error.message);
      return;
    }

    console.log("✅ Seeded initial owner user hoang (id:", data.id, ")");
  } catch (err) {
    console.warn("ensureInitialOwner: unexpected error", err);
  }
}
