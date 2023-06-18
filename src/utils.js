import { Position, getBezierPath, getSmoothStepPath, getStraightPath, internalsSymbol } from "reactflow";

// returns the position (top,right,bottom or right) passed node compared to
function getParams(nodeA, nodeB) {
  const centerA = getNodeCenter(nodeA);
  const centerB = getNodeCenter(nodeB);

  const horizontalDiff = Math.abs(centerA.x - centerB.x);
  const verticalDiff = Math.abs(centerA.y - centerB.y);

  let position;

  // when the horizontal difference between the nodes is bigger, we use Position.Left or Position.Right for the handle
  if (horizontalDiff > verticalDiff) {
    position = centerA.x > centerB.x ? Position.Left : Position.Right;
  } else {
    // here the vertical difference between the nodes is bigger, so we use Position.Top or Position.Bottom for the handle
    position = centerA.y > centerB.y ? Position.Top : Position.Bottom;
  }

  const [x, y] = getHandleCoordsByPosition(nodeA, position);
  return [x, y, position];
}

function getHandleCoordsByPosition(node, handlePosition) {
  // all handles are from type source, that's why we use handleBounds.source here
  const handle = node[internalsSymbol].handleBounds.source.find(
    (h) => h.position === handlePosition
  );

  let offsetX = handle.width / 2;
  let offsetY = handle.height / 2;

  // this is a tiny detail to make the markerEnd of an edge visible.
  // The handle position that gets calculated has the origin top-left, so depending which side we are using, we add a little offset
  // when the handlePosition is Position.Right for example, we need to add an offset as big as the handle itself in order to get the correct position
  switch (handlePosition) {
    case Position.Left:
      offsetX = 0;
      break;
    case Position.Right:
      offsetX = handle.width;
      break;
    case Position.Top:
      offsetY = 0;
      break;
    case Position.Bottom:
      offsetY = handle.height;
      break;
  }

  const x = node.positionAbsolute.x + handle.x + offsetX;
  const y = node.positionAbsolute.y + handle.y + offsetY;

  return [x, y];
}

export function getNodeCenter(node) {
  return {
    x: node.positionAbsolute.x + node.width / 2,
    y: node.positionAbsolute.y + node.height / 2,
  };
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source, target) {
  const [sx, sy, sourcePos] = getParams(source, target);
  const [tx, ty, targetPos] = getParams(target, source);

  return {
    sx,
    sy,
    tx,
    ty,
    sourcePos,
    targetPos,
  };
}

export const getBiDirectionalPath = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
}) => {
  // console.log(offsetX, offsetY)
  const centerX = (sourceX + targetX) / 2;
  const centerY = (sourceY + targetY) / 2;

  let vertX = 0;
  let vertY = 0;

  const m =
    targetX - sourceX > 0
      ? (targetY - sourceY) / (targetX - sourceX)
      : "vertical";
  if (m === "vertical" && sourceY > targetY) {
    vertY = centerY;
    vertX = centerX + 25;
  } else if (m === "vertical") {
    vertY = centerY;
    vertX = centerX - 25;
  } else {
    const mPrime = -1 / m;
    // const offset = 0
    const b = centerY - mPrime * centerX;
    vertX =
      mPrime > 0
        ? centerX + Math.sqrt(25 ** 2 / 1 + mPrime ** 2)
        : centerX - Math.sqrt(25 ** 2 / 1 + mPrime ** 2);
    vertY = mPrime * vertX + b;
  }

  return [
    `M ${sourceX} ${sourceY} Q ${vertX} ${vertY} ${targetX} ${targetY}`,
    (vertX + centerX) / 2,
    (vertY + centerY) / 2,
  ];
};

export async function copyTextToClipboard(text) {
  if ("clipboard" in navigator) {
    return await navigator.clipboard.writeText(text);
  } else {
    return document.execCommand("copy", true, text);
  }
}

