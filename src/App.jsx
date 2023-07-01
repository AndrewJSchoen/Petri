import { useEffect, useState, useRef } from "react";
import ReactFlow, {
  Background,
  ConnectionMode,
  Panel,
  ReactFlowProvider,
} from "reactflow";
import { red } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";
import "./App.css";
import "reactflow/dist/style.css";
import PlaceNode from "./PlaceNode";
import FloatingEdge from "./FloatingEdge";
import FloatingEdgePreview from "./FloatingEdgePreview";
import { useAtom, useSetAtom, useAtomValue } from "jotai";
import {
  nameAtom,
  placesAtom,
  transitionsAtom,
  nodeListAtom,
  edgeListAtom,
  selectedNodeAtom,
  markingAtom,
  initialMarkingAtom,
  simulatingAtom,
  startColorAtom,
  endColorAtom,
  canUndoAtom,
  canRedoAtom,
  undoAtom,
  redoAtom,
  snapshotAtom
} from "./atom";
import TransitionNode from "./TransitionNode";
import { copyTextToClipboard, useForceLayout } from "./utils";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { cloneDeep, shuffle, mapValues, clamp, pick } from "lodash";
import { v4 as uuid4 } from "uuid";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Modal,
  Box,
  Button,
  TextField,
  Stack,
  ClickAwayListener,
  Tooltip,
} from "@mui/material";
import {
  FiCopy,
  FiFileText,
  FiPause,
  FiPlay,
  FiPlus,
  FiRotateCcw,
  FiRotateCw,
  FiUpload,
  FiDownload,
  FiX,
  FiRewind,
} from "react-icons/fi";
import { FaPalette } from "react-icons/fa";
import { saveAs } from "file-saver";
import YAML from "yaml";
import { forceSimulation } from "d3-force";
import { forceManyBody, forceLink } from "d3-force";
import { MuiColorInput } from "mui-color-input";
import { AnimatePresence, motion } from "framer-motion";
import { MotionStack } from "./MotionElements";

const nodeTypes = { placeNode: PlaceNode, transitionNode: TransitionNode };
const edgeTypes = {
  floating: FloatingEdge,
};

