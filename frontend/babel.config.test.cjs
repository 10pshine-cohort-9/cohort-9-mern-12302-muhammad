// Used only by Jest (see jest.config.cjs). Vite's own build/dev pipeline
// does not read this file, so it's safe to force CommonJS output here
// without affecting the real ESM bundle.
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: ['babel-plugin-transform-vite-meta-env'],
};
