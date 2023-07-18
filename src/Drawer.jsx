import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import { Drawer as MuiDrawer, Divider, Stack } from "@mui/material";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import useMeasure from "react-use-measure";
import { TooltippedToolbarButton } from "./ToolbarButton";

const drawerWidth = 240;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export function Drawer({
  open = false,
  setOpen = () => {},
  footerActions = null,
  children = [],
}) {
  const theme = useTheme();
  const [ref, bounds] = useMeasure();
  return (
    <MuiDrawer
      sx={{
        width: drawerWidth,
        display:'flex',
        flexDirection:'column',
        "& .MuiDrawer-paper": {
          backdropFilter: "blur(5pt)",
          WebkitBackdropFilter: "blur(5pt)",
          backgroundColor: "rgba(0,0,0,0.25)",
          width: drawerWidth,
          // boxSizing: "border-box",
        },
      }}
      anchor="left"
      open={open}
      hideBackdrop
    >
      <DrawerHeader>
        <TooltippedToolbarButton
          title="Close"
          onClick={() => setOpen(false)}
          sx={{ fontSize: "1.5rem" }}
        >
          {theme.direction === "ltr" ? <FiChevronLeft /> : <FiChevronRight />}
        </TooltippedToolbarButton>
      </DrawerHeader>
      <Divider />
      <div ref={ref} style={{flexDirection:'column', display:'flex', height:"100%", overflowY:'scroll'}}>
        {typeof children === 'function' ? children(bounds) : children}
      </div>
      
      <Stack direction='row' flex justifyContent='space-around' style={{padding:3,display:'flex'}}>
        {footerActions}
      </Stack>
      
    </MuiDrawer>
  );
}
