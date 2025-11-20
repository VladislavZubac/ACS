import type { Metadata } from "next";
import { AuthForm } from "@/src/features/auth/components/auth-form";

export const metadata: Metadata = {
  title: "Вход",
};

export default function LoginPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Добро пожаловать обратно
        </h1>
        <p className="text-sm text-muted-foreground">
          Авторизуйтесь, чтобы перейти к своим папкам и файлам.
        </p>
      </div>

      <AuthForm variant="login" />
    </section>
  );
}

