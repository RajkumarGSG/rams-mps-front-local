module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        corejs: {
          version: 3,
          proposals: true
        }
      }
    ]
  ],
  plugins: [
    'syntax-dynamic-import',
    '@babel/transform-runtime',
    '@babel/transform-async-to-generator'
  ]
}
