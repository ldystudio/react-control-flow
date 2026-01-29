# react-solidlike

English | [中文](./README.md)

Declarative React control flow components inspired by Solid.js. Replaces ternary expressions and `array.map()` in JSX, making your component code cleaner and more readable. Supports React and React Native.

## Installation

```bash
npm install react-solidlike
# or
bun add react-solidlike
```

## Components

### `<Show>` - Conditional Rendering

Replace ternary expressions for conditional rendering.

```tsx
import { Show } from "react-solidlike";

// Basic usage
<Show when={isLoggedIn}>
  <UserProfile />
</Show>

// With fallback
<Show when={isLoggedIn} fallback={<LoginButton />}>
  <UserProfile />
</Show>

// Using render props for type-safe value access
<Show when={user}>
  {(user) => <UserProfile name={user.name} />}
</Show>
```

### `<For>` - List Rendering

Replace `array.map()` for list rendering.

```tsx
import { For } from "react-solidlike";

// Basic usage
<For each={items}>
  {(item) => <ListItem {...item} />}
</For>

// With keyExtractor
<For each={users} keyExtractor={(user) => user.id}>
  {(user) => <UserCard user={user} />}
</For>

// With fallback for empty arrays
<For each={items} fallback={<EmptyState />}>
  {(item, index) => <ListItem item={item} index={index} />}
</For>

// With wrapper element
<For each={items} wrapper={<ul className="list" />}>
  {(item) => <li>{item.name}</li>}
</For>

// Reverse rendering
<For each={messages} reverse>
  {(msg) => <Message {...msg} />}
</For>

// Using array parameter for context
<For each={steps}>
  {(step, index, array) => (
    <Step
      data={step}
      isFirst={index === 0}
      isLast={index === array.length - 1}
    />
  )}
</For>
```

### `<Switch>` / `<Match>` / `<Default>` - Multi-branch Rendering

Replace multiple `if-else` or `switch` statements.

```tsx
import { Switch, Match, Default } from "react-solidlike";

<Switch>
  <Match when={status === "loading"}>
    <LoadingSpinner />
  </Match>
  <Match when={status === "error"}>
    <ErrorMessage />
  </Match>
  <Match when={status === "success"}>
    <SuccessContent />
  </Match>
  <Default>
    <IdleState />
  </Default>
</Switch>
```

### `<Await>` - Async Rendering

Wait for Promise to resolve before rendering.

```tsx
import { Await } from "react-solidlike";

// Basic usage
<Await promise={fetchUser()} loading={<Spinner />}>
  {(user) => <UserProfile user={user} />}
</Await>

// With error handling
<Await
  promise={fetchData()}
  loading={<Loading />}
  error={(err) => <ErrorMessage message={err.message} />}
>
  {(data) => <DataView data={data} />}
</Await>

// Supports non-Promise values (for caching scenarios)
<Await promise={cache ?? fetchData()} loading={<Spinner />}>
  {(data) => <DataView data={data} />}
</Await>
```

### `<Repeat>` - Repeat Rendering

Replace `Array.from({ length: n }).map()`.

```tsx
import { Repeat } from "react-solidlike";

// Render star ratings
<Repeat times={5}>
  {(i) => <Star key={i} filled={i < rating} />}
</Repeat>

// Generate skeleton placeholders
<Repeat times={3}>
  {(i) => <SkeletonCard key={i} />}
</Repeat>

// With wrapper element
<Repeat times={5} wrapper={<div className="stars" />}>
  {(i) => <Star key={i} />}
</Repeat>

// Reverse rendering
<Repeat times={5} reverse>
  {(i) => <div key={i}>Reversed {i}</div>}
</Repeat>

// Using length parameter for progress
<Repeat times={totalSteps}>
  {(i, length) => (
    <Step key={i} current={i + 1} total={length} />
  )}
</Repeat>
```

### `<Split>` - String Split Rendering

Split a string by separator and render each part.

```tsx
import { Split } from "react-solidlike";

// Basic usage - splits without keeping separator
<Split string="a,b,c" separator=",">
  {(part) => <span>{part}</span>}
</Split>
// Renders: ["a", "b", "c"]

// Keep separator in result
<Split string="9+5=(9+1)+4" separator="=" keepSeparator>
  {(part) => <span>{part}</span>}
</Split>
// Renders: ["9+5", "=", "(9+1)+4"]

// Using RegExp separator
<Split string="a1b2c3" separator={/\d/} keepSeparator>
  {(part) => <span>{part}</span>}
</Split>
// Renders: ["a", "1", "b", "2", "c", "3"]

// With wrapper element
<Split string="hello world" separator=" " wrapper={<div className="words" />}>
  {(word) => <span>{word}</span>}
</Split>

// With fallback for empty string
<Split string={text} separator="," fallback={<EmptyState />}>
  {(part) => <Tag>{part}</Tag>}
</Split>

// Reverse rendering
<Split string="a,b,c" separator="," reverse>
  {(part) => <span>{part}</span>}
</Split>
// Render order: ["c", "b", "a"]
```

### `<Dynamic>` - Dynamic Component

Dynamically select component type based on conditions.

```tsx
import { Dynamic } from "react-solidlike";

// Dynamic button or link
<Dynamic
  component={href ? 'a' : 'button'}
  href={href}
  onClick={onClick}
>
  {label}
</Dynamic>

// With custom components
<Dynamic
  component={isAdmin ? AdminPanel : UserPanel}
  user={currentUser}
/>

// React Native usage
<Dynamic
  component={isPressable ? Pressable : View}
  onPress={handlePress}
>
  <Text>Content</Text>
</Dynamic>
```

### `<ErrorBoundary>` - Error Boundary

Catch JavaScript errors in child component tree.

```tsx
import { ErrorBoundary } from "react-solidlike";

// Basic usage
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>

// With render props for error info and reset function
<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  )}
>
  <App />
</ErrorBoundary>

// Auto-reset when resetKey changes
<ErrorBoundary fallback={<Error />} resetKey={userId}>
  <UserProfile />
</ErrorBoundary>
```

### `<QueryBoundary>` - Query Boundary

Handle async query states (loading, error, empty, success). Works with `@tanstack/react-query`, SWR, RTK Query, etc.

```tsx
import { QueryBoundary } from "react-solidlike";
import { useQuery } from "@tanstack/react-query";

function UserList() {
  const query = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

  return (
    <QueryBoundary
      query={query}
      loading={<Spinner />}
      error={<ErrorMessage />}
      empty={<NoData />}
    >
      {(users) => (
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </QueryBoundary>
  );
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `query` | `QueryResult<T>` | Query result object |
| `loading` | `ReactNode` | Loading state content |
| `error` | `ReactNode` | Error state content |
| `empty` | `ReactNode` | Empty state content |
| `children` | `ReactNode \| (data: T) => ReactNode` | Success content |
| `isEmptyFn` | `(data: T) => boolean` | Custom empty check |

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Lint
bun run lint

# Build
bun run build
```

## License

MIT
