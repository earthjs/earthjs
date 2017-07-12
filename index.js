import app from './src/earthjs';
import configPlugin from './src/plugins/configPlugin.js';
import autorotatePlugin from './src/plugins/autorotatePlugin.js';
import mousePlugin from './src/plugins/mousePlugin.js';
import zoomPlugin from './src/plugins/zoomPlugin.js';
import threejsPlugin from './src/plugins/threejsPlugin.js';
import canvasPlugin from './src/plugins/canvasPlugin.js';
import hoverCanvas from './src/plugins/hoverCanvas';
import clickCanvas from './src/plugins/clickCanvas';
import dblClickCanvas from './src/plugins/dblClickCanvas';
import oceanSvg from './src/plugins/oceanSvg.js';
import graticuleCanvas from './src/plugins/graticuleCanvas.js';
import graticuleSvg from './src/plugins/graticuleSvg.js';
import dropShadowSvg from './src/plugins/dropShadowSvg.js';
import fauxGlobeSvg from './src/plugins/fauxGlobeSvg.js';
import dotSelectCanvas from './src/plugins/dotSelectCanvas.js';
import dotTooltipCanvas from './src/plugins/dotTooltipCanvas.js';
import countrySelectCanvas from './src/plugins/countrySelectCanvas.js';
import countryTooltipCanvas from './src/plugins/countryTooltipCanvas.js';
import countryTooltipSvg from './src/plugins/countryTooltipSvg.js';
import barTooltipSvg from './src/plugins/barTooltipSvg.js';
import placesSvg from './src/plugins/placesSvg.js';
import worldCanvas from './src/plugins/worldCanvas.js';
import worldSvg from './src/plugins/worldSvg.js';
import worldThreejs from './src/plugins/worldThreejs.js';
import centerCanvas from './src/plugins/centerCanvas.js';
import centerSvg from './src/plugins/centerSvg.js';
import flattenPlugin from './src/plugins/flattenPlugin.js';
import barSvg from './src/plugins/barSvg.js';
import dotsSvg from './src/plugins/dotsSvg.js';
import dotsCanvas from './src/plugins/dotsCanvas.js';
import pingsCanvas from './src/plugins/pingsCanvas.js';
import pingsSvg from './src/plugins/pingsSvg.js';
import debugThreejs from './src/plugins/debugThreejs.js';
import commonPlugins from './src/pluginLoader/commonPlugins';
app.plugins= {
    configPlugin,
    autorotatePlugin,
    mousePlugin,
    zoomPlugin,
    threejsPlugin,
    canvasPlugin,
    hoverCanvas,
    clickCanvas,
    dblClickCanvas,
    oceanSvg,
    graticuleCanvas,
    graticuleSvg,
    dropShadowSvg,
    fauxGlobeSvg,
    dotSelectCanvas,
    dotTooltipCanvas,
    countrySelectCanvas,
    countryTooltipCanvas,
    countryTooltipSvg,
    barTooltipSvg,
    placesSvg,
    worldCanvas,
    worldSvg,
    worldThreejs,
    centerCanvas,
    centerSvg,
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
