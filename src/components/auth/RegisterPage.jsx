import { Lock, Mail, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { MfaFlow } from "@/components/auth/MfaFlow";
import { MfaScreen } from "@/components/auth/MfaParts";
import { AuthError, AuthLink, GoogleButton, OrDivider, SubmitButton } from "@/components/auth/parts";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { safeReturnTo } from "@/lib/authReturnTo";

const isAlreadyVerified = (err) => err?.status === 400 && /already verified/i.test(err?.message ?? "");

/**
 * The /register page: register → OTP → verifyOtp → setToken. Registration alone
 * does not sign the user in (the account is unverified), so the code step is never
 * skipped and loginViaEmailPassword is never called right after register.
 */
export function RegisterPage() {
  const returnTo = safeReturnTo();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState("form");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mfaChallenge, setMfaChallenge] = useState(null);

  async function register(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("As senhas precisam ser iguais.");
      return;
    }
    setBusy(true);
    try {
      await base44.auth.register({ email, password });
      setStep("otp");
    } catch (err) {
      setError(err.message || "Não foi possível criar a conta.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.mfa_required) {
        setMfaChallenge(result);
        return;
      }
      if (result?.access_token) base44.auth.setToken(result.access_token);
      window.location.href = returnTo;
    } catch (err) {
      // Verified server-side but the answer never arrived: the code is spent and
      // there is no token, so the only way forward is a normal sign-in.
      if (isAlreadyVerified(err)) setStep("already_verified");
      else setError(err.message || "Código de verificação inválido.");
      setBusy(false);
    }
  }

  async function resend() {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast("Código enviado", { description: "Confira o novo código no seu e-mail." });
    } catch (err) {
      if (isAlreadyVerified(err)) setStep("already_verified");
      else setError(err.message || "Não foi possível reenviar o código.");
    }
  }

  // The account is verified; the second sign-in step replaces the whole page and finishes signing in.
  if (mfaChallenge) return <MfaScreen><MfaFlow challenge={mfaChallenge} returnTo={returnTo} /></MfaScreen>;

  if (step === "already_verified") {
    return (
      <AuthLayout icon={UserPlus} title="Crie sua conta" subtitle="Cadastre-se para solicitar acesso ao seu concurso">
        <p className="mb-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{email}</span> já está verificado. Entre para continuar.
        </p>
        <AuthLink to="/login" returnTo={returnTo} className="inline-flex h-12 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Entrar
        </AuthLink>
      </AuthLayout>
    );
  }

  if (step === "otp") {
    return (
      <AuthLayout icon={UserPlus} title="Crie sua conta" subtitle="Cadastre-se para solicitar acesso ao seu concurso">
        <form onSubmit={verify}>
          <p className="mb-4 text-sm text-muted-foreground">
            Enviamos um código de seis dígitos para <span className="font-medium text-foreground">{email}</span>.
          </p>
          <AuthError>{error}</AuthError>
          <div className="mb-6 flex justify-center">
            <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <SubmitButton busy={busy} busyLabel="Verificando…" disabled={busy || otpCode.length < 6}>
            Verificar
          </SubmitButton>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            O código não chegou?{" "}
            <button type="button" onClick={resend} className="font-medium text-primary hover:underline">
              Reenviar
            </button>
          </p>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout icon={UserPlus} title="Crie sua conta" subtitle="Cadastre-se para solicitar acesso ao seu concurso">
      <GoogleButton returnTo={returnTo} onError={setError} />
      <OrDivider />
      <AuthError>{error}</AuthError>
      <form onSubmit={register} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="register-email">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="register-email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 pl-10" disabled={busy} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-password">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="register-password" type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 pl-10" disabled={busy} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-confirm">Confirmar senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="register-confirm" type="password" autoComplete="new-password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-12 pl-10" disabled={busy} required />
          </div>
        </div>
        <SubmitButton busy={busy} busyLabel="Criando conta…">
          Criar conta
        </SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <AuthLink to="/login" returnTo={returnTo}>
          Entrar
        </AuthLink>
      </p>
    </AuthLayout>
  );
}
