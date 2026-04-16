"use client";
import React from "react";
import { Box, Stepper, Step, StepLabel, styled } from "@mui/material";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";

// Tùy chỉnh đường nối giữa các bước (Connector)
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 14,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: "#0d9488",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: "#0d9488",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 2,
    border: 0,
    backgroundColor: "#e2e8f0",
    borderRadius: 1,
  },
}));

interface RegistrationStepperProps {
  activeStep: number;
}

const steps = ["Xác thực SĐT", "Thông tin", "Giấy tờ", "Kỹ năng", "Gửi hồ sơ"];

const RegistrationStepper: React.FC<RegistrationStepperProps> = ({
  activeStep,
}) => {
  return (
    <Box sx={{ width: "100%", mb: 6 }}>
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        connector={<ColorlibConnector />}
      >
        {steps.map((label, index) => {
          const isStepActive = activeStep === index;
          const isStepCompleted = activeStep > index;

          return (
            <Step key={label}>
              <StepLabel
                sx={{
                  // Tùy chỉnh nhãn chữ (Label)
                  "& .MuiStepLabel-label": {
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    mt: 1,
                    color:
                      isStepActive || isStepCompleted
                        ? "#0d9488 !important"
                        : "#94a3b8",
                  },
                  // Tùy chỉnh vòng tròn số (Icon)
                  "& .MuiStepIcon-root": {
                    fontSize: "1.8rem",
                    color: "#e2e8f0", // Màu mặc định
                    "&.Mui-active": {
                      color: "#0d9488",
                    },
                    "&.Mui-completed": {
                      color: "#0d9488",
                    },
                  },
                  // Tùy chỉnh số bên trong vòng tròn
                  "& .MuiStepIcon-text": {
                    fill: "#fff",
                    fontWeight: "bold",
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
};

export default RegistrationStepper;
