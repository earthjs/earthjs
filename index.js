import app from './src/earthjs';
import versorDragPlugin from './src/plugins/versorDragPlugin.js';
import wheelZoomPlugin from './src/plugins/wheelZoomPlugin.js';
import canvasPlugin from './src/plugins/canvasPlugin.js';
import oceanPlugin from './src/plugins/oceanPlugin.js';
import configPlugin from './src/plugins/configPlugin.js';
import graticulePlugin from './src/plugins/graticulePlugin.js';
import graticuleCanvas from './src/plugins/graticuleCanvas.js';
import fauxGlobePlugin from './src/plugins/fauxGlobePlugin.js';
import autorotatePlugin from './src/plugins/autorotatePlugin.js';
import placesPlugin from './src/plugins/placesPlugin.js';
import worldPlugin from './src/plugins/worldPlugin.js';
import centerPlugin from './src/plugins/centerPlugin.js';
import countryTooltipPlugin from './src/plugins/countryTooltipPlugin.js';
import flattenPlugin from './src/plugins/flattenPlugin.js';
import barPlugin from './src/plugins/barPlugin.js';
app.plugins= {
    versorDragPlugin,
    wheelZoomPlugin,
    canvasPlugin,
    oceanPlugin,
    configPlugin,
    graticulePlugin,
    graticuleCanvas,
    fauxGlobePlugin,
    autorotatePlugin,
    placesPlugin,
    worldPlugin,
    centerPlugin,
    countryTooltipPlugin,
    flattenPlugin,
    barPlugin
};
export default app;
