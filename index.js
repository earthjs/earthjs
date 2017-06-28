import app from './src/earthjs';
import versorDragPlugin from './src/plugins/versorDragPlugin.js';
import wheelZoomPlugin from './src/plugins/wheelZoomPlugin.js';
import threejsPlugin from './src/plugins/threejsPlugin.js';
import canvasPlugin from './src/plugins/canvasPlugin.js';
import hoverCanvas from './src/plugins/hoverCanvas';
import oceanPlugin from './src/plugins/oceanPlugin.js';
import configPlugin from './src/plugins/configPlugin.js';
import graticuleCanvas from './src/plugins/graticuleCanvas.js';
import graticulePlugin from './src/plugins/graticulePlugin.js';
import dropShadowPlugin from './src/plugins/dropShadowPlugin.js';
import fauxGlobePlugin from './src/plugins/fauxGlobePlugin.js';
import autorotatePlugin from './src/plugins/autorotatePlugin.js';
import dotTooltipCanvas from './src/plugins/dotTooltipCanvas.js';
import countryTooltipCanvas from './src/plugins/countryTooltipCanvas.js';
import countryTooltipPlugin from './src/plugins/countryTooltipPlugin.js';
import barTooltipPlugin from './src/plugins/barTooltipPlugin.js';
import placesPlugin from './src/plugins/placesPlugin.js';
import worldCanvas from './src/plugins/worldCanvas.js';
import worldPlugin from './src/plugins/worldPlugin.js';
import worldThreejs from './src/plugins/worldThreejs.js';
import centerPlugin from './src/plugins/centerPlugin.js';
import flattenPlugin from './src/plugins/flattenPlugin.js';
import barPlugin from './src/plugins/barPlugin.js';
import dotsPlugin from './src/plugins/dotsPlugin.js';
import dotsCanvas from './src/plugins/dotsCanvas.js';
import pingsCanvas from './src/plugins/pingsCanvas.js';
import pingsPlugin from './src/plugins/pingsPlugin.js';
import debugThreejs from './src/plugins/debugThreejs.js';
import commonPlugins from './src/pluginLoader/commonPlugins';
app.plugins= {
    versorDragPlugin,
    wheelZoomPlugin,
    threejsPlugin,
    canvasPlugin,
    hoverCanvas,
    oceanPlugin,
    configPlugin,
    graticuleCanvas,
    graticulePlugin,
    dropShadowPlugin,
    fauxGlobePlugin,
    autorotatePlugin,
    dotTooltipCanvas,
    countryTooltipCanvas,
    countryTooltipPlugin,
    barTooltipPlugin,
    placesPlugin,
    worldCanvas,
    worldPlugin,
    worldThreejs,
    centerPlugin,
    flattenPlugin,
    barPlugin,
    dotsPlugin,
    dotsCanvas,
    pingsCanvas,
    pingsPlugin,
    debugThreejs,
    commonPlugins,
};
export default app;
