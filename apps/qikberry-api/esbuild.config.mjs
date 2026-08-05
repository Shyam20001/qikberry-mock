
import esbuild from 'esbuild';
import pkg from './package.json' with { type: 'json' };
// import pkg from './package.json' assert { type: 'json' };  // OLD node 16

const {
  dependencies = {},
  devDependencies = {},
  peerDependencies = {} 
} = pkg;

const externals = [
  ...Object.keys(dependencies),
  ...Object.keys(devDependencies),
  ...Object.keys(peerDependencies)
];

const isDev = process.env.NODE_ENV === 'development';

const ctx = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'dist/bundle.cjs',
  platform: 'node',
  format: 'cjs',
  sourcemap: isDev,
  minify: !isDev,
  external: externals,
  target: 'es2022'
});

if (isDev) {
  console.log('[esbuild] watch mode');
  await ctx.watch();
} else {
  console.log('[esbuild] production build');
  await ctx.rebuild();
  await ctx.dispose();
}
