import { useEffect, useState, useRef } from "react";
import ReactFlow, {
  Background,
  ConnectionMode,
  ReactFlowProvider,
} from "reactflow";
import { red } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import "./App.css";
import "reactflow/dist/style.css";
import PlaceNode from "./PlaceNode";
import FloatingEdge from "./FloatingEdge";
import FloatingEdgePreview from "./FloatingEdgePreview";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
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
  addModeAtom,
  boxSelectionAtom
} from "./atom";
import TransitionNode from "./TransitionNode";
import { copyTextToClipboard, useForceLayout } from "./utils";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { cloneDeep, shuffle, mapValues, clamp, pick, range } from "lodash";
import { v4 as uuid4 } from "uuid";
import { Stack, Typography, FormControlLabel } from "@mui/material";
import {
  FiCopy,
  FiUpload,
  FiDownload,
  FiPlusCircle,
  FiPlusSquare,
} from "react-icons/fi";
import { saveAs } from "file-saver";
import YAML from "yaml";
import { MuiColorInput } from "mui-color-input";
import { Switch } from "./Switch";
import { Drawer } from "./Drawer";
import { AppBar } from "./AppBar";
import { TooltippedToolbarButton } from "./ToolbarButton";
import { Accordion, AccordionSummary, AccordionDetails } from "./Accordion";
import { PlayControls } from "./PlayControls";
import { VersionControls } from "./VersionControls";
import dagre from "dagre";

const nodeTypes = { placeNode: PlaceNode, transitionNode: TransitionNode };
const edgeTypes = {
  floating: FloatingEdge,
};

