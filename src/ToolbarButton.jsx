import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import { styled, alpha } from "@mui/material/styles";

export const ToolbarButton = styled(IconButton, {
  shouldForwardProp: (prop) => !["canToggle","toggled","flex"].includes(prop),

})(({ theme, canToggle, toggled,  }) => ({
  borderRadius: theme.shape.borderRadius * 0.66,
  // fontSize: {md: "0.875rem", sm: "1rem"},
  fontSize: "1rem",
  height: 30,
  flex: 1,
  backgroundColor: toggled ? alpha(theme.palette.primary.main, 0.4) : "transparent",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: canToggle
      ? alpha(theme.palette.primary.main, toggled ? 0.5 : 0.3)
      : "#ffffff30",
    color: theme.palette.primary.main,
  },
  "&:focus": {
    borderColor: theme.palette.primary.main,
    backgroundColor: canToggle && alpha(theme.palette.primary.main, 0.3),
    color: theme.palette.primary.main,
  },
  // firefox
  "&:focus-visible": {
    userSelect: "none",
    outline: 0,
  },
  "& .Mui-selected": {
    backgroundColor: alpha(theme.palette.primary.main, 0.5),
    color: theme.palette.primary.main,
  },
}));

export const ToolbarChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 0.66,
  fontSize: "1rem",
  height: 30,
  backgroundColor: alpha(theme.palette.primary.main, 0.45),
  color: "black",
}));

export const ToolbarButtonWrapper = styled("span")(({}) => ({
  display: "flex",
}));

export const TooltippedToolbarButton = ({
  title = "Button",
  onClick = () => {},
  disabled = false,
  placement = "top",
  toggled = false,
  canToggle = false,
  children = [],
  flex = false,
  ...props
}) => (
  <Tooltip
    className="no-outline"
    title={title}
    color="primary"
    placement={placement}
  >
    <ToolbarButtonWrapper className="no-outline">
      <ToolbarButton
        className="no-outline"
        disabled={disabled}
        aria-label={title}
        onClick={onClick}
        toggled={toggled}
        canToggle={canToggle}
        flex={flex}
        {...props}
      >
        {children}
      </ToolbarButton>
    </ToolbarButtonWrapper>
  </Tooltip>
);
