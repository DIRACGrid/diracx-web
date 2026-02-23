import { useState } from "react";
import {
  Box,
  Chip,
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
import { Close, ExpandMore, ExpandLess } from "@mui/icons-material";
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

  // Track which sections are collapsed (empty = all expanded by default)
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(
    () => new Set(),
  );

  const toggleSection = (idx: number) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
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
        <Stepper orientation="vertical" nonLinear activeStep={-1}>
          {grouped.map((group, idx) => {
            const stepColor =
              statusColors[group.status] || theme.palette.primary.main;
            const isExpanded = !collapsedSections.has(idx);

            // Per-step icon colored by its own status
            const StepIcon = ({ className }: { className?: string }) => (
              <span
                className={className}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: stepColor,
                }}
              />
            );

            return (
              <Step key={idx} expanded={isExpanded}>
                <StepLabel
                  slots={{ stepIcon: StepIcon }}
                  onClick={() => toggleSection(idx)}
                  sx={{ cursor: "pointer" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Typography fontWeight="bold" color={stepColor}>
                      {group.status}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({group.entries.length})
                    </Typography>
                    {isExpanded ? (
                      <ExpandLess
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                    ) : (
                      <ExpandMore
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                    )}
                  </Box>
                </StepLabel>
                <StepContent>
                  {group.entries.map((entry, i) => (
                    <Box key={i} sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {entry.MinorStatus}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ fontStyle: "italic" }}
                        >
                          {entry.ApplicationStatus}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(entry.StatusTime).toLocaleString("en-GB", {
                            timeZone: "UTC",
                          })}{" "}
                          UTC
                        </Typography>
                        {entry.Source && (
                          <Chip
                            label={entry.Source}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 18,
                              fontSize: "0.65rem",
                              backgroundColor: "transparent",
                              borderColor: "grey.500",
                              color: "text.secondary",
                              "&:hover": {
                                backgroundColor: "transparent",
                              },
                            }}
                          />
                        )}
                      </Box>
                    </Box>
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
