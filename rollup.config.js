import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.js',
  external: ['d3'],
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named'
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm'
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'D3ChartLibrary',
      globals: {
        'd3': 'd3'
      }
    },
    {
      file: 'dist/index.min.js',
      format: 'umd',
      name: 'D3ChartLibrary',
      globals: {
        'd3': 'd3'
      },
      plugins: [terser()]
    }
  ],
  plugins: [
    resolve(),
    commonjs()
  ]
};
