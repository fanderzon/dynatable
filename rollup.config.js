import buble from 'rollup-plugin-buble';

export default {
  entry: 'src/index.js',
  external: [],
  moduleName: 'human-date-range',
  plugins: [
    buble()
  ],
  format: 'cjs',
  dest: 'dist/index.js'
};
