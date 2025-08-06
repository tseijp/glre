const { themes } = require('prism-react-renderer')

const config = {
        title: 'glre',
        tagline: 'GLSL Reactive Engine',
        url: 'https://glre.tsei.jp/',
        baseUrl: '/',
        onBrokenLinks: 'warn',
        onBrokenMarkdownLinks: 'warn',
        favicon: 'img/favicon.ico',
        organizationName: 'tseijp',
        projectName: 'glre',
        i18n: {
                defaultLocale: 'en',
                locales: ['en', 'ja'],
                localeConfigs: {
                        en: { label: 'English' },
                        ja: { label: '日本語' },
                },
        },
        markdown: { mermaid: true },
        themes: ['@docusaurus/theme-mermaid', '@docusaurus/theme-live-codeblock'], // @TODO
        presets: [
                [
                        'classic',
                        {
                                docs: {
                                        path: 'docs/',
                                        routeBasePath: 'docs',
                                        editUrl: 'https://github.com/tseijp/glre/tree/main/examples/docs',
                                },
                        },
                ],
        ],
        plugins: [
                [
                        '@docusaurus/plugin-content-docs',
                        {
                                id: 'api',
                                path: 'api/',
                                routeBasePath: 'api',
                                editUrl: 'https://github.com/tseijp/glre/tree/main/examples/docs',
                        },
                ],
                [
                        '@docusaurus/plugin-content-docs',
                        {
                                id: 'guide',
                                path: 'guide/',
                                routeBasePath: 'guide',
                                editUrl: 'https://github.com/tseijp/glre/tree/main/examples/docs',
                        },
                ],
                [
                        '@docusaurus/plugin-content-docs',
                        {
                                id: 'addons',
                                path: 'addons/',
                                routeBasePath: 'addons',
                                editUrl: 'https://github.com/tseijp/glre/tree/main/examples/docs',
                        },
                ],
                // @TODO FIX primitives
                // [
                //         '@docusaurus/plugin-content-docs',
                //         {
                //                 id: 'primitives',
                //                 path: 'primitives/',
                //                 routeBasePath: 'primitives',
                //                 editUrl: 'https://github.com/tseijp/glre/tree/main/examples/docs',
                //         },
                // ],
        ],
        themeConfig: {
                colorMode: {
                        defaultMode: 'dark',
                        disableSwitch: false,
                        respectPrefersColorScheme: false,
                },
                metadata: [
                        {
                                name: 'glsl',
                                content: 'cooking, blog',
                        },
                ],
                navbar: {
                        title: 'glre',
                        logo: { alt: '', src: 'img/favicon.ico' },
                        items: [
                                {
                                        position: 'left',
                                        to: '/docs',
                                        label: 'Docs',
                                },
                                { position: 'left', to: '/api', label: 'API' },
                                { position: 'left', to: '/addons', label: 'Addons' },
                                {
                                        position: 'left',
                                        to: '/guide',
                                        label: 'Guide',
                                },
                                // @TODO FIX primitives
                                // {
                                //         position: 'left',
                                //         to: '/primitives',
                                //         label: 'Primitives',
                                // },
                                { position: 'right', type: 'localeDropdown' },
                                {
                                        position: 'right',
                                        label: 'GitHub',
                                        href: 'https://github.com/tseijp/glre',
                                },
                        ],
                },
                footer: {
                        style: 'dark',
                        links: [
                                {
                                        title: 'Docs',
                                        items: [
                                                {
                                                        label: 'Tutorial',
                                                        to: '/docs/',
                                                },
                                        ],
                                },
                                {
                                        title: 'Community',
                                        items: [
                                                {
                                                        label: 'Twitter',
                                                        href: 'https://twitter.com/tseijp',
                                                },
                                        ],
                                },
                                {
                                        title: 'More',
                                        items: [
                                                {
                                                        label: 'GitHub',
                                                        href: 'https://github.com/tseijp/tseijp',
                                                },
                                        ],
                                },
                        ],
                        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
                },
                prism: {
                        theme: themes.vsLight,
                        darkTheme: themes.vsDark,
                },
                // https://docusaurus.io/docs/api/themes/@docusaurus/theme-live-codeblock
                themeConfig: {
                        liveCodeBlock: {
                                playgroundPosition: 'right', // "top" | "bottom"
                        },
                },
        },
}

module.exports = config
