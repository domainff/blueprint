# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

## Google sign-in

The login modal offers "Continue with Google" for customers whose Flock account was
created with Google (they have no Flock password). The button needs a Google OAuth
web-client ID in `.env`:

```
VITE_GOOGLE_CLIENT_ID=<client id>.apps.googleusercontent.com
```

The same client ID must be configured on the Domain API as `Google:ClientId`, and the
site origin (`https://domainff.github.io` and `http://localhost:5173` for dev) must be
listed under the client's Authorized JavaScript origins. Leave the value empty to hide
the button.

### Local end-to-end test

Create a throwaway OAuth web client in your own Google Cloud project with
`http://localhost:5173` and `http://localhost` as authorized origins. Put it in
`.env.local` (gitignored) along with a pointer at a locally running Domain API:

```
VITE_GOOGLE_CLIENT_ID=<dev client id>.apps.googleusercontent.com
VITE_DOMAIN_API_BASE=http://localhost:5003/api
```

Give the API the same dev client ID without touching tracked files:
`dotnet user-secrets set "Google:ClientId" "<dev client id>"` inside the API project.
