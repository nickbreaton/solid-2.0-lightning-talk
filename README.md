# Solid 2.0: Async Belongs in the Graph

A five-minute lightning talk built with [Slidev](https://sli.dev).

```sh
pnpm install
pnpm dev      # http://localhost:3030, presenter at /presenter
pnpm build
```

## Layout

- `slides.md` – the deck. Speaker notes (with timings) are in each slide's trailing comment.
- `demos/react/*.tsx` – live React 19 + TanStack Query demos.
- `demos/solid/*.tsx` – live Solid 2.0 RC demos.
- `demos/api.ts` – fake backend with latency; every request is logged for the network waterfall.
- `components/Demo.vue` – `<Demo name="solid/NextUser" />` mounts a demo while its slide is active
  (fresh on every visit; ↻ replays it).
- `components/Network.vue` – `<Network />` draws the request waterfall.

`vite.config.ts` scopes `vite-plugin-solid` to `demos/solid/` and `@vitejs/plugin-react` to `demos/react/`
so the two JSX transforms never overlap.
