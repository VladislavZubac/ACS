"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { getApiErrorMessage } from "@/src/shared/api/client";
import { Input } from "@/src/shared/ui/input";
import { Button } from "@/src/shared/ui/button";

type AuthFormVariant = "login" | "signup";

type Props = {
  variant: AuthFormVariant;
};

type FormState = {
  username: string;
  password: string;
  confirmPassword: string;
};

const initialState: FormState = {
  username: "",
  password: "",
  confirmPassword: "",
};

const copy = {
  login: {
    cta: "Войти",
    footerText: "Нет аккаунта?",
    footerLinkText: "Зарегистрироваться",
    footerHref: "/signup",
  },
  signup: {
    cta: "Создать аккаунт",
    footerText: "Уже есть аккаунт?",
    footerLinkText: "Войти",
    footerHref: "/login",
  },
} as const;

export function AuthForm({ variant }: Props) {
  const { login, signup } = useAuth();
  const [formState, setFormState] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const username = formState.username.trim();
    if (username.length < 3) {
      setError("Имя пользователя должно содержать минимум 3 символа");
      setIsSubmitting(false);
      return;
    }

    try {
      if (variant === "signup") {
        if (formState.password !== formState.confirmPassword) {
          throw new Error("Пароли не совпадают");
        }

        await signup({
          username,
          password: formState.password,
        });
      } else {
        await login({
          username,
          password: formState.password,
        });
      }
    } catch (err) {
      if (err instanceof Error && err.message === "Пароли не совпадают") {
        setError(err.message);
      } else {
        setError(getApiErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const { cta, footerHref, footerLinkText, footerText } = copy[variant];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted-foreground">
          Имя пользователя
        </label>
        <Input
          type="text"
          autoComplete="username"
          required
          placeholder="username"
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
          autoComplete={variant === "signup" ? "new-password" : "current-password"}
          required
          placeholder="••••••••"
          value={formState.password}
          onChange={handleChange("password")}
        />
      </div>

      {variant === "signup" ? (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">
            Подтверждение пароля
          </label>
          <Input
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            value={formState.confirmPassword}
            onChange={handleChange("confirmPassword")}
          />
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="pt-2">
        <Button type="submit" className="w-full" loading={isSubmitting}>
          {cta}
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {footerText}{" "}
        <Link href={footerHref} className="text-primary underline-offset-4 hover:underline">
          {footerLinkText}
        </Link>
      </p>
    </form>
  );
}

