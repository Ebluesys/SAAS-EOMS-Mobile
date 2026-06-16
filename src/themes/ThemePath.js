export const Images = {
  earth: require('../assets/images/earth.png'),
  pageBackground: require('../assets/images/pageBG.jpg'),
  appicon: require('../assets/images/E-Attendance.png'),
  drawerNav: require('../assets/images/drawerNav.png'),
  eyeclose: require('../assets/images/eyeclose.png'),
  eyeopen: require('../assets/images/eyeopen.png'),
  notificationBell: require('../assets/images/notificationBell.png'),
  successTick: require('../assets/images/successTick.png'),
  tab1: require('../assets/images/tab1.png'),
  tab2: require('../assets/images/tab2.png'),
  tab3: require('../assets/images/tab3.png'),
  tab4: require('../assets/images/tab4.png'),
  tab5: require('../assets/images/tab5.png'),
  tab6: require('../assets/images/tab6.png'),
  tab7: require('../assets/images/tab7.png'),
  googleplay: require('../assets/images/google-play.png'),

  backbutton1: require('../assets/images/backbutton1.png'),
  downArrow: require('../assets/images/downArrow.png'),
  lock: require('../assets/images/lock.png'),
  option: require('../assets/images/option.png'),
  delete: require('../assets/images/delete.png'),

  drawer1: require('../assets/images/tab3.png'),
  drawer2: require('../assets/images/drawer2.png'),
  drawer4: require('../assets/images/tab2.png'),
  drawer6: require('../assets/images/drawer6.png'),
  drawerbg: require('../assets/images/drawerbg.png'),
  cross: require('../assets/images/Cross.png'),
  close: require('../assets/images/close.png'),
  location: require('../assets/images/location.png'),
  clock: require('../assets/images/clock.png'),
  uploadImage: require('../assets/images/uploadImage.png'),
  map: require('../assets/images/map.png'),
  s: require('../assets/images/s.png'),
  msgBg: require('../assets/images/msgBg.png'),
  tick: require('../assets/images/tick.png'),
  mailbox: require('../assets/images/mailbox.png'),
  downarrow2: require('../assets/images/downarrow2.png'),
  profilepic: require('../assets/images/profilepic.png'),
  pdf: require('../assets/images/pdf.png'),
  logout: require('../assets/images/exit.png'),
  camera: require('../assets/images/camera.png'),
  noTask: require('../assets/images/noTask.png'),
  refreshicon: require('../assets/images/flip.png'),
  refresh: require('../assets/images/refresh.png'),
  roadmap: require('../assets/images/roadmap.png'),
  language: require('../assets/images/language.png'),
  call: require('../assets/images/call.png'),
  app_logo: require('../assets/images/EBS.png'),
  addTask: require('../assets/images/addTask.png'),
  success: require('../assets/images/success.png'),
  fail: require('../assets/images/fail.png'),
  alert: require('../assets/images/alert.png'),
  greenbg: require('../assets/images/greenbg.jpg'),
};

const lightColors = {
  white: '#FFFFFF',
  fontWhite: '#FFFAEC',
  black: '#0F172A',
  red: '#E94343',
  orange: '#06485bff',
  green: '#89C438',
  lightYellow: '#FFFFC5',
  skyblue: '#06485bff',
  inputGreyBorder: '#DDE4EE',
  textInputColor: '#1B1831',
  darkblue: '#1B1831',
  tintGrey: '#8B97A8',
  greytext: '#64748B',
  greytext2: '#4B5563',
  lightgreybg: '#E5E7EB',
  lightgreybg2: 'rgb(249,249,249)',
  lightgreen: '#DCFCE7',
  lightred: '#FEE2E2',
  backgroundWhite: 'rgb(244,244,244)',
  lightBlue: '#D7EBF7',
  grey: '#7D7C8A',
  bgColor: '#FFFFFF',
  button: '#06485bff',
  primary: '#06485bff',
  lightGrey: '#E5E7EB',
  lightGray: '#E5E7EB',
  gray: '#64748B',
  blue: '#2196F3',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  page: '#F4F7FB',
  text: '#0F172A',
  mutedText: '#64748B',
  border: '#E2E8F0',
  card: '#FFFFFF',
};

const darkColors = {
  white: '#0B1120',
  fontWhite: '#F8FAFC',
  black: '#F8FAFC',
  red: '#FB7185',
  orange: '#2DD4BF',
  green: '#4ADE80',
  lightYellow: '#3A2F00',
  skyblue: '#38BDF8',
  inputGreyBorder: '#334155',
  textInputColor: '#E2E8F0',
  darkblue: '#F8FAFC',
  tintGrey: '#94A3B8',
  greytext: '#94A3B8',
  greytext2: '#CBD5E1',
  lightgreybg: '#334155',
  lightgreybg2: '#111827',
  lightgreen: '#14381E',
  lightred: '#3B1720',
  backgroundWhite: '#0F172A',
  lightBlue: '#1E3A5F',
  grey: '#94A3B8',
  bgColor: '#0F172A',
  button: '#38BDF8',
  primary: '#38BDF8',
  lightGrey: '#334155',
  lightGray: '#334155',
  gray: '#94A3B8',
  blue: '#60A5FA',
  surface: '#111827',
  surfaceElevated: '#172033',
  page: '#0B1120',
  text: '#F8FAFC',
  mutedText: '#94A3B8',
  border: '#334155',
  card: '#111827',
};

const activeColors = { ...lightColors };

export const themeModes = {
  light: 'light',
  dark: 'dark',
};

export const applyTheme = mode => {
  const nextColors = mode === themeModes.dark ? darkColors : lightColors;

  Object.keys(activeColors).forEach(key => {
    delete activeColors[key];
  });
  Object.assign(activeColors, nextColors);

  return activeColors;
};

export const getThemeColors = mode => {
  return mode === themeModes.dark ? darkColors : lightColors;
};

export const Colors = activeColors;

export const Fonts = {
  MulishBold: 'Mulish-Bold',
  MulishItalic: 'Mulish-Italic',
  MulishLight: 'Mulish-Light',
  MulishMedium: 'Mulish-Medium',
  MulishRegular: 'Mulish-Regular',
  MulishSemiBold: 'Mulish-SemiBold',
  MulishExtraBold: 'Mulish-ExtraBold',
  MulishBlack: 'Mulish-Black',
};
