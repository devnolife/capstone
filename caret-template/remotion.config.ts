import path from "node:path";
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.overrideWebpackConfig((currentConfiguration) => {
  const withTailwind = enableTailwind(currentConfiguration);
  return {
    ...withTailwind,
    resolve: {
      ...withTailwind.resolve,
      alias: {
        ...(withTailwind.resolve?.alias ?? {}),
        // Mirror the Next.js "@/*" -> "./src/*" tsconfig path alias
        "@": path.join(process.cwd(), "src"),
      },
    },
  };
});

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
