import { useEffect, useState, useRef } from "react";
import ReactFlow, {
  Background,
  ConnectionMode,
  Panel,
  ReactFlowProvider,
} from "reactflow";
import "./App.css";
import "reactflow/dist/style.css";
import PlaceNode from "./PlaceNode";
import FloatingEdge from "./FloatingEdge";
import FloatingEdgePreview from "./FloatingEdgePreview";
import { useAtom, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import {
  nameAtom,
  placesAtom,
  transitionsAtom,
  nodeListAtom,
  edgeListAtom,
  selectedNodeAtom,
  markingAtom,
  initialMarkingAtom,
  simulatingAtom
} from "./atom";
import TransitionNode from "./TransitionNode";
import { copyTextToClipboard } from "./utils";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
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
} from "@mui/material";
import {
  FiCopy,
  FiFileText,
  FiPauseCircle,
  FiPlayCircle,
  FiPlusCircle,
  FiRotateCcw,
  FiUpload,
  FiDownload,
  FiX,
} from "react-icons/fi";
import { saveAs } from "file-saver";
import YAML from "yaml";
import { forceSimulation } from "d3-force";
import { forceManyBody, forceLink } from "d3-force";

const nodeTypes = { placeNode: PlaceNode, transitionNode: TransitionNode };
const edgeTypes = {
  floating: FloatingEdge,
};

const mergePositions = (nodeList, positions) => {
  return nodeList.map((node) => ({
    ...node,
    position: { x: positions[node.id]?.x, y: positions[node.id]?.y },
  }));
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
  const resetMarking = useResetAtom(markingAtom);
  const [marking, setMarking] = useAtom(markingAtom);
  const [initialMarking, setInitialMarking] = useAtom(initialMarkingAtom);

  const [saveModal, setSaveModal] = useState(false);
  // const [forceSim, setForceSim] = useState(()=>{
  //   console.log("creating force sim");
  //   const forceSim = forceSimulation(nodeList).force("charge", forceManyBody().strength(-500));
  //   forceSim.tick();
  //   return forceSim;
  // });
  // const [positions, setPositions] = useState(()=>{
  //   let positions = {};
  //   forceSim.nodes().forEach(n=>{
  //     positions[n.id] = {x: n.x, y: n.y}
  //   })
  //   return positions;
  // });

  // useEffect(()=>{
  //   console.log("Running tick");
  //   forceSim.tick();
  //   let newPositions = {};
  //   forceSim.nodes().forEach(n=>{
  //     newPositions[n.id] = {x: n.x, y: n.y}
  //   });
  //   console.log(forceSim.nodes()[0])
  //   // setPositions(newPositions);
  //   // forceSim.nodes().forEach(node=>{
  //   //   setPositions({...positions, [node.id]: {x: node.x, y: node.y}})
  //   // })
  // },[positions,nodeList.length,edgeList.length])

  const download = () => {
    const text = JSON.stringify({ name, places, transitions, marking });

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
          if (Object.values(data.places).some(p=>!p.position) || Object.values(data.transitions).some(t=>!t.position)) {
            let nodes = [
              ...Object.values(data.places).map((p) => ({id: p.id, x: p.position?.x, y: p.position?.y})),
              ...Object.values(data.transitions).map((t) => ({id: t.id, x: t.position?.x, y: t.position?.y}))
            ];
            let links = [];
            Object.values(data.transitions).forEach((t) => {
              Object.keys(t.input).forEach((p) => {
                const source = nodes.findIndex(n=>n.id==p);
                const target = nodes.findIndex(n=>n.id==t.id);
                links.push({ source, target });
              });
              Object.keys(t.output).forEach((p) => {
                const target = nodes.findIndex(n=>n.id==p);
                const source = nodes.findIndex(n=>n.id==t.id);
                links.push({ source, target });
              });
            });
            // Use D3-Force to find a good layout
            let forceSim = forceSimulation(nodes)
              .force("charge", forceManyBody().strength(-500))
              .force('link', forceLink().links(links));
            forceSim.tick(100);

            let nodesPositions = forceSim.nodes();
            let positionedPlaces = mapValues(data.places, (place) => ({
              ...place,
              position: pick(nodesPositions.find((n) => n.id == place.id),["x","y"]),
            }));
            let positionedTransitions = mapValues(data.transitions, (transition) => ({
              ...transition,
              time: transition.time || 2,
              position: pick(nodesPositions.find((n) => n.id == transition.id),["x","y"]),
            }));

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

  useEffect(()=>{
    setMarking(initialMarking);
  },[initialMarking])

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
            newMarking[transition.id] + 1 / transition.time,
            0,
            1
          );
          update = true;
        } else if (newMarking[transition.id] != undefined && newMarking[transition.id] === 1) {
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
        }, 1000);
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
        active: false,
      };
      setTransitions({
        ...transitions,
        [id]: newTransition,
      });
    } else if (places[props.source] && transitions[props.target]) {
      let currentTransition = transitions[props.target];
      if (!currentTransition.input[props.source]) {
        currentTransition.input[props.source] = 1;
        setTransitions({
          ...transitions,
          [currentTransition.id]: currentTransition,
        });
      }
    } else if (transitions[props.source] && places[props.target]) {
      let currentTransition = transitions[props.source];
      if (!currentTransition.output[props.target]) {
        currentTransition.output[props.target] = 1;
        setTransitions({
          ...transitions,
          [currentTransition.id]: currentTransition,
        });
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
          tokens: [],
        },
      });
      setAddMode(false);
      setSelectedNode(id);
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
          onPaneClick={handlePaneClick}
          onInit={(instance) => setReactFlowInstance(instance)}
          nodes={nodeList}
          edges={edgeList}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView={{ padding: 10 }}
          onNodesChange={onNodesChange}
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
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="filled"
            />
          </Panel>
          <Panel position="top-right">
            <IconButton
              variant="outlined"
              disabled={simulating}
              onClick={() => {
                setMarking(initialMarking);
                // resetPlaces();
                // resetTransitions();
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
            <IconButton
              color={addMode ? "primary" : "default"}
              onClick={() => setAddMode(!addMode)}
            >
              <FiPlusCircle />
            </IconButton>
            <IconButton
              variant="outlined"
              onClick={() => {
                console.log("Copying to Clipboard");
                copyTextToClipboard(JSON.stringify({ marking, places, transitions }));
              }}
            >
              <FiCopy />
            </IconButton>
            <IconButton
              variant="outlined"
              onClick={() => {
                setSaveModal(!saveModal);
              }}
            >
              <FiFileText />
            </IconButton>
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
                  <IconButton onClick={() => setSaveModal(false)}>
                    <FiX />
                  </IconButton>
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
                  variant="outlined"
                  icon={<FiUpload />}
                  style={{ flex: 1 }}
                  onClick={handleUploadClick}
                >
                  Upload
                </Button>
                <Button
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
