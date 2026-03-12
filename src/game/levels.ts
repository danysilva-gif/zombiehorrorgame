import { Platform } from './types';

export interface LevelTheme {
  name: string;
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  groundColor: string;
  groundDark: string;
  grassColor: string;
  floatingColor: string;
  floatingTop: string;
  brickColor: string;
  brickDark: string;
  brickLight: string;
  bgElementColor: string;
  bgDetailColor: string;
  moonColor: string;
  starsColor: string;
  fogColor: string;
  fogAlpha: number;
  icon: string;
}

export interface LevelConfig {
  id: number;
  name: string;
  theme: LevelTheme;
  zombieCount: number;
  wavesRequired: number;
  platformSeed: number;
}

const THEMES: Record<string, LevelTheme> = {
  forest: {
    name: 'Floresta Sombria',
    skyTop: '#050d0a', skyMid: '#0a1a12', skyBottom: '#071510',
    groundColor: '#2d4a1e', groundDark: '#1a3010', grassColor: '#3a7d44',
    floatingColor: '#8b5e3c', floatingTop: '#5a9d54',
    brickColor: '#8b5e3c', brickDark: '#6b3e1c', brickLight: '#ab7e5c',
    bgElementColor: '#0d1f15', bgDetailColor: '#1a3a22',
    moonColor: '#e8e8c8', starsColor: '#aaffaa',
    fogColor: '#1a3a22', fogAlpha: 0,
    icon: '🌲',
  },
  cemetery: {
    name: 'Cemitério',
    skyTop: '#0a0515', skyMid: '#150a20', skyBottom: '#0d0818',
    groundColor: '#3a3028', groundDark: '#2a2018', grassColor: '#4a5038',
    floatingColor: '#555050', floatingTop: '#6a6a5a',
    brickColor: '#605858', brickDark: '#404040', brickLight: '#807878',
    bgElementColor: '#120a1a', bgDetailColor: '#2a1a35',
    moonColor: '#d8d8ff', starsColor: '#ccaaff',
    fogColor: '#2a1a35', fogAlpha: 0.15,
    icon: '⚰️',
  },
  city: {
    name: 'Cidade em Ruínas',
    skyTop: '#0a0a0a', skyMid: '#151515', skyBottom: '#1a1410',
    groundColor: '#3a3a3a', groundDark: '#2a2a2a', grassColor: '#4a4a44',
    floatingColor: '#505050', floatingTop: '#606060',
    brickColor: '#6a5a4a', brickDark: '#4a3a2a', brickLight: '#8a7a6a',
    bgElementColor: '#1a1a1a', bgDetailColor: '#ff8800',
    moonColor: '#ff6600', starsColor: '#ffaa44',
    fogColor: '#2a1a0a', fogAlpha: 0.1,
    icon: '🏚️',
  },
  desert: {
    name: 'Deserto Morto',
    skyTop: '#1a0a05', skyMid: '#2a1508', skyBottom: '#3a200a',
    groundColor: '#c4a050', groundDark: '#a48030', grassColor: '#b49040',
    floatingColor: '#a08050', floatingTop: '#c0a060',
    brickColor: '#b09060', brickDark: '#907040', brickLight: '#d0b080',
    bgElementColor: '#2a1a0a', bgDetailColor: '#3a2a15',
    moonColor: '#ffdd88', starsColor: '#ffcc66',
    fogColor: '#c4a050', fogAlpha: 0.05,
    icon: '🏜️',
  },
  snow: {
    name: 'Nevasca',
    skyTop: '#0a0a15', skyMid: '#151520', skyBottom: '#1a1a2a',
    groundColor: '#d0d5e0', groundDark: '#b0b5c0', grassColor: '#e0e5f0',
    floatingColor: '#a0a5b0', floatingTop: '#c0c5d0',
    brickColor: '#8090a0', brickDark: '#607080', brickLight: '#a0b0c0',
    bgElementColor: '#151525', bgDetailColor: '#2a2a3a',
    moonColor: '#e0e8ff', starsColor: '#aaccff',
    fogColor: '#c0c5d0', fogAlpha: 0.2,
    icon: '❄️',
  },
  swamp: {
    name: 'Pântano Tóxico',
    skyTop: '#050a05', skyMid: '#0a150a', skyBottom: '#081208',
    groundColor: '#2a3a18', groundDark: '#1a2a08', grassColor: '#3a5a20',
    floatingColor: '#4a5a30', floatingTop: '#5a7a40',
    brickColor: '#3a4a2a', brickDark: '#2a3a1a', brickLight: '#5a6a4a',
    bgElementColor: '#0a1508', bgDetailColor: '#44ff00',
    moonColor: '#88ff88', starsColor: '#66ff66',
    fogColor: '#2a4a10', fogAlpha: 0.25,
    icon: '🐊',
  },
  volcano: {
    name: 'Vulcão',
    skyTop: '#1a0500', skyMid: '#2a0a00', skyBottom: '#3a1505',
    groundColor: '#3a2020', groundDark: '#2a1010', grassColor: '#ff4400',
    floatingColor: '#4a2a1a', floatingTop: '#ff6600',
    brickColor: '#5a3020', brickDark: '#3a1a0a', brickLight: '#8a5030',
    bgElementColor: '#1a0500', bgDetailColor: '#ff3300',
    moonColor: '#ff4400', starsColor: '#ff6600',
    fogColor: '#ff2200', fogAlpha: 0.1,
    icon: '🌋',
  },
  cave: {
    name: 'Caverna Profunda',
    skyTop: '#050505', skyMid: '#0a0a0a', skyBottom: '#080808',
    groundColor: '#4a4040', groundDark: '#3a3030', grassColor: '#5a4a40',
    floatingColor: '#504540', floatingTop: '#605550',
    brickColor: '#5a5050', brickDark: '#3a3030', brickLight: '#7a7070',
    bgElementColor: '#0a0808', bgDetailColor: '#44aaff',
    moonColor: '#44aaff', starsColor: '#2288cc',
    fogColor: '#1a1a1a', fogAlpha: 0.3,
    icon: '🦇',
  },
  hospital: {
    name: 'Hospital Abandonado',
    skyTop: '#0a0a0a', skyMid: '#121215', skyBottom: '#0f0f12',
    groundColor: '#b0b0a8', groundDark: '#909088', grassColor: '#c0c0b8',
    floatingColor: '#a0a098', floatingTop: '#c0c0b8',
    brickColor: '#d0d0c8', brickDark: '#a0a098', brickLight: '#e0e0d8',
    bgElementColor: '#151518', bgDetailColor: '#225522',
    moonColor: '#aaffaa', starsColor: '#88dd88',
    fogColor: '#909090', fogAlpha: 0.15,
    icon: '🏥',
  },
  factory: {
    name: 'Fábrica',
    skyTop: '#0a0808', skyMid: '#151210', skyBottom: '#1a1510',
    groundColor: '#505050', groundDark: '#383838', grassColor: '#606060',
    floatingColor: '#686868', floatingTop: '#787878',
    brickColor: '#785030', brickDark: '#583010', brickLight: '#987050',
    bgElementColor: '#1a1510', bgDetailColor: '#ff8800',
    moonColor: '#ffaa00', starsColor: '#ff8800',
    fogColor: '#3a3020', fogAlpha: 0.15,
    icon: '🏭',
  },
  beach: {
    name: 'Praia Infestada',
    skyTop: '#0a0a20', skyMid: '#101535', skyBottom: '#15202a',
    groundColor: '#d4b878', groundDark: '#b49858', grassColor: '#c4a868',
    floatingColor: '#8a6a4a', floatingTop: '#a48a6a',
    brickColor: '#7a6a5a', brickDark: '#5a4a3a', brickLight: '#9a8a7a',
    bgElementColor: '#101530', bgDetailColor: '#2050aa',
    moonColor: '#e8e8ff', starsColor: '#aaccff',
    fogColor: '#204080', fogAlpha: 0.08,
    icon: '🏖️',
  },
  castle: {
    name: 'Castelo Gótico',
    skyTop: '#080510', skyMid: '#100a1a', skyBottom: '#0a0810',
    groundColor: '#505060', groundDark: '#383848', grassColor: '#484858',
    floatingColor: '#606070', floatingTop: '#707080',
    brickColor: '#606878', brickDark: '#404858', brickLight: '#808898',
    bgElementColor: '#0a0815', bgDetailColor: '#aa44ff',
    moonColor: '#ddaaff', starsColor: '#cc88ff',
    fogColor: '#2a1a40', fogAlpha: 0.2,
    icon: '🏰',
  },
  sewer: {
    name: 'Esgoto',
    skyTop: '#050808', skyMid: '#0a1010', skyBottom: '#081010',
    groundColor: '#3a4040', groundDark: '#2a3030', grassColor: '#44aa44',
    floatingColor: '#405050', floatingTop: '#506060',
    brickColor: '#3a4a3a', brickDark: '#2a3a2a', brickLight: '#5a6a5a',
    bgElementColor: '#081010', bgDetailColor: '#22aa44',
    moonColor: '#44ff88', starsColor: '#22cc66',
    fogColor: '#1a3a20', fogAlpha: 0.25,
    icon: '🐀',
  },
  highway: {
    name: 'Rodovia',
    skyTop: '#0a0808', skyMid: '#151010', skyBottom: '#1a1512',
    groundColor: '#404040', groundDark: '#2a2a2a', grassColor: '#505050',
    floatingColor: '#585858', floatingTop: '#686868',
    brickColor: '#606060', brickDark: '#404040', brickLight: '#808080',
    bgElementColor: '#121010', bgDetailColor: '#ffcc00',
    moonColor: '#ffdd44', starsColor: '#ffcc00',
    fogColor: '#2a2020', fogAlpha: 0.1,
    icon: '🛣️',
  },
  lab: {
    name: 'Laboratório',
    skyTop: '#0a0a10', skyMid: '#10101a', skyBottom: '#0a0a15',
    groundColor: '#c0c0c8', groundDark: '#a0a0a8', grassColor: '#d0d0d8',
    floatingColor: '#b0b0b8', floatingTop: '#c0c0c8',
    brickColor: '#a0a0b0', brickDark: '#808090', brickLight: '#c0c0d0',
    bgElementColor: '#0a0a15', bgDetailColor: '#00ddff',
    moonColor: '#00ddff', starsColor: '#0088ff',
    fogColor: '#0a1a2a', fogAlpha: 0.15,
    icon: '🧬',
  },
  rooftop: {
    name: 'Telhados',
    skyTop: '#05050a', skyMid: '#0a0a15', skyBottom: '#101020',
    groundColor: '#484848', groundDark: '#303030', grassColor: '#585858',
    floatingColor: '#505050', floatingTop: '#606060',
    brickColor: '#585858', brickDark: '#383838', brickLight: '#787878',
    bgElementColor: '#0a0a15', bgDetailColor: '#ff4444',
    moonColor: '#ffe8c8', starsColor: '#ffddaa',
    fogColor: '#1a1a2a', fogAlpha: 0.05,
    icon: '🏙️',
  },
  jungle: {
    name: 'Selva Perigosa',
    skyTop: '#050a05', skyMid: '#081008', skyBottom: '#0a150a',
    groundColor: '#2a4a18', groundDark: '#1a3a08', grassColor: '#3a6a20',
    floatingColor: '#4a6a30', floatingTop: '#5a8a40',
    brickColor: '#6a5a3a', brickDark: '#4a3a1a', brickLight: '#8a7a5a',
    bgElementColor: '#081008', bgDetailColor: '#2a6a10',
    moonColor: '#c8e8a8', starsColor: '#88cc44',
    fogColor: '#1a4a10', fogAlpha: 0.2,
    icon: '🌴',
  },
  arctic: {
    name: 'Base Ártica',
    skyTop: '#050510', skyMid: '#0a0a1a', skyBottom: '#0f1020',
    groundColor: '#c8d0e0', groundDark: '#a8b0c0', grassColor: '#d8e0f0',
    floatingColor: '#90a0b0', floatingTop: '#b0c0d0',
    brickColor: '#708090', brickDark: '#506070', brickLight: '#90a0b0',
    bgElementColor: '#0a0a1a', bgDetailColor: '#0088cc',
    moonColor: '#c0d8ff', starsColor: '#88bbff',
    fogColor: '#a0b0d0', fogAlpha: 0.2,
    icon: '🧊',
  },
  hell: {
    name: 'Inferno',
    skyTop: '#1a0000', skyMid: '#2a0500', skyBottom: '#3a0a00',
    groundColor: '#2a1010', groundDark: '#1a0808', grassColor: '#ff2200',
    floatingColor: '#3a1a0a', floatingTop: '#ff4400',
    brickColor: '#4a2010', brickDark: '#2a0a00', brickLight: '#6a3020',
    bgElementColor: '#1a0500', bgDetailColor: '#ff0000',
    moonColor: '#ff2200', starsColor: '#ff4400',
    fogColor: '#ff0000', fogAlpha: 0.15,
    icon: '👹',
  },
  finalBoss: {
    name: 'Arena Final',
    skyTop: '#0a0020', skyMid: '#150030', skyBottom: '#1a0040',
    groundColor: '#2a2040', groundDark: '#1a1030', grassColor: '#ff00ff',
    floatingColor: '#3a2050', floatingTop: '#aa00ff',
    brickColor: '#4a3060', brickDark: '#2a1040', brickLight: '#6a5080',
    bgElementColor: '#0a0020', bgDetailColor: '#ff00ff',
    moonColor: '#ff44ff', starsColor: '#ff00ff',
    fogColor: '#4a0060', fogAlpha: 0.2,
    icon: '💀',
  },
};

const themeKeys = [
  'forest', 'cemetery', 'city', 'desert', 'snow',
  'swamp', 'volcano', 'cave', 'hospital', 'factory',
  'beach', 'castle', 'sewer', 'highway', 'lab',
  'rooftop', 'jungle', 'arctic', 'hell', 'finalBoss',
];

export const LEVELS: LevelConfig[] = themeKeys.map((key, i) => ({
  id: i + 1,
  name: THEMES[key].name,
  theme: THEMES[key],
  zombieCount: 3 + i * 2,
  wavesRequired: Math.min(2 + Math.floor(i / 3), 6),
  platformSeed: i * 137 + 42,
}));

export function getLevelTheme(levelId: number): LevelTheme {
  const level = LEVELS.find(l => l.id === levelId);
  return level?.theme ?? THEMES.forest;
}
