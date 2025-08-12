import 'dotenv/config'
import { themes } from 'prism-react-renderer'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

const editUrl = 'https://github.com/tseijp/glre/tree/main/examples/docs'
const sitemap: Preset.Options['sitemap'] = {
        lastmod: 'date',
        changefreq: 'weekly',
        filename: 'sitemap.xml',
        createSitemapItems: async (params) => {
                const { defaultCreateSitemapItems, ...rest } = params
                const items = await defaultCreateSitemapItems(rest)
                return items.filter((item) => !item.url.includes('/page/'))
        },
}

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
        presets: [['@docusaurus/preset-classic', { sitemap, docs: { path: 'docs/', routeBasePath: 'docs', editUrl } }]],
        plugins: [
                ['@docusaurus/plugin-content-docs', { id: 'api', path: 'api/', routeBasePath: 'api', editUrl }],
                ['@docusaurus/plugin-content-docs', { id: 'guide', path: 'guide/', routeBasePath: 'guide', editUrl }],
                [
                        '@docusaurus/plugin-content-docs',
                        {
                                id: 'addons',
                                path: 'addons/',
                                routeBasePath: 'addons',
                                editUrl,
                                remarkPlugins: [remarkMath],
                                rehypePlugins: [rehypeKatex],
                        },
                ],
        ],
        themeConfig: {
                navbar: {
                        title: 'glre',
                        logo: { alt: 'logo', src: 'img/favicon.ico' },
                        items: [
                                { position: 'left', to: '/docs', label: 'Docs' },
                                { position: 'left', to: '/api', label: 'API' },
                                { position: 'left', to: '/addons', label: 'Addons' },
                                { position: 'left', to: '/guide', label: 'Guide' },
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
                // https://docusaurus.io/docs/search
                algolia: {
                        appId: process.env.ALGOLIA_APP_ID,
                        apiKey: process.env.ALGOLIA_API_KEY,
                        indexName: process.env.ALGOLIA_INDEX_NAME,
                        contextualSearch: true,
                        externalUrlRegex: 'external\\.com|domain\\.com',
                        replaceSearchResultPathname: {
                                from: '/docs/', // or as RegExp: /\/docs\//
                                to: '/',
                        },
                        searchParameters: {},
                        searchPagePath: 'search',
                        insights: false,
                },
        } satisfies Preset.ThemeConfig,
        // https://docusaurus.io/docs/next/markdown-features/math-equations#configuration
        stylesheets: [
                {
                        href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
                        type: 'text/css',
                        integrity: 'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
                        crossorigin: 'anonymous',
                },
        ] satisfies Preset.ThemeConfig['stylesheets'],
}

export default config
