import earthjs from './npm/earthjs';
import configPlugin from './npm/plugins/configPlugin';
import autorotatePlugin from './npm/plugins/autorotatePlugin';
import countryCanvas from './npm/plugins/countryCanvas';
import mousePlugin from './npm/plugins/mousePlugin';

earthjs.plugins= {
    configPlugin,
    autorotatePlugin,
    countryCanvas,
    mousePlugin,
};
export default earthjs;
