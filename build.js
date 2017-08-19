import earthjs from './src/earthjs';

import worldJson       from './src/data/worldJson';
import choroplethCsv   from './src/data/choroplethCsv';
import countryNamesCsv from './src/data/countryNamesCsv';

import hoverCanvas      from './src/base/hoverCanvas';
import clickCanvas      from './src/base/clickCanvas';
import mousePlugin      from './src/base/mousePlugin';
import configPlugin     from './src/base/configPlugin';
import canvasPlugin     from './src/base/canvasPlugin';
import countryCanvas    from './src/base/countryCanvas';
import threejsPlugin    from './src/base/threejsPlugin';
import dblClickCanvas   from './src/base/dblClickCanvas';
import autorotatePlugin from './src/base/autorotatePlugin';

import oceanSvg             from './src/plugins/oceanSvg';
import sphereSvg            from './src/plugins/sphereSvg';
import zoomPlugin           from './src/plugins/zoomPlugin';
import fauxGlobeSvg         from './src/plugins/fauxGlobeSvg';
import graticuleSvg         from './src/plugins/graticuleSvg';
import dropShadowSvg        from './src/plugins/dropShadowSvg';
import dotTooltipSvg        from './src/plugins/dotTooltipSvg';
import dotSelectCanvas      from './src/plugins/dotSelectCanvas';
import graticuleCanvas      from './src/plugins/graticuleCanvas';
import dotTooltipCanvas     from './src/plugins/dotTooltipCanvas';
import countrySelectCanvas  from './src/plugins/countrySelectCanvas';
import countryTooltipCanvas from './src/plugins/countryTooltipCanvas';
import countryTooltipSvg    from './src/plugins/countryTooltipSvg';
import barTooltipSvg        from './src/plugins/barTooltipSvg';
import worldCanvas          from './src/plugins/worldCanvas';
import centerSvg            from './src/plugins/centerSvg';
import placesSvg            from './src/plugins/placesSvg';
import worldSvg             from './src/plugins/worldSvg';
import barSvg               from './src/plugins/barSvg';
import dotsSvg              from './src/plugins/dotsSvg';
import pingsSvg             from './src/plugins/pingsSvg';
import pinCanvas            from './src/plugins/pinCanvas';
import dotsCanvas           from './src/plugins/dotsCanvas';
import pingsCanvas          from './src/plugins/pingsCanvas';
import centerCanvas         from './src/plugins/centerCanvas';
import flattenPlugin        from './src/plugins/flattenPlugin';

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
import globeThreejs       from './src/threejs/globeThreejs';
import sphereThreejs      from './src/threejs/sphereThreejs';
import world3d            from './src/threejs/world3d';
import world3d2           from './src/threejs/world3d2';

import commonPlugins    from './src/mixed/commonPlugins';
import selectCountryMix from './src/mixed/selectCountryMix';

earthjs.plugins= {
    worldJson,
    choroplethCsv,
    countryNamesCsv,

    hoverCanvas,
    clickCanvas,
    mousePlugin,
    configPlugin,
    canvasPlugin,
    countryCanvas,
    threejsPlugin,
    dblClickCanvas,
    autorotatePlugin,

    oceanSvg,
    sphereSvg,
    zoomPlugin,
    fauxGlobeSvg,
    graticuleSvg,
    dropShadowSvg,
    dotTooltipSvg,
    dotSelectCanvas,
    graticuleCanvas,
    dotTooltipCanvas,
    countrySelectCanvas,
    countryTooltipCanvas,
    countryTooltipSvg,
    barTooltipSvg,
    worldCanvas,
    centerSvg,
    placesSvg,
    worldSvg,
    barSvg,
    dotsSvg,
    pingsSvg,
    pinCanvas,
    dotsCanvas,
    pingsCanvas,
    centerCanvas,
    flattenPlugin,

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
    globeThreejs,
    sphereThreejs,
    world3d,
    world3d2,

    commonPlugins,
    selectCountryMix,
};
export default earthjs;
