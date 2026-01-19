module.exports = {
  packagerConfig: {
    asar: false,
    extraResource: [
      {
        from: 'release/java',
        to: 'resources/java',
        filter: ['**/*']
      }
    ],
    ignore: [
      'projectlibre_build/**',
      'dist/projectlibre.jar'
    ],
    files: [
      'dist-electron/**/*',
      'dist/**/*',
      'node_modules/**/*',
      'dist-electron/package.json'
    ]
  }
};