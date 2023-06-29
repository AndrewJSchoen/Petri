import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";
import { mapValues, cloneDeep, range } from "lodash";

export const tokens = atom({});

export const startColorAtom = atom("#ffcc00");

export const endColorAtom = atom("#40826D");

export const nameAtom = atom("Untitled");

const data = {
  marking: {
    a: 0,
    b: 1,
    c: 0,
    d: 0,
    "710ee10a-8a6d-4d91-8a2f-ebbc6dff7ad0": 1,
    "41a4c380-5507-4bc5-a318-87be79c4f692": 1,
    "750169f8-4eee-4873-a6e7-f58a047383c2": 0,
    "797c0c8a-f6f4-41ac-91e9-7355747396e2": 1,
    "8ac6638b-b8d1-496c-a98f-aa877028ef0b": 1,
    "74eb3e2c-72cc-473e-a28f-dfd26116b6d9": 0,
    "9b484783-cb44-4b0f-9062-9f83bfa24807": 0,
  },
  places: {
    a: { id: "a", name: "A", position: { x: -50, y: 40 }, tokens: "finite" },
    b: {
      id: "b",
      name: "Agent 2 Idle",
      position: { x: 190, y: 200 },
      tokens: "finite",
    },
    c: { id: "c", name: "C", position: { x: 260, y: 40 }, tokens: "finite" },
    d: { id: "d", name: "B", position: { x: 120, y: 40 }, tokens: "finite" },
    "797c0c8a-f6f4-41ac-91e9-7355747396e2": {
      id: "797c0c8a-f6f4-41ac-91e9-7355747396e2",
      name: "Agent 1 Idle",
      position: { x: 190, y: -120 },
      tokens: "finite",
    },
    "750169f8-4eee-4873-a6e7-f58a047383c2": {
      id: "750169f8-4eee-4873-a6e7-f58a047383c2",
      name: "Spawn",
      position: { x: -180, y: 40 },
      tokens: "infinite",
    },
    "74eb3e2c-72cc-473e-a28f-dfd26116b6d9": {
      id: "74eb3e2c-72cc-473e-a28f-dfd26116b6d9",
      name: "D",
      position: { x: 410, y: 40 },
      tokens: "finite",
    },
    "710ee10a-8a6d-4d91-8a2f-ebbc6dff7ad0": {
      id: "710ee10a-8a6d-4d91-8a2f-ebbc6dff7ad0",
      name: "Limit 1",
      position: { x: 40, y: 40 },
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
      position: { x: 340, y: 40 },
      tokens: "finite",
    },
    "9b484783-cb44-4b0f-9062-9f83bfa24807": {
      id: "9b484783-cb44-4b0f-9062-9f83bfa24807",
      name: "Sink",
      position: { x: 530, y: 40 },
      tokens: "sink",
    },
  },
  transitions: {
    "ffbabf72-c768-4b32-aa70-ea1666268a81": {
      id: "ffbabf72-c768-4b32-aa70-ea1666268a81",
      name: "Process 1",
      input: {
        a: 1,
        "797c0c8a-f6f4-41ac-91e9-7355747396e2": 1,
        "710ee10a-8a6d-4d91-8a2f-ebbc6dff7ad0": 1,
      },
      output: {
        d: 1,
        "797c0c8a-f6f4-41ac-91e9-7355747396e2": 1,
        "710ee10a-8a6d-4d91-8a2f-ebbc6dff7ad0": 1,
      },
      position: { x: 50, y: -40 },
      time: 10,
    },
    "fec437f0-ffdc-4272-9db9-85071f6146d5": {
      id: "fec437f0-ffdc-4272-9db9-85071f6146d5",
      name: "Process 2",
      input: {
        d: 1,
        "797c0c8a-f6f4-41ac-91e9-7355747396e2": 1,
        "41a4c380-5507-4bc5-a318-87be79c4f692": 1,
      },
      output: {
        c: 1,
        "797c0c8a-f6f4-41ac-91e9-7355747396e2": 1,
        "41a4c380-5507-4bc5-a318-87be79c4f692": 1,
      },
      position: { x: 200, y: -40 },
      time: 5,
    },
    "d0a8509f-6777-4b35-bfd9-947ff9c51b7c": {
      id: "d0a8509f-6777-4b35-bfd9-947ff9c51b7c",
      name: "Process 1",
      input: { b: 1, a: 1, "710ee10a-8a6d-4d91-8a2f-ebbc6dff7ad0": 1 },
      output: { d: 1, b: 1, "710ee10a-8a6d-4d91-8a2f-ebbc6dff7ad0": 1 },
      position: { x: 50, y: 120 },
      time: 2,
    },
    "795e2bca-07fe-4b77-9bcd-87a5ed202663": {
      id: "795e2bca-07fe-4b77-9bcd-87a5ed202663",
      name: "Process 2",
      input: { b: 1, d: 1, "41a4c380-5507-4bc5-a318-87be79c4f692": 1 },
      output: { c: 1, b: 1, "41a4c380-5507-4bc5-a318-87be79c4f692": 1 },
      position: { x: 200, y: 120 },
      time: 5,
    },
    "e86d0bf4-1d14-4d08-a38b-d34ef88fbbca": {
      id: "e86d0bf4-1d14-4d08-a38b-d34ef88fbbca",
      name: "750169F8-4EEE-4873-A6E7-F58A047383C2->A",
      input: { "750169f8-4eee-4873-a6e7-f58a047383c2": 1 },
      output: { a: 1 },
      position: { x: -100, y: 40 },
      time: 5,
    },
    "0a464a55-e740-4b7d-b87f-7b876d816fb1": {
      id: "0a464a55-e740-4b7d-b87f-7b876d816fb1",
      name: "Process 3",
      input: {
        c: 1,
        "797c0c8a-f6f4-41ac-91e9-7355747396e2": 1,
        "8ac6638b-b8d1-496c-a98f-aa877028ef0b": 1,
      },
      output: {
        "74eb3e2c-72cc-473e-a28f-dfd26116b6d9": 1,
        "797c0c8a-f6f4-41ac-91e9-7355747396e2": 1,
        "8ac6638b-b8d1-496c-a98f-aa877028ef0b": 1,
      },
      position: { x: 350, y: -40 },
      time: 10,
    },
    "6c6b27bd-883a-4720-91a8-6ebf8aacdf9a": {
      id: "6c6b27bd-883a-4720-91a8-6ebf8aacdf9a",
      name: "Process 3",
      input: { b: 1, c: 1, "8ac6638b-b8d1-496c-a98f-aa877028ef0b": 1 },
      output: {
        "74eb3e2c-72cc-473e-a28f-dfd26116b6d9": 1,
        b: 1,
        "8ac6638b-b8d1-496c-a98f-aa877028ef0b": 1,
      },
      position: { x: 350, y: 120 },
      time: 5,
    },
    "3ef63e0d-2737-4548-ac17-0dfb48fc4d19": {
      id: "3ef63e0d-2737-4548-ac17-0dfb48fc4d19",
      name: "Finish",
      input: { "74eb3e2c-72cc-473e-a28f-dfd26116b6d9": 1 },
      output: { "9b484783-cb44-4b0f-9062-9f83bfa24807": 1 },
      position: { x: 480, y: 40 },
      time: 25,
    },
  },
};

