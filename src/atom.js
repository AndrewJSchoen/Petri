import { atom } from "jotai";
import { focusAtom } from "jotai-optics";
import { mapValues } from "lodash";

export const startColorAtom = atom("#ffcc00");

export const endColorAtom = atom("#40826D");

export const nameAtom = atom("Untitled");

const data = {
  marking: {
    "b175f4d6-9f81-4aed-8e92-138df1571478": [],
    "0ae2783d-56dd-41f5-9668-1da03522a3db": [
      { id: "725d9646-815c-4171-8261-d1dcf36a17a4" },
    ],
    c: [],
    d: [],
    "710ee10a-8a6d-4d91-8a2f-ebbc6dff7ad0": [
      { id: "fa85dbfa-812e-43a8-a1df-014734df9346" },
    ],
    "41a4c380-5507-4bc5-a318-87be79c4f692": [
      { id: "3f55e0cc-c3d6-4990-9b8c-2e828c806c8f" },
    ],
    "750169f8-4eee-4873-a6e7-f58a047383c2": [],
    "797c0c8a-f6f4-41ac-91e9-7355747396e2": [
      { id: "1937d6b5-1019-4e1b-8dc3-59aa2420bbc0" },
    ],
    "8ac6638b-b8d1-496c-a98f-aa877028ef0b": [
      { id: "b0d2d4d2-b471-424f-ad04-1020b6be8e17" },
    ],
    "74eb3e2c-72cc-473e-a28f-dfd26116b6d9": [],
    "9b484783-cb44-4b0f-9062-9f83bfa24807": [],
  },
  places: {
    "b175f4d6-9f81-4aed-8e92-138df1571478": {
      id: "b175f4d6-9f81-4aed-8e92-138df1571478",
      name: "A",
      position: { x: -270, y: 40 },
      tokens: "finite",
    },
    "0ae2783d-56dd-41f5-9668-1da03522a3db": {
      id: "0ae2783d-56dd-41f5-9668-1da03522a3db",
      name: "Agent 2 Idle",
      position: { x: 200, y: 520 },
      tokens: "finite",
    },
    "baef23d6-cd13-4efa-ad91-219ed440674c": { id: "baef23d6-cd13-4efa-ad91-219ed440674c", name: "C", position: { x: 320, y: 40 }, tokens: "finite" },
    "492b7c7d-b577-41f2-b0c3-6f238847925c": { id: "492b7c7d-b577-41f2-b0c3-6f238847925c", name: "B", position: { x: 30, y: 40 }, tokens: "finite" },
    "797c0c8a-f6f4-41ac-91e9-7355747396e2": {
      id: "797c0c8a-f6f4-41ac-91e9-7355747396e2",
      name: "Agent 1 Idle",
      position: { x: 190, y: -440 },
      tokens: "finite",
    },
    "750169f8-4eee-4873-a6e7-f58a047383c2": {
      id: "750169f8-4eee-4873-a6e7-f58a047383c2",
      name: "Spawn",
      position: { x: -560, y: 40 },
      tokens: "infinite",
    },
    "74eb3e2c-72cc-473e-a28f-dfd26116b6d9": {
      id: "74eb3e2c-72cc-473e-a28f-dfd26116b6d9",
      name: "D",
      position: { x: 630, y: 40 },
      tokens: "finite",
    },
    "710ee10a-8a6d-4d91-8a2f-ebbc6dff7ad0": {
      id: "710ee10a-8a6d-4d91-8a2f-ebbc6dff7ad0",
      name: "Limit 1",
      position: { x: -110, y: 40 },
      tokens: "finite",
    },
    "41a4c380-5507-4bc5-a318-87be79c4f692": {
      id: "41a4c380-5507-4bc5-a318-87be79c4f692",
      name: "Limit 2",
      position: { x: 190, y: 40 },
      tokens: "finite",
    },
    "8ac6638b-b8d1-496c-a98f-aa877028ef0b": {
      id: "8ac6638b-b8d1-496c-a98f-aa877028ef0b",
      name: "Limit 3",
      position: { x: 470, y: 40 },
      tokens: "finite",
    },
    "9b484783-cb44-4b0f-9062-9f83bfa24807": {
      id: "9b484783-cb44-4b0f-9062-9f83bfa24807",
      name: "Sink",
      position: { x: 900, y: 40 },
      tokens: "sink",
    },
  },
  transitions: {
    "ffbabf72-c768-4b32-aa70-ea1666268a81": {
      id: "ffbabf72-c768-4b32-aa70-ea1666268a81",
      name: "Process 1",
      input: {
        "b175f4d6-9f81-4aed-8e92-138df1571478": 1,
        "797c0c8a-f6f4-41ac-91e9-7355747396e2": 1,
        "710ee10a-8a6d-4d91-8a2f-ebbc6dff7ad0": 1,
      },
      output: {
        "492b7c7d-b577-41f2-b0c3-6f238847925c": 1,
        "797c0c8a-f6f4-41ac-91e9-7355747396e2": 1,
        "710ee10a-8a6d-4d91-8a2f-ebbc6dff7ad0": 1,
      },
      position: { x: -90, y: -240 },
      time: 10,
    },
    "fec437f0-ffdc-4272-9db9-85071f6146d5": {
      id: "fec437f0-ffdc-4272-9db9-85071f6146d5",
      name: "Process 2",
      input: {
        "492b7c7d-b577-41f2-b0c3-6f238847925c": 1,
        "797c0c8a-f6f4-41ac-91e9-7355747396e2": 1,
        "41a4c380-5507-4bc5-a318-87be79c4f692": 1,
      },
      output: {
        "baef23d6-cd13-4efa-ad91-219ed440674c": 1,
        "797c0c8a-f6f4-41ac-91e9-7355747396e2": 1,
        "41a4c380-5507-4bc5-a318-87be79c4f692": 1,
      },
      position: { x: 190, y: -220 },
      time: 5,
    },
    "d0a8509f-6777-4b35-bfd9-947ff9c51b7c": {
      id: "d0a8509f-6777-4b35-bfd9-947ff9c51b7c",
      name: "Process 1",
      input: {
        "0ae2783d-56dd-41f5-9668-1da03522a3db": 1,
        "b175f4d6-9f81-4aed-8e92-138df1571478": 1,
        "710ee10a-8a6d-4d91-8a2f-ebbc6dff7ad0": 1,
      },
      output: {
        "492b7c7d-b577-41f2-b0c3-6f238847925c": 1,
        "0ae2783d-56dd-41f5-9668-1da03522a3db": 1,
        "710ee10a-8a6d-4d91-8a2f-ebbc6dff7ad0": 1,
      },
      position: { x: -90, y: 320 },
      time: 2,
    },
    "795e2bca-07fe-4b77-9bcd-87a5ed202663": {
      id: "795e2bca-07fe-4b77-9bcd-87a5ed202663",
      name: "Process 2",
      input: {
        "0ae2783d-56dd-41f5-9668-1da03522a3db": 1,
        "492b7c7d-b577-41f2-b0c3-6f238847925c": 1,
        "41a4c380-5507-4bc5-a318-87be79c4f692": 1,
      },
      output: {
        "baef23d6-cd13-4efa-ad91-219ed440674c": 1,
        "0ae2783d-56dd-41f5-9668-1da03522a3db": 1,
        "41a4c380-5507-4bc5-a318-87be79c4f692": 1,
      },
      position: { x: 200, y: 320 },
      time: 5,
    },
    "e86d0bf4-1d14-4d08-a38b-d34ef88fbbca": {
      id: "e86d0bf4-1d14-4d08-a38b-d34ef88fbbca",
      name: "Spawn 1",
      input: { "750169f8-4eee-4873-a6e7-f58a047383c2": 1 },
      output: { "b175f4d6-9f81-4aed-8e92-138df1571478": 1 },
      position: { x: -410, y: 40 },
      time: 5,
    },
    "0a464a55-e740-4b7d-b87f-7b876d816fb1": {
      id: "0a464a55-e740-4b7d-b87f-7b876d816fb1",
      name: "Process 3",
      input: {
        "baef23d6-cd13-4efa-ad91-219ed440674c": 1,
        "797c0c8a-f6f4-41ac-91e9-7355747396e2": 1,
        "8ac6638b-b8d1-496c-a98f-aa877028ef0b": 1,
      },
      output: {
        "74eb3e2c-72cc-473e-a28f-dfd26116b6d9": 1,
        "797c0c8a-f6f4-41ac-91e9-7355747396e2": 1,
        "8ac6638b-b8d1-496c-a98f-aa877028ef0b": 1,
      },
      position: { x: 470, y: -240 },
      time: 10,
    },
    "6c6b27bd-883a-4720-91a8-6ebf8aacdf9a": {
      id: "6c6b27bd-883a-4720-91a8-6ebf8aacdf9a",
      name: "Process 3",
      input: {
        "0ae2783d-56dd-41f5-9668-1da03522a3db": 1,
        "baef23d6-cd13-4efa-ad91-219ed440674c": 1,
        "8ac6638b-b8d1-496c-a98f-aa877028ef0b": 1,
      },
      output: {
        "74eb3e2c-72cc-473e-a28f-dfd26116b6d9": 1,
        "0ae2783d-56dd-41f5-9668-1da03522a3db": 1,
        "8ac6638b-b8d1-496c-a98f-aa877028ef0b": 1,
      },
      position: { x: 470, y: 320 },
      time: 5,
    },
    "3ef63e0d-2737-4548-ac17-0dfb48fc4d19": {
      id: "3ef63e0d-2737-4548-ac17-0dfb48fc4d19",
      name: "Finish",
      input: { "74eb3e2c-72cc-473e-a28f-dfd26116b6d9": 1 },
      output: { "9b484783-cb44-4b0f-9062-9f83bfa24807": 1 },
      position: { x: 780, y: 40 },
      time: 25,
    },
  },
};

