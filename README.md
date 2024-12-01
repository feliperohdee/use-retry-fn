# useRetryFn 🔄

A lightweight, flexible, and powerful retry mechanism for async operations in TypeScript.

[![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/-Vitest-729B1B?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌟 Features

- 💪 Type-safe retry mechanism
- ⚡ Supports both sync and async functions
- ⏰ Configurable timeout
- 🎯 Custom retry delays
- 🛑 Skip retry functionality
- 🎭 Error handling with custom callbacks
- 🔄 Flexible retry attempts
- 🎨 Clean and minimal API

## 📦 Installation

```bash
npm install use-retry-fn
```

## 🚀 Quick Start

```typescript
import useRetryFn from 'use-retry-fn';

// Simple usage
const result = await useRetryFn(async ({ attempts }) => {
  // Your async operation here
  return await fetchData();
});

// Advanced usage with options
const result = await useRetryFn(
  async ({ attempts, skipRetry }) => {
    try {
      return await fetchData();
    } catch (error) {
      if (error.code === 'FATAL') {
        skipRetry(error);
      }
      throw error;
    }
  },
  {
    maxAttempts: 3,
    delay: ({ attempts }) => attempts * 1000,
    timeout: 5000,
    onError: ({ attempts }) => {
      console.log(`Attempt ${attempts} failed`);
    }
  }
);
```

## 🛠️ API Reference

### Function Signature

```typescript
function useRetryFn<T>(
  fn: UseRetryFn<T>, 
  options?: UseRetryFnOptions
): Promise<T>
```

### Context Object

The retry function receives a context object with:

```typescript
type UseRetryFnContext = {
  attempts: number;      // Current attempt number (starts at 1)
  skipRetry: (err?: Error) => void;  // Function to skip further retries
}
```

### Options

```typescript
type UseRetryFnOptions = {
  delay?: number | (({ attempts }: { attempts: number }) => number);  // Delay between retries
  onError?: (context: UseRetryFnContext) => void;  // Error callback
  maxAttempts?: number;  // Maximum number of attempts (default: 5)
  timeout?: number;  // Timeout in milliseconds
}
```

## 🎯 Use Cases

### Basic Retry

```typescript
const fetchData = async () => {
  const result = await useRetryFn(async () => {
    return await api.getData();
  });
  return result;
};
```

### Custom Delay Strategy

```typescript
// Exponential backoff
const result = await useRetryFn(
  async () => fetchData(),
  {
    delay: ({ attempts }) => Math.pow(2, attempts) * 1000,
  }
);
```

### Error Handling with Skip

```typescript
const result = await useRetryFn(
  async ({ skipRetry }) => {
    try {
      return await riskyOperation();
    } catch (error) {
      if (error.type === 'AUTHENTICATION_FAILED') {
        skipRetry(new Error('Authentication required'));
      }
      throw error;
    }
  }
);
```

### With Timeout

```typescript
// Operation will timeout after 5 seconds
const result = await useRetryFn(
  async () => longRunningOperation(),
  { timeout: 5000 }
);
```

## 📊 Common Patterns

### Progress Tracking

```typescript
let progress = 0;

const result = await useRetryFn(
  async () => operation(),
  {
    onError: ({ attempts }) => {
      progress = (attempts / maxAttempts) * 100;
      updateProgressBar(progress);
    }
  }
);
```

### Conditional Retry

```typescript
const result = await useRetryFn(
  async ({ attempts, skipRetry }) => {
    try {
      return await operation();
    } catch (error) {
      if (!isRetryableError(error)) {
        skipRetry(error);
      }
      throw error;
    }
  }
);
```

## 🧪 Testing

The package includes comprehensive tests covering various scenarios:

```bash
npm test
```

Test coverage includes:
- ✅ Successful operations
- ✅ Multiple retry attempts
- ✅ Timeout handling
- ✅ Custom delay functions
- ✅ Error callbacks
- ✅ Skip retry functionality
- ✅ Async operations

## 📝 License

MIT © [Felipe Rohde](mailto:feliperohdee@gmail.com)

## 🤝 Contributing

Contributions, issues and feature requests are welcome! Feel free to check [issues page](https://github.com/yourusername/use-retry-fn/issues).

## ⭐ Show your support

Give a ⭐️ if this project helped you!

## 👨‍💻 Author

**Felipe Rohde**
* Twitter: [@felipe_rohde](https://twitter.com/felipe_rohde)
* Github: [@feliperohdee](https://github.com/feliperohdee)
* Email: feliperohdee@gmail.com