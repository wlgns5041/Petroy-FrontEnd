// NavBar.jsx
import * as React from 'react';
import { fetchCurrentMember } from '../../services/TokenService.jsx'; 
import { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PersonIcon from '@mui/icons-material/Person';
import PetsIcon from '@mui/icons-material/Pets';
import GroupIcon from '@mui/icons-material/Group';
import ForumIcon from '@mui/icons-material/Forum';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'; 
import { useNavigate } from 'react-router-dom';
import { subscribeNotification } from '../../services/SubscribeNotification';

const drawerWidth = 240;
const openedMixin = (theme) => ({ width: drawerWidth, transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }), overflowX: 'hidden' });
const closedMixin = (theme) => ({ transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }), overflowX: 'hidden', width: `calc(${theme.spacing(7)} + 1px)`, [theme.breakpoints.up('sm')]: { width: `calc(${theme.spacing(8)} + 1px)` } });

const DrawerHeader = styled('div')(({ theme }) => ({ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: theme.spacing(0, 1), ...theme.mixins.toolbar }));
const AppBar = styled(MuiAppBar, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme }) => ({ zIndex: theme.zIndex.drawer + 1, transition: theme.transitions.create(['width', 'margin'], { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }) }));
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({ width: drawerWidth, flexShrink: 0, whiteSpace: 'nowrap', boxSizing: 'border-box', ...(open && { ...openedMixin(theme), '& .MuiDrawer-paper': openedMixin(theme) }), ...(!open && { ...closedMixin(theme), '& .MuiDrawer-paper': closedMixin(theme) }) }));

export default function NavBar({ title, unreadCount: propUnreadCount = 0 }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [localUnreadCount, setLocalUnreadCount] = useState(() => {
    const saved = localStorage.getItem('unreadCount');
    return saved ? parseInt(saved, 10) : 0;
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      // 기본 멤버 정보 가져오기
      const getMemberData = async () => {
        const memberData = await fetchCurrentMember(token);
        if (memberData?.name) setMemberName(memberData.name);
      };
      getMemberData();
  
      // ✅ SSE 연결 + unReadCount 수신 처리
      const sse = subscribeNotification((count) => {
        localStorage.setItem('unreadCount', count); 
        setLocalUnreadCount(count);
      });
  
      return () => {
        sse.close();
        window.__eventSourceInstance = null;
      };
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'unreadCount') {
        setLocalUnreadCount(parseInt(e.newValue, 10) || 0);
      }
    };
  
    window.addEventListener('storage', handleStorageChange);
  
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const finalUnreadCount = propUnreadCount > 0 ? propUnreadCount : localUnreadCount;

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);
  const handleNavigation = (path) => navigate(path);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ backgroundColor: '#484848' }}> {!open ? (
          <IconButton color="inherit" onClick={handleDrawerOpen} edge="start" sx={{ marginRight: 5 }}>
            <MenuIcon />
          </IconButton> ) : (
          <IconButton color="inherit" onClick={handleDrawerClose} edge="start" sx={{ marginRight: 5 }}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
          )}
          <Typography variant="h6" noWrap sx={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }} >{title}</Typography>
          <Typography variant="h6" sx={{ marginLeft: 'auto', fontFamily: 'Pretendard, sans-serif', fontWeight: 600 }}>{memberName && `${memberName}님`}</Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <ListItem key="홈 & 캘린더" disablePadding sx={{ display: 'block' }}>
            <ListItemButton onClick={() => handleNavigation('/mainPage')} sx={[{ minHeight: 48, px: 2.5 }, open ? { justifyContent: 'initial' } : { justifyContent: 'center' }]}>              
              <ListItemIcon sx={[{ minWidth: 0, justifyContent: 'center' }, open ? { mr: 3 } : { mr: 'auto' }]}> <CalendarTodayIcon /> </ListItemIcon>
              <ListItemText primary="홈 & 캘린더" sx={[open ? { opacity: 1 } : { opacity: 0 }]} />
            </ListItemButton>
          </ListItem>
          {[['마이페이지', <PersonIcon />], ['펫', <PetsIcon />], ['친구', <GroupIcon />], ['커뮤니티', <ForumIcon />]].map(([text, icon]) => (
            <ListItem key={text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={() => handleNavigation(`/${text === '마이페이지' ? 'myPage' : text === '펫' ? 'petPage' : text === '친구' ? 'friendPage' : 'communityPage'}`)}
                sx={[{ minHeight: 48, px: 2.5 }, open ? { justifyContent: 'initial' } : { justifyContent: 'center' }]}
              >
                <ListItemIcon sx={[{ minWidth: 0, justifyContent: 'center' }, open ? { mr: 3 } : { mr: 'auto' }]}>{icon}</ListItemIcon>
                <ListItemText primary={text} sx={[open ? { opacity: 1 } : { opacity: 0 }]} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
        {[
  ['알림', NotificationsIcon],
  ['설정', SettingsIcon],
].map(([text, IconComponent]) => (
  <ListItem key={text} disablePadding sx={{ display: 'block' }}>
    <ListItemButton
      onClick={() => handleNavigation(`/${text === '알림' ? 'notificationPage' : 'settingsPage'}`)}
      sx={[{ minHeight: 48, px: 2.5 }, open ? { justifyContent: 'initial' } : { justifyContent: 'center' }]}
    >
      <ListItemIcon sx={[{ minWidth: 0, justifyContent: 'center' }, open ? { mr: 3 } : { mr: 'auto' }]}>
        {text === '알림' ? (
          <Badge badgeContent={finalUnreadCount} color="error" max={99} showZero>
            <IconComponent />
          </Badge>
        ) : (
          <IconComponent />
        )}
      </ListItemIcon>
      <ListItemText primary={text} sx={[open ? { opacity: 1 } : { opacity: 0 }]} />
    </ListItemButton>
  </ListItem>
))}
        </List>
      </Drawer>
    </Box>
  );
}