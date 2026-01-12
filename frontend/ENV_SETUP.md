# 🔧 Настройка переменных окружения

## Быстрый старт

1. **Скопируйте `.env.example` в `.env`:**
   ```bash
   cp .env.example .env
   ```

2. **Отредактируйте `.env` файл с вашими настройками:**
   ```env
   # API Configuration
   VITE_API_BASE_URL=http://localhost:8080/api/v1
   VITE_FILE_UPLOAD_BASE_URL=http://localhost:8080
   ```

3. **Для production используйте реальные URL:**
   ```env
   VITE_API_BASE_URL=https://api.flowday.app/api/v1
   VITE_FILE_UPLOAD_BASE_URL=https://api.flowday.app
   ```

## Переменные окружения

### `VITE_API_BASE_URL`
- **Описание:** Базовый URL для всех API запросов
- **Формат:** `http://hostname:port/api/v1` или `https://domain.com/api/v1`
- **По умолчанию:** `http://localhost:8080/api/v1`

### `VITE_FILE_UPLOAD_BASE_URL`
- **Описание:** Базовый URL для загрузки и получения файлов (аватары, вложения)
- **Формат:** `http://hostname:port` или `https://domain.com`
- **По умолчанию:** `http://localhost:8080`

### `VITE_APP_NAME`
- **Описание:** Название приложения (используется в мета-тегах и заголовках)
- **По умолчанию:** `Flowday`

### `VITE_APP_VERSION`
- **Описание:** Версия приложения
- **По умолчанию:** `1.0.0`

### `VITE_ENV`
- **Описание:** Текущее окружение (development, staging, production)
- **По умолчанию:** `development`

## Важные замечания

⚠️ **ВНИМАНИЕ:**
- Все переменные окружения должны начинаться с `VITE_` для работы с Vite
- После изменения `.env` файла нужно **перезапустить dev сервер**
- `.env` файл должен быть в `.gitignore` (уже добавлен)
- `.env.example` хранится в репозитории как шаблон

## Использование в коде

```typescript
// Получение переменной окружения
const API_URL = import.meta.env.VITE_API_BASE_URL;

// С проверкой fallback
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

// Проверка окружения
if (import.meta.env.DEV) {
  // Код только для development
}

if (import.meta.env.PROD) {
  // Код только для production
}
```

## Разные окружения

### Development
```env
VITE_ENV=development
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### Staging
```env
VITE_ENV=staging
VITE_API_BASE_URL=https://staging-api.flowday.app/api/v1
```

### Production
```env
VITE_ENV=production
VITE_API_BASE_URL=https://api.flowday.app/api/v1
```

## Troubleshooting

**Проблема:** Переменные окружения не работают
- ✅ Убедитесь, что переменные начинаются с `VITE_`
- ✅ Перезапустите dev сервер после изменения `.env`
- ✅ Проверьте, что `.env` файл находится в корне `frontend/` директории

**Проблема:** В production используются значения по умолчанию
- ✅ Убедитесь, что переменные заданы в production окружении (CI/CD, hosting platform)
- ✅ Проверьте, что `.env` файл включен в build процесс
