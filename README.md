# react-control-flow

声明式 React 控制流组件，用于替代 JSX 中的三元表达式和 `array.map()`。

## 安装

```bash
bun add react-control-flow
```

## 组件

### `<If>` - 条件渲染

替代三元表达式进行条件渲染。

```tsx
import { If } from "react-control-flow";

// 基础用法
<If condition={isLoggedIn}>
  <UserProfile />
</If>

// 带 fallback
<If condition={isLoggedIn} fallback={<LoginButton />}>
  <UserProfile />
</If>

// 使用 render props 获取类型安全的值
<If condition={user}>
  {(user) => <UserProfile name={user.name} />}
</If>
```

### `<For>` - 列表渲染

替代 `array.map()` 进行列表渲染。

```tsx
import { For } from "react-control-flow";

// 基础用法
<For each={items}>
  {(item) => <ListItem {...item} />}
</For>

// 带 keyExtractor
<For each={users} keyExtractor={(user) => user.id}>
  {(user) => <UserCard user={user} />}
</For>

// 带 fallback
<For each={items} fallback={<EmptyState />}>
  {(item, index) => <ListItem item={item} index={index} />}
</For>
```

## 开发

```bash
# 安装依赖
bun install

# 运行测试
bun test

# 代码检查
bun run lint

# 自动修复
bun run lint:fix

# 构建
bun run build
```

## License

MIT
