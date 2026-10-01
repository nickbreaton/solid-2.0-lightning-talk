---
theme: default
colorSchema: dark
title: Async Belongs in the Graph
info: |
  A five-minute lightning talk on Solid 2.0's async model.
  Demos run live: React 19 + TanStack Query, and Solid 2.0 RC.
class: text-center
transition: slide-left
duration: 5min
mdc: true
drawings:
  persist: false
---

# Solid 2.0

<div class="lead">A game changer for managing async state</div>

<img src="/solid-logo.png" alt="Solid logo" class="mx-auto mt-12 w-40" />

---
layout: two-cols-header
layoutClass: gap-8
zoom: 0.9
---

# Let’s tell the story of React

::left::

<div class="code-label" data-framework="react">

````md magic-move {lines: true}
```tsx
function App({ userId }) {
  const [user, setUser] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchUser(userId).then((user) => {
      setUser(user);
      setIsLoading(false);
    });
  }, [userId]);

  if (isLoading) return <p>Loading...</p>;

  return <p>{user.name}</p>;
}
```

```tsx
import { useQuery } from "@tanstack/react-query";

function App({ userId }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  });

  if (isLoading) return <p>Loading...</p>;

  return <p>{user.name}</p>;
}
```

```tsx
import { useSuspenseQuery } from "@tanstack/react-query";

function User({ userId }) {
  const { data: user } = useSuspenseQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  });

  return <p>{user.name}</p>;
}

function App({ userId }) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <User userId={userId} />
    </Suspense>
  );
}
```
````

</div>

::right::

<div>
  <Demo :name="['react/UserEffect', 'react/UserQuery', 'react/UserSuspense'][Math.min($clicks, 2)]" />
</div>

---
layout: two-cols-header
layoutClass: gap-8
zoom: 0.75
---

# The _component tree_ becomes the request graph

::left::

<div class="code-label" data-framework="react">

```tsx {all|10-13|2-5|24,26}
function Posts({ userId }) {
  const { data: posts } = useSuspenseQuery({
    queryKey: ["posts", userId],
    queryFn: () => fetchPosts(userId),
  });
  return <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}

function User({ userId }) {
  const { data: user } = useSuspenseQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  });
  return (
    <>
      <p>{user.name}</p>
      <Posts userId={userId} />
    </>
  );
}

function App({ userId }) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <User userId={userId} />
    </Suspense>
  );
}
```

</div>

::right::

<div>
  <Demo name="react/Waterfall" :height="88" />
  <Network :scale="2400" />
</div>  

---
layout: two-cols-header
layoutClass: gap-8
zoom: 0.68
---

# Hoist data fetching to fix

::left::

<div class="code-label" data-framework="react">

```tsx {all|23-26}
function Posts({ userId }) {
  const { data: posts } = useSuspenseQuery({
    queryKey: ["posts", userId],
    queryFn: () => fetchPosts(userId),
  });
  return <ul>{posts.map((p) => <li key={p.id}>{p.title}</li>)}</ul>;
}

function User({ userId }) {
  const { data: user } = useSuspenseQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  });
  return (
    <>
      <p>{user.name}</p>
      <Posts userId={userId} />
    </>
  );
}

function App({ userId }) {
  usePrefetchQuery({
    queryKey: ["posts", userId],
    queryFn: () => fetchPosts(userId),
  });
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <User userId={userId} />
    </Suspense>
  );
}
```

</div>

::right::

<div>
  <Demo name="react/Waterfall" :props="{ prefetch: true }" :height="88" />
  <Network :scale="2400" />
</div>

---
layout: two-cols-header
layoutClass: gap-8
---

# Basic Solid state

::left::

<div class="code-label" data-framework="solid">

<WordHighlight :word="['{count()}', '{doubled()}']" within="{count()} × 2 = {doubled()}" :at="5">

````md magic-move
```tsx {2|4|6-10|all}
function Counter() {
  const [count, setCount] = createSignal(0);

  const doubled = createMemo(() => count() * 2);

  return (
    <button onClick={() => setCount(count() + 1)}>
      {count()} × 2 = {doubled()}
    </button>
  );
}
```

