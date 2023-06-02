import { Position, getSmoothStepPath, internalsSymbol } from "reactflow";

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

function getNodeCenter(node) {
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

export const getBiDirectionalPath = (
  { sourceX, sourceY, targetX, targetY }
) => {
  // console.log(offsetX, offsetY)
  const centerX = (sourceX + targetX) / 2;
  const centerY = (sourceY + targetY) / 2;

  let vertX = 0;
  let vertY = 0;

  const m = targetX-sourceX>0 ? (targetY-sourceY)/(targetX-sourceX) : 'vertical';
  if (m==='vertical' && sourceY > targetY) {
    vertY = centerY;
    vertX = centerX + 25;
  } else if (m==='vertical') {
    vertY = centerY;
    vertX = centerX - 25;
  } else {
    const mPrime = -1/m;
    // const offset = 0
    const b = centerY - mPrime*centerX;
    vertX = mPrime > 0 ? centerX + Math.sqrt(25**2/1+(mPrime**2)) : centerX - Math.sqrt(25**2/1+(mPrime**2));
    vertY = mPrime*vertX + b;
  }

  // return getSmoothStepPath({sourceX, targetX, targetY, sourceY, centerX:vertX, centerY:vertY, borderRadius:5});

  return [`M ${sourceX} ${sourceY} Q ${vertX} ${vertY} ${targetX} ${targetY}`, (vertX+centerX)/2, (vertY+centerY)/2];
};

export async function copyTextToClipboard(text) {
  if ('clipboard' in navigator) {
    return await navigator.clipboard.writeText(text);
  } else {
    return document.execCommand('copy', true, text);
  }
}