// tailwind.config.js
export default {
        content: ['./app/**/*.tsx'],
        theme: {
                extend: {
                        backgroundImage: {
                                'gradient-radial':
                                        'radial-gradient(var(--tw-gradient-stops))',
                                'gradient-conic':
                                        'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                        },
                },
        },
        plugins: [],
}
