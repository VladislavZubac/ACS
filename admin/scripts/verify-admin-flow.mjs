import axios from "axios";

const baseUrl = process.env.ADMIN_VERIFICATION_BASE_URL ?? "http://localhost:8080";
const username = process.env.ADMIN_VERIFICATION_USERNAME;
const password = process.env.ADMIN_VERIFICATION_PASSWORD;
const targetUserId = process.env.ADMIN_VERIFICATION_TARGET_USER_ID;
const quotaDelta =
  Number(process.env.ADMIN_VERIFICATION_QUOTA_DELTA ?? 1048576);

function requireEnv(value, name) {
  if (!value) {
    throw new Error(
      `Переменная ${name} не задана. См. README/ADMIN.MD для списка обязательных переменных.`,
    );
  }
  return value;
}

function log(step, message) {
  console.log(`[verify:${step}] ${message}`);
}

function summarizeSummary(summary) {
  return `users=${summary.totalUsers}, files=${summary.totalFiles}, assigned=${summary.totalAssignedBytes}, used=${summary.totalUsedBytes}`;
}

async function main() {
  requireEnv(username, "ADMIN_VERIFICATION_USERNAME");
  requireEnv(password, "ADMIN_VERIFICATION_PASSWORD");

  log("setup", `Используем backend ${baseUrl}`);

  const loginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
    username,
    password,
  });
  const token = loginResponse.data.token;
  if (!token) {
    throw new Error("Backend не вернул токен авторизации");
  }
  log("auth", `Вход выполнен как ${loginResponse.data.user?.username ?? "unknown"}`);

  const client = axios.create({
    baseURL: baseUrl,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const summaryResponse = await client.get("/api/admin/stats/summary");
  log("dashboard", `Сводка: ${summarizeSummary(summaryResponse.data)}`);

  const usersResponse = await client.get("/api/admin/stats/users");
  const users = usersResponse.data ?? [];
  if (!Array.isArray(users) || users.length === 0) {
    throw new Error("Список пользователей пуст или имеет неверный формат");
  }

  let pickedUser =
    users.find((user) => user.id === targetUserId) ??
    users.find((user) => user.role === "USER") ??
    users[0];

  if (!pickedUser) {
    throw new Error("Не удалось выбрать пользователя для проверки квоты");
  }

  log(
    "users",
    `Выбран пользователь ${pickedUser.username} (id=${pickedUser.id}, assigned=${pickedUser.assignedSpaceBytes})`,
  );

  if (!Number.isFinite(quotaDelta) || quotaDelta <= 0) {
    throw new Error("ADMIN_VERIFICATION_QUOTA_DELTA должен быть положительным числом");
  }

  const nextQuota = pickedUser.assignedSpaceBytes + quotaDelta;
  log("quota", `Увеличиваем квоту на ${quotaDelta} → ${nextQuota}`);
  await client.patch(`/api/admin/users/${pickedUser.id}/quota`, {
    assignedSpaceBytes: nextQuota,
  });

  log("quota", "Возвращаем исходное значение квоты");
  await client.patch(`/api/admin/users/${pickedUser.id}/quota`, {
    assignedSpaceBytes: pickedUser.assignedSpaceBytes,
  });

  log("done", "Сценарий логин → дэшборд → изменение квоты выполнен успешно");
}

main().catch((error) => {
  console.error("[verify:error]", error.response?.data ?? error.message ?? error);
  process.exit(1);
});


