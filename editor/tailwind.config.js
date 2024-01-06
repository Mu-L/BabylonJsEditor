module.exports = {
    content: ["./src/**/*.{html,ts,tsx,js,jsx}"],
    theme: {
        extend: {
            fontFamily: {
                'sans': ['Roboto', 'sans-serif'],
            },
        },
    },
    plugins: [
        "postcss-import"
    ],
};
