import { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  ConnectionMode,
  Panel,
  ReactFlowProvider,
} from "reactflow";
import "./App.css";
import "reactflow/dist/style.css";
import PlaceNode from "./PlaceNode";
import SimpleFloatingEdge from "./SimpleFloatingEdge";
import { useAtom } from "jotai";
import { RESET, useResetAtom } from "jotai/utils";
import {
  placesAtom,
  transitionsAtom,
  nodeListAtom,
  edgeListAtom,
} from "./atom";
import TransitionNode from "./TransitionNode";
import { copyTextToClipboard } from "./utils";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { cloneDeep, shuffle, mapValues } from "lodash";
import { v4 as uuid4 } from "uuid";
import { IconButton } from "@mui/material";
import {
  FiCopy,
  FiPause,
  FiPauseCircle,
  FiPlay,
  FiPlayCircle,
  FiPlusCircle,
  FiRotateCcw,
} from "react-icons/fi";

const nodeTypes = { placeNode: PlaceNode, transitionNode: TransitionNode };
const edgeTypes = {
  floating: SimpleFloatingEdge,
};

function Petri() {
  const [simulating, setSimulating] = useState(false);
  const [nodeList] = useAtom(nodeListAtom);
  const [edgeList] = useAtom(edgeListAtom);
  const [places, setPlaces] = useAtom(placesAtom);
  const resetPlaces = useResetAtom(placesAtom);
  const [transitions, setTransitions] = useAtom(transitionsAtom);
  const resetTransitions = useResetAtom(transitionsAtom);
  const reducedPlaces = mapValues(places, (place) => place.tokens);
  const reducedTransitions = mapValues(
    transitions,
    (transition) => transition.active
  );

  useEffect(() => {
    if (simulating) {
      let newPlaces = cloneDeep(places);
      let newTransitions = cloneDeep(transitions);
      let transitionedPlaces = [];
      let update = false;

      shuffle(Object.values(newTransitions)).forEach((transition) => {
        console.log("considering ", transition.id);
        let inputNodes = Object.keys(transition.input).map(
          (inputNodeId) => newPlaces[inputNodeId]
        );
        let outputNodes = Object.keys(transition.output).map(
          (outputNodeId) => newPlaces[outputNodeId]
        );
        if (transition.active) {
          console.log("closing out transition");
          outputNodes.forEach((outputNode) => {
            for (let i = 0; i < transition.output[outputNode.id].count; i++) {
              if (
                !["infinite", "sink"].includes(newPlaces[outputNode.id].tokens)
              ) {
                newPlaces[outputNode.id].tokens.push({});
              }
              transitionedPlaces.push(outputNode.id);
            }
          });
          newTransitions[transition.id].active = false;
          update = true;
        } else if (
          !transition.active &&
          inputNodes.length > 0 &&
          !inputNodes
            .map(
              (inputNode) =>
                inputNode.tokens.length >=
                  transition.input[inputNode.id].count &&
                !transitionedPlaces.includes(inputNode.id)
            )
            .includes(false)
        ) {
          console.log("starting transition");
          inputNodes.forEach((inputNode) => {
            for (let i = 0; i < transition.input[inputNode.id].count; i++) {
              if (newPlaces[inputNode.id].tokens !== "infinite") {
                newPlaces[inputNode.id].tokens.pop();
              }
            }
          });
          newTransitions[transition.id].active = true;

          update = true;
        }
      });
      if (update) {
        console.log(newTransitions);
        const handle = setTimeout(() => {
          console.log({ newPlaces, newTransitions });
          setPlaces(newPlaces);
          setTransitions(newTransitions);
        }, 1000);
        return () => {
          clearTimeout(handle);
        };
      }
    }
    return undefined;
  }, [simulating, places, transitions]);

  const onNodesChange = (changes) => {
    let newPlaces = cloneDeep(places);
    let newTransitions = cloneDeep(transitions);
    changes.forEach((change) => {
      if (change.type === "position" && change.dragging) {
        if (newPlaces[change.id]) {
          newPlaces[change.id].position = change.position;
          setPlaces(newPlaces);
        } else if (newTransitions[change.id]) {
          newTransitions[change.id].position = change.position;
          setTransitions(newTransitions);
        }
      }
    });
    // setNodes(newNodes);
  };

  const onConnect = (props) => {
    if (places[props.source] && places[props.target]) {
      const id = uuid4();
      const newTransition = {
        id,
        name: `${props.source}->${props.target}`.toUpperCase(),
        input: { [props.source]: { count: 1 } },
        output: { [props.target]: { count: 1 } },
        position: {
          x:
            (places[props.source].position.x +
              places[props.target].position.x) /
            2,
          y:
            (places[props.source].position.y +
              places[props.target].position.y) /
            2,
        },
        active: false,
      };
      setTransitions({
        ...transitions,
        [id]: newTransition,
      });
    } else if (places[props.source] && transitions[props.target]) {
      let currentTransition = transitions[props.target];
      if (!currentTransition.input[props.source]) {
        currentTransition.input[props.source] = { count: 1 };
        setTransitions({
          ...transitions,
          [currentTransition.id]: currentTransition,
        });
      }
    } else if (transitions[props.source] && places[props.target]) {
      let currentTransition = transitions[props.source];
      if (!currentTransition.output[props.target]) {
        currentTransition.output[props.target] = { count: 1 };
        setTransitions({
          ...transitions,
          [currentTransition.id]: currentTransition,
        });
      }
    }
  };

  const newPlace = () => {
    const id = uuid4();
    setPlaces({
      ...places,
      [id]: {
        id,
        name: "New Place",
        position: { x: -39, y: 2.5 },
        tokens: [],
      },
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App" style={{ height: "100%", width: "100%" }}>
        <ReactFlow
          nodes={nodeList}
          edges={edgeList}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView={{ padding: 10 }}
          onNodesChange={onNodesChange}
          onConnect={onConnect}
          //onEdgesChange={onEdgesChange}
          connectionMode={ConnectionMode.Loose}
          style={{ backgroundColor: "#333" }}
          snapGrid={[10, 20]}
          snapToGrid
        >
          <Background variant="dots" gap={24} size={1} />
          <Panel position="top-right">
            <IconButton
              variant="outlined"
              disabled={simulating}
              onClick={() => {
                resetPlaces();
                resetTransitions();
                // if (simulating) {
                //   // setSimulating(false);
                //   resetPlaces();
                //   resetTransitions();
                // } else {
                //   setSimulating(true);
                // }
              }}
            >
              <FiRotateCcw />
            </IconButton>
            <IconButton
              variant="outlined"
              onClick={() => {
                if (simulating) {
                  setSimulating(false);
                } else {
                  setSimulating(true);
                }
              }}
            >
              {simulating ? <FiPauseCircle /> : <FiPlayCircle />}
            </IconButton>
            <IconButton variant="outlined" onClick={newPlace}>
              <FiPlusCircle />
            </IconButton>
            <IconButton
              variant="outlined"
              onClick={() => {
                console.log("Copying to Clipboard");
                copyTextToClipboard(JSON.stringify({ places, transitions }));
              }}
            >
              <FiCopy />
            </IconButton>
          </Panel>
        </ReactFlow>
      </div>
    </ThemeProvider>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <Petri />
    </ReactFlowProvider>
  );
}

export default App;
