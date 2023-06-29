import {
  InputAdornment,
  TextField,
  Avatar,
  Chip,
  Tooltip,
} from "@mui/material";
import React, { memo, useMemo, useState, useEffect } from "react";
import { Handle, Position, NodeToolbar, useNodeId, useStore } from "reactflow";
import { useAtom, useAtomValue } from "jotai";
import {
  transitionsAtom,
  selectedNodeAtom,
  transitionArrangementsAtom,
  markingAtom,
  startColorAtom,
  endColorAtom,
} from "./atom";
import { focusAtom } from "jotai-optics";
import { BsPinAngle, BsPinAngleFill } from "react-icons/bs";
import { FiTrash2, FiMinus, FiPlus } from "react-icons/fi";
import { motion, useSpring, useTransform } from "framer-motion";

const MotionHandle = motion(Handle);
const MotionAvatar = motion(Avatar);

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
  const [pinned, setPinned] = useState(false);

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

  return (
    transition &&
    transitionArrangement && (
      <>
        <NodeToolbar
          className="nodrag nopan"
          isVisible={selectedNode === nodeId || pinned}
        >
          <TextField
            autoFocus
            size="small"
            color="primary"
            value={transition.name}
            label="Transition Info"
            variant="outlined"
            onChange={(e) => {
              setTransition({ ...transition, name: e.target.value });
            }}
            InputProps={{
              style: {
                color: "#ddd",
                backgroundColor: "#77777777",
              },
              startAdornment: (
                <Tooltip title={pinned ? "Unpin" : "Pin This Menu"}>
                <InputAdornment
                  style={{ cursor: "pointer" }}
                  position="start"
                  onClick={() => setPinned(!pinned)}
                >
                  {pinned ? <BsPinAngleFill /> : <BsPinAngle />}
                </InputAdornment>
                </Tooltip>
              ),
              endAdornment: (
                <>
                  <Tooltip title="Decrease Transition Time">
                    <InputAdornment style={{ cursor: "pointer" }} position="end">
                      <FiMinus
                        onClick={() => {
                          setTransition({
                            ...transition,
                            time: transition.time - 1,
                          });
                        }}
                      />
                    </InputAdornment>
                  </Tooltip>
                  <Tooltip title="Transition Time">
                    <InputAdornment position="end">
                      <Chip size="small" label={`${transition.time}s`} />
                    </InputAdornment>
                  </Tooltip>
                  <Tooltip title="Increase Transition Time">
                    <InputAdornment
                      style={{ cursor: "pointer" }}
                      position="end"
                    >
                      <FiPlus
                        onClick={() => {
                          setTransition({
                            ...transition,
                            time: transition.time + 1,
                          });
                        }}
                      />
                    </InputAdornment>
                  </Tooltip>
                  <Tooltip title="Delete Transition">
                    <InputAdornment
                      style={{ cursor: "pointer" }}
                      position="end"
                      onClick={() => {
                        const { [transition.id]: _, ...rest } = transitions;
                        setTransitions(rest);
                      }}
                    >
                      <FiTrash2 />
                    </InputAdornment>
                  </Tooltip>
                </>
              ),
            }}
            inputProps={{
              style: {
                maxWidth: 100,
                textAlign: "center",
              },
            }}
          />
        </NodeToolbar>
        <Tooltip open={tooltipOpen}
          onOpen={() => {
            if (!pinned && selectedNode !== nodeId) {
              setTooltipOpen(true);
            }
          }}
          onClose={() => setTooltipOpen(false)}
          title={transition.name}
          placement="top">
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
            onClick={
              selectedNode === nodeId
                ? () => setSelectedNode(null)
                : () => {
                  setSelectedNode(nodeId);
                  setTooltipOpen(false)
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
