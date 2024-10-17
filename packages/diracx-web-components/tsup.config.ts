import * as fs from "node:fs/promises";
import * as path from "path";
import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: [
      "components/!(index|*.stories).ts?(x)",
      "components/*/!(index|*.stories).ts?(x)",
      "hooks/!(index|*.stories).ts?(x)",
      "contexts/!(index|*.stories).ts?(x)",
      "types/!(index|*.stories).ts?(x)",
    ],
    format: ["esm"],
    experimentalDts: true, // Seems to work fine, lower memory usage and faster than dts
    target: "es6",
    bundle: true,
    sourcemap: true,
    async onSuccess() {
      // recursively go through each js file in dist and add "use client" to the top
      const distDir = path.join(__dirname, "dist");

      async function processFilesRecursively(dir: string): Promise<void> {
        // Read dirents of the current folder
        const dirents = await fs.readdir(dir, { withFileTypes: true });
        dirents.map(async (dirent) => {
          const filePath = dirent.path + "/" + dirent.name;
          if (dirent.isDirectory()) return processFilesRecursively(filePath);

          if (
            dirent.name.endsWith(".js") &&
            !dirent.name.endsWith("index.js")
          ) {
            const fileContents = await fs.readFile(filePath, "utf8");
            const newFileContents = `'use client'\n${fileContents
              .replaceAll('"use client"', "")
              .replaceAll("'use client'", "")}`;
            await fs.writeFile(filePath, newFileContents);
          }
        });
      }
      await processFilesRecursively(distDir);
    },
  },
  {
    entry: [
      "components/index.ts",
      "components/*/index.ts",
      "hooks/index.ts",
      "contexts/index.ts",
      "types/index.ts",
    ],
    format: ["esm"],
    experimentalDts: true, // Seems to work fine, lower memory usage and faster than dts
    target: "es6",
    bundle: false,
    sourcemap: true,
  },
]);
