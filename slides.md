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

<!--
[0:00–0:20]

I want to talk about one idea in Solid 2.0. Not rendering performance, not signals versus hooks. Async.

Most UI frameworks have a synchronous reactive model and then a set of tools for dealing with async when it happens. Solid 2.0 makes a different bet: async itself is part of the reactive graph.

I'm going to start in React, because the problem is easier to see there.
-->

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

<!--
[0:20–1:00]

We need some data. So we start with state and an Effect. Mount — or ID changes — call the API, put the answer into state. And we need a second piece of state, isLoading, to drive the loading branch. Ignore cancellation and errors; it's a lightning talk, this is already enough code.

[click] Fine. We don't want to rebuild server-state management, so we pull in TanStack Query and it makes this much better. isLoading now comes from the query. Caching, dedup, retries, stale data — the whole thing becomes sane. But I still have an explicit loading state in the component.

[click] Then Suspense gets the loading condition out of this component entirely. Great. This is progressively better code. But notice the loading state had to be hoisted: it now lives in App, a component above User.

[click] But we've moved async from state, to a query primitive, to the shape of the component tree.
-->

---
layout: two-cols-header
layoutClass: gap-8
zoom: 0.75
---

# The _component_ tree becomes the request graph

::left::

<div class="code-label" data-framework="react">

```tsx
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

<!--
[1:00–1:30]

Same App, same User as before. Now somebody adds the user's posts. Posts don't depend on the user response — we already have the ID. But User suspends before Posts mounts. So the component tree accidentally serialized two independent requests.

(TanStack's docs call this a nested component waterfall.)

[click] This is the part that bothers me: our data graph was parallel. Our render graph made it serial.

DON'T say "Suspense always waterfalls" or "there's no solution". Next slide is the solution.
-->

---
layout: two-cols-header
layoutClass: gap-8
zoom: 0.68
---

# React can fix it

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

<!--
[1:30–1:50]

React can absolutely fix this. Prefetch it. Hoist the queries. Use useSuspenseQueries. Put the knowledge in your router.

[click] But notice what fixed it: App — two levels above Posts — had to know that Posts was going to need that data.

Solid 2.0 starts from a different place.
-->

---
layout: two-cols-header
layoutClass: gap-8
---

# Basic Solid state

::left::

<div class="code-label" data-framework="solid">

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

```tsx {6}
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

</div>

::right::

<div>
  <Demo name="solid/Counter" />
</div>

<!--
Keep this fast (~15s). It's here so the next slide reads as "same thing, but async".

A signal is a value you can write. Like useState, except reading it is a function call, so whoever reads it is subscribed.

[click] A memo is a value derived from other values. It recomputes when count changes, and nothing else does.

[click] The UI is just another reader in that graph.

DEMO: click the button a couple of times.

[click] Hold onto that shape: signal → memo → UI.

[click] console.log(count()) — how many times does this run? Once. The component function is setup, not a render function; only the things that read count() re-run.
-->

---
layout: two-cols-header
layoutClass: gap-8
---

# Async is just a computation

::left::

<div class="code-label" data-framework="solid">

```tsx
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

</div>

::right::

<div>
  <Demo name="solid/User" :height="28" />
</div>

<!--
[1:50–2:30] — most important slide.

Same user fetch as the React slide. In Solid 2, an ordinary memo can return a Promise. There's no resource object, no query hook: `user` is a memo that just doesn't know its answer yet.

Reading user() before it's ready is fine. <Loading> decides what the user sees in the meantime. (Note: Loading, not Suspense.)

Nuance: this doesn't abolish causality. If request B truly needs A's result, it's still serial. The point is we aren't making component mount order define our data model.
-->

---
layout: two-cols-header
layoutClass: gap-8
zoom: 0.75
---

# Same tree, no waterfall

::left::

<div class="code-label" data-framework="solid">

```tsx {24-26|13|17|2}
function Posts(props) {
  const posts = createMemo(() => fetchPosts(props.id));
  return (
    <ul>
      <For each={posts()}>
        {(p) => <li>{p.title}</li>}
      </For>
    </ul>
  );
}

function User(props) {
  const user = createMemo(() => fetchUser(props.id));
  return (
    <>
      <p>{user().name}</p>
      <Posts id={props.id} />
    </>
  );
}

