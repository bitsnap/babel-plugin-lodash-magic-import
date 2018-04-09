import babel from 'rollup-plugin-babel';

const bundleBabelRC = {
  exclude: 'node_modules/**',
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: true,
      },
      forceAllTransforms: true,
      exclude: ['transform-regenerator'],
      modules: false,
    }],
    'minify',
  ],
  plugins: [
    ['module-resolver', {
      root: ['src'],
    }],
  ],
};

export default {
  input: 'src/main.js',
  plugins: [
    babel({
      babelrc: false,
      ...bundleBabelRC,
    }),
  ],
  external: [
    'lodash',
    'lodash/fp',
    'lodash/fp/startsWith',
    'lodash/fp/get',
    'lodash/fp/overSome',
    'lodash/fp/find',
    'lodash/fp/isEqual',
    'lodash/fp/includes',
    'lodash/fp/assignIn',
    'lodash/fp/map',
    'lodash/fp/forEach',
    'lodash/fp/reduce',
    'lodash/fp/remove',
    'lodash/fp/isEmpty',
    'lodash/fp/flatMap',
    'lodash/fp/identity',
  ],
  output: [{
    file: 'dist/lodash-magic-import.min.js',
    format: 'cjs',
    sourcemap: true,
  }],
};
