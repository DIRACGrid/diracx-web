import * as fs from "node:fs/promises";
import * as path from "path";
import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: [
      "src/components/*/!(index).ts?(x)",
      "src/hooks/!(index).ts?(x)",
      "src/contexts/!(index).ts?(x)",
      "src/types/!(index).ts?(x)",
    ],
    format: ["esm", "cjs"],
    experimentalDts: true, // Seems to work fine, lower memory usage and faster than dts
    target: "es5",
    bundle: true,
    async onSuccess() {
      // recursively go through each js file in dist and add "use client" to the top
      const distDir = path.join(__dirname, "dist");
      const files = await fs.readdir(distDir);

      async function processFilesRecursively(dir: string): Promise<any[]> {
        // Read dirents of the current folder
        const dirents = await fs.readdir(dir, { withFileTypes: true });
        const promises = dirents.map(async (dirent) => {
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
        return Promise.all(promises.flat());
      }
      await processFilesRecursively(distDir);
    },
  },
  {
    entry: [
      "src/components/index.ts",
      "src/components/*/index.ts",
      "src/hooks/index.ts",
      "src/contexts/index.ts",
      "src/types/index.ts",
    ],
    format: ["esm", "cjs"],
    experimentalDts: true, // Seems to work fine, lower memory usage and faster than dts
    clean: true,
    target: "es5",
    bundle: false,
  },
]);