function Petri() {

  // References to the ReactFlow instance and the file input element
  const reactFlowWrapper = useRef(null);
  const fileInputRef = useRef();
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // States and atom hooks
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addMode, setAddMode] = useAtom(addModeAtom);
  const simulating = useAtomValue(simulatingAtom);
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
  const [boxSelection, setBoxSelection] = useAtom(boxSelectionAtom);
  const [highlightEdges, setHighlightEdges] = useAtom(highlightEdgesAtom);
  const [showConnectingLabels, setShowConnectingLabels] = useAtom(
    showConnectingLabelsAtom
  );
  const [useForceLayoutSetting, setUseForceLayoutSetting] =
    useAtom(useForceLayoutAtom);
  const snapshot = useSetAtom(snapshotAtom);
  const [dragging, setDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);


  // Context menu handling for adding nodes and transitions
  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
            clientX: event.clientX,
            clientY: event.clientY,
          }
        : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
          // Other native context menus might behave different.
          // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
          null
    );
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  // Hook for using force layout
  useForceLayout(dragging);

  // Theme
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
    shape: {
      borderRadius: 6.6,
    },
  });

  // Handling for downloading and uploading files
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
            var g = new dagre.graphlib.Graph();
            g.setGraph({});
            g.setDefaultEdgeLabel(function () {
              return {};
            });

            for (const [id, _place] of Object.entries(data.places)) {
              g.setNode(id, { width: 50, height: 50 });
            }
            for (const [id, _transition] of Object.entries(data.transitions)) {
              g.setNode(id, { width: 25, height: 50 });
              for (const [place, _] of Object.entries(_transition.input)) {
                g.setEdge(place, id);
              }
              for (const [place, _] of Object.entries(_transition.output)) {
                g.setEdge(id, place);
              }
            }

            dagre.layout(g);

            // let nodesPositions = forceSim.nodes();
            let positionedPlaces = mapValues(data.places, (place) => ({
              ...place,
              position: pick(
                g.node(place.id),
                // nodesPositions.find((n) => n.id == place.id),
                ["x", "y"]
              ),
            }));
            let positionedTransitions = mapValues(
              data.transitions,
              (transition) => ({
                ...transition,
                time: transition.time || 2,
                position: pick(
                  g.node(transition.id),
                  // nodesPositions.find((n) => n.id == transition.id),
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

  // This steps the simulation forward
  useEffect(() => {
    if (simulating) {
      let newMarking = cloneDeep(marking);
      let transitionedPlaces = [];
      let update = false;

      // Right now, we just naively shuffle the transitions and try to progress them
      // Future work could try to find a better ordering, using RL or search
      shuffle(Object.values(transitions)).forEach((transition) => {
        let inputNodes = Object.keys(transition.input).map(
          (inputNodeId) => places[inputNodeId]
        );
        let outputNodes = Object.keys(transition.output).map(
          (outputNodeId) => places[outputNodeId]
        );
        // If a transition is non-zero, it is active. When they are just started, 
        // they are set to 0.001, and then they are incremented by 0.1 / time. 
        // When they reach 1, they are finished, and the output places are incremented.
        if (newMarking[transition.id] > 0 && newMarking[transition.id] < 1) {
          // Transition is currently active. 
          // Progressing transition with duration specified by the time.
          newMarking[transition.id] = clamp(
            newMarking[transition.id] + 0.1 / transition.time,
            0,
            1
          );
          update = true;
        } else if (
          newMarking[transition.id] != undefined && // Transition has an entry. 
          newMarking[transition.id] === 1 // Transition is finished
        ) {
          // This transition is finished, so close it out and increment the output places.
          newMarking[transition.id] = 0;
          outputNodes.forEach((outputNode) => {
            for (let i = 0; i < transition.output[outputNode.id]; i++) {
              if (
                !["infinite", "sink"].includes(places[outputNode.id].tokens)
              ) {
                newMarking[outputNode.id]
                  ? newMarking[outputNode.id].push({ id: uuid4() })
                  : (newMarking[outputNode.id] = [{ id: uuid4() }]);
              }
              transitionedPlaces.push(outputNode.id);
            }
          });
          newMarking[transition.id] = 0;
          update = true;
        } else if (
          !newMarking[transition.id] &&  // Transition is not active
          inputNodes.length > 0 && // Transition has inputs
          inputNodes.every(
            (inputNode) =>
              inputNode.tokens === "infinite" ||
              newMarking[inputNode.id]?.length >= transition.input[inputNode.id]
          ) // All inputs have enough tokens
        ) {
          // This transition is not active, but it is ready to be started.
          inputNodes.forEach((inputNode) => {
            // Remove the needed number of tokens from the input places 
            // (unless there are unlimited at that place)
            if (places[inputNode.id].tokens !== "infinite") {
              let newTokens = [...newMarking[inputNode.id]];
              newTokens.length =
                newTokens.length - transition.input[inputNode.id];
              newMarking[inputNode.id] = newTokens;
            }
            // }
          });
          newMarking[transition.id] = 0.001;
          update = true;
        }
      });
      if (update) {
        // An update happened, so we need to update the marking.
        // This will set off a second step, since it updates the marking.
        const handle = setTimeout(() => {
          setMarking(newMarking);
        }, 100);
        return () => {
          clearTimeout(handle);
        };
      }
    }
    return undefined;
  }, [simulating, places, transitions, marking]);

  // This handles changes to transitions and places, as well as selection.
  const onNodesChange = (changes) => {
    let newPlaces = cloneDeep(places);
    let newTransitions = cloneDeep(transitions);
    let newSelection = [...boxSelection];
    changes.forEach((change) => {
      if (change.type === "position" && change.dragging) {
        if (newPlaces[change.id]) {
          newPlaces[change.id].position = change.position;
        } else if (newTransitions[change.id]) {
          newTransitions[change.id].position = change.position;
        }
      } else if (change.type === "select" && change.selected) {
        newSelection.push(change.id);
      } else if (change.type === "select" && !change.selected) {
        newSelection = newSelection.filter((id) => id !== change.id);
      }
    });
    setPlaces(newPlaces);
    setTransitions(newTransitions);
    setBoxSelection(newSelection);
  };

  // Handling the connection of nodes to other nodes
  const onConnect = (props) => {
    // Quick, make a snapshot before we change anything.
    snapshot();
    // If we connect two places, spawn a transition between them
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
      // In this case, we are connecting a place to a transition, so generate the arc.
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
      // In this case, we are connecting a transition to a place, so generate the arc.
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
    // If they are currently in add mode, add a new place.
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

  // This is the context menu for adding a place. This looks a lot like the code above.
  const handleCreatePlace = () => {
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.project({
      x: contextMenu.clientX - reactFlowBounds.left,
      y: contextMenu.clientY - reactFlowBounds.top,
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
  };

  // This is the context menu for adding a transition. This looks a lot like the code above.
  const handleCreateTransition = () => {
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.project({
      x: contextMenu.clientX - reactFlowBounds.left,
      y: contextMenu.clientY - reactFlowBounds.top,
    });
    const id = uuid4();
    setTransitions({
      ...transitions,
      [id]: {
        id,
        name: "New Transition",
        position,
        input: {},
        output: {},
        time: 1,
        active: false,
      },
    });
    setAddMode(false);
    setSelectedNode(id);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar open={sidebarOpen} onOpen={() => setSidebarOpen(!sidebarOpen)} />
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
        <Stack
          direction="row"
          spacing={1}
          justifyContent="space-around"
          sx={{
            display: {
              xs: "flex",
              sm: "flex",
              md: "none",
              padding: 3,
              marginTop: 3,
              marginBottom: 3,
            },
          }}
        >
          <PlayControls
            sx={{ display: { xs: "flex", sm: "flex", md: "none" } }}
          />
          <VersionControls
            sx={{ display: { xs: "flex", sm: "flex", md: "none" } }}
          />
        </Stack>
        <Accordion disableGutters square>
          <AccordionSummary
            // expandIcon={<FiMoreHorizontal />}
            aria-controls="style settings"
            id="color-settings-panel-header"
          >
            <Typography>Styles</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack
              direction="column"
              spacing={1}
              style={{ textAlign: "start" }}
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
              <FormControlLabel
                sx={{
                  flexDirection: "row-reverse",
                  justifyContent: "space-between",
                  backgroundColor: "#22222240",
                  padding: 0.75,
                  borderRadius: 1,
                }}
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
                sx={{
                  flexDirection: "row-reverse",
                  justifyContent: "space-between",
                  backgroundColor: "#22222240",
                  padding: 0.75,
                  borderRadius: 1,
                }}
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
                sx={{
                  flexDirection: "row-reverse",
                  justifyContent: "space-between",
                  backgroundColor: "#22222240",
                  padding: 0.75,
                  borderRadius: 1,
                }}
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
        <Menu
          open={contextMenu !== null}
          onClose={handleContextMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          <MenuItem
            onClick={() => {
              handleCreatePlace();
              handleContextMenuClose();
            }}
          >
            <ListItemIcon>
              <FiPlusCircle />
            </ListItemIcon>
            <ListItemText>Add Place</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleCreateTransition();
              handleContextMenuClose();
            }}
          >
            <ListItemIcon>
              <FiPlusSquare />
            </ListItemIcon>
            <ListItemText>Add Transition</ListItemText>
          </MenuItem>
        </Menu>
        <ReactFlow
          proOptions={{ hideAttribution: true }}
          onPaneClick={handlePaneClick}
          onInit={(instance) => setReactFlowInstance(instance)}
          nodes={nodeList}
          edges={edgeList}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView={{ padding: 100 }}
          onContextMenu={handleContextMenu}
          onNodesChange={onNodesChange}
          onNodeDragStart={() => {
            setDragging(true);
            snapshot();
          }}
          onNodeDragStop={() => {
            setDragging(false);
          }}
          onSelectionDragStart={snapshot}
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
