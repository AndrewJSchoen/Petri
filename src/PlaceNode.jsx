import { Avatar, InputAdornment, TextField } from "@mui/material";
import React, { memo, useMemo, useState } from "react";
import { Handle, Position, NodeToolbar, useNodeId, useStore } from "reactflow";
import { useAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { placesAtom, selectedNodeAtom, transitionsAtom } from "./atom";
import { BsPinAngle, BsPinAngleFill } from "react-icons/bs";
import { IoInfinite, IoExitOutline } from "react-icons/io5";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { pickBy, mapValues } from "lodash";

const connectionNodeIdSelector = (state) => state.connectionNodeId;

export default memo(({ isConnectable }) => {
  const nodeId = useNodeId();
  const connectionNodeId = useStore(connectionNodeIdSelector);

  const isConnecting = !!connectionNodeId;
  const isTarget = connectionNodeId && connectionNodeId == nodeId;

  const placeAtom = useMemo(
    () => focusAtom(placesAtom, (optic) => optic.prop(nodeId)),
    [nodeId]
  );
  const [places, setPlaces] = useAtom(placesAtom);
  const [transitions, setTransitions] = useAtom(transitionsAtom);
  const [place, setPlace] = useAtom(placeAtom);
  const [selectedNode, setSelectedNode] = useAtom(selectedNodeAtom);
  const [pinned, setPinned] = useState(false);

  return (
    place && (
      <>
        <NodeToolbar
          className="nodrag nopan"
          isVisible={selectedNode === nodeId || pinned}
        >
          <TextField
            autoFocus
            size="small"
            value={place.name}
            label="Place Name"
            variant="outlined"
            onChange={(e) => {
              setPlace({ ...place, name: e.target.value });
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
                  {place.tokens !== "infinite" && place.tokens !== "sink" && (
                    <InputAdornment position="end">
                      <FiMinus
                        onClick={() => {
                          setPlace({
                            ...place,
                            tokens: place.tokens.slice(0, -1),
                          });
                        }}
                      />
                    </InputAdornment>
                  )}
                  {place.tokens !== "infinite" && place.tokens !== "sink" && (
                    <InputAdornment position="end">
                      <FiPlus
                        onClick={() => {
                          setPlace({ ...place, tokens: [...place.tokens, {}] });
                        }}
                      />
                    </InputAdornment>
                  )}
                  <InputAdornment
                    position="end"
                    onClick={() => {
                      const { [place.id]: _, ...rest } = places;
                      console.log("rest", rest);
                      const newTransitions = mapValues(
                        transitions,
                        (transition) => {
                          const { [place.id]: _i, ...input } = transition.input;
                          const { [place.id]: _o, ...output } = transition.output;
                          return { ...transition, input, output };
                        }
                      );
                      console.log({id:place.id,rest,newTransitions});
                      setPlaces(rest);
                      setTransitions(newTransitions);
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

        <Handle
          id="out"
          type="source"
          position={Position.Right}
          style={{
            background: "#555",
            width: "calc(100% + 10px)",
            height: "calc(100% + 10px)",
            position: "absolute",
            top: -5,
            left: -5,
            borderRadius: 100,
            transform: "none",
            border: "none",
            opacity: 0.5,
          }}
          onConnect={(params) => console.log("handle onConnect", params)}
          isConnectable={isConnectable}
        />
        <Avatar
          style={{ color: "black" }}
          onClick={
            selectedNode === nodeId
              ? () => setSelectedNode(null)
              : () => setSelectedNode(nodeId)
          }
        >
          {place.tokens === "infinite" ? (
            <IoInfinite />
          ) : place.tokens === "sink" ? (
            <IoExitOutline />
          ) : (
            place.tokens.length > 0 && place.tokens.length
          )}
        </Avatar>

        {isConnecting && (
          <Handle
            id="in"
            style={{
              background: isTarget ? "yellow" : "cyan",
              width: "calc(100% + 10px)",
              height: "calc(100% + 10px)",
              position: "absolute",
              top: -5,
              left: -5,
              borderRadius: 100,
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
      </>
    )
  );
});
