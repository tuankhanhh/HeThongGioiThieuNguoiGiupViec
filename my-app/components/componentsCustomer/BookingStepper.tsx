"use client";

import React from "react";
import { Stepper, Step, StepLabel, Box } from "@mui/material";

const STEPS = ["DỊCH VỤ", "THỜI GIAN", "ĐỊA CHỈ", "THANH TOÁN", "HOÀN THÀNH"];

interface BookingStepperProps {
  activeStep: number;
}

const BookingStepper = ({ activeStep }: BookingStepperProps) => {
  return (
    <Box className="w-full max-w-2xl mx-auto mb-8">
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{
          // 1. Thu nhỏ vòng tròn số (từ 2rem xuống 1.5rem hoặc 1.25rem)
          "& .MuiStepIcon-root": {
            color: "#e1ece8",
            fontSize: "1.5rem", // Kích thước vòng tròn nhỏ hơn
          },
          "& .MuiStepIcon-root.Mui-completed": { color: "#0d7660" },
          "& .MuiStepIcon-root.Mui-active": { color: "#0d7660" },

          // 2. Thu nhỏ font chữ số bên trong vòng tròn
          "& .MuiStepIcon-text": {
            fill: "#fff",
            fontWeight: "bold",
            fontSize: "0.85rem", // Số bên trong nhỏ lại cho cân đối
          },

          // 3. Tinh chỉnh Label (chữ bên dưới)
          "& .MuiStepLabel-label": {
            fontSize: "0.65rem", // Chữ nhỏ lại một chút
            mt: 0.5, // Giảm khoảng cách giữa vòng tròn và chữ
            color: "#9ca3af",
            fontWeight: 600,
            letterSpacing: "0.025em",
          },
          "& .MuiStepLabel-label.Mui-completed": { color: "#0d7660" },
          "& .MuiStepLabel-label.Mui-active": {
            color: "#0d7660",
            fontWeight: "bold",
          },

          // 4. Điều chỉnh đường kẻ nối (Connector)
          "& .MuiStepConnector-line": {
            borderColor: "#e1ece8",
            borderWidth: 2,
          },
          // Căn chỉnh vị trí đường kẻ cho khớp với vòng tròn nhỏ
          "& .MuiStepConnector-root": {
            top: 12, // Dịch chuyển đường kẻ lên trên một chút vì vòng tròn đã nhỏ lại
            left: "calc(-50% + 12px)",
            right: "calc(50% + 12px)",
          },
          "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line": {
            borderColor: "#0d7660",
          },
          "& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": {
            borderColor: "#0d7660",
          },
        }}
      >
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default BookingStepper;
