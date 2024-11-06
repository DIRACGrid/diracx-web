import type { Preview } from "@storybook/react";
import React from "react";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "../src/contexts/ThemeProvider";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ width: "60vw", maxWidth: "900px" }}>
          <CssBaseline />
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],

  tags: ["autodocs"],
};

export default preview;
