import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";
import { mapValues, cloneDeep } from "lodash";

export const tokens = atom({});

const data = {
  places: {
    a: { id: "a", name: "A", position: { x: -50, y: 40 }, tokens: [] },
    b: {
      id: "b",
      name: "Agent 2 Idle",
      position: { x: 190, y: 200 },
      tokens: [{}],
    },
    c: { id: "c", name: "C", position: { x: 260, y: 40 }, tokens: [] },
    d: { id: "d", name: "B", position: { x: 120, y: 40 }, tokens: [] },
    "797c0c8a-f6f4-41ac-91e9-7355747396e2": {
      id: "797c0c8a-f6f4-41ac-91e9-7355747396e2",
      name: "Agent 1 Idle",
      position: { x: 190, y: -120 },
      tokens: [{}],
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
      tokens: [],
    },
    "710ee10a-8a6d-4d91-8a2f-ebbc6dff7ad0": {
      id: "710ee10a-8a6d-4d91-8a2f-ebbc6dff7ad0",
      name: "Limit 1",
      position: { x: 40, y: 40 },
      tokens: [{}],
    },
    "41a4c380-5507-4bc5-a318-87be79c4f692": {
      id: "41a4c380-5507-4bc5-a318-87be79c4f692",
      name: "Limit 2",
      position: { x: 190, y: 40 },
      tokens: [{}],
    },
    "8ac6638b-b8d1-496c-a98f-aa877028ef0b": {
      id: "8ac6638b-b8d1-496c-a98f-aa877028ef0b",
      name: "Limit 3",
      position: { x: 340, y: 40 },
      tokens: [{}],
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
        a: { count: 1 },
        "797c0c8a-f6f4-41ac-91e9-7355747396e2": { count: 1 },
        "710ee10a-8a6d-4d91-8a2f-ebbc6dff7ad0": { count: 1 },
      },
      output: {
        d: { count: 1 },
        "797c0c8a-f6f4-41ac-91e9-7355747396e2": { count: 1 },
        "710ee10a-8a6d-4d91-8a2f-ebbc6dff7ad0": { count: 1 },
      },
      position: { x: 50, y: -40 },
      active: false,
    },
    "fec437f0-ffdc-4272-9db9-85071f6146d5": {
      id: "fec437f0-ffdc-4272-9db9-85071f6146d5",
      name: "Process 2",
      input: {
        d: { count: 1 },
        "797c0c8a-f6f4-41ac-91e9-7355747396e2": { count: 1 },
        "41a4c380-5507-4bc5-a318-87be79c4f692": { count: 1 },
      },
      output: {
        c: { count: 1 },
        "797c0c8a-f6f4-41ac-91e9-7355747396e2": { count: 1 },
        "41a4c380-5507-4bc5-a318-87be79c4f692": { count: 1 },
      },
      position: { x: 200, y: -40 },
      active: false,
    },
    "d0a8509f-6777-4b35-bfd9-947ff9c51b7c": {
      id: "d0a8509f-6777-4b35-bfd9-947ff9c51b7c",
      name: "Process 1",
      input: {
        b: { count: 1 },
        a: { count: 1 },
        "710ee10a-8a6d-4d91-8a2f-ebbc6dff7ad0": { count: 1 },
      },
      output: {
        d: { count: 1 },
        b: { count: 1 },
        "710ee10a-8a6d-4d91-8a2f-ebbc6dff7ad0": { count: 1 },
      },
      position: { x: 50, y: 120 },
      active: false,
    },
    "795e2bca-07fe-4b77-9bcd-87a5ed202663": {
      id: "795e2bca-07fe-4b77-9bcd-87a5ed202663",
      name: "Process 2",
      input: {
        b: { count: 1 },
        d: { count: 1 },
        "41a4c380-5507-4bc5-a318-87be79c4f692": { count: 1 },
      },
      output: {
        c: { count: 1 },
        b: { count: 1 },
        "41a4c380-5507-4bc5-a318-87be79c4f692": { count: 1 },
      },
      position: { x: 200, y: 120 },
      active: false,
    },
    "e86d0bf4-1d14-4d08-a38b-d34ef88fbbca": {
      id: "e86d0bf4-1d14-4d08-a38b-d34ef88fbbca",
      name: "750169F8-4EEE-4873-A6E7-F58A047383C2->A",
      input: { "750169f8-4eee-4873-a6e7-f58a047383c2": { count: 1 } },
      output: { a: { count: 1 } },
      position: { x: -100, y: 40 },
      active: false,
    },
    "0a464a55-e740-4b7d-b87f-7b876d816fb1": {
      id: "0a464a55-e740-4b7d-b87f-7b876d816fb1",
      name: "Process 3",
      input: {
        c: { count: 1 },
        "797c0c8a-f6f4-41ac-91e9-7355747396e2": { count: 1 },
        "8ac6638b-b8d1-496c-a98f-aa877028ef0b": { count: 1 },
      },
      output: {
        "74eb3e2c-72cc-473e-a28f-dfd26116b6d9": { count: 1 },
        "797c0c8a-f6f4-41ac-91e9-7355747396e2": { count: 1 },
        "8ac6638b-b8d1-496c-a98f-aa877028ef0b": { count: 1 },
      },
      position: { x: 350, y: -40 },
      active: false,
    },
    "6c6b27bd-883a-4720-91a8-6ebf8aacdf9a": {
      id: "6c6b27bd-883a-4720-91a8-6ebf8aacdf9a",
      name: "Process 3",
      input: {
        b: { count: 1 },
        c: { count: 1 },
        "8ac6638b-b8d1-496c-a98f-aa877028ef0b": { count: 1 },
      },
      output: {
        "74eb3e2c-72cc-473e-a28f-dfd26116b6d9": { count: 1 },
        b: { count: 1 },
        "8ac6638b-b8d1-496c-a98f-aa877028ef0b": { count: 1 },
      },
      position: { x: 350, y: 120 },
      active: false,
    },
    "3ef63e0d-2737-4548-ac17-0dfb48fc4d19": {
      id: "3ef63e0d-2737-4548-ac17-0dfb48fc4d19",
      name: "Finish",
      input: { "74eb3e2c-72cc-473e-a28f-dfd26116b6d9": { count: 1 } },
      output: { "9b484783-cb44-4b0f-9062-9f83bfa24807": { count: 1 } },
      position: { x: 480, y: 40 },
      active: false,
    },
  },
};

export const selectedNodeAtom = atom(null);

export const placesAtom = atomWithReset(data.places);

export const transitionsAtom = atomWithReset(data.transitions);

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
    const angle =
      (Math.atan2(targetY - sourceY, targetX - sourceX) * 180) / Math.PI;
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
