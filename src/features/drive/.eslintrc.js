module.exports = {
  extends: ["../../.eslintrc.js"],
  rules: {
    // Reglas específicas para el módulo de drive
    "no-console": ["warn", { allow: ["warn", "error"] }], // Advertencia por uso de console.log, pero permite warn y error
    "max-depth": ["warn", 4], // Advertencia por anidamiento excesivo (> 4 niveles)
    "max-lines-per-function": ["warn", 200], // Advertencia por funciones muy largas
    "prefer-const": "warn", // Preferir constantes cuando no se reasigna
    "@typescript-eslint/explicit-function-return-type": "warn", // Tipos de retorno explícitos
    "@typescript-eslint/no-explicit-any": "warn", // Evitar uso de any
    "@typescript-eslint/no-unused-vars": "warn", // Variables sin usar
  },
  overrides: [
    {
      // Excepciones para tests
      files: ["**/__tests__/**/*.ts", "**/*.test.ts"],
      rules: {
        "max-lines-per-function": "off",
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
    {
      // Excepciones para archivos de tipos
      files: ["**/types/**/*.ts", "**/types/**/*.d.ts"],
      rules: {
        "max-lines-per-function": "off",
      },
    },
  ],
};