export const selectedNodeAtom = atom(null);

export const placesAtom = atomWithReset(data.places);

export const transitionsAtom = atomWithReset(data.transitions);

export const initialMarkingAtom = atom(data.marking)

export const markingAtom = atom(data.marking);

export const simulatingAtom = atom(false);

export const nodesAtom = atom((get) => ({
  ...mapValues(get(placesAtom), (place) => ({
    id: place.id,
    type: "placeNode",
    position: place.position,
    // data: { label: place.name, tokens: place.tokens },
  })),
  ...mapValues(get(transitionsAtom), (transition) => ({
    id: transition.id,
    type: "transitionNode",
    dragHandle: ".transition-drag-handle",
    position: transition.position,
    // data: { label: transition.name, active: transition.active },
  })),
}));

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

export const transitionArrangementsAtom = atom((get) => {
  const transitions = get(transitionsAtom);
  const places = get(placesAtom);
  return mapValues(transitions, (transition) => {
    const inputKeys = Object.keys(transition.input);
    const outputKeys = Object.keys(transition.output);
    const angles = [
      ...inputKeys.map(k=>(Math.atan2(transition.position.y - places[k].position.y, transition.position.x - places[k].position.x ) * 180) / Math.PI),
      ...outputKeys.map(k=>(Math.atan2(places[k].position.y - transition.position.y, places[k].position.x - transition.position.x) * 180) / Math.PI)
    ]
    
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