```tsx {6|all}
function Counter() {
  const [count, setCount] = createSignal(0);

  const doubled = createMemo(() => count() * 2);

  console.log(count());

  return (
    <button onClick={() => setCount(count() + 1)}>
      {count()} × 2 = {doubled()}
    </button>
  );
}
```
````

</WordHighlight>

</div>

::right::

<div>
  <Demo name="solid/Counter" />
</div>

---
layout: two-cols-header
layoutClass: gap-8
---

# Signals suspend transparently

::left::

<div class="code-label" data-framework="solid">

<WordHighlight word="{user().name}" :until="2">

```tsx {all|all|7,9}
function App(props) {
  const user = createMemo(
    () => fetchUser(props.userId)
  );

  return (
    <Loading fallback={<p>Loading...</p>}>
      <p>{user().name}</p>
    </Loading>
  );
}
```

</WordHighlight>

</div>

::right::

<div>
  <Demo name="solid/User" :height="28" />
</div>

---
layout: two-cols-header
layoutClass: gap-8
zoom: 0.75
---

# The _signals_ becomes the request graph

::left::

<div class="code-label" data-framework="solid">

````md magic-move {lines: true}
```tsx
function App(props) {
  const user = createMemo(() => fetchUser(props.userId));
  const posts = createMemo(() => fetchPosts(props.userId));
  return (
    <Loading fallback={<p>Loading...</p>}>
      <p>{user().name}</p>
      <ul>
        <For each={posts()}>
          {(p) => <li>{p.title}</li>}
        </For>
      </ul>
    </Loading>
  );
}
```

```tsx
function Posts(props) {
  const posts = createMemo(() => fetchPosts(props.userId));
  return (
    <ul>
      <For each={posts()}>
        {(p) => <li>{p.title}</li>}
      </For>
    </ul>
  );
}

function App(props) {
  const user = createMemo(() => fetchUser(props.userId));
  return (
    <Loading fallback={<p>Loading...</p>}>
      <p>{user().name}</p>
      <Posts userId={props.userId} />
    </Loading>
  );
}
```

```tsx
function Posts(props) {
  const posts = createMemo(() => fetchPosts(props.userId));
  return (
    <ul>
      <For each={posts()}>
        {(p) => <li>{p.title}</li>}
      </For>
    </ul>
  );
}

function User(props) {
  const user = createMemo(() => fetchUser(props.userId));
  return (
    <>
      <p>{user().name}</p>
      <Posts userId={props.userId} />
    </>
  );
}

function App(props) {
  return (
    <Loading fallback={<p>Loading...</p>}>
      <User userId={props.userId} />
    </Loading>
  );
}
```
````

</div>

::right::

<div>
  <Demo :name="['solid/PostsSingle', 'solid/PostsSplit', 'solid/Posts'][Math.min($clicks, 2)]" :height="88" />
  <Network :scale="2400" />
</div>

<v-click at="3">

<div class="mt-8 opacity-70">

Reading a value that isn't ready doesn't stop the rest of the tree from being built.

</div>

</v-click>

---
layout: two-cols-header
layoutClass: gap-8
---

# Transitions without `startTransition`

::left::

<div class="code-label" data-framework="solid">

```tsx {1-2|4-6|9|10-12|all}
const [id, setId] = createSignal(1);
const user = createMemo(() => fetchUser(id()));

<button onClick={() => setId(id() + 1)}>
  Next user
</button>

<Loading fallback={<Skeleton />}>
  <div class={{ dim: isPending(() => user()) }}>
    {user().name}
  </div>
</Loading>
Selected: {latest(id)}
```

</div>

::right::

<div>
  <Demo name="solid/NextUser" />
  <Network :scale="2400" />
</div>

<div class="quote mt-8 text-xl!">

In React, we mark which update is a transition.<br>
In Solid 2, the graph knows this write is waiting on async work.

</div>

---
layout: two-cols-header
layoutClass: gap-8
---

