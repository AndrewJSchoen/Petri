import { useCallback, useMemo, useState, useEffect } from "react";
import {
  useStore,
  EdgeLabelRenderer,
} from "reactflow";
import { useAtom, useAtomValue } from "jotai";
import {
  transitionArrangementsAtom,
  transitionsAtom,
  markingAtom,
  startColorAtom,
  endColorAtom
} from "./atom";
import { focusAtom } from "jotai-optics";
import {
  getCustomEdge,
  getNodeCenter,
} from "./utils.js";
import { FiMinusCircle, FiPlusCircle } from "react-icons/fi";
import { motion, useSpring, useTransform } from "framer-motion";

function FloatingEdge({ id, source, target, markerEnd }) {
  const sourceNode = useStore(
    useCallback((store) => store.nodeInternals.get(source), [source])
  );
  const targetNode = useStore(
    useCallback((store) => store.nodeInternals.get(target), [target])
  );

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
  const transitionArrangementAtom = useMemo(
    () =>
      focusAtom(transitionArrangementsAtom, (optic) =>
        optic.prop(transitionNode.id)
      ),
    [transitionNode.id]
  );

  const [transition, setTransition] = useAtom(transitionAtom);
  const transitionArrangement = useAtomValue(transitionArrangementAtom);
  const marking = useAtomValue(markingAtom);

  const startColor = useAtomValue(startColorAtom);
  const endColor = useAtomValue(endColorAtom);

  const [interactive, setInteractive] = useState(false);

  const [edgePath, labelX, labelY] = getCustomEdge(
    getNodeCenter(sourceNode),
    getNodeCenter(targetNode),
    transitionField,
    transitionArrangement
  );

  const progress = useSpring(0);
  const actionStroke = useTransform(progress, [0, 0.75, 1], [startColor, startColor, endColor]);
  const actionPathLength = useTransform(progress, [0, 0.5, 1], [
    transitionField === "input" ? 0 : 0,
    transitionField === "input" ? 1 : 0,
    transitionField === "input" ? 1 : 1,
  ]);

  useEffect(() => {
    if (!marking[transition?.id]) {
      progress.jump(0)
    } else {
      progress.set(marking[transition?.id])
    }
  }, [marking[transition?.id]])

  return (
    transition?.[transitionField]?.[placeNode.id] && (
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
          strokeOpacity={marking[transition.id] ? 0.5 : 1}
          style={{ stroke: marking[transition.id] ? startColor : "#999" }}
        />

        {marking[transition.id] && (
          <motion.path
            strokeDashoffset={0.5}
            pathLength={actionPathLength}
            stroke={actionStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="5"
            fill="none"
            d={edgePath}
          />
        )}

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
                if (transition[transitionField][placeNode.id] === 1) {
                  const { [placeNode.id]: _, ...rest } =
                    transition[transitionField];
                  // console.log({ rest });
                  setTransition({
                    ...transition,
                    [transitionField]: rest,
                  });
                } else {
                  setTransition({
                    ...transition,
                    [transitionField]: {
                      ...transition[transitionField],
                      [placeNode.id]:
                        (transition[transitionField][placeNode.id] || 0) - 1,
                    },
                  });
                }

                e.stopPropagation();
              }}
            />
          )}
          <motion.div
            onClick={() => {
              console.log("clicked");
              setInteractive(!interactive);
            }}
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: marking[transition.id] ? actionStroke : "#222",
              color: marking[transition.id] ? "black" : "#999",
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
              ? transition.input[source]
              : transition.output[target]}
          </motion.div>
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
                    [placeNode.id]:
                      (transition[transitionField][placeNode.id] || 0) + 1,
                  },
                });
                e.stopPropagation();
              }}
            />
          )}
        </EdgeLabelRenderer>
      </g>
    )
  );
}

export default FloatingEdge;
