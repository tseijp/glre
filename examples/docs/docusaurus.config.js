// const lightCodeTheme = require('prism-react-renderer/themes/github');
// const darkCodeTheme = require('prism-react-renderer/themes/dracula');

const config = {
        title: 'glre',
        tagline: 'GLSL Reactive Engine',
        url: 'https://glre.tsei.jp/',
        baseUrl: '/',
        onBrokenLinks: 'warn',
        onBrokenMarkdownLinks: 'warn',
        favicon: 'img/favicon.ico',
        organizationName: 'tseijp',
        projectName: 'tseijp',
        i18n: {
                defaultLocale: 'ja',
                locales: ['ja'],
        },
        markdown: { mermaid: true, },
        // themes: ['@docusaurus/theme-mermaid'], // @TODO
        presets: [
                ['classic', { docs: {
                        path: 'docs/',
                        routeBasePath: 'docs',
                        editUrl: 'https://github.com/tseijp/glre/tree/main/examples/docs/docs',
                },}],
        ],
        plugins: [
                ['@docusaurus/plugin-content-docs', {
                        id: 'api',
                        path: 'api/',
                        routeBasePath: 'api',
                        editUrl: 'https://github.com/tseijp/glre/tree/main/examples/docs/api',
                }],
                ['@docusaurus/plugin-content-docs', {
                        id: 'guide',
                        path: 'guide/',
                        routeBasePath: 'guide',
                        editUrl: 'https://github.com/tseijp/glre/tree/main/examples/docs/guide',
                }],
        ],
        themeConfig: {
                metadata: [{
                        name: 'glsl',
                        content: 'cooking, blog'
                }],
                navbar: {
                        title: 'glre',
                        logo: { alt: '', src: 'img/logo.svg', },
                        items: [
                                { to: '/docs', label: 'Docs', position: 'left' },
                                { to: '/api', label: 'API', position: 'left' },
                                { to: '/guide', label: 'Guide', position: 'left' },
                                { label: 'GitHub', position: 'right', href: 'https://github.com/tseijp/glre', },
                        ],
                },
                footer: {
                        style: 'dark',
                        links: [
                                { title: 'Docs', items: [
                                        { label: 'Tutorial', to: '/docs/', },
                                ], },
                                { title: 'Community', items: [
                                        { label: 'Twitter', href: 'https://twitter.com/tseijp', },
                                ], },
                                { title: 'More', items: [
                                        { label: 'GitHub', href: 'https://github.com/tseijp/tseijp', },
                                ], },
                        ],
                        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
                },
                // prism: {
                //         theme: lightCodeTheme,
                //         darkTheme: darkCodeTheme,
                // },
        },
};

module.exports = config;