function Petri() {
  const reactFlowWrapper = useRef(null);
  const fileInputRef = useRef();
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [addMode, setAddMode] = useState(false);
  const [simulating, setSimulating] = useAtom(simulatingAtom);
  const [nodeList] = useAtom(nodeListAtom);
  const [edgeList] = useAtom(edgeListAtom);
  const [name, setName] = useAtom(nameAtom);
  const [places, setPlaces] = useAtom(placesAtom);
  const [transitions, setTransitions] = useAtom(transitionsAtom);
  const setSelectedNode = useSetAtom(selectedNodeAtom);
  const [marking, setMarking] = useAtom(markingAtom);
  const [initialMarking, setInitialMarking] = useAtom(initialMarkingAtom);
  const [startColor, setStartColor] = useAtom(startColorAtom);
  const [endColor, setEndColor] = useAtom(endColorAtom);

  const [palette, setPalette] = useState(false);
  const [saveModal, setSaveModal] = useState(false);

  const canUndo = useAtomValue(canUndoAtom);
  const canRedo = useAtomValue(canRedoAtom);

  const undo = useSetAtom(undoAtom);
  const redo = useSetAtom(redoAtom);
  const snapshot = useSetAtom(snapshotAtom);

  // useForceLayout()

  const theme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: startColor,
      },
      secondary: {
        main: endColor,
      },
      error: {
        main: red.A400,
      },
    },
  });

  const download = () => {
    const text = JSON.stringify({
      name,
      places,
      transitions,
      marking: initialMarking,
    });

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${name.replaceAll(" ", "_")}.json`);
  };

  const upload = async (event) => {
    const fileUploaded = event.target.files[0];
    if (fileUploaded) {
      const reader = new FileReader();
      reader.onabort = () => {
        /* message.error('Upload Aborted') */
      };
      reader.onerror = () => {
        /* message.error('Upload Error') */
      };
      reader.onload = () => {
        let data = YAML.parse(reader.result);
        if (data) {
          setName(data.name || "Untitled Net");
          if (
            Object.values(data.places).some((p) => !p.position) ||
            Object.values(data.transitions).some((t) => !t.position)
          ) {
            let nodes = [
              ...Object.values(data.places).map((p) => ({
                id: p.id,
                x: p.position?.x,
                y: p.position?.y,
              })),
              ...Object.values(data.transitions).map((t) => ({
                id: t.id,
                x: t.position?.x,
                y: t.position?.y,
              })),
            ];
            let links = [];
            Object.values(data.transitions).forEach((t) => {
              Object.keys(t.input).forEach((p) => {
                const source = nodes.findIndex((n) => n.id == p);
                const target = nodes.findIndex((n) => n.id == t.id);
                links.push({ source, target });
              });
              Object.keys(t.output).forEach((p) => {
                const target = nodes.findIndex((n) => n.id == p);
                const source = nodes.findIndex((n) => n.id == t.id);
                links.push({ source, target });
              });
            });
            // Use D3-Force to find a good layout
            let forceSim = forceSimulation(nodes)
              .force("charge", forceManyBody().strength(-500))
              .force("link", forceLink().links(links));
            forceSim.tick(100);

            let nodesPositions = forceSim.nodes();
            let positionedPlaces = mapValues(data.places, (place) => ({
              ...place,
              position: pick(
                nodesPositions.find((n) => n.id == place.id),
                ["x", "y"]
              ),
            }));
            let positionedTransitions = mapValues(
              data.transitions,
              (transition) => ({
                ...transition,
                time: transition.time || 2,
                position: pick(
                  nodesPositions.find((n) => n.id == transition.id),
                  ["x", "y"]
                ),
              })
            );

            setPlaces(positionedPlaces);
            setTransitions(positionedTransitions);
          } else {
            setPlaces(data.places || {});
            setTransitions(data.transitions || {});
          }

          setMarking(data.marking || data.initial_marking || {});
          setInitialMarking(data.initial_marking || data.marking || {});
          setSaveModal(false);
        }
      };
      reader.readAsText(fileUploaded);
    }
  };

  const handleUploadClick = (_) => {
    fileInputRef.current.click();
  };

  // Run snapshot on certain changes

  useEffect(() => {
    if (simulating) {
      let newMarking = cloneDeep(marking);
      let transitionedPlaces = [];
      let update = false;

      shuffle(Object.values(transitions)).forEach((transition) => {
        // console.log(`considering ${transition.id} with marking ${newMarking[transition.id]}`);
        let inputNodes = Object.keys(transition.input).map(
          (inputNodeId) => places[inputNodeId]
        );
        let outputNodes = Object.keys(transition.output).map(
          (outputNodeId) => places[outputNodeId]
        );
        if (newMarking[transition.id] > 0 && newMarking[transition.id] < 1) {
          // console.log(`progressing transition ${transition.id} with duration ${transition.time} by ${1 / transition.time}`);
          newMarking[transition.id] = clamp(
            newMarking[transition.id] + 0.1 / transition.time,
            0,
            1
          );
          update = true;
        } else if (
          newMarking[transition.id] != undefined &&
          newMarking[transition.id] === 1
        ) {
          // console.log("finishing transition", transition.id);
          newMarking[transition.id] = 0;
          outputNodes.forEach((outputNode) => {
            for (let i = 0; i < transition.output[outputNode.id]; i++) {
              if (
                !["infinite", "sink"].includes(places[outputNode.id].tokens)
              ) {
                newMarking[outputNode.id] += 1;
              }
              transitionedPlaces.push(outputNode.id);
            }
          });
          newMarking[transition.id] = 0;
          // newTransitions[transition.id].active = false;
          update = true;
        } else if (
          !newMarking[transition.id] &&
          inputNodes.length > 0 &&
          inputNodes.every(
            (inputNode) =>
              inputNode.tokens === "infinite" ||
              newMarking[inputNode.id] >= transition.input[inputNode.id]
          )
        ) {
          // console.log("starting transition");
          inputNodes.forEach((inputNode) => {
            for (let i = 0; i < transition.input[inputNode.id]; i++) {
              if (places[inputNode.id].tokens !== "infinite") {
                newMarking[inputNode.id] -= 1;
              }
            }
          });
          // newTransitions[transition.id].active = true;
          newMarking[transition.id] = 0.001;

          update = true;
        }
      });
      if (update) {
        // console.log(newTransitions);
        const handle = setTimeout(() => {
          // console.log({ newMarking });
          setMarking(newMarking);
          // setPlaces(newPlaces);
          // setTransitions(newTransitions);
        }, 100);
        return () => {
          clearTimeout(handle);
        };
      }
    }
    return undefined;
  }, [simulating, places, transitions, marking]);

  const onNodesChange = (changes) => {
    let newPlaces = cloneDeep(places);
    let newTransitions = cloneDeep(transitions);
    changes.forEach((change) => {
      if (change.type === "position" && change.dragging) {
        if (newPlaces[change.id]) {
          newPlaces[change.id].position = change.position;
        } else if (newTransitions[change.id]) {
          newTransitions[change.id].position = change.position;
        }
      }
    });
    setPlaces(newPlaces);
    setTransitions(newTransitions);
  };
  
  const onConnect = (props) => {
    snapshot();
    if (places[props.source] && places[props.target]) {
      const id = uuid4();
      const newTransition = {
        id,
        name: "New Transition",
        input: { [props.source]: 1 },
        output: { [props.target]: 1 },
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
        time: 1,
        active: false,
      };
      const newTransitions = {
        ...transitions,
        [id]: newTransition,
      };
      setTransitions(newTransitions);
    } else if (places[props.source] && transitions[props.target]) {
      let currentTransition = transitions[props.target];
      if (!currentTransition.input[props.source]) {
        currentTransition.input[props.source] = 1;
        const newTransitions = {
          ...transitions,
          [currentTransition.id]: currentTransition,
        };
        setTransitions(newTransitions);
      }
    } else if (transitions[props.source] && places[props.target]) {
      let currentTransition = transitions[props.source];
      if (!currentTransition.output[props.target]) {
        currentTransition.output[props.target] = 1;
        const newTransitions = {
          ...transitions,
          [currentTransition.id]: currentTransition,
        };
        setTransitions(newTransitions);
      }
    }
  };

  const handlePaneClick = (event) => {
    if (addMode && reactFlowInstance) {
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const id = uuid4();
      setPlaces({
        ...places,
        [id]: {
          id,
          name: "New Place",
          position,
          tokens: "finite",
        },
      });
      setAddMode(false);
      setSelectedNode(id);
      setInitialMarking({ ...initialMarking, [id]: 0 });
    } else {
      setSelectedNode(null);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        ref={reactFlowWrapper}
        className="App"
        style={{ height: "100%", width: "100%" }}
      >
        <ReactFlow
          proOptions={{ hideAttribution: true }}
          onPaneClick={handlePaneClick}
          onInit={(instance) => setReactFlowInstance(instance)}
          nodes={nodeList}
          edges={edgeList}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView={{ padding: 10 }}
          onNodesChange={onNodesChange}
          onNodeDragStart={snapshot}
          connectionLineComponent={FloatingEdgePreview}
          onConnect={onConnect}
          //onEdgesChange={onEdgesChange}
          connectionMode={ConnectionMode.Loose}
          style={{ backgroundColor: "#333" }}
          snapGrid={[10, 20]}
          snapToGrid
        >
          <Background variant="dots" gap={24} size={1} />
          <Panel position="top-left">
            <TextField
              aria-label="Petri Net Name"
              label="Petri Net Name"
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="filled"
            />
          </Panel>
          <Panel position="bottom-left">
            <IconButton
              disabled={!canUndo}
              aria-label="Undo"
              onClick={undo}
            >
              <FiRotateCcw />
            </IconButton>
            <IconButton
              disabled={!canRedo}
              aria-label="Redo"
              onClick={redo}
            >
              <FiRotateCw />
            </IconButton>
          </Panel>
          <Panel position="bottom-right">
            <ClickAwayListener onClickAway={() => setPalette(false)}>
              <Stack direction="column" spacing={1} alignItems="end">
                <AnimatePresence>
                  {palette && (
                    <MotionStack
                      spacing={1}
                      direction="column"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      style={{
                        backgroundColor: "#77777777",
                        padding: 15,
                        borderRadius: 10,
                      }}
                    >
                      <MuiColorInput
                        key="start"
                        aria-label="Start Color Selector"
                        label="Start"
                        size="small"
                        value={startColor}
                        onChange={(v) => setStartColor(v)}
                        isAlphaHidden
                      />
                      <MuiColorInput
                        key="end"
                        aria-label="End Color Selector"
                        label="End"
                        size="small"
                        value={endColor}
                        onChange={(v) => setEndColor(v)}
                        isAlphaHidden
                      />
                    </MotionStack>
                  )}
                </AnimatePresence>
                <Tooltip title="Set Colors" className='no-outline'>
                  <IconButton
                    aria-label="Toggle Color Selector"
                    color={palette ? "primary" : "default"}
                    onClick={() => setPalette(!palette)}
                  >
                    <FaPalette />
                  </IconButton>
                </Tooltip>
              </Stack>
            </ClickAwayListener>
          </Panel>
          <Panel position="top-right">
            <Tooltip title="Restart" className='no-outline'>
              <span>
                <IconButton
                  aria-label="Restart Simulation"
                  variant="outlined"
                  disabled={simulating}
                  onClick={() => {
                    setMarking(initialMarking);
                  }}
                >
                  <FiRewind className='no-outline'/>
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={simulating ? "Pause" : "Play"} className='no-outline'>
              <IconButton
                aria-label="Pause/Play Simulation Toggle"
                variant="outlined"
                onClick={() => {
                  if (simulating) {
                    setSimulating(false);
                  } else {
                    setSimulating(true);
                  }
                }}
              >
                {simulating ? <FiPause /> : <FiPlay />}
              </IconButton>
            </Tooltip>
            <Tooltip title={addMode ? "Cancel" : "Add a Place"} className='no-outline'>
              <IconButton
                variant="outlined"
                color={addMode ? "primary" : "default"}
                onClick={() => setAddMode(!addMode)}
              >
                <FiPlus />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy to Clipboard" className='no-outline'>
              <IconButton
                aria-label="Copy Petri Net to Clipboard"
                variant="outlined"
                onClick={() => {
                  console.log("Copying to Clipboard");
                  copyTextToClipboard(
                    JSON.stringify({
                      marking: initialMarking,
                      places,
                      transitions,
                    })
                  );
                }}
              >
                <FiCopy />
              </IconButton>
            </Tooltip>
            <Tooltip title="Upload / Download" className='no-outline'>
              <IconButton
                aria-label="Open modal to upload or download a Petri Net"
                variant="outlined"
                onClick={() => {
                  setSaveModal(!saveModal);
                }}
              >
                <FiFileText />
              </IconButton>
            </Tooltip>
          </Panel>
        </ReactFlow>
        <Modal open={saveModal} onClose={() => setSaveModal(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 500,
              pt: 2,
              px: 4,
              pb: 3,
            }}
          >
            <Card>
              <CardHeader
                title="Upload / Download"
                action={
                  <Tooltip title="Close Modal" className='no-outline'>
                    <IconButton
                      aria-label="Close Modal"
                      onClick={() => setSaveModal(false)}
                    >
                      <FiX />
                    </IconButton>
                  </Tooltip>
                }
              />
              <CardContent>Save or Upload your Petri Net</CardContent>
              <CardActions>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={upload}
                  style={{ display: "none" }}
                />
                <Button
                  className='no-outline'
                  variant="outlined"
                  aria-label="Upload File"
                  icon={<FiUpload />}
                  style={{ flex: 1 }}
                  onClick={handleUploadClick}
                >
                  Upload
                </Button>
                <Button
                  className='no-outline'
                  aria-label="Download File"
                  variant="outlined"
                  icon={<FiDownload />}
                  style={{ flex: 1 }}
                  label="Download"
                  onClick={download}
                >
                  Download
                </Button>
              </CardActions>
            </Card>
          </Box>
        </Modal>
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
