import Input from '@mui/base/Input';
import { styled } from "@mui/material/styles";

export const SimpleInput = styled('input')(
    ({ theme }) => ({
        width: 100,
        height: 16,
        fontSize: '0.857rem',
        lineHeight:1.5,
        padding: 12,
        borderRadius: 5,
        color: theme.palette.primary,
        background: '#24292f',
        border: `1px solid #24292f`,
        boxShadow: `0px 0px 1px ${theme.palette.primary.main}`,
        '&:hover': {
            borderColor: theme.palette.primary.main
        },
        '&:focus': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 3px ${theme.palette.primary.main}`,
        },
        // firefox
        '&:focus-visible': {
            userSelect: 'none',
            outline: 0,
        },
    })
  );