import { useCallback, useMemo, useState } from "react";
import { useStore, getBezierPath, getSmoothStepPath, EdgeLabelRenderer } from "reactflow";
import { useAtom, useAtomValue } from "jotai";
import { transitionArrangementsAtom, transitionsAtom } from "./atom";
import { focusAtom } from "jotai-optics";
import { getBiDirectionalPath, getCustomEdgePreview, getEdgeParams, getNodeCenter } from "./utils.js";
import { FiMinusCircle, FiPlusCircle } from "react-icons/fi";

function FloatingEdgePreview({
  id,
  markerEnd,
  fromNode,
  toX,
  toY
}) {

  const sourceNode = useStore(
    useCallback((store) => store.nodeInternals.get(fromNode.id), [fromNode.id])
  );

  if (!sourceNode) {
    return null;
  }

  const transitionField =
    sourceNode.type === "transitionNode" ? "output" : "input";

  const transitionNode =
    sourceNode.type === "transitionNode" ? sourceNode : null;
  const transitionAtom = useMemo(
    () => focusAtom(transitionsAtom, (optic) => optic.prop(transitionNode?.id)),
    [transitionNode?.id]
  );

  const transitionArrangementAtom = useMemo(
    () => focusAtom(transitionArrangementsAtom, (optic) => optic.prop(transitionNode?.id)),
    [transitionNode?.id]
  );

  const transitionArrangement = useAtomValue(transitionArrangementAtom);

  const [edgePath] = getCustomEdgePreview(
    getNodeCenter(sourceNode), 
    {x: toX, y: toY}, 
    transitionField,
    transitionArrangement
  );

  return (
    <g
      style={{ userSelect: "none" }}
    >
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={5}
        markerEnd={markerEnd}
        style={{ stroke:"#999" }}
      />
      <circle cx={toX} cy={toY} fill="#aaa" r={3} stroke="#222" strokeWidth={1.5} />
    </g>
  );
}

export default FloatingEdgePreview;
