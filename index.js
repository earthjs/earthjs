import app from './src/earthjs';
import configPlugin from './src/plugins/configPlugin';
import autorotatePlugin from './src/plugins/autorotatePlugin';
import mousePlugin from './src/plugins/mousePlugin';
import zoomPlugin from './src/plugins/zoomPlugin';
import threejsPlugin from './src/plugins/threejsPlugin';
import canvasPlugin from './src/plugins/canvasPlugin';
import hoverCanvas from './src/plugins/hoverCanvas';
import clickCanvas from './src/plugins/clickCanvas';
import dblClickCanvas from './src/plugins/dblClickCanvas';
import canvasThreejs from './src/plugins/canvasThreejs';
import oceanThreejs from './src/plugins/oceanThreejs';
import oceanSvg from './src/plugins/oceanSvg';
import sphereSvg from './src/plugins/sphereSvg';
import textureThreejs from './src/plugins/textureThreejs';
import graticuleCanvas from './src/plugins/graticuleCanvas';
import graticuleThreejs from './src/plugins/graticuleThreejs';
import graticuleSvg from './src/plugins/graticuleSvg';
import dropShadowSvg from './src/plugins/dropShadowSvg';
import fauxGlobeSvg from './src/plugins/fauxGlobeSvg';
import dotTooltipSvg from './src/plugins/dotTooltipSvg';
import dotSelectCanvas from './src/plugins/dotSelectCanvas';
import dotTooltipCanvas from './src/plugins/dotTooltipCanvas';
import countrySelectCanvas from './src/plugins/countrySelectCanvas';
import countryTooltipCanvas from './src/plugins/countryTooltipCanvas';
import countryTooltipSvg from './src/plugins/countryTooltipSvg';
import barTooltipSvg from './src/plugins/barTooltipSvg';
import placesSvg from './src/plugins/placesSvg';
import worldCanvas from './src/plugins/worldCanvas';
import worldSvg from './src/plugins/worldSvg';
import worldThreejs from './src/plugins/worldThreejs';
import imageThreejs from './src/plugins/imageThreejs';
import centerCanvas from './src/plugins/centerCanvas';
import centerSvg from './src/plugins/centerSvg';
import flattenPlugin from './src/plugins/flattenPlugin';
import barSvg from './src/plugins/barSvg';
import dotsSvg from './src/plugins/dotsSvg';
import pinCanvas from './src/plugins/pinCanvas';
import dotsCanvas from './src/plugins/dotsCanvas';
import dotsThreejs from './src/plugins/dotsThreejs';
import dotsCThreejs from './src/plugins/dotsCThreejs';
import pingsCanvas from './src/plugins/pingsCanvas';
import pingsSvg from './src/plugins/pingsSvg';
import debugThreejs from './src/plugins/debugThreejs';
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
    canvasThreejs,
    oceanThreejs,
    oceanSvg,
    sphereSvg,
    textureThreejs,
    graticuleCanvas,
    graticuleThreejs,
    graticuleSvg,
    dropShadowSvg,
    fauxGlobeSvg,
    dotTooltipSvg,
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
    imageThreejs,
    centerCanvas,
    centerSvg,
    flattenPlugin,
    barSvg,
    dotsSvg,
    pinCanvas,
    dotsCanvas,
    dotsThreejs,
    dotsCThreejs,
    pingsCanvas,
    pingsSvg,
    debugThreejs,
    commonPlugins,
};
export default app;
