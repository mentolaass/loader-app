import {useState, useEffect} from "react";
import {invoke} from "@tauri-apps/api/core";

type Language = {
    id: string;
    tags: Record<string, string>;
};

const Resource: Language[] = [
    {
        id: "ru",
        tags: {
            "login-button": "Войти",
            "login-title": "Вход в аккаунт",
            "login-description": "Вам необходимо войти в свой аккаунт, чтобы продолжить доступ к этой функции или услуге",
            "login-input-login": "Введите логин",
            "login-input-pass": "Введите пароль",
            "login-keep": "Запомнить сессию",

            "updater-checking": "Проверка обновлений",
            "updater-failed": "Ошибка обновления",
            "updater-latest": "Последняя версия",
            "updater-process": "Загрузка версии",

            "client-dialog-no-updates": "Нет обновлений",
            "subscription-no-active": "Не активна",
            "client-dialog-latest-update": "Изменения последнего обновления",
            "client-dialog-run": "Запуск",
            "client-dialog-close": "Закрыть",

            // states
            "client_downloading_files": "Загрузка файлов",
            "client_checking_files": "Проверка файлов",
            "client_running": "Запуск...",

            // debug
            "debug_process_ram": "ОЗУ",
            "debug_process_runtime": "Время работы",
            "debug_error": "Ошибка",
            "debug_manage_process": "Управление процессом",
            "debug_proccess_info": "Информация о процессе",
            "debug_process_copy_logs": "Скопировать логи",
            "debug_process_copy_logs_success": "Успешно скопировано",

            "client-total-updates": "Всего обновлений",
            "client-total-runs": "Всего запусков",
            "client-subscription": "Дата окончания подписки",

            "login_min_require": "Логин должен быть длиннее 4 символов",
            "login_max_require": "Логин должен быть короче 12 символов",
            "pass_min_require": "Пароль должен быть длиннее 6 символов",
            "pass_max_require": "Пароль должен быть короче 16 символов",

            "invalid_hwid": "Идентификатор устройства не совпадает",

            "settings-title-game": "Настройка игры",
            "settings-title-account": "Ваш аккаунт",
            "settings-title-loader": "Настройка лоадера",
            "settings-game-ram": "ОЗУ",
            "settings-game-debug": "Режим отладки",
            "settings-loader-install-dir": "Папка установки",
            "settings-loader-language": "Язык интерфейса",
            "settings-title-window-game": "Настройки окна игры",
            "settings-window-game-size": "Размеры окна",
            "settings-window-game-size-height": "Введите высоту",
            "settings-window-game-size-width": "Введите ширину"
        }
    },
    {
        id: "en",
        tags: {
            "login-button": "Log In",
            "login-title": "Account Login",
            "login-description": "You need to log in to your account in order to proceed with accessing this feature or service",
            "login-input-login": "Enter your username",
            "login-input-pass": "Enter your password",
            "login-keep": "Remember session",

            "updater-checking": "Checking Updates",
            "updater-failed": "Update Failed",
            "updater-latest": "Latest Version",
            "updater-process": "Loading Version",

            "client-dialog-no-updates": "No updates",
            "client-dialog-latest-update": "Last Update Changelog",
            "subscription-no-active": "No active",
            "client-dialog-run": "Run",
            "client-dialog-close": "Close",

            // states
            "client_downloading_files": "Downloading Files",
            "client_checking_files": "Checking Files",
            "client_running": "Running...",

            // debug
            "debug_process_ram": "RAM",
            "debug_process_runtime": "Work Time",
            "debug_error": "Error",
            "debug_manage_process": "Manage Process",
            "debug_proccess_info": "Process Info",
            "debug_process_copy_logs": "Copy Logs",
            "debug_process_copy_logs_success": "Success Copy",

            "client-total-updates": "Total Updates",
            "client-total-runs": "Total Runs",
            "client-subscription": "Expires Subscription Date",

            "login_min_require": "Login must be longer than 4 characters",
            "login_max_require": "Login must be shorter than 12 characters",
            "pass_min_require": "Password must be longer than 6 characters",
            "pass_max_require": "Password must be shorter than 16 characters",

            "invalid_hwid": "Invalid HWID",

            "settings-title-game": "Game Settings",
            "settings-title-account": "Your Account",
            "settings-title-loader": "Loader Settings",
            "settings-game-ram": "RAM",
            "settings-game-debug": "Debug Mode",
            "settings-loader-install-dir": "Installation Folder",
            "settings-loader-language": "Interface Language",
            "settings-title-window-game": "Window Game Settings",
            "settings-window-game-size": "Window Size",
            "settings-window-game-size-height": "Enter Height",
            "settings-window-game-size-width": "Enter Width"
        }
    },
]

function useTranslation(): { value: string, setLanguage: (lang: string) => Promise<void>, getString: (tag: string) => string } {
    const [value, setValue] = useState<string>("en");

    async function setLanguage(lang: string) {
        await invoke("write_language", { code: lang });
        setValue(lang);
    }

    function getString(tag: string): string {
        const resource = Resource.filter((res) => res.id === value)[0];
        return resource.tags[tag];
    }

    useEffect(() => {
        async function load() {
            const code: string = await invoke("get_language");
            setValue(code);
        }

        load();
    }, []);

    return { value, setLanguage, getString };
}

export default useTranslation;