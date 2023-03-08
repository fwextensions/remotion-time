import { resolve } from "node:path";
import { defineConfig } from "vite";

const libName = "remotion-time";

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "lib/main.js"),
			name: libName,
			fileName: libName
//			fileName: (format) => `${libName}.${format}.js`
		},
		rollupOptions: {
			external: [
				"remotion",
				"react"
			],
			output: {
				globals: {
					remotion: "remotion",
					react: "react"
				}
			}
		}
	},
});
