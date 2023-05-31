import { useCallback, useMemo, useState } from "react";
import { useStore, getBezierPath, EdgeLabelRenderer } from "reactflow";
import { useAtom } from "jotai";
import { transitionsAtom } from "./atom";
import { focusAtom } from "jotai-optics";
import { getBiDirectionalPath, getEdgeParams } from "./utils.js";
import { FiMinusCircle, FiPlusCircle } from "react-icons/fi";

const getOffset = (targetX, sourceX, targetY, sourceY) => {
  const distX = Math.abs(targetX - sourceX);
  const distY = Math.abs(targetY - sourceY);
  if (distX <= distY && targetX > sourceX) {
    return [25, 0];
  } else if (distX <= distY && targetX < sourceX) {
    return [-25, 0];
  } else if (distX > distY && targetY > sourceY) {
    return [0, -25];
  } else if (distX > distY && targetY < sourceY) {
    return [0, 25];
  } else {
    console.warn({ targetX, sourceX, targetY, sourceY });
    return [0, 0];
  }
};

function SimpleFloatingEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  style,
}) {
  const sourceNode = useStore(
    useCallback((store) => store.nodeInternals.get(source), [source])
  );
  const targetNode = useStore(
    useCallback((store) => store.nodeInternals.get(target), [target])
  );
  const isBiDirectionEdge = useStore((s) => {
    const edgeExists = s.edges.some(
      (e) =>
        (e.source === target && e.target === source) ||
        (e.target === source && e.source === target)
    );
    return edgeExists;
  });

  if (!sourceNode || !targetNode) {
    return null;
  }

  const transitionField =
    sourceNode.type === "transitionNode" ? "output" : "input";

  const transitionNode =
    sourceNode.type === "transitionNode" ? sourceNode : targetNode;
  const placeNode = sourceNode.type === "placeNode" ? sourceNode : targetNode;
  const transitionAtom = useMemo(
    () => focusAtom(transitionsAtom, (optic) => optic.prop(transitionNode.id)),
    [transitionNode.id]
  );
  const [transition, setTransition] = useAtom(transitionAtom);

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode
  );

  const [interactive, setInteractive] = useState(false);

  const [edgePath, labelX, labelY] = isBiDirectionEdge
    ? getBiDirectionalPath({
        sourceX: sx,
        sourceY: sy,
        sourcePosition: sourcePos,
        targetPosition: targetPos,
        targetX: tx,
        targetY: ty,
      })
    : getBezierPath({
        sourceX: sx,
        sourceY: sy,
        sourcePosition: sourcePos,
        targetPosition: targetPos,
        targetX: tx,
        targetY: ty,
      });

  return transition?.[transitionField]?.[placeNode.id] && (
    <g
      style={{ userSelect: "none" }}
      onClick={() => {
        console.log("click");
        setInteractive(!interactive);
      }}
    >
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={interactive ? 10 : 5}
        markerEnd={markerEnd}
        style={{ stroke: transition.active ? "#ffcc00" : "#999" }}
      />
      <EdgeLabelRenderer>
        {interactive && (
          <FiMinusCircle
            style={{
              fontSize: 10,
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${
                labelX - 15
              }px,${labelY}px)`,
              userSelect: "none",
              pointerEvents: "all",
            }}
            onClick={(e) => {
              console.log("minus");
              if (transition[transitionField][placeNode.id]?.count === 1) {
                const { [placeNode.id]: _, ...rest } = transition[transitionField];
                console.log({ rest });
                setTransition({
                  ...transition,
                  [transitionField]: rest,
                });
              } else {
                setTransition({
                  ...transition,
                  [transitionField]: {
                    ...transition[transitionField],
                    [placeNode.id]: {
                      count: (transition[transitionField][placeNode.id]?.count || 0) - 1,
                    },
                  },
                });
              }
              
              e.stopPropagation()
            }}
          />
        )}
        <div
          onClick={() => {
            console.log("clicked");
            setInteractive(!interactive);
          }}
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: transition.active ? "#ffcc00" : "#222",
            color: transition.active ? "black" : "#999",
            padding: 5,
            borderRadius: 100,
            fontSize: 5,
            fontWeight: 700,
            userSelect: "none",
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          {transition.input[source]
            ? transition.input[source].count
            : transition.output[target].count}
        </div>
        {interactive && (
          <FiPlusCircle
            style={{
              fontSize: 10,
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${
                labelX + 15
              }px,${labelY}px)`,
              userSelect: "none",
              pointerEvents: "all",
            }}
            onClick={(e) => {
              console.log("plus");
              setTransition({
                ...transition,
                [transitionField]: {
                  ...transition[transitionField],
                  [placeNode.id]: {
                    count: (transition[transitionField][placeNode.id]?.count || 0) + 1,
                  },
                },
              });
              e.stopPropagation()
            }}
          />
        )}
      </EdgeLabelRenderer>
    </g>
  );
}

export default SimpleFloatingEdge;
