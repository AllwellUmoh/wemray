import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  {
    ignores: [
      '.next/**',
      '.npm-cache/**',
      '.tmp/**',
      'node_modules/**',
      'dist/**',
      'next-env.d.ts',
    ],
  },
];

export default config;
