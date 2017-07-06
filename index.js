import app from './src/earthjs';
import versorDragPlugin from './src/plugins/versorDragPlugin.js';
import wheelZoomPlugin from './src/plugins/wheelZoomPlugin.js';
import threejsPlugin from './src/plugins/threejsPlugin.js';
import canvasPlugin from './src/plugins/canvasPlugin.js';
import hoverCanvas from './src/plugins/hoverCanvas';
import clickCanvas from './src/plugins/clickCanvas';
import oceanSvg from './src/plugins/oceanSvg.js';
import configPlugin from './src/plugins/configPlugin.js';
import graticuleCanvas from './src/plugins/graticuleCanvas.js';
import graticuleSvg from './src/plugins/graticuleSvg.js';
import dropShadowSvg from './src/plugins/dropShadowSvg.js';
import fauxGlobeSvg from './src/plugins/fauxGlobeSvg.js';
import autorotatePlugin from './src/plugins/autorotatePlugin.js';
import dotTooltipCanvas from './src/plugins/dotTooltipCanvas.js';
import countryTooltipCanvas from './src/plugins/countryTooltipCanvas.js';
import countryTooltipSvg from './src/plugins/countryTooltipSvg.js';
import barTooltipSvg from './src/plugins/barTooltipSvg.js';
import placesSvg from './src/plugins/placesSvg.js';
import worldCanvas from './src/plugins/worldCanvas.js';
import worldSvg from './src/plugins/worldSvg.js';
import worldThreejs from './src/plugins/worldThreejs.js';
import centerPlugin from './src/plugins/centerPlugin.js';
import flattenPlugin from './src/plugins/flattenPlugin.js';
import barSvg from './src/plugins/barSvg.js';
import dotsSvg from './src/plugins/dotsSvg.js';
import dotsCanvas from './src/plugins/dotsCanvas.js';
import pingsCanvas from './src/plugins/pingsCanvas.js';
import pingsSvg from './src/plugins/pingsSvg.js';
import debugThreejs from './src/plugins/debugThreejs.js';
import commonPlugins from './src/pluginLoader/commonPlugins';
app.plugins= {
    versorDragPlugin,
    wheelZoomPlugin,
    threejsPlugin,
    canvasPlugin,
    hoverCanvas,
    clickCanvas,
    oceanSvg,
    configPlugin,
    graticuleCanvas,
    graticuleSvg,
    dropShadowSvg,
    fauxGlobeSvg,
    autorotatePlugin,
    dotTooltipCanvas,
    countryTooltipCanvas,
    countryTooltipSvg,
    barTooltipSvg,
    placesSvg,
    worldCanvas,
    worldSvg,
    worldThreejs,
    centerPlugin,
    flattenPlugin,
    barSvg,
    dotsSvg,
    dotsCanvas,
    pingsCanvas,
    pingsSvg,
    debugThreejs,
    commonPlugins,
};
export default app;
