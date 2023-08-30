import {
  AppBar as MuiAppBar,
  Stack,
  Toolbar,
  Typography
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { SimpleInput } from "./SimpleInput";
import {
  FiMenu
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
import { PlayControls } from "./PlayControls";
import { VersionControls } from "./VersionControls";

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

export const AppBar = ({ open, onOpen }) => {
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
          <VersionControls sx={{display: {xs: "none", md: "flex", sm: "none"}}}/>

          {/* Play Controls */}
          <PlayControls sx={{display: {xs: "none", md: "flex", sm: "none"}}}/>

          {/* Export/Share Controls */}
        </Stack>
      </Toolbar>
    </StyledAppBar>
  );
};
