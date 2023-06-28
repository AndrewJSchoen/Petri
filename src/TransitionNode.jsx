import { InputAdornment, TextField, Avatar, Chip } from "@mui/material";
import React, { memo, useMemo, useState, useEffect } from "react";
import { Handle, Position, NodeToolbar, useNodeId, useStore } from "reactflow";
import { useAtom, useAtomValue } from "jotai";
import {
  transitionsAtom,
  selectedNodeAtom,
  transitionArrangementsAtom,
  markingAtom
} from "./atom";
import { focusAtom } from "jotai-optics";
import { BsPinAngle, BsPinAngleFill } from "react-icons/bs";
import { FiTrash2, FiMinus, FiPlus } from "react-icons/fi";
import { motion, useSpring, useTransform } from "framer-motion";

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

  const angle = useSpring(transitionArrangement?.angle || 0);
  const transform = useTransform(angle, (angle) => `rotate(${angle}deg)`);

  useEffect(() => {
    angle.set(transitionArrangement?.angle || 0);
  }, [transitionArrangement?.angle])


  return (
    transition && transitionArrangement && (
      <>
        <NodeToolbar
          className="nodrag nopan"
          isVisible={selectedNode === nodeId || pinned}
        >
          <TextField
            autoFocus
            size="small"
            value={transition.name}
            label="Transition Name"
            variant="outlined"
            onChange={(e) => {
              setTransition({ ...transition, name: e.target.value });
            }}
            color="info"
            InputProps={{
              style: {
                color: "#ddd",
                backgroundColor: "#77777777",
              },
              startAdornment: (
                <InputAdornment
                  position="start"
                  onClick={() => setPinned(!pinned)}
                >
                  {pinned ? <BsPinAngleFill /> : <BsPinAngle />}
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  <InputAdornment position="end">
                        <FiMinus
                          onClick={() => {
                            setTransition({ ...transition, time: transition.time - 1 });
                          }}
                        />
                      </InputAdornment>
                      <InputAdornment position="end">
                        <Chip size='small' label={`${transition.time}s`} />
                        </InputAdornment>
                      <InputAdornment position="end">
                        <FiPlus
                          onClick={() => {
                            setTransition({ ...transition, time: transition.time +1 });
                          }}
                        />
                      </InputAdornment>
                      <InputAdornment
                  position="end"
                  onClick={() => {
                    const { [transition.id]: _, ...rest } = transitions;
                    setTransitions(rest);
                  }}
                >
                  <FiTrash2 />
                </InputAdornment>
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
        <motion.div style={{transform}}>
        
        <Handle
          id="out"
          type="source"
          position={Position.Right}
          style={{
            background: "#555",
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
        <Avatar
          className="transition-drag-handle"
          style={{
            // transform: `rotate(${transitionArrangement.angle}deg)`,
            borderRadius: 2,
            zIndex: 100,
            background: "black",
            boxShadow: marking[nodeId]
              ? "inset 0px 0px 1px 1px #ffcc00"
              : null,
            height: 40,
            width: 20,
            // alignItems: "center",
          }}
          onClick={
            selectedNode === nodeId
              ? () => setSelectedNode(null)
              : () => setSelectedNode(nodeId)
          }
        >
          {""}
        </Avatar>
        {isConnecting && (
          <Handle
            id="in"
            style={{
              background: isTarget ? "yellow" : "cyan",
              width: "calc(100% + 5px)",
              height: "calc(100% + 5px)",
              position: "absolute",
              top: -2.5,
              left: -2.5,
              borderRadius: 2,
              transform: "none",
              border: "none",
              opacity: 0.1,
            }}
            position={Position.Left}
            type="target"
            onConnect={(params) => console.log("handle onConnect", params)}
            isConnectable={isConnectable}
          />
        )}
        </motion.div>
        
      </>
    )
  );
});
