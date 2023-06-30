import {
  Avatar,
  InputAdornment,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Tooltip,
} from "@mui/material";
import { styled } from '@mui/material/styles';
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

const MotionHandle = motion(Handle);

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  backgroundOpacity: 0.5,
  height: 30,
  '& .MuiToggleButtonGroup-grouped': {
    margin: theme.spacing(0.5),
    border: 0,
    height: 18,
    '&.Mui-disabled': {
      border: 0,
    },
    '&:not(:first-of-type)': {
      borderRadius: theme.shape.borderRadius,
    },
    '&:first-of-type': {
      borderRadius: theme.shape.borderRadius,
    },
  },
}));

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
  const [marking, setMarking] = useAtom(markingAtom);
  const [initialMarking, setInitialMarking] = useAtom(initialMarkingAtom);
  const [places, setPlaces] = useAtom(placesAtom);
  const [transitions, setTransitions] = useAtom(transitionsAtom);
  const [place, setPlace] = useAtom(placeAtom);
  const [selectedNode, setSelectedNode] = useAtom(selectedNodeAtom);
  const simulating = useAtomValue(simulatingAtom);
  const [pinned, setPinned] = useState(false);
  const [startColor, setStartColor] = useAtom(startColorAtom);
  const [endColor, setEndColor] = useAtom(endColorAtom);
  const snapshot = useSetAtom(snapshotAtom);

  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    place && (
      <>
        <NodeToolbar
          className="nodrag nopan"
          isVisible={selectedNode === nodeId || pinned}
        >
          <Stack direction="column" alignItems="center" spacing={2}>
            <StyledToggleButtonGroup
              exclusive
              color="primary"
              value={place.tokens}
              onChange={(_, newValue) => {
                snapshot();
                setPlace({ ...place, tokens: newValue });
              }}
            >
              
                <ToggleButton
                  value="infinite"
                  aria-label="Change to Infinite Token Place"
                >
                  
                    <IoInfinite />
                  
                </ToggleButton>
              
              
                <ToggleButton
                  value="finite"
                  aria-label="Change to Finite Token Place"
                >
                  <FiHash/>
                </ToggleButton>
              
                <ToggleButton
                  aria-label="Change to Sink Token Place"
                  value="sink"
                >
                  <IoExitOutline />
                </ToggleButton>
              
            </StyledToggleButtonGroup>
            <TextField
              aria-label="Place Info"
              autoFocus
              color="primary"
              size="small"
              value={place.name}
              label="Place Info"
              variant="outlined"
              onChange={(e) => {
                snapshot();
                setPlace({ ...place, name: e.target.value });
              }}
              InputProps={{
                "aria-label": "Place Name",
                style: {
                  color: "#ddd",
                  backgroundColor: "#77777777",
                },
                startAdornment: (
                  <Tooltip
                    title={pinned ? "Unpin" : "Pin This Menu"}
                    placement="bottom"
                  >
                    <InputAdornment
                      style={{cursor: 'pointer'}}
                      aria-label={pinned ? "Unpin this menu" : "Pin this menu"}
                      position="start"
                      onClick={() => {
                        setPinned(!pinned);
                        setTooltipOpen(false);
                      }}
                    >
                      {pinned ? <BsPinAngleFill /> : <BsPinAngle />}
                    </InputAdornment>
                  </Tooltip>
                ),
                endAdornment: (
                  <>
                    {place.tokens !== "infinite" && place.tokens !== "sink" && (
                      <Tooltip title="Decrease Tokens" placement="bottom">
                        <InputAdornment
                          style={{cursor: 'pointer'}}
                          position="end"
                          aria-label="Decrease Tokens"
                        >
                          <FiMinus
                            onClick={() => {
                              if (simulating) {
                                setMarking({
                                  ...marking,
                                  [place.id]: marking[place.id] - 1,
                                });
                              } else {
                                snapshot();
                                setInitialMarking({
                                  ...initialMarking,
                                  [place.id]: initialMarking[place.id] - 1,
                                });
                              }
                            }}
                          />
                        </InputAdornment>
                      </Tooltip>
                    )}
                    {place.tokens !== "infinite" && place.tokens !== "sink" && (
                      <Tooltip title="Increase Tokens" placement="bottom">
                        <InputAdornment
                          style={{cursor: 'pointer'}}
                          position="end"
                          aria-label="Increase Tokens"
                        >
                          <FiPlus
                            onClick={() => {
                              if (simulating) {
                                setMarking({
                                  ...marking,
                                  [place.id]: marking[place.id] + 1,
                                });
                              } else {
                                snapshot();
                                setInitialMarking({
                                  ...initialMarking,
                                  [place.id]: initialMarking[place.id] + 1,
                                });
                              }
                            }}
                          />
                        </InputAdornment>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete" placement="bottom">
                      <InputAdornment
                        style={{cursor: 'pointer'}}
                        aria-label="Delete Place"
                        position="end"
                        onClick={() => {
                          snapshot();
                          const { [place.id]: _, ...rest } = places;
                          const newTransitions = mapValues(
                            transitions,
                            (transition) => {
                              const { [place.id]: _i, ...input } =
                                transition.input;
                              const { [place.id]: _o, ...output } =
                                transition.output;
                              return { ...transition, input, output };
                            }
                          );
                          setPlaces(rest);
                          setTransitions(newTransitions);
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
          </Stack>
        </NodeToolbar>

        <MotionHandle
          id="out"
          whileHover={{ scale: 1.2, opacity: 0.2, backgroundColor: startColor }}
          aria-label="Connect from Place"
          type="source"
          position={Position.Right}
          style={{
            backgroundColor: "#555",
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
        <Tooltip
          open={tooltipOpen}
          onOpen={() => {
            if (!pinned && selectedNode !== nodeId) {
              setTooltipOpen(true);
            }
          }}
          onClose={() => setTooltipOpen(false)}
          title={place.name}
          placement="top"
        >
          <Avatar
            aria-label="Place"
            style={{ color: "black" }}
            onClick={
              selectedNode === nodeId
                ? () => setSelectedNode(null)
                : () => {
                    setSelectedNode(nodeId);
                    setTooltipOpen(false);
                  }
            }
          >
            {place.tokens === "infinite" ? (
              <IoInfinite />
            ) : place.tokens === "sink" ? (
              <IoExitOutline />
            ) : (
              marking[place?.id] || 0
            )}
          </Avatar>
        </Tooltip>

        {isConnecting && (
          <MotionHandle
            aria-label="Connect to Place"
            whileHover={{
              opacity: 0.25,
              background: isTarget ? startColor : endColor,
            }}
            id="in"
            style={{
              background: startColor,
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
