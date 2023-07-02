# Qwik City App ⚡️

- [Qwik Docs](https://qwik.builder.io/)
- [Discord](https://qwik.builder.io/chat)
- [Qwik GitHub](https://github.com/BuilderIO/qwik)
- [@QwikDev](https://twitter.com/QwikDev)
- [Vite](https://vitejs.dev/)

---

## Dependencies

- ![glre][glre] ![glre_][glre_] glre
- ![qwik][qwik] ![qwik_][qwik_] qwik
- ![qwik-city][qwik-city] ![qwik-city_][qwik-city_] qwik-city
- ![typescript][typescript] ![typescript_][typescript_] typescript
- ![undici][undici] ![undici_][undici_] undici
- ![vite][vite] ![vite_][vite_] vite
- ![vite-tsconfig-paths][vite-tsconfig-paths] ![vite-tsconfig-paths_][vite-tsconfig-paths_] vite-tsconfig-paths

[glre]: https://img.shields.io/npm/v/glre?style=flat&colorA=000&colorB=000
[glre_]: https://img.shields.io/badge/using_0.13.1-black?style=flat
[qwik]: https://img.shields.io/npm/v/qwik?style=flat&colorA=000&colorB=000
[qwik_]: https://img.shields.io/badge/using_1.1.5-black?style=flat
[qwik-city]: https://img.shields.io/npm/v/qwik-city?style=flat&colorA=000&colorB=000
[qwik-city_]: https://img.shields.io/badge/using_1.1.5-black?style=flat
[typescript]: https://img.shields.io/npm/v/typescript?style=flat&colorA=000&colorB=000
[typescript_]: https://img.shields.io/badge/using_5.1.6-black?style=flat
[undici]: https://img.shields.io/npm/v/undici?style=flat&colorA=000&colorB=000
[undici_]: https://img.shields.io/badge/using_5.22.1-black?style=flat
[vite]: https://img.shields.io/npm/v/vite?style=flat&colorA=000&colorB=000
[vite_]: https://img.shields.io/badge/using_4.3.9-black?style=flat
[vite-tsconfig-paths]: https://img.shields.io/npm/v/vite-tsconfig-paths?style=flat&colorA=000&colorB=000
[vite-tsconfig-paths_]: https://img.shields.io/badge/using_4.2.0-black?style=flat

## Local Development

```shell
npm start # or `yarn start`
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```shell
npm run build # or `yarn build`
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```shell
USE_SSH=true npm run deploy # or `yarn deploy

<!--
                "glre": "*",
                "@builder.io/qwik": "^1.1.5",
                "@builder.io/qwik-city": "^1.1.5",
                "typescript": "5.0.4",
                "undici": "5.22.1",
                "vite": "4.3.9",
                "vite-tsconfig-paths": "4.2.0" -->

## Project Structure

This project is using Qwik with [QwikCity](https://qwik.builder.io/qwikcity/overview/). QwikCity is just an extra set of tools on top of Qwik to make it easier to build a full site, including directory-based routing, layouts, and more.

Inside your project, you'll see the following directory structure:

```

├── public/
│ └── ...
└── src/
├── components/
│ └── ...
└── routes/
└── ...

````

- `src/routes`: Provides the directory based routing, which can include a hierarchy of `layout.tsx` layout files, and an `index.tsx` file as the page. Additionally, `index.ts` files are endpoints. Please see the [routing docs](https://qwik.builder.io/qwikcity/routing/overview/) for more info.

- `src/components`: Recommended directory for components.

- `public`: Any static assets, like images, can be placed in the public directory. Please see the [Vite public directory](https://vitejs.dev/guide/assets.html#the-public-directory) for more info.

## Add Integrations and deployment

Use the `npm run qwik add` command to add additional integrations. Some examples of integrations include: Cloudflare, Netlify or Express server, and the [Static Site Generator (SSG)](https://qwik.builder.io/qwikcity/guides/static-site-generation/).

```shell
npm run qwik add # or `yarn qwik add`
````

## Development

Development mode uses [Vite's development server](https://vitejs.dev/). During development, the `dev` command will server-side render (SSR) the output.

```shell
npm start # or `yarn start`
```

> Note: during dev mode, Vite may request a significant number of `.js` files. This does not represent a Qwik production build.

## Preview

The preview command will create a production build of the client modules, a production build of `src/entry.preview.tsx`, and run a local server. The preview server is only for convenience to locally preview a production build, and it should not be used as a production server.

```shell
npm run preview # or `yarn preview`
```

## Production

The production build will generate client and server modules by running both client and server build commands. Additionally, the build command will use Typescript to run a type check on the source code.

```shell
npm run build # or `yarn build`
```
