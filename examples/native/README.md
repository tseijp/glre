# @glre/native

This website is built using [Expo](https://docs.expo.dev/), a modern static website generator.

### Installation

```
$ yarn
```

**android install**

install [JDK][JDK] and [Android Studio]

[JDK]: https://www.oracle.com/jp/java/technologies/downloads/
[android]: https://developer.android.com/studio

### Dependencies

- ![expo][expo] ![expo_][expo_] expo
- ![expo-gl][expo-gl] ![expo-gl_][expo-gl_] expo-gl
- ![expo-webpack-config][expo-webpack-config] ![expo-webpack-config_][expo-webpack-config_] @expo/webpack-config
- ![glre][glre] ![glre_][glre_] glre
- ![react][react] ![react_][react_] react
- ![react-dom][react-dom] ![react-dom_][react-dom_] react-dom
- ![react-native][react-native] ![react-native_][react-native_] react-native
- ![react-native-web][react-native-web] ![react-native-web_][react-native-web_] react-native-web
- ![typescript][typescript] ![typescript_][typescript_] typescript

[expo]: https://img.shields.io/npm/v/expo?style=flat&colorA=000&colorB=000
[expo_]: https://img.shields.io/badge/using_49.0.0-beta.3-black?style=flat
[expo-gl]: https://img.shields.io/npm/v/expo-gl?style=flat&colorA=000&colorB=000
[expo-gl_]: https://img.shields.io/badge/using_13.0.0-black?style=flat
[expo-webpack-config]: https://img.shields.io/npm/v/@expo/webpack-config?style=flat&colorA=000&colorB=000
[expo-webpack-config_]: https://img.shields.io/badge/using_18.1.0-black?style=flat
[glre]: https://img.shields.io/npm/v/glre?style=flat&colorA=000&colorB=000
[glre_]: https://img.shields.io/badge/using_0.13.1-black?style=flat
[react]: https://img.shields.io/npm/v/react?style=flat&colorA=000&colorB=000
[react_]: https://img.shields.io/badge/using_18.2.0-black?style=flat
[react-dom]: https://img.shields.io/npm/v/react-dom?style=flat&colorA=000&colorB=000
[react-dom_]: https://img.shields.io/badge/using_18.2.0-black?style=flat
[react-native]: https://img.shields.io/npm/v/react-native?style=flat&colorA=000&colorB=000
[react-native_]: https://img.shields.io/badge/using_0.72.0-black?style=flat
[react-native-web]: https://img.shields.io/npm/v/react-native-web?style=flat&colorA=000&colorB=000
[react-native-web_]: https://img.shields.io/badge/using_0.19.6-black?style=flat
[typescript]: https://img.shields.io/npm/v/typescript?style=flat&colorA=000&colorB=000
[typescript_]: https://img.shields.io/badge/using_5.1.6-black?style=flat

### Local Development

```ruby
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```ruby
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```ruby
$ USE_SSH=true yarn deploy
```

Not using SSH:

```ruby
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