# Writes use the same model

::left::

<div class="code-label" data-framework="solid">

````md magic-move {lines: true}
```tsx {*|1|2|4|6}
const rename = action(function* (name) {
  affects(user);

  yield api.rename(id(), name);

  refresh(user);
});
```

```tsx
const [user, setUser] = createOptimisticStore(
  () => fetchUser(id()),
  seed
);

const rename = action(function* (name) {
  setUser(u => {
    u.name = name;
  });

  yield api.rename(id(), name);

  refresh(user);
});
```
````

</div>

<div class="mt-6 opacity-50 text-sm font-mono">action · affects · refresh · createOptimisticStore</div>

::right::

<div>
  <Demo name="solid/Rename" />
  <Network :scale="3000" />
</div>

<v-click at="6">

<div class="quote mt-8 text-xl!">Optimistic state, mutation status, invalidation, transition — different views of one transaction.</div>

</v-click>

---
layout: two-cols-header
layoutClass: gap-8
---

# Synchronization creeps in too

::left::

<div class="code-label" data-framework="react">

```tsx
const [name, setName] = useState(user.name);

useEffect(() => {
  setName(user.name);
}, [user.name]);
```

</div>

<div class="text-xs opacity-50 mt-1 mb-6">React alternatives: derive · key · restructure</div>

<v-click>

<div class="code-label" data-framework="solid">

```tsx
const [name, setName] = createSignal(
  () => user().name
);
```

</div>

<div class="text-sm opacity-70">derived, but writable</div>

</v-click>

::right::

<div class="flex flex-col gap-8">
  <Demo name="react/DraftEffect" />
  <Demo v-click="1" name="solid/Draft" />
</div>

---
layout: two-cols-header
layoutClass: gap-8
---

# Put it all together

::left::

<div class="code-label" data-framework="solid">

```tsx {1-2|4-6|8-10|12-14|16-18|all}
const [state, setState] =
  createSignal("NC");

const counties = createMemo(
  () => fetchCounties(state())
);

const [county, setCounty] = createSignal(
  () => counties()[0].id
);

const cities = createMemo(
  () => fetchCities(county())
);

const [city, setCity] = createSignal(
  () => cities()[0].id
);
```

</div>

::right::

<div>
  <Demo name="solid/Cascade" :height="172" />
  <Network :scale="2400" />
</div>

<v-click at="6">

<div class="quote mt-8">Where are the Effects?</div>
<div class="text-xl mt-2 opacity-80">The dependencies are the program.</div>

</v-click>

---
layout: center
class: text-center
---

<div class="closing-grid inline-grid text-left mt-6">
  <b>ASYNC</b><span class="opacity-70">not a side channel</span>
  <b>SYNCHRONIZATION</b><span class="opacity-70">not an Effect</span>
  <b>TRANSITIONS</b><span class="opacity-70">not a wrapper</span>
  <b>MUTATIONS</b><span class="opacity-70">not a separate universe</span>
</div>

<v-click>

<div class="quote mt-14 text-4xl!">Put the relationships in the graph.</div>

</v-click>

---
layout: two-cols-header
layoutClass: gap-8
---

# Appendix: I actually used this

::left::

<div class="code-label" data-framework="solid">

```tsx
function createCookieSignal(name, fallback) {
  const [value, setValue] = createOptimistic(async function* () {
    yield await readCookie(name, fallback);
    for await (const change of cookieChanges(name)) {
      yield change;
    }
  });

  const set = action(function* (next) {
    setValue(() => next);
    yield cookieStore.set(name, serialize(next));
    yield until(() => value() === next);
  });

  return [value, set];
}
```

</div>

::right::

<div>

<div class="code-label" data-framework="solid">

```tsx
const [latinOnly, setLatinOnly] =
  createCookieSignal("latinOnly", true);
```

</div>

<div class="mt-6 text-lg opacity-80">

SSR'd from a cookie, hydrated, live-updated from Cookie Store events, optimistically writable…

**…and it reads like state.**

</div>
</div>
