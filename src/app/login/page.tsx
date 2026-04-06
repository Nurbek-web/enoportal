"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@enoportal.uz");
  const [password, setPassword] = useState("demo2026");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => router.push("/"), 600);
  };

  const handleDemo = () => {
    setLoading(true);
    setTimeout(() => router.push("/"), 400);
  };

  return (
    <div className="min-h-screen login-gradient-bg flex items-center justify-center p-4">
      {/* Glass card */}
      <div className="w-full max-w-md bg-white/[0.07] backdrop-blur-2xl border border-white/[0.15] shadow-2xl rounded-2xl p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-xl font-bold text-white mb-4">
            E
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            ENO Portal
          </h1>
          <p className="text-sm text-stone-400 mt-1">Etive Neft Oil</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-stone-300">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-stone-400 focus:border-blue-400 focus:ring-blue-400/20"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-stone-300">Пароль</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-stone-400 focus:border-blue-400 focus:ring-blue-400/20"
            />
          </div>

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transition-all"
          >
            {loading ? "Вход..." : "Войти"}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-transparent px-2 text-stone-500">или</span>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={handleDemo}
            disabled={loading}
            className="w-full h-10 text-stone-300 hover:text-white hover:bg-white/10 transition-all"
          >
            Демо доступ
          </Button>
        </div>

        <p className="text-xs text-stone-500 text-center mt-6">
          © 2026 Etive Neft Oil. Все права защищены.
        </p>
      </div>
    </div>
  );
}
