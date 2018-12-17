export default class Gps {
    pi = 3.14159265358979324;
    a = 6378245.0;
    ee = 0.00669342162296594323;

    constructor(longitude, latitude, speed, direction, altitude, sampleTime) {
        this.longitude = Number(longitude);
        this.latitude = Number(latitude);
        this.speed = Number(speed);
        this.direction = Number(direction);
        this.altitude = Number(altitude);
        this.sampleTime = sampleTime;
        this.isTransformed = false;
    }


    isOutOfChina() {
        let polygon = [
            [87.756289, 49.194132],
            [90.74457, 47.707773],
            [92.06293, 45.319176],
            [95.754336, 45.009329],
            [97.731875, 42.954259],
            [110.871524, 44.069677],
            [111.75043, 45.319176],
            [116.452578, 49.878573],
            [120.583438, 53.577707],
            [125.109805, 53.967274],
            [128.537539, 50.915024],
            [131.921328, 48.23734],
            [135.173281, 48.732506],
            [135.74457, 48.208062],
            [131.657656, 42.631784],
            [130.69086, 42.275122],
            [128.405703, 41.3581],
            [124.40668, 39.823143],
            [122.692813, 37.03528],
            [123.176211, 30.578635],
            [122.25336, 28.127521],
            [120.759219, 25.698274],
            [118.298281, 23.016356],
            [116.05707, 22.530124],
            [114.837588, 22.357503],
            [114.497012, 22.395599],
            [114.453067, 22.509826],
            [114.461306, 22.545344],
            [114.392642, 22.583389],
            [114.134463, 22.527587],
            [113.969668, 22.484451],
            [113.870791, 22.420991],
            [113.70325, 22.266029],
            [113.620852, 22.194841],
            [113.579654, 22.21423],
            [113.538455, 22.21423],
            [113.535708, 22.173541],
            [113.576907, 22.023397],
            [112.882022, 21.482588],
            [112.332705, 19.693148],
            [109.959658, 17.129108],
            [107.015322, 17.695181],
            [106.817569, 20.333164],
            [107.916201, 21.56435],
            [104.005069, 22.053948],
            [102.335147, 21.073093],
            [99.083194, 20.991057],
            [96.622256, 24.635905],
            [97.940615, 26.695438],
            [96.358584, 27.555883],
            [91.5246, 26.065539],
            [80.977725, 29.256567],
            [76.934756, 32.499451],
            [74.385928, 36.623351],
            [72.628115, 39.866637],
            [77.989444, 43.984018],
            [83.350772, 48.2458],
            [87.042178, 49.574299],
            [87.756289, 49.194132]
        ];

        let x = this.longitude, y = this.latitude;

        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            let xi = polygon[i][0], yi = polygon[i][1];
            let xj = polygon[j][0], yj = polygon[j][1];

            let intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return !inside;
    }

    isIllegal() {
        if (this.longitude == 0 && this.latitude == 0)
            return true;
        if (this.longitude < -180 || this.longitude > 180)
            return true;
        if (this.latitude < -90 || this.latitude > 90)
            return true;
        return false;
    }

    _transformLatitude(x, y) {
        var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * this.pi) + 20.0 * Math.sin(2.0 * x * this.pi)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(y * this.pi) + 40.0 * Math.sin(y / 3.0 * this.pi)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(y / 12.0 * this.pi) + 320 * Math.sin(y * this.pi / 30.0)) * 2.0 / 3.0;
        return ret;
    };

    _transformLongitude(x, y) {
        var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * this.pi) + 20.0 * Math.sin(2.0 * x * this.pi)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(x * this.pi) + 40.0 * Math.sin(x / 3.0 * this.pi)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(x / 12.0 * this.pi) + 300.0 * Math.sin(x / 30.0 * this.pi)) * 2.0 / 3.0;
        return ret;
    };

    transform() {
        if (this.isIllegal()) {
            return null;
        }
        if (this.isOutOfChina() || this.isTransformed) {
            return this;
        }
        let dLat = this._transformLatitude(this.longitude - 105.0, this.latitude - 35.0);
        let dLon = this._transformLongitude(this.longitude - 105.0, this.latitude - 35.0);
        let radLat = this.latitude / 180.0 * this.pi;
        let magic = Math.sin(radLat);
        magic = 1 - this.ee * magic * magic;
        let sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((this.a * (1 - this.ee)) / (magic * sqrtMagic) * this.pi);
        dLon = (dLon * 180.0) / (this.a / sqrtMagic * Math.cos(radLat) * this.pi);
        this.latitude = this.latitude + dLat;
        this.longitude = this.longitude + dLon;
        this.isTransformed = true;
        return this;
    }

    toArray() {
        return [this.longitude, this.latitude];
    }

    toReArray() {
        return [this.latitude, this.longitude];
    }
}


