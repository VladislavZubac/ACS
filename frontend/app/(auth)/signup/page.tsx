import type { Metadata } from "next";
import { AuthForm } from "@/src/features/auth/components/auth-form";

export const metadata: Metadata = {
  title: "Регистрация",
};

export default function SignupPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Создайте аккаунт
        </h1>
        <p className="text-sm text-muted-foreground">
          Получите 5 ГБ бесплатного пространства и делитесь файлами в пару кликов.
        </p>
      </div>

      <AuthForm variant="signup" />
    </section>
  );
}

