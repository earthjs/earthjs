export default function() { // function is required for arguments works
    /*eslint no-console: 0 */
    var _ = {
        data: {},
        nm_to_id: {},
        geometries: [],
    };
    var args = arguments;

    return {
        name: 'world3dJson',
        urls: Array.prototype.slice.call(args),
        onReady: function onReady(err, json, nm_to_id) {
            _.me.data(json);
            if (nm_to_id) {
                _.me.arrayOfGeometry(nm_to_id);
            }
        },
        onInit: function onInit(me) {
            _.me = me;
        },
        data: function data(data$1) {
            if (data$1) {
                _.data = data$1;
            } else {
                return _.data;
            }
        },
        message: function message(fn) {
            _.data = _.data.map(fn);
        },
        allData: function allData(all) {
            if (all) {
                _.data = all.data;
            } else {
                var data = _.data;
                var geometries = _.geometries;
                var nm_to_id = _.nm_to_id;
                return {data: data, geometries: geometries, nm_to_id: nm_to_id};
            }
        },
        arrayOfGeometry: function arrayOfGeometry(data) {
            var features = [];
            for (var name in _.data) {
                var geometry = _.data[name];
                var cid = data[name.toUpperCase()];
                var properties = {cid: cid};
                geometry.properties = properties;
                features.push({properties: properties, geometry: geometry});
            }
            _.nm_to_id = data;
            _.geometries = {features: features};
        }
    }
}