export const selectedNodeAtom = atom(null);
export const boxSelectionAtom = atom([]);
export const addModeAtom = atom(false);
export const highlightEdgesAtom = atom(true);
export const useForceLayoutAtom = atom(false);
export const showConnectingLabelsAtom = atom(true);
// export const taxonomyAtom = atom({});

export const appAtom = atom({
  past: [],
  current: {
    places: data.places,
    transitions: data.transitions,
    initialMarking: data.marking,
    marking: data.marking,
  },
  future: [],
});

export const undoAtom = atom(null, (_get, set) => {
  set(appAtom, function undoReducer(app) {
    let newPast = [...app.past];
    const newCurrent = newPast.pop();
    const newFuture = [app.current, ...app.future];
    return { past: newPast, current: newCurrent, future: newFuture };
  });
});

export const redoAtom = atom(null, (_get, set) => {
  set(appAtom, function redoReducer(app) {
    const [newCurrent, ...newFuture] = [...app.future];
    const newPast = [...app.past, app.current];
    return { past: newPast, current: newCurrent, future: newFuture };
  });
});

export const snapshotAtom = atom(null, (_get, set) => {
  set(appAtom, function snapshotReducer(app) {
    let newPast = [...app.past, app.current];
    if (newPast.length > 30) {
      newPast = newPast.slice(1);
    }
    return { past: newPast, current: app.current, future: [] };
  });
});

