# react-solidlike

[English](./README.en.md) | 中文

声明式 React 控制流组件库，灵感来源于 Solid.js。用于替代 JSX 中的三元表达式和 `array.map()`，让你的组件代码更加清晰易读。支持 React 和 React Native。

## 安装

```bash
npm install react-solidlike
# 或
bun add react-solidlike
```

## 组件

### `<Show>` - 条件渲染

替代三元表达式进行条件渲染。

```tsx
import { Show } from "react-solidlike";

// 基础用法
<Show when={isLoggedIn}>
  <UserProfile />
</Show>

// 带 fallback
<Show when={isLoggedIn} fallback={<LoginButton />}>
  <UserProfile />
</Show>

// 使用 render props 获取类型安全的值
<Show when={user}>
  {(user) => <UserProfile name={user.name} />}
</Show>
```

### `<For>` - 列表渲染

替代 `array.map()` 进行列表渲染。

```tsx
import { For } from "react-solidlike";

// 基础用法
<For each={items}>
  {(item) => <ListItem {...item} />}
</For>

// 带 keyExtractor
<For each={users} keyExtractor={(user) => user.id}>
  {(user) => <UserCard user={user} />}
</For>

// 带 fallback 处理空数组
<For each={items} fallback={<EmptyState />}>
  {(item, index) => <ListItem item={item} index={index} />}
</For>

// 使用 wrapper 包装元素
<For each={items} wrapper={<ul className="list" />}>
  {(item) => <li>{item.name}</li>}
</For>

// 倒序渲染
<For each={messages} reverse>
  {(msg) => <Message {...msg} />}
</For>

// 使用 array 参数获取上下文信息
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

### `<Switch>` / `<Match>` / `<Default>` - 多分支渲染

替代多个 `if-else` 或 `switch` 语句。

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

### `<Await>` - 异步等待

等待 Promise resolve 后渲染内容。

```tsx
import { Await } from "react-solidlike";

// 基础用法
<Await promise={fetchUser()} loading={<Spinner />}>
  {(user) => <UserProfile user={user} />}
</Await>

// 带错误处理
<Await
  promise={fetchData()}
  loading={<Loading />}
  error={(err) => <ErrorMessage message={err.message} />}
>
  {(data) => <DataView data={data} />}
</Await>

// 支持非 Promise 值（用于缓存场景）
<Await promise={cache ?? fetchData()} loading={<Spinner />}>
  {(data) => <DataView data={data} />}
</Await>
```

### `<Repeat>` - 重复渲染

替代 `Array.from({ length: n }).map()`。

```tsx
import { Repeat } from "react-solidlike";

// 渲染星级评分
<Repeat times={5}>
  {(i) => <Star key={i} filled={i < rating} />}
</Repeat>

// 生成骨架屏占位
<Repeat times={3}>
  {(i) => <SkeletonCard key={i} />}
</Repeat>

// 使用 wrapper 包装元素
<Repeat times={5} wrapper={<div className="stars" />}>
  {(i) => <Star key={i} />}
</Repeat>

// 倒序渲染
<Repeat times={5} reverse>
  {(i) => <div key={i}>倒序 {i}</div>}
</Repeat>

// 使用 length 参数显示进度
<Repeat times={totalSteps}>
  {(i, length) => (
    <Step key={i} current={i + 1} total={length} />
  )}
</Repeat>
```

### `<Dynamic>` - 动态组件

根据条件动态选择要渲染的组件类型。

```tsx
import { Dynamic } from "react-solidlike";

// 动态选择按钮或链接
<Dynamic
  component={href ? 'a' : 'button'}
  href={href}
  onClick={onClick}
>
  {label}
</Dynamic>

// 配合自定义组件
<Dynamic
  component={isAdmin ? AdminPanel : UserPanel}
  user={currentUser}
/>

// React Native 中使用
<Dynamic
  component={isPressable ? Pressable : View}
  onPress={handlePress}
>
  <Text>Content</Text>
</Dynamic>
```

### `<ErrorBoundary>` - 错误边界

捕获子组件树中的 JavaScript 错误，防止整个应用崩溃。

```tsx
import { ErrorBoundary } from "react-solidlike";

// 基础用法
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>

// 使用 render props 获取错误信息和重置函数
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

// resetKey 变化时自动重置
<ErrorBoundary fallback={<Error />} resetKey={userId}>
  <UserProfile />
</ErrorBoundary>
```

### `<QueryBoundary>` - 查询边界

处理异步查询的各种状态（加载中、错误、空数据、成功）。可与 `@tanstack/react-query`、SWR、RTK Query 等配合使用。

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

| 属性 | 类型 | 描述 |
|------|------|------|
| `query` | `QueryResult<T>` | 查询结果对象 |
| `loading` | `ReactNode` | 加载中显示 |
| `error` | `ReactNode` | 错误时显示 |
| `empty` | `ReactNode` | 空数据显示 |
| `children` | `ReactNode \| (data: T) => ReactNode` | 成功时渲染 |
| `isEmptyFn` | `(data: T) => boolean` | 自定义空判断 |

## 开发

```bash
# 安装依赖
bun install

# 运行测试
bun test

# 代码检查
bun run lint

# 构建
bun run build
```

## License

MIT
