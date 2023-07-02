# @glre/docs

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

## Dependencies

- ![glre][glre] ![glre_][glre_] glre
- ![clsx][clsx] ![clsx_][clsx_] clsx
- ![leva][leva] ![leva_][leva_] leva
- ![stats.js][stats.js] ![stats.js_][stats.js_] stats.js
- ![prism-react-renderer][prism-react-renderer] ![prism-react-renderer_][prism-react-renderer_] prism-react-renderer
- ![docusaurus][docusaurus] ![docusaurus_][docusaurus_] @docusaurus/core
- ![docusaurus-preset-classic][docusaurus-preset-classic] ![docusaurus-preset-classic_][docusaurus-preset-classic_] @docusaurus/preset-classic
- ![docusaurus-module-type-aliases][docusaurus-module-type-aliases] ![docusaurus-module-type-aliases_][docusaurus-module-type-aliases_] @docusaurus/module-type-aliases
- ![docusaurus-theme-mermaid][docusaurus-theme-mermaid] ![docusaurus-theme-mermaid_][docusaurus-theme-mermaid_] @docusaurus/theme-mermaid
- ![tsconfig-docusaurus][tsconfig-docusaurus] ![tsconfig-docusaurus_][tsconfig-docusaurus_] @tsconfig/docusaurus
- ![mdx-js-react][mdx-js-react] ![mdx-js-react_][mdx-js-react_] @mdx-js/react
- ![react][react] ![react_][react_] react
- ![react-dom][react-dom] ![react-dom_][react-dom_] react-dom
- ![typescript][typescript] ![typescript_][typescript_] typescript

[glre]: https://img.shields.io/npm/v/glre?style=flat&colorA=000&colorB=000
[glre_]: https://img.shields.io/badge/using_0.13.1-black?style=flat
[clsx]: https://img.shields.io/npm/v/clsx?style=flat&colorA=000&colorB=000
[clsx_]: https://img.shields.io/badge/using_1.2.1-black?style=flat
[leva]: https://img.shields.io/npm/v/leva?style=flat&colorA=000&colorB=000
[leva_]: https://img.shields.io/badge/using_0.9.34-black?style=flat
[stats.js]: https://img.shields.io/npm/v/stats.js?style=flat&colorA=000&colorB=000
[stats.js_]: https://img.shields.io/badge/using_0.17.0-black?style=flat
[prism-react-renderer]: https://img.shields.io/npm/v/prism-react-renderer?style=flat&colorA=000&colorB=000
[prism-react-renderer_]: https://img.shields.io/badge/using_2.0.5-black?style=flat
[docusaurus]: https://img.shields.io/npm/v/@docusaurus/core?style=flat&colorA=000&colorB=000
[docusaurus_]: https://img.shields.io/badge/using_3.0.0--alpha.0-black?style=flat
[docusaurus-preset-classic]: https://img.shields.io/npm/v/@docusaurus/preset-classic?style=flat&colorA=000&colorB=000
[docusaurus-preset-classic_]: https://img.shields.io/badge/using_3.0.0--alpha.0-black?style=flat
[docusaurus-module-type-aliases]: https://img.shields.io/npm/v/@docusaurus/module-type-aliases?style=flat&colorA=000&colorB=000
[docusaurus-module-type-aliases_]: https://img.shields.io/badge/using_3.0.0--alpha.0-black?style=flat
[docusaurus-theme-mermaid]: https://img.shields.io/npm/v/@docusaurus/theme-mermaid?style=flat&colorA=000&colorB=000
[docusaurus-theme-mermaid_]: https://img.shields.io/badge/using_3.0.0--alpha.0-black?style=flat
[tsconfig-docusaurus]: https://img.shields.io/npm/v/@tsconfig/docusaurus?style=flat&colorA=000&colorB=000
[tsconfig-docusaurus_]: https://img.shields.io/badge/using_1.0.7-black?style=flat
[mdx-js-react]: https://img.shields.io/npm/v/@mdx-js/react?style=flat&colorA=000&colorB=000
[mdx-js-react_]: https://img.shields.io/badge/using_2.3.0-black?style=flat
[react]: https://img.shields.io/npm/v/react?style=flat&colorA=000&colorB=000
[react_]: https://img.shields.io/badge/using_18.2.0-black?style=flat
[react-dom]: https://img.shields.io/npm/v/react-dom?style=flat&colorA=000&colorB=000
[react-dom_]: https://img.shields.io/badge/using_18.2.0-black?style=flat
[typescript]: https://img.shields.io/npm/v/typescript?style=flat&colorA=000&colorB=000
[typescript_]: https://img.shields.io/badge/using_5.1.6-black?style=flat

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
