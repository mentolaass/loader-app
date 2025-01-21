# Конфигурируемый лоадер Minecraft'a с кастомными клиентами.
### Зависимости/инструменты
**perl** (для сборки openssl) [strawberry](https://strawberryperl.com/)

**rust == 1.84.0**

**node.js == 23.6.0**
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

### src-tauri/src/config.rs
```rust
#[tauri::command]
pub fn get_proxy_api() -> String {
    protected!(cstr "http://localhost:8080").to_string() // измените на свой хост, если имеется ssl используйте его
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
      "path": "string", // путь скачивания файла (не ссылка)
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
  "window_h": "number", // высота для окна игры
  "jdks": [ // установленные jdk у клиента
    "path": "string", // путь до папки с jdk
    "ver": "string", // версия jdk
  ],
  "jres": [ // установленные jre у клиента
    "path": "string", // путь до папки с jre
    "ver": "string", // версия jre
  ]
}
```
- **Response:**
```json
{
  "content": ["string"], // аргументы запуска
  "bootstrap": "string" // путь до запускаемого файла, вы можете использовать install_dir из тела запроса чтобы подставить его в путь запускаемого файла
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
    "password": "string" // пароль
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
  "sha256": "number", // хэш файла (для обновления проверяется хэш файла у юзера с данным)
  "download_url": "string" // ссылка на скачивание лоадера, может быть потоком или прямой ссылкой на файл
}
```
# Проверка SSL сертификатов перед запросами (только при https)
### src-tauri/src/config.rs
```rust
pub fn get_cert() -> String {
  protected!(cstr "undefined").to_string() // измените undefined на сертификат хоста формата PEM.
}
```

# Тестирование
```cmd
cd ./loader-app
npm i (если не установлены пакеты)
npm run tauri dev
```

# Сборка проекта
```cmd
cd ./loader-app
npm i (если не установлены пакеты)
npm run tauri build
```
Исполняемый файл будет доступен по пути .\loader-app\src-tauri\target\release.
Чтобы избавиться от .dll файлов, защитите приложение с помощью VMProtect с импортом скрипта для работы: src-tauri/vmprotect/script.lua