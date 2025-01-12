# Конфигурируемый лоадер Minecraft'a с кастомными клиентами.
### Кастомный клиент означает полностью конфигурируемый, лоадер автоматизирует процесс поставки клиента на ПК пользователя и запускает его по конфигурации с сервера.
### Для защиты с использованием VMProtect вы можете самостоятельно использовать данную библиотеку [here](https://github.com/CertainLach/vmprotect)
### Скриншоты дизайна лоадера
#### Обновление
![](https://i.imgur.com/lZbmr6s.png "")
#### Авторизация
![](https://i.imgur.com/c36SkDj.png "")
#### Настройки клиента
![](https://i.imgur.com/L356ezA.png "")
#### Клиенты
![](https://i.imgur.com/FMzuyiR.png "")
#### Установка/Запуск клиента
![](https://i.imgur.com/poiq1sS.png "")
#### Debug режим
![](https://i.imgur.com/nmd3Dvo.png "")

# Конфигурация проекта
Перед сборкой, протестируйте конфигурацию с сборкой: npm run tauri dev

### src-tauri/tauri.conf.json
```json
{
  "productName": "MLoader", // измените на название вашего лоадера
  "identifier": "ru.mentola.loader", // не менять
  "app": {
    "windows": [
      {
        "title": "MLoader" // измените на название вашего лоадера
      }
    ]
  },
  "bundle": {
    "icon": [
      "icons/32x32.png", // вы можете добавить свои иконки, они находятся по пути ./loader-app/src-tauri/icons
      "icons/128x128.png",
      "icons/icon.ico"
    ]
  }
}
```

### src-tauri/capabilities/default.json
```json
{
  "permissions": [
    {
      "identifier": "http:default",
      "allow": [{ "url": "http://*:*" }] // измените http://*:* на ссылку вашего хоста, обязательно установите его с SSL сертификатом для доп безопасности.
    }
  ]
}
```

### src-tauri/src/config.rs
```rust
#[tauri::command]
pub fn get_proxy_api() -> String {
    protected!(cstr "http://localhost:8080").to_string() // измените на хост
}
```

# Необходимое API
### Данное API является минимальным для работы лоадера, от его реализации зависит работоспособность лоадера.
## Client & Subscription & Client Assets Endpoints
### Fetch Client Assets
- **Method:** `POST`
- **URL:** `/api/v1/client/assets`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <session>`
- **Body:**
```json
{
  "raw_id": "string" // уникальный id клиента
}
```
- **Response:**
```json
{
  "data": [
    {
      "path": "string", // важно!!! не абсолютный путь, например: path/to/file.exe, (raw_id в пути не учитывайте)
      "checksum": "string", // sha256
      "size": "number" // размер в байтах (не важно)
    }
  ]
}
```
### Build Client Args
- **Method:** `POST`
- **URL:** `/api/v1/client/build/args`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <session>`
- **Body:**
```json
{
  "raw_id": "string", // уникальный id клиента
  "install_dir": "string", // папка установки клиента на машине пользователя
  "ram": "number", // объем выставленной ОЗУ для jvm
  "max_ram": "number", // объем максимальной ОЗУ для jvm
  "window_w": "number", // ширина для окна игры
  "window_h": "number" // высота для окна игры
}
```
- **Response:**
```json
{
  "content": ["string"], // аргументы запуска
  "bootstrap": "string" // запускаемый файл, как и в случае с ассетами не указывать абсолютный путь, вы можете использовать install_dir из тела запроса чтобы подставить его в путь запускаемого файла
}
```
#### Получить логин или другую информацию о клиенте вы можете из токена сессии в заголовке запроса.
### Fetch Client Infos
- **Method:** `POST`
- **URL:** `/api/v1/client/all`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <session>`
- **Response:**
```json
[
  {
    "raw_id": "string", // уникальный id клиента
    "title": "string", // заголовок клиента
    "description": "string", // описание клиента
    "image_url": "string", // картинка фона клиента
    "last_update_log": "string", // последнее обновление, можно использовать html-теги без контейнеров (div), img можно
    "total_runs": "number", // количество запусков клиента
    "total_updates": "number" // количество обновлений клиента
  }
]
```
### Fetch Subscription Info
- **Method:** `POST`
- **URL:** `/api/v1/subscription`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <session>`
- **Body:**
```json
{
  "raw_id": "string" // уникальный id клиента
}
```
- **Response:**
```json
{
  "raw_id": "string", // уникальный id клиента
  "active": "boolean", // активна ли подписка
  "expires": "number" // дата истечения
}
```
## Sessions Endpoints
#### !!! Очень важно, обратите на порядок вызовов при авторизации клиента
#### Создание сессии (Fetch Session) => Проверка сессии (Commit Session) => (Получение данных о юзере) Fetch User Data
### Fetch Session
- **Method:** `POST`
- **URL:** `/api/v1/auth/session/fetch`
- **Headers:**
  - `Content-Type: application/json`
- **Body:**
```json
{
    "login": "string", // логин
    "hash": "string" // хэш пароля (sha256)
}
```
- **Response:**
```json
{
  "token": "string", // токен сессии
  "commited": "boolean" // статус сессии
}
```
### Commit Session
- **Method:** `POST`
- **URL:** `/api/v1/auth/session/commit`
- **Headers:**
  - `Content-Type: application/json`
- **Body:**
```json
{
  "hwid": "string", // уникальный идентификатор устройства (./loader-app/src-tauri/src/hwid.rs)
  "token": "string" // токен сессии которую нужно подтвердить
}
```
- **Response:**
```json
{
  "token": "string", // токен сессии
  "commited": "boolean" // статус сессии
}
```
### Fetch User Data
- **Method:** `POST`
- **URL:** `/api/v1/auth/user/fetch`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <session>`
- **Response:**
```json
{
  "id": "number", // айди юзера
  "login": "string", // логин юзера
  "timestamp": "number" // дата регистрации
}
```
## Updates
### Fetch Updates
- **Method:** `GET`
- **URL:** `/api/v1/loader/updates`
- **Headers:**
  - `Content-Type: application/json`
- **Response:**
```json
{
  "sha256": "number", // хэш версии (для обновления проверяется хэш лоадера у юзера с данным)
  "download_url": "string" // ссылка на скачивание лоадера, может быть потоком или прямой ссылкой на файл
}
```


# Сборка проекта
Перед сборкой убедитесь, что у вас установлен node.js==23.4.0 и npm.
Для сборки проекта необходим rust==1.84.0.

```cmd
cd ./loader-app
npm run tauri build
```

<<<<<<< HEAD
Исполняемый файл будет доступен по пути .\loader-app\src-tauri\target\release.
Чтобы избавиться от .dll файлов, защитите приложение с помощью VMProtect, не забудьте импортировать скрипт для работы: src-tauri/vmprotect/script.lua
=======
Исполняемый файл будет доступен по пути .\loader-app\src-tauri\target\release
>>>>>>> a3dc3efa40b0a965903a3b3eee28f0c19f285cbe
