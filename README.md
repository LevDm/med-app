# Запуск проекта

## Установка зависимостей

```
pnpm install --frozen-lockfile
```

## Создание .env

```
Windows: copy .\packages\backend\.env.example .\packages\backend\.env
Linux: cp ./packages/backend/.env.example ./packages/backend/.env
```

## Запуск контейнера с базой

```
docker-compose up -d
```

## Генерация типов БД

```
pnpm --filter backend generate
```

## Миграция

```
pnpm --filter backend migrate:dev
```

## Запуск проекта

```
pnpm start:dev:backend
pnpm start:dev:frontend
```

## Просмотр БД

```
pnpm start:db-ui
```
