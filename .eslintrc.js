module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true
    },
    "parserOptions": {
        "sourceType": "module"
    },
    "extends": "eslint:recommended",
    rules: {
        "brace-style": ["warn", "1tbs"],
        'comma-dangle': ['warn', 'always-multiline'],
        'no-unused-vars': ['warn', { 'args': 'none' }]
    }
};