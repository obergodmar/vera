# Бот вера

## Два проекта: `frontend` и `backend`

1. `frontend`: Админка для базы данных
2. `backend`: Приложение для БД и апи для бота

[Собранный фронт](https://vera.example.com/)

## Установка

Сперва необходимо настроить mysql:

```sh
sudo mysql
```

```sql
CREATE USER 'vera'@'localhost' IDENTIFIED BY 'password';
CREATE DATABASE vera;
GRANT ALL PRIVILEGES ON vera.* TO 'vera'@'localhost';
```

```sh
sudo mysql -u vera -p
```