function App(props) {
  return (
    <Loading fallback={<p>Loading...</p>}>
      <User id={props.id} />
    </Loading>
  );
}
```

</div>

::right::

<div>
  <Demo name="solid/Posts" :height="88" />
  <Network :scale="2400" />
</div>

<div class="mt-8 opacity-70">

Reading a value that isn't ready doesn't stop the rest of the tree from being built.

</div>

<!--
OPTIONAL — cut if running long.

Same User → Posts shape as the React waterfall. Reading `user()` before it's ready doesn't halt construction of the tree below it, so Posts' memo starts its request immediately.

Careful wording: "the data sources don't need to be modeled as component-local fetch lifecycle". Not "Solid eliminates every waterfall".
-->

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

<!--
[2:30–3:00]

Now I change the thing the async value depends on. [point at setId] There is no startTransition around this.

DEMO: click Next user.
- Old user stays visible, dimmed — isPending lets me style that fact.
- "selected" jumps ahead immediately — latest(id) lets UI intentionally look ahead.
- Then the new user commits.

The old answer remains a consistent answer while the new answer is in flight.

React comparison, spoken only: "If an update in React can suspend and I want already-visible UI to stay visible, this is where I'd reach for startTransition."

DO NOT demo bare refresh(user) here — in the RC it's a quiet re-ask and isPending stays false. A pending reload needs `affects(user); refresh(user)`.
-->

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

<!--
[3:00–3:35]

Reads were the easy part. What about writes?

[click] A mutation gets an action.
[click] affects(user): we declare what authoritative data this work is going to change. It — and everything derived from it — reads as pending until the transaction settles, while the old value stays readable.
[click] Do the write.
[click] And don't finish the story until we've reconciled against the source of truth.

DEMO: "Rename (affects)" — dims until the server answers.

[click → morph] If we know what the result should look like, make it optimistic. The tentative write participates in the same transition and reconciles when fresh server state lands.

DEMO: "Rename (optimistic)" — new name shows instantly.

[click] We're not manually coordinating an optimistic cache, mutation status, query invalidation, and a transition. Those are all different views of one transaction.

"You can build this in React. My point is how many concepts have to agree."
-->

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

<!--
[3:35–4:05]

Async isn't the only thing that creeps through an application. State synchronization does the same thing.

I want a draft that's initialized from a user. The user can edit it locally. But when the upstream user changes, I want the draft to follow the new user.

The obvious code is state plus an Effect that keeps the state synchronized.

React's docs will tell you to restructure this, use a key when you're resetting the whole subtree, or otherwise avoid this Effect. That's good advice. The point is the relationship we're expressing is "derived, but locally writable."

[click] Solid 2 gives this relationship a name. The setter can locally override it. When the source recomputes, the derived value takes over again. No synchronization Effect. One edge in the graph.

Agent aside (quick): this is exactly the kind of state-sync Effect code-generating agents eagerly invent. A primitive that describes the relationship makes the right thing easier to express.

Now combine that with async.
-->

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

<!--
[4:05–4:45] — the climax. Walk slowly.

State is regular writable state.
[click] Counties are async derived state.
[click] County is derived from the counties that arrived — but still user-writable.
[click] Cities are async derived from county.
[click] City is derived-but-writable again.

DEMO: change State → county and city follow, consistently, with pending dimming. Then override county by hand → city follows.

[click] Where are the synchronization Effects? (pause) Where's the transition wrapper? (pause) Where's the loading state attached to each of these?

The dependencies are the program.

TODO: track down Ryan Carniato's StackBlitz with the real state/county/city APIs; fake data lives in demos/api.ts.
-->

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

<!--
[4:45–5:00]

React and its ecosystem can solve every problem I showed today. What I find interesting about Solid 2.0 is where the solution lives. Async values, derived state, pending transitions, and optimistic mutations all participate in the same reactive graph.

Async is going to creep into our applications. Synchronization is going to creep into our applications. Solid's bet is that the graph should understand both.

(If time:) That's the part of Solid 2.0 I think is worth stealing.
-->

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

<!--
BACKUP — only if 15+ seconds ahead.

From tld-search. Async generator source, optimistic setter, Cookie Store write, then `until` waits for the authoritative stream to reflect the write. createFavorites builds another memo (a Set) on top of it.

"My app doesn't know this value is SSR'd from a cookie, hydrated, live-updated from Cookie Store events, and optimistically writable. It reads like state."
-->
