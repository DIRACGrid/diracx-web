import { Box, Alert, AlertTitle, Button } from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";

/**
 * This component is used to display an error message
 *
 * @param s The error message (optional)
 * @param reset The function to call to reset the error (optional)
 * @returns Error component
 */
export function ErrorBox({ msg, reset }: { msg?: string; reset?: () => void }) {
  return (
    <Box
      sx={{
        display: "flex",
        height: 1,
        width: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Alert
        severity="error"
        action={
          reset && (
            <Button sx={{ color: "black" }} onClick={reset}>
              <ReplayIcon />
            </Button>
          )
        }
      >
        <AlertTitle>Error</AlertTitle>
        {msg ? msg : "Something went wrong"}
      </Alert>
    </Box>
  );
}
