import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import { styled, alpha } from "@mui/material/styles";


export const ToolbarButton = styled(IconButton)(({ theme }) => ({
  borderRadius: 3,
  fontSize: "0.875rem",
  "&:hover": {
    borderColor: theme.palette.primary.main,
  },
  "&:focus": {
    borderColor: theme.palette.primary.main,
  },
  // firefox
  "&:focus-visible": {
    userSelect: "none",
    outline: 0,
  },
  "& .Mui-selected": {
    backgroundColor: alpha(theme.palette.primary.main, 0.5),
  },
}));

export const ToolbarChip = styled(Chip)(({ theme }) => ({
  borderRadius:3,
  fontSize: "0.875rem",
  height:26,
  backgroundColor: alpha(theme.palette.primary.main, 0.45),
  color: 'black'
}));