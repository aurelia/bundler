module.exports = function (wallaby) {
  return {
    files: [
      'lib/**/*.js'
    ],

    tests: [
      'test/**/*.js'
    ],
    env: {
      type: 'node'
    },
    testFramework: 'mocha',
    compilers: {
      '**/*.js': wallaby.compilers.babel({
        stage: 2,
        optional: [
          'es7.decorators',
          'es7.classProperties',
          'runtime'
        ]
      })
    }
  };
};
