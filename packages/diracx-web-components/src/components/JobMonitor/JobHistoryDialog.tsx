import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  useTheme,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { JobHistory } from "../../types/JobHistory";

interface JobHistoryDialogProps {
  /** Whether the dialog is open or not */
  open: boolean;
  /** Function to close the dialog */
  onClose: () => void;
  /** Job history data */
  historyData: JobHistory[];
  /** Job ID */
  jobId: number;
  /** Status colors */
  statusColors: Record<string, string>;
}

// Helper to group consecutive entries by Status
function groupByConsecutiveStatus(history: JobHistory[]) {
  const groups: { status: string; entries: JobHistory[] }[] = [];
  let lastStatus: string | null = null;
  let currentGroup: JobHistory[] = [];
  for (const entry of history) {
    if (entry.Status !== lastStatus) {
      if (currentGroup.length > 0) {
        groups.push({ status: lastStatus!, entries: currentGroup });
      }
      lastStatus = entry.Status;
      currentGroup = [entry];
    } else {
      currentGroup.push(entry);
    }
  }
  if (currentGroup.length > 0) {
    groups.push({ status: lastStatus!, entries: currentGroup });
  }
  return groups;
}

export function JobHistoryDialog({
  open,
  onClose,
  historyData,
  jobId,
  statusColors,
}: JobHistoryDialogProps) {
  const theme = useTheme();

  // Reverse the history so the most recent is first
  const reversedHistory = [...historyData].reverse();

  // Group consecutive entries by Status
  const grouped = groupByConsecutiveStatus(reversedHistory);

  // Custom StepIcon for color logic
  const CustomStepIcon = (props: {
    active?: boolean;
    completed?: boolean;
    className?: string;
  }) => {
    const { active, completed, className } = props;
    let color = theme.palette.grey[400];
    if (active) {
      color = statusColors[grouped[0].status] || theme.palette.primary.main;
    } else if (completed) {
      color = theme.palette.grey[400];
    }
    return (
      <span
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: color,
        }}
      />
    );
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="job-history-title">
      <DialogTitle id="job-history-title">Job History: {jobId}</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
        }}
      >
        <Close />
      </IconButton>
      <DialogContent sx={{ padding: 2 }}>
        <Stepper orientation="vertical" nonLinear activeStep={0}>
          {grouped.map((group, idx) => {
            const isActive = idx === 0;

            let labelColor: string = theme.palette.grey[400];
            if (isActive) {
              labelColor =
                statusColors[group.status] || theme.palette.primary.main;
            }

            return (
              <Step key={idx} expanded completed={!isActive}>
                <StepLabel slots={{ stepIcon: CustomStepIcon }}>
                  <Typography fontWeight="bold" color={labelColor}>
                    {group.status}
                  </Typography>
                </StepLabel>
                <StepContent>
                  {group.entries.map((entry, i) => (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {entry.MinorStatus}
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                        {entry.ApplicationStatus}
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 1 }}
                      >
                        {new Date(entry.StatusTime).toLocaleString("en-GB", {
                          timeZone: "UTC",
                        })}{" "}
                        UTC
                        <br />
                        {entry.Source}
                      </Typography>
                    </div>
                  ))}
                </StepContent>
              </Step>
            );
          })}
        </Stepper>
      </DialogContent>
    </Dialog>
  );
}
