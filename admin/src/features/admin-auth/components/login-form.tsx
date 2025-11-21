"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from "react";
import { getApiErrorMessage } from "@/src/shared/api/client";
import { Input } from "@/src/shared/ui/input";
import { Button } from "@/src/shared/ui/button";
import { useAdminAuth } from "@/src/features/admin-auth/hooks/use-admin-auth";
import { useErrorNotifications } from "@/src/shared/providers/error/error-provider";

type FormState = {
  username: string;
  password: string;
};

const initialState: FormState = {
  username: "",
  password: "",
};

export function AdminLoginForm() {
  const { login } = useAdminAuth();
  const [formState, setFormState] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notifyError } = useErrorNotifications();

  const handleChange =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({
        username: formState.username.trim(),
        password: formState.password,
      });
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      notifyError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted-foreground">
          Имя администратора
        </label>
        <Input
          type="text"
          autoComplete="username"
          placeholder="admin"
          required
          value={formState.username}
          onChange={handleChange("username")}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted-foreground">
          Пароль
        </label>
        <Input
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          value={formState.password}
          onChange={handleChange("password")}
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Войти в админку
      </Button>
    </form>
  );
}