export function getCustomEdge(
  sourceNodePosition,
  targetNodePosition,
  type,
  transitionArrangement
) {
  let sourceHandleLocation;
  let sourceControlLocation;
  let targetHandleLocation;
  let targetControlLocation;
  if (type === "input") {
    sourceHandleLocation = getPositionAtCirclePerimeter(
      sourceNodePosition.x,
      sourceNodePosition.y,
      20,
      targetNodePosition.x,
      targetNodePosition.y
    );
    sourceControlLocation = getPositionAtCirclePerimeter(
      sourceNodePosition.x,
      sourceNodePosition.y,
      45,
      targetNodePosition.x,
      targetNodePosition.y
    );
    targetHandleLocation = projectPointByAngle(
      targetNodePosition.x,
      targetNodePosition.y,
      transitionArrangement?.angle || 0,
      -10
    );
    targetControlLocation = projectPointAway(
      targetNodePosition.x,
      targetNodePosition.y,
      targetHandleLocation.x,
      (9 * targetHandleLocation.y + sourceNodePosition.y) / 10,
      -50
    );
  } else {
    sourceHandleLocation = projectPointByAngle(
      sourceNodePosition.x,
      sourceNodePosition.y,
      transitionArrangement?.angle || 0,
      10
    );
    sourceControlLocation = projectPointAway(
      sourceNodePosition.x,
      sourceNodePosition.y,
      sourceHandleLocation.x,
      (9 * sourceHandleLocation.y + targetNodePosition.y) / 10,
      -50
    );
    targetHandleLocation = getPositionAtCirclePerimeter(
      targetNodePosition.x,
      targetNodePosition.y,
      20,
      sourceNodePosition.x,
      sourceNodePosition.y
    );
    targetControlLocation = getPositionAtCirclePerimeter(
      targetNodePosition.x,
      targetNodePosition.y,
      45,
      sourceNodePosition.x,
      sourceNodePosition.y
    );
  }
  const [centerX, centerY, offsetX, offsetY] = getBezierEdgeCenter({
    sourceX: sourceHandleLocation.x,
    sourceY: sourceHandleLocation.y,
    targetX: targetHandleLocation.x,
    targetY: targetHandleLocation.y,
    sourceControlX: sourceControlLocation.x,
    sourceControlY: sourceControlLocation.y,
    targetControlX: targetControlLocation.x,
    targetControlY: targetControlLocation.y,
  });

  const path = `M ${sourceHandleLocation.x} ${sourceHandleLocation.y} C ${sourceControlLocation.x} ${sourceControlLocation.y} ${targetControlLocation.x} ${targetControlLocation.y} ${targetHandleLocation.x} ${targetHandleLocation.y}`;

  return [path, centerX, centerY, offsetX, offsetY];
}

export function getCustomEdgePreview(sourceNodePosition, cursorPosition, type, transitionArrangement) {
  let sourceHandleLocation;
  let sourceControlLocation;
  if (type === "input") {
    sourceHandleLocation = getPositionAtCirclePerimeter(
      sourceNodePosition.x,
      sourceNodePosition.y,
      20,
      cursorPosition.x,
      cursorPosition.y
    );
    sourceControlLocation = getPositionAtCirclePerimeter(
      sourceNodePosition.x,
      sourceNodePosition.y,
      45,
      cursorPosition.x,
      cursorPosition.y
    );
  } else {
    sourceHandleLocation = projectPointByAngle(
      sourceNodePosition.x,
      sourceNodePosition.y,
      transitionArrangement?.angle || 0,
      10
    );
    sourceControlLocation = projectPointAway(
      sourceNodePosition.x,
      sourceNodePosition.y,
      sourceHandleLocation.x,
      (9 * sourceHandleLocation.y + cursorPosition.y) / 10,
      -50
    );
  }
  const [path, centerX, centerY] = getStraightPath({
    sourceX:sourceHandleLocation.x,
    sourceY:sourceHandleLocation.y,
    targetX:cursorPosition.x,
    targetY:cursorPosition.y,
  })
  return [path, centerX, centerY];
}

export function getPositionAtCirclePerimeter(
  centerX,
  centerY,
  radius,
  targetX,
  targetY
) {
  const dx = targetX - centerX;
  const dy = targetY - centerY;
  const theta = Math.atan2(dy, dx);
  return {
    x: centerX + radius * Math.cos(theta),
    y: centerY + radius * Math.sin(theta),
  };
}

// https://github.com/wbkd/react-flow/blob/main/packages/core/src/components/Edges/utils.ts
export function getBezierEdgeCenter({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourceControlX,
  sourceControlY,
  targetControlX,
  targetControlY,
}) {
  // cubic bezier t=0.5 mid point, not the actual mid point, but easy to calculate
  // https://stackoverflow.com/questions/67516101/how-to-find-distance-mid-point-of-bezier-curve
  const centerX =
    sourceX * 0.125 +
    sourceControlX * 0.375 +
    targetControlX * 0.375 +
    targetX * 0.125;
  const centerY =
    sourceY * 0.125 +
    sourceControlY * 0.375 +
    targetControlY * 0.375 +
    targetY * 0.125;
  const offsetX = Math.abs(centerX - sourceX);
  const offsetY = Math.abs(centerY - sourceY);

  return [centerX, centerY, offsetX, offsetY];
}

const projectPointAway = (x, y, cx, cy, distance) => {
  const angle = Math.atan2(y - cy, x - cx);
  return {
    x: cx + Math.cos(angle) * distance,
    y: cy + Math.sin(angle) * distance,
  };
};

const projectPointByAngle = (x, y, angle, distance) => {
  return {
    x: x + Math.cos(degreesToRadians(angle)) * distance,
    y: y + Math.sin(degreesToRadians(angle)) * distance,
  };
};

const degreesToRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};
