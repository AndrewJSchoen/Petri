import {
  Avatar,
  ToggleButtonGroup,
  Stack,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { Handle } from "reactflow";
import { motion } from "framer-motion";

export const MotionStack = motion(Stack);

export const MotionAvatar = motion(Avatar);

export const MotionHandle = motion(Handle);

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.default, 0.85),
  height: 30,
  borderRadius: theme.shape.borderRadius,
  backdropFilter: "blur(1pt)",
  WebkitBackdropFilter: "blur(1pt)",
  "& .MuiToggleButtonGroup-grouped": {
    margin: theme.spacing(0.5),
    border: 0,
    height: 18,
    "&.Mui-disabled": {
      border: 0,
    },
    "&:not(:first-of-type)": {
      borderRadius: theme.shape.borderRadius * 0.66,
    },
    "&:first-of-type": {
      borderRadius: theme.shape.borderRadius * 0.66,
    },
  },
}));

export const ButtonGroup = styled(Stack)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.default, 0.85),
  padding: theme.spacing(0.5),
  backdropFilter: "blur(1pt)",
  WebkitBackdropFilter: "blur(1pt)",
  // borderRadius: theme.shape.borderRadius,
  "&.Mui-disabled": {
    border: 0,
  },
  "&:not(:first-of-type)": {
    borderRadius: theme.shape.borderRadius,
  },
  "&:first-of-type": {
    borderRadius: theme.shape.borderRadius,
  },
}));

export const MotionButtonGroup = motion(ButtonGroup);
export const MotionToggleButtonGroup = motion(StyledToggleButtonGroup);