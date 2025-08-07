import { themes } from 'prism-react-renderer'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

const config: Config = {
        title: 'glre',
        tagline: 'GLSL Reactive Engine',
        url: 'https://glre.tsei.jp/',
        baseUrl: '/',
        onBrokenLinks: 'warn',
        onBrokenMarkdownLinks: 'warn',
        favicon: 'img/favicon.ico',
        organizationName: 'tseijp',
        projectName: 'glre',
        future: { v4: true },
        i18n: {
                defaultLocale: 'en',
                locales: ['en', 'ja'],
                localeConfigs: { en: { label: 'English' }, ja: { label: '日本語' } },
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
                                remarkPlugins: [remarkMath],
                                rehypePlugins: [rehypeKatex],
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
                navbar: {
                        title: 'glre',
                        logo: { alt: ' ', src: 'img/favicon.ico' },
                        items: [
                                { position: 'left', to: '/docs', label: 'Docs' },
                                { position: 'left', to: '/api', label: 'API' },
                                { position: 'left', to: '/addons', label: 'Addons' },
                                { position: 'left', to: '/guide', label: 'Guide' },
                                // @TODO FIX primitives
                                // { position: 'left', to: '/primitives', label: 'Primitives' },
                                { position: 'right', type: 'localeDropdown' },
                                { position: 'right', label: 'GitHub', href: 'https://github.com/tseijp/glre' },
                        ],
                },
                footer: {
                        style: 'dark',
                        links: [
                                { title: 'Docs', items: [{ label: 'Tutorial', to: '/docs/' }] },
                                {
                                        title: 'Community',
                                        items: [{ label: 'Twitter', href: 'https://twitter.com/tseijp' }],
                                },
                                {
                                        title: 'More',
                                        items: [{ label: 'GitHub', href: 'https://github.com/tseijp/tseijp' }],
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
        } satisfies Preset.ThemeConfig,
}

export default config
