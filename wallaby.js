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
      '**/*.js': wallaby.compilers.babel()
    }
  };
};
