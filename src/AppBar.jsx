import {
  AppBar as MuiAppBar,
  Stack,
  Toolbar,
  Typography,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { SimpleInput } from "./SimpleInput";
import {
  FiMenu,
  FiRewind,
  FiRotateCcw,
  FiRotateCw,
  FiPlay,
  FiPause,
  FiPlus,
} from "react-icons/fi";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  nameAtom,
  canUndoAtom,
  canRedoAtom,
  undoAtom,
  redoAtom,
  simulatingAtom,
  markingAtom,
  initialMarkingAtom,
} from "./atom";
import { TooltippedToolbarButton } from "./ToolbarButton";
import { ButtonGroup } from "./MotionElements";

const drawerWidth = 240;

const StyledAppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  backdropFilter: "blur(5pt)",
  WebkitBackdropFilter: "blur(5pt)",
  backgroundColor: "rgba(0,0,0,0.25)",
  boxShadow: "none",
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export const AppBar = ({ open, onOpen, addMode, onSetAddMode }) => {
  const [name, setName] = useAtom(nameAtom);
  const [simulating, setSimulating] = useAtom(simulatingAtom);

  const canUndo = useAtomValue(canUndoAtom);
  const canRedo = useAtomValue(canRedoAtom);
  const initialMarking = useAtomValue(initialMarkingAtom);

  const undo = useSetAtom(undoAtom);
  const redo = useSetAtom(redoAtom);
  const setMarking = useSetAtom(markingAtom);

  return (
    <StyledAppBar position="fixed" open={open}>
      <Toolbar>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          style={{ width: "100%" }}
        >
          {/* Collapse, Petri Title, Name */}
          <Stack direction="row" gap={2} alignItems="center">
            <TooltippedToolbarButton
              title="Open Drawer"
              onClick={onOpen}
              sx={{
                fontSize: "1.5rem",
                mr: 2,
                ...(open && { display: "none" }),
              }}
            >
              <FiMenu />
            </TooltippedToolbarButton>
            <Typography variant="h6" noWrap component="div">
              Petri
            </Typography>
            <SimpleInput
              style={{
                height: "2rem",
                width: 200,
                backdropFilter: "blur(5pt)",
                WebkitBackdropFilter: "blur(5pt)",
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Stack>

          {/* Undo/Redo */}
          <ButtonGroup
            direction="row"
            gap={0.5}
            sx={{
              backdropFilter: "blur(5pt)",
              WebkitBackdropFilter: "blur(5pt)",
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <TooltippedToolbarButton
              title="Undo"
              disabled={!canUndo}
              onClick={undo}
            >
              <FiRotateCcw />
            </TooltippedToolbarButton>
            <TooltippedToolbarButton
              title="Redo"
              disabled={!canRedo}
              onClick={redo}
            >
              <FiRotateCw />
            </TooltippedToolbarButton>
          </ButtonGroup>

          {/* Play Controls */}
          <ButtonGroup direction="row" gap={0.5}>
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

          {/* Export/Share Controls */}
        </Stack>
      </Toolbar>
    </StyledAppBar>
  );
};
