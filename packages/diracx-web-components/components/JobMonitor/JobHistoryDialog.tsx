import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { JobHistory } from "@/types/JobHistory";

interface JobHistoryDialogProps {
  /** Whether the Dialog is open */
  open: boolean;
  /** The function to close the dialog */
  onClose: () => void;
  /**
   * The data for the job history dialog
   */
  historyData: JobHistory[];
}

/**
 * Renders a dialog component that displays the job history.
 *
 * @returns The rendered JobHistoryDialog component.
 */
export function JobHistoryDialog(props: JobHistoryDialogProps) {
  const { open, onClose, historyData } = props;
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="job-history-title">
      <DialogTitle id="job-history-title">Job History</DialogTitle>

      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>
      <DialogContent sx={{ padding: 0 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Minor Status</TableCell>
              <TableCell>Application Status</TableCell>
              <TableCell>Status Time</TableCell>
              <TableCell>Source</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {historyData.map((history, index) => (
              <TableRow key={index}>
                <TableCell>{history.Status}</TableCell>
                <TableCell>{history.MinorStatus}</TableCell>
                <TableCell>{history.ApplicationStatus}</TableCell>
                <TableCell>{history.StatusTime}</TableCell>
                <TableCell>{history.Source}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
