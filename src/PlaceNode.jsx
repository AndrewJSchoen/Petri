import { Avatar, ToggleButton, Tooltip } from "@mui/material";
import React, { memo, useMemo, useState } from "react";
import { Position, NodeToolbar, useNodeId, useStore } from "reactflow";
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
  selectedAdjacentsAtom,
} from "./atom";
import { BsPinAngle, BsPinAngleFill } from "react-icons/bs";
import { IoInfinite, IoExitOutline } from "react-icons/io5";
import { FiMinus, FiPlus, FiTrash2, FiHash } from "react-icons/fi";
import { mapValues } from "lodash";
import { SimpleInput } from "./SimpleInput";
import { ToolbarButton, TooltippedToolbarButton } from "./ToolbarButton";
import {
  MotionHandle,
  MotionButtonGroup,
  MotionToggleButtonGroup,
} from "./MotionElements";
import { MarkingDisplay } from "./MarkingDisplay";
import { v4 as uuid4 } from "uuid";

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
  const startColor = useAtomValue(startColorAtom);
  const endColor = useAtomValue(endColorAtom);
  const snapshot = useSetAtom(snapshotAtom);

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const selectedAdjacents = useAtomValue(selectedAdjacentsAtom);

  // console.log("includes", selectedAdjacents.includes(nodeId));

  return (
    place && (
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
                <SimpleInput readOnly wrapped value={place.name} />
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
                  value={place.name}
                  wrapped
                  onChange={(e) => {
                    snapshot();
                    setPlace({ ...place, name: e.target.value });
                  }}
                />
                {place.tokens !== "infinite" && place.tokens !== "sink" && (
                  <TooltippedToolbarButton
                    title="Decrease Tokens"
                    disabled={marking[place.id]?.length <= 0}
                    onClick={() => {
                      if (simulating) {
                        let [_, ...newMarking] = marking[place.id];
                        setMarking((m) => ({
                          ...m,
                          [place.id]: newMarking,
                        }));
                      } else {
                        snapshot();
                        setInitialMarking((im) => {
                          let [_, ...newTokens] = im[place.id];
                          return {
                            ...im,
                            [place.id]: newTokens,
                          };
                        });
                        setMarking((m) => {
                          let [_, ...newTokens] = m[place.id];
                          return {
                            ...m,
                            [place.id]: newTokens,
                          };
                        });
                      }
                    }}
                  >
                    <FiMinus/>
                </TooltippedToolbarButton>
                )}
                {place.tokens !== "infinite" && place.tokens !== "sink" && (
                  <TooltippedToolbarButton
                    title="Increase Tokens"
                    onClick={() => {
                      if (simulating) {
                        setMarking((m) => ({
                          ...m,
                          [place.id]: [...m[place.id], { id: uuid4() }],
                        }));
                      } else {
                        snapshot();
                        let newToken = { id: uuid4() };
                        setInitialMarking((im) => ({
                          ...im,
                          [place.id]: [...im[place.id], newToken],
                        }));
                        setMarking((m) => ({
                          ...m,
                          [place.id]: [...m[place.id], newToken],
                        }));
                      }
                    }}
                  >
                    <FiPlus />
                  </TooltippedToolbarButton>
                )}
                <TooltippedToolbarButton
                  onClick={() => {
                    snapshot();
                    const { [place.id]: _, ...rest } = places;
                    const newTransitions = mapValues(
                      transitions,
                      (transition) => {
                        const { [place.id]: _i, ...input } = transition.input;
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
                </TooltippedToolbarButton>
              </>
            )}
          </MotionButtonGroup>
        </NodeToolbar>
        <NodeToolbar
          className="nodrag nopan"
          isVisible={selectedNode === nodeId}
          position="bottom"
        >
          <MotionToggleButtonGroup
            className="no-outline"
            exclusive
            color="primary"
            value={place.tokens}
            onChange={(_, newValue) => {
              snapshot();
              setPlace({ ...place, tokens: newValue });
            }}
            variants={{
              visible: { opacity: 1, y: 0 },
              hidden: { opacity: 0, y: -10 },
            }}
            initial="hidden"
            animate={selectedNode === nodeId || pinned ? "visible" : "hidden"}
          >
            <ToggleButton
              className="no-outline"
              value="infinite"
              aria-label="Change to Infinite Token Place"
            >
              <IoInfinite />
            </ToggleButton>

            <ToggleButton
              className="no-outline"
              value="finite"
              aria-label="Change to Finite Token Place"
            >
              <FiHash />
            </ToggleButton>

            <ToggleButton
              className="no-outline"
              aria-label="Change to Sink Token Place"
              value="sink"
            >
              <IoExitOutline />
            </ToggleButton>
          </MotionToggleButtonGroup>
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
            if (
              !pinned &&
              selectedNode !== nodeId &&
              !selectedAdjacents.includes(nodeId)
            ) {
              setTooltipOpen(true);
            }
          }}
          onClose={() => setTooltipOpen(false)}
          title={place.name}
          placement="top"
          className="no-outline"
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
              <MarkingDisplay marking={marking[place?.id] || []} />
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
