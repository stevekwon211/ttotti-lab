import { config } from "@workspace/eslint-config/react-internal"

export default [
  ...config,
  {
    rules: {
      "react/no-unknown-property": "off",
    },
  },
]
