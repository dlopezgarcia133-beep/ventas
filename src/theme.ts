import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1e3a5f',
      light: '#2d5591',
      dark: '#0d1e3a',
    },
    secondary: {
      main: '#f97316',
      light: '#fb923c',
      dark: '#ea6c00',
    },
    background: {
      default: '#0a1628',
      paper: '#0d1e3a',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
    divider: 'rgba(249, 115, 22, 0.15)',
    success: {
      main: '#22c55e',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f97316',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0a1628',
          minHeight: '100vh',
          scrollbarColor: '#1e3a5f #0a1628',
          '&::-webkit-scrollbar': { width: 8 },
          '&::-webkit-scrollbar-track': { background: '#0a1628' },
          '&::-webkit-scrollbar-thumb': { background: '#1e3a5f', borderRadius: 4 },
          '&::-webkit-scrollbar-thumb:hover': { background: '#f97316' },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0d1e3a',
          borderBottom: '3px solid #f97316',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#1e3a5f',
          color: '#ffffff',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: '#f97316',
            boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
          },
          transition: 'all 0.2s ease',
        },
        containedSecondary: {
          backgroundColor: '#f97316',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#ea6c00',
          },
        },
        outlinedPrimary: {
          borderColor: '#f97316',
          color: '#f97316',
          '&:hover': {
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            borderColor: '#f97316',
          },
        },
        outlinedSecondary: {
          borderColor: '#f97316',
          color: '#f97316',
          '&:hover': {
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#0d1e3a',
          border: '1px solid rgba(249, 115, 22, 0.12)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#0a1628',
            color: '#f97316',
            fontWeight: 700,
            borderBottom: '2px solid rgba(249, 115, 22, 0.3)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(249, 115, 22, 0.08)',
          color: '#f1f5f9',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(249, 115, 22, 0.05)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& label.Mui-focused': { color: '#f97316' },
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': { borderColor: '#f97316' },
            '&:hover fieldset': { borderColor: 'rgba(249, 115, 22, 0.5)' },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: { color: '#94a3b8' },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0d1e3a',
          border: '1px solid rgba(249, 115, 22, 0.2)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#f1f5f9',
          '&:hover': {
            backgroundColor: 'rgba(249, 115, 22, 0.12)',
            color: '#f97316',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(249, 115, 22, 0.15)',
            '&:hover': { backgroundColor: 'rgba(249, 115, 22, 0.2)' },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            color: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e3a5f',
          color: '#f1f5f9',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(249, 115, 22, 0.15)' },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: { color: '#f97316' },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: { color: '#94a3b8' },
        select: { color: '#f1f5f9' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0d1e3a',
          border: '1px solid rgba(249, 115, 22, 0.2)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#94a3b8',
          '&.Mui-selected': { color: '#f97316' },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: '#f97316' },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: '#f97316',
            '& + .MuiSwitch-track': { backgroundColor: '#f97316' },
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          '&.Mui-checked': { color: '#f97316' },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          '&.Mui-checked': { color: '#f97316' },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          border: '1px solid rgba(249, 115, 22, 0.3)',
        },
      },
    },
  },
});

export default theme;
