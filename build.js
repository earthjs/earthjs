import earthjs from './src/earthjs';
import configPlugin from './src/plugins/configPlugin';
import autorotatePlugin from './src/plugins/autorotatePlugin';
import countryCanvas from './src/plugins/countryCanvas';
import mousePlugin from './src/plugins/mousePlugin';
import zoomPlugin from './src/plugins/zoomPlugin';
import canvasPlugin from './src/plugins/canvasPlugin';
import hoverCanvas from './src/plugins/hoverCanvas';
import clickCanvas from './src/plugins/clickCanvas';
import dblClickCanvas from './src/plugins/dblClickCanvas';
import oceanSvg from './src/plugins/oceanSvg';
import sphereSvg from './src/plugins/sphereSvg';
import graticuleCanvas from './src/plugins/graticuleCanvas';
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
import centerCanvas from './src/plugins/centerCanvas';
import centerSvg from './src/plugins/centerSvg';
import flattenPlugin from './src/plugins/flattenPlugin';
import barSvg from './src/plugins/barSvg';
import dotsSvg from './src/plugins/dotsSvg';
import pinCanvas from './src/plugins/pinCanvas';
import dotsCanvas from './src/plugins/dotsCanvas';
import pingsCanvas from './src/plugins/pingsCanvas';
import pingsSvg from './src/plugins/pingsSvg';

import threejsPlugin      from './src/threejs/threejsPlugin';
import barThreejs         from './src/threejs/barThreejs';
import hmapThreejs        from './src/threejs/hmapThreejs';
import dotsThreejs        from './src/threejs/dotsThreejs';
import dotsCThreejs       from './src/threejs/dotsCThreejs';
import iconsThreejs       from './src/threejs/iconsThreejs';
import canvasThreejs      from './src/threejs/canvasThreejs';
import textureThreejs     from './src/threejs/textureThreejs';
import graticuleThreejs   from './src/threejs/graticuleThreejs';
import flightLineThreejs  from './src/threejs/flightLineThreejs';
import flightLine2Threejs from './src/threejs/flightLine2Threejs';
import debugThreejs       from './src/threejs/debugThreejs';
import oceanThreejs       from './src/threejs/oceanThreejs';
import imageThreejs       from './src/threejs/imageThreejs';
import worldThreejs       from './src/threejs/worldThreejs';
import world3d            from './src/threejs/world3d';
import world3d2           from './src/threejs/world3d2';

import commonPlugins from './src/pluginLoader/commonPlugins';
earthjs.plugins= {
    configPlugin,
    autorotatePlugin,
    countryCanvas,
    mousePlugin,
    zoomPlugin,
    canvasPlugin,
    hoverCanvas,
    clickCanvas,
    dblClickCanvas,
    oceanSvg,
    sphereSvg,
    graticuleCanvas,
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
    centerCanvas,
    centerSvg,
    flattenPlugin,
    barSvg,
    dotsSvg,
    pinCanvas,
    dotsCanvas,
    pingsCanvas,
    pingsSvg,

    threejsPlugin,
    barThreejs,
    hmapThreejs,
    dotsThreejs,
    dotsCThreejs,
    iconsThreejs,
    canvasThreejs,
    textureThreejs,
    graticuleThreejs,
    flightLineThreejs,
    flightLine2Threejs,
    debugThreejs,
    oceanThreejs,
    imageThreejs,
    worldThreejs,
    world3d,
    world3d2,

    commonPlugins,
};
export default earthjs;
