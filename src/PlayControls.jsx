import {
  Divider,
} from "@mui/material";
import {
  FiRewind,
  FiPlay,
  FiPause,
  FiPlus,
} from "react-icons/fi";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  simulatingAtom,
  markingAtom,
  initialMarkingAtom,
  addModeAtom
} from "./atom";
import { TooltippedToolbarButton } from "./ToolbarButton";
import { ButtonGroup } from "./MotionElements";

export const PlayControls = ({
    sx={
        display: { xs: "flex", sm: "none" }
    },
    ...props
}) => {
  const [simulating, setSimulating] = useAtom(simulatingAtom);
  const [addMode, onSetAddMode] = useAtom(addModeAtom);

  const initialMarking = useAtomValue(initialMarkingAtom);

  const setMarking = useSetAtom(markingAtom);

  return (
    <ButtonGroup
      direction="row"
      gap={0.5}
      sx={{
        backdropFilter: "blur(5pt)",
        WebkitBackdropFilter: "blur(5pt)",
        backgroundColor: "rgba(0,0,0,0.5)",
        ...sx
        }}
      {...props}
    >
      <TooltippedToolbarButton
        title="Restart Simulation"
        disabled={simulating}
        onClick={() => {
          setMarking(initialMarking);
        }}
      >
        <FiRewind />
      </TooltippedToolbarButton>
      <TooltippedToolbarButton
        title={simulating ? "Pause" : "Play"}
        canToggle
        toggled={simulating}
        onClick={() => {
          if (simulating) {
            setSimulating(false);
          } else {
            setSimulating(true);
          }
        }}
      >
        {simulating ? <FiPause /> : <FiPlay />}
      </TooltippedToolbarButton>
      <Divider light orientation="vertical" />
      <TooltippedToolbarButton
        title="Add Place"
        toggled={addMode}
        canToggle
        onClick={() => onSetAddMode(!addMode)}
      >
        <FiPlus />
      </TooltippedToolbarButton>
    </ButtonGroup>
  );
};
