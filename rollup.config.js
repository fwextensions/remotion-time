import esbuild from "rollup-plugin-esbuild";
import dts from "rollup-plugin-dts";
import pkg from "./package.json" assert { type: "json" };
import del from "rollup-plugin-delete";

const name = `./dist/${pkg.name}`;
const defaults = {
	input: "src/index.ts",
	external: [
		"react",
		"remotion"
	]
};

export default [
	{
		...defaults,
		output: [
			{
				file: `${name}.cjs`,
				format: "cjs",
				sourcemap: true,
			},
			{
				file: `${name}.js`,
				format: "es",
				sourcemap: true,
			},
		],
		plugins: [
			del({ targets: "dist/*" }),
			esbuild({ minify: false }),
		],
	},
	{
		...defaults,
		output: {
			file: `${name}.d.ts`,
			format: "es",
		},
		plugins: [
			dts()
		],
	}
];
