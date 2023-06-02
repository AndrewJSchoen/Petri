import { InputAdornment, TextField } from "@mui/material";
import React, { memo, useMemo, useState } from "react";
import { Handle, Position, NodeToolbar, useNodeId } from "reactflow";
import { useAtom, useSetAtom } from "jotai";
import { transitionsAtom, selectedNodeAtom } from "./atom";
import { focusAtom } from "jotai-optics";
import { BsPinAngle, BsPinAngleFill } from "react-icons/bs";
import { FiDelete, FiTrash2 } from "react-icons/fi";

export default memo(({ isConnectable }) => {
  const nodeId = useNodeId();
  const transitionAtom = useMemo(
    () => focusAtom(transitionsAtom, (optic) => optic.prop(nodeId)),
    [nodeId]
  );
  const [transitions, setTransitions] = useAtom(transitionsAtom);
  const [transition, setTransition] = useAtom(transitionAtom);
  const [selectedNode, setSelectedNode] = useAtom(selectedNodeAtom);
  const [pinned, setPinned] = useState(false);

  return transition && (
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
              <InputAdornment position="start" onClick={() => setPinned(!pinned)}>
                {pinned ? <BsPinAngleFill /> : <BsPinAngle />}
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment
                position="end"
                onClick={() => {
                  const { [transition.id]: _, ...rest } = transitions;
                  console.log("rest", rest);
                  setTransitions(rest);
                }}
              >
                <FiTrash2 />
              </InputAdornment>
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
      <div
        onClick={
          selectedNode === nodeId
            ? () => setSelectedNode(null)
            : () => setSelectedNode(nodeId)
        }
        style={{
          borderRadius: 2,
          background: "black",
          boxShadow: transition.active ? "inset 0px 0px 1px 1px #ffcc00" : null,
          height: 40,
          width: 20,
        }}
      />
      <Handle
        id="a"
        position={Position.Top}
        style={{ background: "#555" }}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      <Handle
        id="b"
        position={Position.Right}
        style={{ background: "#555" }}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      <Handle
        id="c"
        position={Position.Bottom}
        style={{ background: "#555" }}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      <Handle
        id="d"
        position={Position.Left}
        style={{ background: "#555" }}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
    </>
  );
});
