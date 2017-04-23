import app from './src/earthjs';
import versorDragPlugin from './src/plugins/versorDragPlugin.js';
import wheelZoomPlugin from './src/plugins/wheelZoomPlugin.js';
import oceanPlugin from './src/plugins/oceanPlugin.js';
import configPlugin from './src/plugins/configPlugin.js';
import graticulePlugin from './src/plugins/graticulePlugin.js';
import fauxGlobePlugin from './src/plugins/fauxGlobePlugin.js';
import autorotatePlugin from './src/plugins/autorotatePlugin.js';
import placesPlugin from './src/plugins/placesPlugin.js';
import worldPlugin from './src/plugins/worldPlugin.js';
import countryTooltipPlugin from './src/plugins/countryTooltipPlugin.js';

app.plugins = {
    versorDragPlugin,
    wheelZoomPlugin,
    oceanPlugin,
    configPlugin,
    graticulePlugin,
    fauxGlobePlugin,
    autorotatePlugin,
    placesPlugin,
    worldPlugin,
    countryTooltipPlugin
}
export default app;
