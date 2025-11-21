import type { Metadata } from "next";
import { AdminLoginForm } from "@/src/features/admin-auth/components/login-form";

export const metadata: Metadata = {
  title: "Вход администратора",
};

export default function AdminLoginPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Панель администратора
        </h1>
        <p className="text-sm text-muted-foreground">
          Используйте учётную запись с правами ADMIN.
        </p>
      </div>

      <AdminLoginForm />
    </section>
  );
}


