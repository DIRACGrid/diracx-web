import {
  LocalizationProvider,
  DateTimePicker,
  DateTimePickerProps,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import React, { KeyboardEvent, useState } from "react";
import "dayjs/locale/en-gb"; // Import the locale for dayjs
import { TextField, TextFieldProps } from "@mui/material";

/**
 * Display format of the date-time picker input (en-gb locale, 24h clock with
 * seconds). Passed explicitly to the picker so that consumers (e.g.
 * SearchField caret handling) can rely on its exact length.
 */
export const DATE_TIME_PICKER_FORMAT = "DD/MM/YYYY HH:mm:ss";

interface CustomDateTimePickerProps extends Omit<
  DateTimePickerProps,
  "value" | "onChange"
> {
  value: string | null;
  onDateAccepted: (value: string | null) => void;
  handleArrowKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handleBackspaceKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: React.Ref<HTMLInputElement>;
}

/**
 *
 * @param value - The current value of the date-time picker.
 * @param onDateAccepted - Callback function to handle when the date is accepted.
 * @param handleArrowKeyDown - Callback function to handle arrow key down events.
 * @param handleBackspaceKeyDown - Callback function to handle backspace key down events.
 * @param inputRef - Ref to the input element for direct manipulation.
 * @returns
 */
export function MyDateTimePicker({
  value,
  onDateAccepted,
  handleArrowKeyDown,
  handleBackspaceKeyDown,
  inputRef,
  ...props
}: CustomDateTimePickerProps) {
  const [dateValue, setDateValue] = useState<Dayjs | null>(
    value ? dayjs(value) : dayjs(),
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (dateValue?.isValid()) onDateAccepted(dateValue.toISOString());
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      if (handleArrowKeyDown) {
        handleArrowKeyDown(event);
      }
    }
    if (event.key === "Backspace") {
      if (
        handleBackspaceKeyDown &&
        inputRef &&
        typeof inputRef !== "function" &&
        inputRef.current?.selectionStart === 0
      ) {
        handleBackspaceKeyDown(event);
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={"en-gb"}>
      {/* Non-interactive wrapper: the click handler only stops propagation
          so clicks inside the picker don't refocus the search input. */}
      <div role="presentation" onClick={(e) => e.stopPropagation()}>
        <DateTimePicker
          enableAccessibleFieldDOMStructure={false}
          value={dateValue}
          onChange={(val) => setDateValue(val)}
          format={DATE_TIME_PICKER_FORMAT}
          views={["year", "month", "day", "hours", "minutes", "seconds"]}
          onAccept={(val, _ctx) =>
            onDateAccepted(val ? val.toISOString() : null)
          }
          slots={{
            textField: ForwardedTextField, // Use the forwarded ref TextField
          }}
          slotProps={{
            textField: {
              onKeyDown: handleKeyDown,
              inputRef: inputRef, // Pass the ref to the TextField
            },
          }}
          sx={{
            // Create a red border if the date is invalid
            "& .MuiInput-underline:before": {
              borderBottom: dateValue?.isValid() ? "none" : "1px solid red",
            },
            "& .MuiInput-underline:after": {
              borderBottom: dateValue?.isValid() ? "none" : "1px solid red",
            },
          }}
          {...props}
        />
      </div>
    </LocalizationProvider>
  );
}

/**
 *  ForwardedTextField is a wrapper around the MUI TextField component
 *  that allows it to be used with the DateTimePicker component.
 *  It forwards the ref to the input element and applies custom styles.
 */
function ForwardedTextField({
  ref,
  ...props
}: TextFieldProps & { ref?: React.Ref<HTMLElement> }) {
  return <TextField {...props} inputRef={ref} variant="standard" />;
}
