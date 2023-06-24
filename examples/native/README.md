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
