import earthjs from './npm/earthjs';
import autorotatePlugin from './npm/base/autorotatePlugin';
import inertiaPlugin from './npm/base/inertiaPlugin';
import mousePlugin from './npm/base/mousePlugin';

earthjs.plugins= {
    autorotatePlugin,
    inertiaPlugin,
    mousePlugin,
};
export default earthjs;
