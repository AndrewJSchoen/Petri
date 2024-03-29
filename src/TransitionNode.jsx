import {
  Tooltip,
} from "@mui/material";
import React, { memo, useMemo, useState, useEffect } from "react";
import { Position, NodeToolbar, useNodeId, useStore } from "reactflow";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import {
  transitionsAtom,
  selectedNodeAtom,
  transitionArrangementsAtom,
  markingAtom,
  startColorAtom,
  endColorAtom,
  snapshotAtom,
  selectedAdjacentsAtom,
} from "./atom";
import { focusAtom } from "jotai-optics";
import { BsPinAngle, BsPinAngleFill } from "react-icons/bs";
import { FiTrash2, FiMinus, FiPlus, FiCopy } from "react-icons/fi";
import { motion, useSpring, useTransform } from "framer-motion";
import {
  MotionButtonGroup,
  MotionHandle,
  MotionAvatar,
} from "./MotionElements";
import { SimpleInput } from "./SimpleInput";
import { ToolbarButton, ToolbarChip } from "./ToolbarButton";

const connectionNodeIdSelector = (state) => state.connectionNodeId;

export default memo(({ isConnectable }) => {
  const nodeId = useNodeId();
  const connectionNodeId = useStore(connectionNodeIdSelector);

  const isConnecting = !!connectionNodeId;
  const isTarget = connectionNodeId && connectionNodeId == nodeId;

  const transitionAtom = useMemo(
    () => focusAtom(transitionsAtom, (optic) => optic.prop(nodeId)),
    [nodeId]
  );

  const transitionArrangementAtom = useMemo(
    () => focusAtom(transitionArrangementsAtom, (optic) => optic.prop(nodeId)),
    [nodeId]
  );

  const [transitions, setTransitions] = useAtom(transitionsAtom);
  const [transition, setTransition] = useAtom(transitionAtom);
  const transitionArrangement = useAtomValue(transitionArrangementAtom);
  const [selectedNode, setSelectedNode] = useAtom(selectedNodeAtom);
  const marking = useAtomValue(markingAtom);
  const snapshot = useSetAtom(snapshotAtom);
  const [pinned, setPinned] = useState(false);
  const selectedAdjacents = useAtomValue(selectedAdjacentsAtom);

  const [tooltipOpen, setTooltipOpen] = useState(false);

  const startColor = useAtomValue(startColorAtom);
  const endColor = useAtomValue(endColorAtom);

  const angle = useSpring(transitionArrangement?.angle || 0);
  const transform = useTransform(angle, (angle) => `rotate(${angle}deg)`);

  const progress = useSpring(0);
  const boxShadow = useTransform(
    progress,
    [0, 0.001, 0.75, 1],
    [
      `inset 0px 0px 0px 0px transparent`,
      `inset 0px 0px 1px 1px ${startColor}`,
      `inset 0px 0px 1px 1px ${startColor}`,
      `inset 0px 0px 1px 1px ${endColor}`,
    ]
  );

  useEffect(() => {
    angle.set(transitionArrangement?.angle || 0);
  }, [transitionArrangement?.angle]);

  useEffect(() => {
    // console.log(progress)
    if (!marking[nodeId]) {
      progress.jump(0);
    } else {
      progress.set(marking[nodeId]);
    }
  }, [marking[nodeId]]);

  const [contextMenu, setContextMenu] = useState(null);

  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
            clientX: event.clientX,
            clientY: event.clientY,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null
    );
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  return (
    transition &&
    transitionArrangement && (
      <>
        <NodeToolbar
          className="nodrag nopan"
          isVisible={
            selectedNode === nodeId ||
            pinned ||
            selectedAdjacents.includes(nodeId)
          }
          position="top"
        >
          <MotionButtonGroup
            direction="row"
            gap={0.5}
            variants={{
              visible: { opacity: 1, y: 0 },
              hidden: { opacity: 0, y: 10 },
            }}
            initial="hidden"
            animate={
              selectedNode === nodeId ||
              pinned ||
              selectedAdjacents.includes(nodeId)
                ? "visible"
                : "hidden"
            }
          >
            {selectedAdjacents.includes(nodeId) ||
            (pinned && selectedNode !== nodeId) ? (
              <>
                <Tooltip
                  className="no-outline"
                  title={pinned ? "Unpin" : "Pin This Menu"}
                  color="primary"
                  placement="top"
                >
                  <ToolbarButton
                    aria-label={pinned ? "Unpin this menu" : "Pin this menu"}
                    color="primary"
                    onClick={() => {
                      setPinned(!pinned);
                      setTooltipOpen(false);
                    }}
                  >
                    {pinned ? <BsPinAngleFill /> : <BsPinAngle />}
                  </ToolbarButton>
                </Tooltip>
                <SimpleInput wrapped readOnly value={transition.name} />
              </>
            ) : (
              <>
                <Tooltip
                  className="no-outline"
                  title={pinned ? "Unpin" : "Pin This Menu"}
                  color="primary"
                  placement="top"
                >
                  <ToolbarButton
                    aria-label={pinned ? "Unpin this menu" : "Pin this menu"}
                    color="primary"
                    onClick={() => {
                      setPinned(!pinned);
                      setTooltipOpen(false);
                    }}
                  >
                    {pinned ? <BsPinAngleFill /> : <BsPinAngle />}
                  </ToolbarButton>
                </Tooltip>
                <SimpleInput
                  value={transition.name}
                  wrapped
                  onChange={(e) => {
                    snapshot();
                    setTransition({ ...transition, name: e.target.value });
                  }}
                />
                <Tooltip
                  title="Decrease Transition Time"
                  className="no-outline"
                >
                  <ToolbarButton
                    onClick={() => {
                      snapshot();
                      setTransition({
                        ...transition,
                        time: transition.time - 1,
                      });
                    }}
                  >
                    <FiMinus />
                  </ToolbarButton>
                </Tooltip>
                <Tooltip title="Transition Time" className="no-outline">
                  <ToolbarChip size="small" label={`${transition.time}s`} />
                </Tooltip>
                <Tooltip
                  title="Increase Transition Time"
                  className="no-outline"
                >
                  <ToolbarButton
                    onClick={() => {
                      snapshot();
                      setTransition({
                        ...transition,
                        time: transition.time + 1,
                      });
                    }}
                  >
                    <FiPlus />
                  </ToolbarButton>
                </Tooltip>
                <Tooltip title="Delete Transition" className="no-outline">
                  <ToolbarButton
                    onClick={() => {
                      snapshot();
                      const { [transition.id]: _, ...rest } = transitions;
                      setTransitions(rest);
                    }}
                  >
                    <FiTrash2 />
                  </ToolbarButton>
                </Tooltip>
              </>
            )}
          </MotionButtonGroup>
        </NodeToolbar>
        <Tooltip
          open={tooltipOpen}
          onOpen={() => {
            if (
              !pinned &&
              selectedNode !== nodeId &&
              !selectedAdjacents.includes(nodeId)
            ) {
              setTooltipOpen(true);
            }
          }}
          onClose={() => setTooltipOpen(false)}
          title={transition.name}
          placement="top"
          className="no-outline"
        >
          <motion.div style={{ transform }}>
            <MotionHandle
              aria-label="Connect from Transition"
              id="out"
              type="source"
              whileHover={{
                scale: 1.2,
                opacity: 0.2,
                backgroundColor: startColor,
              }}
              position={Position.Right}
              style={{
                backgroundColor: "#555",
                width: "calc(100% + 5px)",
                height: "calc(100% + 5px)",
                position: "absolute",
                top: -2.5,
                left: -2.5,
                borderRadius: 4,
                transform: "none",
                border: "none",
                opacity: 0.5,
              }}
              onConnect={(params) => console.log("handle onConnect", params)}
              isConnectable={isConnectable}
            />
            <Menu
              open={contextMenu !== null}
              onClose={handleContextMenuClose}
              anchorReference="anchorPosition"
              anchorPosition={
                contextMenu !== null
                  ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                  : undefined
              }
            >
              <MenuItem
                disabled
                onClick={() => {
                  // handleCreatePlace();
                  handleContextMenuClose();
                }}
              >
                <ListItemIcon>
                  <FiCopy />
                </ListItemIcon>
                <ListItemText>Copy</ListItemText>
              </MenuItem>
            </Menu>
            <MotionAvatar
              className="transition-drag-handle"
              aria-label="Transition"
              style={{
                // transform: `rotate(${transitionArrangement.angle}deg)`,
                borderRadius: 2,
                background: "black",
                boxShadow,
                height: 40,
                width: 20,
                // alignItems: "center",
              }}
              onContextMenu={handleContextMenu}
              onClick={
                selectedNode === nodeId
                  ? () => setSelectedNode(null)
                  : () => {
                      setSelectedNode(nodeId);
                      setTooltipOpen(false);
                    }
              }
            >
              {""}
            </MotionAvatar>
            {isConnecting && (
              <MotionHandle
                aria-label="Connect to Transition"
                id="in"
                whileHover={{
                  opacity: 0.25,
                  background: isTarget ? startColor : endColor,
                }}
                style={{
                  background: startColor,
                  width: "calc(100% + 5px)",
                  height: "calc(100% + 5px)",
                  position: "absolute",
                  top: -2.5,
                  left: -2.5,
                  borderRadius: 4,
                  transform: "none",
                  border: "none",
                  opacity: 0.1,
                }}
                position={Position.Left}
                type="target"
                isConnectable={isConnectable}
              />
            )}
          </motion.div>
        </Tooltip>
      </>
    )
  );
});
