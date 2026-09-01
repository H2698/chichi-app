"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [email, setEmail] = useState("chichi@bychichi.tn");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      showToast("Entrez votre identifiant et votre mot de passe");
      return;
    }
    if (!supabaseConfigured) {
      // No backend configured — keep the old offline/demo behaviour.
      router.push("/home");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      showToast("Identifiant ou mot de passe incorrect");
      return;
    }
    // Force a fresh pull of the shop's data now that we have a signed-in
    // session — a prior attempt on this page load would have been rejected
    // by RLS while signed out, so `hydrated` may still be false, but even a
    // re-login (after sign-out) should always refetch rather than reuse a
    // previous session's cached state.
    useAppStore.setState({ hydrated: false });
    await useAppStore.getState().hydrate();
    setLoading(false);
    router.push("/home");
  };

  return (
    <div className="chi-fade relative flex min-h-full flex-col overflow-hidden px-[34px] pb-10 pt-8">
      {/* Premium ambient background — soft, slow-drifting fabric-toned light. No photography. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="chi-drift-1 absolute -left-24 -top-16 h-[280px] w-[280px] rounded-full opacity-[0.45] blur-[70px]"
          style={{ background: "#e6cf9a" }}
        />
        <div
          className="chi-drift-2 absolute -right-28 top-[120px] h-[300px] w-[300px] rounded-full opacity-[0.35] blur-[80px]"
          style={{ background: "#c9a869" }}
        />
        <div
          className="chi-drift-3 absolute bottom-[-80px] left-1/2 h-[260px] w-[260px] -translate-x-1/2 rounded-full opacity-[0.4] blur-[75px]"
          style={{ background: "#f6ecd9" }}
        />
      </div>

      <div className="relative z-[1] flex flex-1 flex-col">
        <div className="chi-float flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/bychichi-logo.png"
            alt="By Chichi"
            className="h-[150px] w-[150px] object-contain drop-shadow-[0_18px_30px_rgba(165,129,63,.25)] sm:h-[168px] sm:w-[168px]"
          />
        </div>

        <div className="mt-6 text-center">
          <div className="font-serif text-[38px] leading-none text-ink">Bienvenue</div>
          <div className="mt-2.5 text-[13.5px] font-light text-[#7b6a53]">
            Connectez-vous à votre espace Chichii
          </div>
        </div>

        <div className="mt-[30px] flex flex-col gap-3.5">
          <label className="block">
            <div className="mb-[7px] font-caps text-[9.5px] tracking-[2.2px] text-gold">
              IDENTIFIANT
            </div>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[14px] border border-border-input bg-card px-4 py-[15px] text-[15px] text-ink outline-none"
            />
          </label>
          <label className="block">
            <div className="mb-[7px] font-caps text-[9.5px] tracking-[2.2px] text-gold">
              MOT DE PASSE
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
              className="w-full rounded-[14px] border border-border-input bg-card px-4 py-[15px] text-[15px] text-ink outline-none"
            />
          </label>
        </div>

        <div className="mt-[26px]">
          <Button variant="dark" onClick={handleLogin} disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </div>
        <div
          className="mt-[18px] cursor-pointer text-center text-[13.5px] text-secondary-2"
          onClick={() => showToast("Contactez votre responsable de boutique")}
        >
          Mot de passe oublié ?
        </div>

        <div className="flex-1" />
        <div className="mt-[30px] text-center font-caps text-[9px] tracking-[3px] text-tertiary">
          BY CHICHI LUXURY DRESS
        </div>
      </div>
    </div>
  );
}
