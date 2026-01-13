# Тестирование

Проект использует [Vitest](https://vitest.dev/) и [React Testing Library](https://testing-library.com/react) для тестирования.

## Запуск тестов

```bash
# Запустить тесты в watch режиме
npm test

# Запустить тесты один раз
npm run test:run

# Запустить тесты с UI
npm run test:ui

# Запустить тесты с coverage отчетом
npm run test:coverage
```

## Структура тестов

Тесты находятся рядом с файлами, которые они тестируют:
- `ComponentName.test.tsx` - для компонентов
- `utilName.test.ts` - для утилит
- `hookName.test.ts` - для хуков

## Написание тестов

Используйте `test/utils.tsx` для render функции, которая включает все необходимые провайдеры:

```tsx
import { render, screen } from '../../test/utils'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## Примеры тестов

См. существующие тесты:
- `src/utils/cn.test.ts` - простой unit тест
- `src/components/state/EmptyState.test.tsx` - тест компонента

## Coverage

Целевое покрытие:
- Утилиты: 90%+
- Компоненты: 70%+
- Критические пути: 100%

## Полезные ссылки

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