export const placesAtom = focusAtom(appAtom, (optic) =>
  optic.prop("current").prop("places")
);
export const transitionsAtom = focusAtom(appAtom, (optic) =>
  optic.prop("current").prop("transitions")
);
export const initialMarkingAtom = focusAtom(appAtom, (optic) =>
  optic.prop("current").prop("initialMarking")
);
export const markingAtom = focusAtom(appAtom, (optic) =>
  optic.prop("current").prop("marking")
);

export const canUndoAtom = atom((get) => get(appAtom).past.length > 0);
export const canRedoAtom = atom((get) => get(appAtom).future.length > 0);

export const simulatingAtom = atom(false);

export const nodesAtom = atom((get) => {
  const boxSelection = get(boxSelectionAtom);
  return ({
  ...mapValues(get(placesAtom), (place) => ({
    id: place.id,
    type: "placeNode",
    position: place.position,
    selected: boxSelection.includes(place.id),
    // data: { label: place.name, tokens: place.tokens },
  })),
  ...mapValues(get(transitionsAtom), (transition) => ({
    id: transition.id,
    type: "transitionNode",
    dragHandle: ".transition-drag-handle",
    position: transition.position,
    selected: boxSelection.includes(transition.id),
    // data: { label: transition.name, active: transition.active },
  })),
})});

