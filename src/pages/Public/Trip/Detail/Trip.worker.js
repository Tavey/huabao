import axios from "axios";
import {BASE_API_HOST} from "@/env";

let retry = 0;

const BaseURL = BASE_API_HOST;

const getTracks = (trip_id, vehicle_id, token) => {
    axios
        .get(`${BaseURL}/trips/${trip_id}?vehicle_id=${vehicle_id}`, {
            headers: {
                "X-Authorization": token
            }
        })
        .then(res => {
            if (res.data.status) {
                postMessage(res.data.data);
            }
        })
        .catch(err => {
            if (err && retry < 3) {
                retry++;
                getTracks(trip_id, vehicle_id, token);
            } else {
                postMessage(null);
            }
        });
};

onmessage = async params => {
    let {vehicle_id, trip_id, token} = params.data;
    getTracks(trip_id, vehicle_id, token);
};
