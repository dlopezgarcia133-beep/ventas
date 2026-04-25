import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#f97316',
      light: '#fb923c',
      dark: '#ea6c00',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0d1e3a',
      light: '#1e3a5f',
      dark: '#060f1e',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f1f5f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    divider: '#e2e8f0',
    success: { main: '#22c55e' },
    error: { main: '#ef4444' },
    warning: { main: '#f97316' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f1f5f9',
          minHeight: '100vh',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0d1e3a',
          borderBottom: '3px solid #f97316',
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#f97316',
          color: '#ffffff',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: '#ea6c00',
            boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
          },
          transition: 'all 0.2s ease',
        },
        containedSecondary: {
          backgroundColor: '#0d1e3a',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#1e3a5f',
          },
        },
        outlinedPrimary: {
          borderColor: '#f97316',
          color: '#f97316',
          '&:hover': {
            backgroundColor: 'rgba(249,115,22,0.08)',
            borderColor: '#ea6c00',
          },
        },
        outlinedSecondary: {
          borderColor: '#0d1e3a',
          color: '#0d1e3a',
          '&:hover': {
            backgroundColor: 'rgba(13,30,58,0.06)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#f8fafc',
            color: '#f97316',
            fontWeight: 700,
            borderBottom: '2px solid rgba(249,115,22,0.25)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #e2e8f0',
          color: '#1e293b',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(249,115,22,0.04)',
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
            '&:hover fieldset': { borderColor: 'rgba(249,115,22,0.5)' },
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#1e293b',
          '&:hover': {
            backgroundColor: 'rgba(249,115,22,0.08)',
            color: '#f97316',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(249,115,22,0.12)',
            color: '#f97316',
            '&:hover': { backgroundColor: 'rgba(249,115,22,0.16)' },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#64748b',
          '&:hover': {
            color: '#f97316',
            backgroundColor: 'rgba(249,115,22,0.08)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(249,115,22,0.1)',
          color: '#ea6c00',
          fontWeight: 600,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#e2e8f0' },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: { color: '#f97316' },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: { color: '#64748b' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#64748b',
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
        root: { '&.Mui-checked': { color: '#f97316' } },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: { '&.Mui-checked': { color: '#f97316' } },
      },
    },
  },
});

export default theme;