export const edgesAtom = atom((get) => {
  let edges = {};
  Object.values(get(transitionsAtom)).forEach((transition) => {
    Object.keys(transition.input).forEach((inputKey) => {
      edges[transition.id + "--" + inputKey] = {
        id: transition.id + "--" + inputKey,
        source: inputKey,
        target: transition.id,
        sourceHandle: "out",
        targetHandle: "in",
        type: "floating",
        markerEnd: { type: "arrowclosed" },
      };
    });
    Object.keys(transition.output).forEach((outputKey) => {
      edges[outputKey + "--" + transition.id] = {
        id: outputKey + "--" + transition.id,
        source: transition.id,
        target: outputKey,
        sourceHandle: "out",
        targetHandle: "in",
        type: "floating",
        markerEnd: { type: "arrowclosed" },
      };
    });
  });
  return edges;
});

export const selectedAdjacentsAtom = atom((get) => {
  if (!get(showConnectingLabelsAtom)) {
    return [];
  }
  const transitions = get(transitionsAtom);
  const places = get(placesAtom);
  const selectedNode = get(selectedNodeAtom);
  let adjacents = [];
  if (selectedNode && places[selectedNode]) {
    Object.values(transitions).forEach((transition) => {
      if (
        Object.keys(transition.input).some((k) => k === selectedNode) ||
        Object.keys(transition.output).some((k) => k === selectedNode)
      ) {
        adjacents.push(transition.id);
      }
    });
  } else if (selectedNode && transitions[selectedNode]) {
    adjacents = [
      ...Object.keys(transitions[selectedNode].input),
      ...Object.keys(transitions[selectedNode].output),
    ];
  }
  return adjacents;
});

export const transitionArrangementsAtom = atom((get) => {
  const transitions = get(transitionsAtom);
  const places = get(placesAtom);
  return mapValues(transitions, (transition) => {
    const inputKeys = Object.keys(transition.input);
    const outputKeys = Object.keys(transition.output);
    const angles = [
      ...inputKeys.map(
        (k) =>
          (Math.atan2(
            transition.position.y - places[k].position.y,
            transition.position.x - places[k].position.x
          ) *
            180) /
          Math.PI
      ),
      ...outputKeys.map(
        (k) =>
          (Math.atan2(
            places[k].position.y - transition.position.y,
            places[k].position.x - transition.position.x
          ) *
            180) /
          Math.PI
      ),
    ];

    const angle = angles.reduce((a, b) => a + b, 0) / angles.length;

    const sourceX =
      inputKeys
        .map((placeId) => places[placeId].position.x)
        .reduce((a, b) => a + b, 0) / inputKeys.length;
    const sourceY =
      inputKeys
        .map((placeId) => places[placeId].position.y)
        .reduce((a, b) => a + b, 0) / inputKeys.length;
    const targetX =
      outputKeys
        .map((placeId) => places[placeId].position.x)
        .reduce((a, b) => a + b, 0) / outputKeys.length;
    const targetY =
      outputKeys
        .map((placeId) => places[placeId].position.y)
        .reduce((a, b) => a + b, 0) / outputKeys.length;
    //(Math.atan2(targetY - sourceY, targetX - sourceX) * 180) / Math.PI;
    return {
      sourceX,
      sourceY,
      targetX,
      targetY,
      angle,
    };
  });
});

export const nodeListAtom = atom((get) => Object.values(get(nodesAtom)));

export const edgeListAtom = atom((get) => Object.values(get(edgesAtom)));
