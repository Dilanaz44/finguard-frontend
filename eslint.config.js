import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  prettier,
  {
    languageOptions: {
      // Bu bir tarayici (Vue/Vite) uygulamasi - fetch, localStorage, document
      // gibi tarayici API'lerini ESLint'e tanitmazsak "tanimsiz degisken"
      // hatasi veriyor.
      globals: globals.browser,
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    rules: {
      // Sayfa/route seviyesindeki bileşenler (Login, Dashboard, Profil gibi)
      // ozel HTML elementi olarak kullanilmiyor, bu yuzden tek kelimelik
      // isimler burada gercek bir risk tasimiyor.
      "vue/multi-word-component-names": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
);
