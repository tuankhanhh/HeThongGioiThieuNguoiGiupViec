import React from "react";
import { Snackbar, Alert } from "@mui/material";

interface NotificationToastProps {
  open: boolean;
  message: string;
  severity?: "success" | "error" | "warning" | "info";
  onClose: (event?: React.SyntheticEvent | Event, reason?: string) => void;
  autoHideDuration?: number;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  open,
  message,
  severity = "success",
  onClose,
  autoHideDuration = 3000,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{ top: { xs: "80px", sm: "80px" } }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        className="relative overflow-hidden min-w-[280px] shadow-lg rounded-md"
      >
        {message}

        {/* Thanh progress bar chạy ngang ở dưới cùng */}
        <span
          className="absolute bottom-0 left-0 h-1 bg-white/70 animate-progress-run"
          style={{ animationDuration: `${autoHideDuration}ms` }}
        ></span>
      </Alert>
    </Snackbar>
  );
};

export default NotificationToast;
