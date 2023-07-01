import {
    Avatar,
    InputAdornment,
    TextField,
    ToggleButtonGroup,
    ToggleButton,
    Stack,
    Tooltip,
  } from "@mui/material";
  import { styled, alpha } from "@mui/material/styles";
  import React, { memo, useMemo, useState } from "react";
  import { Handle, Position, NodeToolbar, useNodeId, useStore } from "reactflow";
  import { useAtom, useAtomValue, useSetAtom } from "jotai";
  import { focusAtom } from "jotai-optics";
  import {
    markingAtom,
    initialMarkingAtom,
    placesAtom,
    selectedNodeAtom,
    transitionsAtom,
    simulatingAtom,
    startColorAtom,
    endColorAtom,
    snapshotAtom,
  } from "./atom";
  import { BsPinAngle, BsPinAngleFill } from "react-icons/bs";
  import { IoInfinite, IoExitOutline } from "react-icons/io5";
  import { FiMinus, FiPlus, FiTrash2, FiHash } from "react-icons/fi";
  import { mapValues } from "lodash";
  import { motion } from "framer-motion";
  import { SimpleInput } from "./SimpleInput";
  import { ToolbarButton } from "./ToolbarButton";

  export const MotionStack = motion(Stack);

  export const MotionAvatar = motion(Avatar);

  export const MotionHandle = motion(Handle);

  const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    backgroundColor: alpha(theme.palette.background.default, 0.85),
    height: 30,
    "& .MuiToggleButtonGroup-grouped": {
      margin: theme.spacing(0.5),
      border: 0,
      height: 18,
      "&.Mui-disabled": {
        border: 0,
      },
      "&:not(:first-of-type)": {
        borderRadius: theme.shape.borderRadius,
      },
      "&:first-of-type": {
        borderRadius: theme.shape.borderRadius,
      },
    },
  }));
  
  const ButtonGroup = styled(Stack)(({ theme }) => ({
    backgroundColor: alpha(theme.palette.background.default, 0.85),
    height: 34,
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
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