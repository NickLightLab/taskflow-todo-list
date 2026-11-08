# FORMA — Your space to focus

Тёмное редакционное To-Do приложение (Dark Editorial Productivity). Тестовое задание.

## Функции
- Добавление задач (Enter / кнопка), обрезка пробелов, запрет пустых, лимит 140 символов
- Отметка выполнено / возврат в активные, редактирование (двойной клик или кнопка; Enter / Esc)
- Удаление с анимацией и отменой через toast; очистка выполненных с подтверждением и отменой
- Фильтры: Все / В процессе / Выполнено (сайдбар на десктопе, нижняя навигация на мобильных)
- Живые счётчики, кольцо прогресса, три разных empty-state
- Сохранение в `localStorage`: устойчиво к повреждённым данным (битые элементы отбрасываются поштучно), ошибкам чтения/записи, синхронизация между вкладками
- Клавиатура: Tab, Enter, Esc, `/` — фокус в поле, Delete на чекбоксе; `prefers-reduced-motion`; тексты выводятся как текст (без XSS)

## Стек
React 19, TypeScript, Vite, Tailwind CSS 4, Motion (Framer Motion), lucide-react, Vitest.

## Запуск
```bash
npm install
npm run dev        # разработка
npm test           # юнит-тесты логики и хранилища
npm run typecheck
npm run build      # production-сборка в dist/
```

## Публикация на GitHub Pages
Workflow `.github/workflows/deploy.yml` собирает проект с `BASE_PATH=/<имя-репозитория>/` и публикует `dist`.
В репозитории: Settings → Pages → Source: GitHub Actions, затем push в `main`.
Для ручной сборки: `BASE_PATH=/my-repo/ npm run build`.
