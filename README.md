# Hackaton Template — React Native client

Expo + TypeScript клиент для сценария организации мероприятий по Figma-макету.

## Stack

- Expo SDK 54
- React Native + TypeScript
- React Navigation Native Stack
- AsyncStorage
- react-native-svg
- Jest + Testing Library

## Scripts

- `npm start` — запустить Expo
- `npm run ios` — открыть iOS target
- `npm run android` — открыть Android target
- `npm test` — запустить тесты
- `npm run typecheck` — проверить TypeScript

## App flow

- Авторизация
- Главная (пустая / со списком мероприятий)
- Профиль
- Создание мероприятия
- Список заведений
- Детали заведения
- Страница мероприятия

## Data model

- Заведений — локальные mock-данные
- Профиль и мероприятия — `AsyncStorage`
- Архитектура подготовлена под будущую замену репозиториев на API
