import { useEffect, useState, useRef } from "react";
import ReactFlow, {
  Background,
  ConnectionMode,
  ReactFlowProvider,
} from "reactflow";
import { red } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";
import "./App.css";
import "reactflow/dist/style.css";
import PlaceNode from "./PlaceNode";
import FloatingEdge from "./FloatingEdge";
import FloatingEdgePreview from "./FloatingEdgePreview";
import { useAtom, useSetAtom } from "jotai";
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
  snapshotAtom,
  highlightEdgesAtom,
  showConnectingLabelsAtom,
  useForceLayoutAtom,
} from "./atom";
import TransitionNode from "./TransitionNode";
import { copyTextToClipboard, useForceLayout } from "./utils";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { cloneDeep, shuffle, mapValues, clamp, pick, range } from "lodash";
import { v4 as uuid4 } from "uuid";
import {
  Stack,
  Typography,
  FormControlLabel,
} from "@mui/material";
import {
  FiCopy,
  FiUpload,
  FiDownload,
} from "react-icons/fi";
import { saveAs } from "file-saver";
import YAML from "yaml";
import { forceSimulation } from "d3-force";
import { forceManyBody, forceLink } from "d3-force";
import { MuiColorInput } from "mui-color-input";
import { Switch } from "./Switch";
import { Drawer } from "./Drawer";
import { AppBar } from "./AppBar";
import { TooltippedToolbarButton } from "./ToolbarButton";
import { Accordion, AccordionSummary, AccordionDetails } from "./Accordion";

const nodeTypes = { placeNode: PlaceNode, transitionNode: TransitionNode };
const edgeTypes = {
  floating: FloatingEdge,
};

function Petri() {
  const reactFlowWrapper = useRef(null);
  const fileInputRef = useRef();
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const [highlightEdges, setHighlightEdges] = useAtom(highlightEdgesAtom);
  const [showConnectingLabels, setShowConnectingLabels] = useAtom(
    showConnectingLabelsAtom
  );
  const [useForceLayoutSetting, setUseForceLayoutSetting] =
    useAtom(useForceLayoutAtom);
  const snapshot = useSetAtom(snapshotAtom);

  const [dragging, setDragging] = useState(false);

  useForceLayout(dragging);

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
        console.log(data)
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

          setMarking(mapValues(data.marking || data.initial_marking || {}, (v)=>{
            if (typeof v == "number") {
              return range(v).map(_=>({id: uuid4()}));
            } else if (typeof v == "object") {
              return v;
            }
          }));
          setInitialMarking(mapValues(data.initial_marking || data.marking || {}, (v)=>{
            if (typeof v == "number") {
              return range(v).map(_=>({id: uuid4()}));
            } else if (typeof v == "object") {
              return v;
            }
          }));
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
                newMarking[outputNode.id] ? newMarking[outputNode.id].push({id:uuid4()}) : newMarking[outputNode.id] = [{id:uuid4()}];
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
              newMarking[inputNode.id]?.length >= transition.input[inputNode.id]
          )
        ) {
          console.log("starting transition");
          inputNodes.forEach((inputNode) => {
            // for (let i = 0; i < transition.input[inputNode.id]; i++) {
              if (places[inputNode.id].tokens !== "infinite") {
                let newTokens = [...newMarking[inputNode.id]];
                newTokens.length = newTokens.length - transition.input[inputNode.id];
                newMarking[inputNode.id] = newTokens;
              }
            // }
          });
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
      <AppBar
        open={sidebarOpen}
        onOpen={setSidebarOpen}
        addMode={addMode}
        onSetAddMode={setAddMode}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={upload}
        style={{ display: "none" }}
      />
      <Drawer
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        footerActions={
          <>
            <TooltippedToolbarButton
              title="Upload File"
              flex
              onClick={handleUploadClick}
            >
              <FiUpload />
            </TooltippedToolbarButton>
            <TooltippedToolbarButton title="Download File" onClick={download}>
              <FiDownload />
            </TooltippedToolbarButton>
            <TooltippedToolbarButton
              title="Copy to Clipboard"
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
            </TooltippedToolbarButton>
          </>
        }
      >
        <Accordion disableGutters square>
          <AccordionSummary
            // expandIcon={<FiMoreHorizontal />}
            aria-controls="style settings"
            id="color-settings-panel-header"
          >
            <Typography>Styles</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction="column" spacing={1} style={{textAlign:'start'}}>
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
              <FormControlLabel
                sx={{flexDirection:'row-reverse', justifyContent:'space-between',backgroundColor:'#22222240', padding: 0.75, borderRadius: 1}}
                control={
                  <Switch
                    sx={{ marginLeft: 2 }}
                    checked={highlightEdges}
                    onChange={(e) => setHighlightEdges(e.target.checked)}
                  />
                }
                checked={highlightEdges}
                label="Highlight Connecting Edges"
                labelPlacement="start"
              />
              <FormControlLabel
                sx={{flexDirection:'row-reverse', justifyContent:'space-between',backgroundColor:'#22222240', padding: 0.75, borderRadius: 1}}
                control={
                  <Switch
                    sx={{ marginLeft: 2 }}
                    checked={showConnectingLabels}
                    onChange={(e) => setShowConnectingLabels(e.target.checked)}
                  />
                }
                checked={highlightEdges}
                label="Label Connecting Nodes"
                labelPlacement="start"
              />
              <FormControlLabel
                sx={{flexDirection:'row-reverse', justifyContent:'space-between',backgroundColor:'#22222240', padding: 0.75, borderRadius: 1}}
                control={
                  <Switch
                    sx={{ marginLeft: 2 }}
                    checked={useForceLayoutSetting}
                    onChange={(e) => setUseForceLayoutSetting(e.target.checked)}
                  />
                }
                checked={highlightEdges}
                label="Use Force Layout"
                labelPlacement="start"
              />
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Drawer>
      <div ref={reactFlowWrapper} style={{ width: "100%", height: "100%" }}>
        <ReactFlow
          proOptions={{ hideAttribution: true }}
          onPaneClick={handlePaneClick}
          onInit={(instance) => setReactFlowInstance(instance)}
          nodes={nodeList}
          edges={edgeList}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView={{ padding: 100 }}
          onNodesChange={onNodesChange}
          onNodeDragStart={() => {
            setDragging(true);
            snapshot();
          }}
          onNodeDragStop={() => {
            setDragging(false);
          }}
          connectionLineComponent={FloatingEdgePreview}
          onConnect={onConnect}
          connectionMode={ConnectionMode.Loose}
          style={{ backgroundColor: "#333" }}
          snapGrid={[10, 20]}
          snapToGrid
        >
          <Background variant="dots" gap={24} size={1} />
          
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
