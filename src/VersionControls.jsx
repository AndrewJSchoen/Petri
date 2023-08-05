import { FiRotateCcw, FiRotateCw } from "react-icons/fi";
import { useAtomValue, useSetAtom } from "jotai";
import { canUndoAtom, canRedoAtom, undoAtom, redoAtom } from "./atom";
import { TooltippedToolbarButton } from "./ToolbarButton";
import { ButtonGroup } from "./MotionElements";

export const VersionControls = ({
  sx = {
    display: { xs: "flex", sm: "none" },
  },
  ...props
}) => {
  const canUndo = useAtomValue(canUndoAtom);
  const canRedo = useAtomValue(canRedoAtom);
  const undo = useSetAtom(undoAtom);
  const redo = useSetAtom(redoAtom);

  return (
    <ButtonGroup
      direction="row"
      gap={0.5}
      sx={{
        backdropFilter: "blur(5pt)",
        WebkitBackdropFilter: "blur(5pt)",
        backgroundColor: "rgba(0,0,0,0.5)",
        ...sx,
      }}
      {...props}
    >
      <TooltippedToolbarButton title="Undo" disabled={!canUndo} onClick={undo}>
        <FiRotateCcw />
      </TooltippedToolbarButton>
      <TooltippedToolbarButton title="Redo" disabled={!canRedo} onClick={redo}>
        <FiRotateCw />
      </TooltippedToolbarButton>
    </ButtonGroup>
  );
};
