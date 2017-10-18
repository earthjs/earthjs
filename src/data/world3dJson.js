export default function() { // function is required for arguments works
    /*eslint no-console: 0 */
    const _ = {
        data: {},
        nm_to_id: {},
        geometries: [],
    };
    const args = arguments;

    return {
        name: 'world3dJson',
        urls: Array.prototype.slice.call(args),
        onReady(err, json, nm_to_id) {
            _.me.data(json);
            if (nm_to_id) {
                _.me.arrayOfGeometry(nm_to_id);
            }
        },
        onInit(me) {
            _.me = me;
        },
        data(data) {
            if (data) {
                _.data = data;
            } else {
                return _.data;
            }
        },
        message(fn) {
            _.data = _.data.map(fn);
        },
        allData(all) {
            if (all) {
                _.data = all.data;
            } else {
                const  {data, geometries, nm_to_id} = _;
                return {data, geometries, nm_to_id};
            }
        },
        arrayOfGeometry(data) {
            const features = [];
            for (let name in _.data) {
                const geometry = _.data[name];
                const cid = data[name.toUpperCase()];
                const properties = {cid};
                geometry.properties = properties;
                features.push({properties, geometry});
            }
            _.nm_to_id = data;
            _.geometries = {features};
        }
    }
}
