
# ACS Backend

Spring Boot 3 сервис для проекта «Мини-облако». Основные возможности: хранение файлов пользователей, квоты, публичные шаринги и административные API.

## Технологии
- Java 21, Spring Boot 3 (Web, Security, Data JPA, Validation)
- SQLite (через Hibernate) — по умолчанию локальный файл `./data/db/acs.sqlite`
- JWT-аутентификация, Swagger/OpenAPI (`springdoc`)
- Кэширование Caffeine (`user-details` и др.), request logging filter
- Docker/Docker Compose для контейнерного запуска

## Слои и пакеты
- `config` — конфигурации (security, swagger, async, storage)
- `user` — пользователи и аутентификация
- `folder` / `file` — логика папок и файлов
- `storage` — абстракции работы с диском/S3
- `share` — публичные ссылки
- `quota` — квоты пользователей
- `admin` — админские API
- `audit` — аудит действий (на будущее)

## Запуск
### Локально
```powershell
cd backend/acs
.\mvnw.cmd spring-boot:run
```
Переменные окружения (опционально):

| env | значение по умолчанию | назначение |
| --- | --- | --- |
| `ACS_DB_PATH` | `./data/db/acs.sqlite` | путь к SQLite |
| `ACS_STORAGE_ROOT` | `backend/cloud` | каталог файлов |
| `ACS_JWT_SECRET` | `change-me` | секрет JWT |
| `ACS_MAX_FILE_SIZE` | `100MB` | лимит загрузки |
| `ACS_LOG_FILE` | `logs/acs.log` | путь к лог-файлу |
| `ACS_SHARE_CLEANUP_DELAY` | `PT1H` | период очистки просроченных шарингов |

## API (частично реализовано)
- `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
- `POST /api/folders`, `GET /api/folders`, `GET /api/folders/{id}`, `DELETE /api/folders/{id}`
- `POST /api/files` (multipart upload), `GET /api/files`, `GET /api/files/{id}`, `GET /api/files/{id}/download`, `DELETE /api/files/{id}`
- `GET /api/files/{id}/preview` — PNG превью (генерируется асинхронно для изображений)
- `POST /api/share`, `GET /api/share`, `DELETE /api/share/{id}`
- Публичный доступ: `GET /api/public/share/{token}`, `GET /api/public/share/{token}/download` (для файлов)
- Админка (`ROLE_ADMIN`): `GET /api/admin/stats/summary`, `GET /api/admin/stats/users`, `PATCH /api/admin/users/{id}/quota`

Админ создаётся автоматически (логин/пароль в переменных `ACS_ADMIN_*`). Хранилище файлов — локальный диск (`storage.root-path`), квоты контролируются сервисом `QuotaService`.

### Docker Compose
```powershell
docker compose up --build
```
В `docker-compose.yml` уже подключены тома `backend_db` и `backend_cloud`.

## Дальнейшие шаги
См. `BACKEND.MD` — текущий этап: завершён шаг 1 (инфраструктура). Далее: шаг 2 (модель данных и репозитории).

