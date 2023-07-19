import { useState, useEffect } from "react";
import * as d3 from "d3";
import { motion } from "framer-motion";
import { SvgIcon } from "@mui/material";
import { FiMoreHorizontal } from "react-icons/fi";

function randomColor() {
    return `hsl(${Math.random() * 360}, 100%, 50%)`;
}

export const MarkingDisplay = ({ marking }) => {
  const [animatedCircles, setAnimatedCircles] = useState([]);

  useEffect(() => {
    let count = marking.length;
    let size = 20 / Math.exp(count / 10) + 5;
    const packing = d3.pack().size([100, 100]).padding(size/2)(
      d3
        .hierarchy({ children: [...marking.map((n) => ({ ...n, r: size }))] })
        .sum((_) => size+3)
    );

    const [_, ...rest] = packing.descendants()[0].descendants();
    setAnimatedCircles(rest);
  }, [marking]);

  if (marking.length > 20) {
    return <FiMoreHorizontal />;
  } else if (marking.length === 0) {
    return "0";
  } else {
    return (
      <SvgIcon>
        <svg viewBox="0 0 100 100">
          {animatedCircles.map((c) => (
            <motion.circle
              key={c.id}
              cx={0}
              cy={0}
              r={6}
              stroke="black"
              fill="black"
              initial={{ r: 0, x: 50, y: 50 }}
              animate={{ r: c.r, x: c.x, y: c.y }}
            />
          ))}
        </svg>
      </SvgIcon>
    );
  }
};
