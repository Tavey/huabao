// import Vue from 'vue';
import axios from "axios";
import * as request from "./RequestClient";
import qs from "qs";
import i18n from "@/languages/i18n";
import {BASE_API_HOST} from "@/env";

export default {
    install(Vue, pluginOptions = {}) {
        let googleKey = "AIzaSyDpfGZo2e8pDHGEFqQkwL-WGv33-YjMMY8";
        let googleClient = new request.Client({
            baseURL: "https://gstand.huabao.io/google-map"
        });
        let requestClient = new request.Client(
            {
                baseURL: BASE_API_HOST,
            },
            {
                tokenGetter: () => {
                    let loginInfo = localStorage.getItem("loginInfo");
                    let token = null;
                    if (loginInfo != null) {
                        loginInfo = JSON.parse(loginInfo);
                        if (loginInfo.token) {
                            token = loginInfo.token.token;
                        }
                    }
                    return token;
                },
                languageGetter: () => {
                    let loginInfo = localStorage.getItem("loginInfo");
                    let language = null;
                    if (loginInfo != null) {
                        loginInfo = JSON.parse(loginInfo);
                        if (loginInfo.settings) {
                            language = loginInfo.settings.language;
                        }
                    }
                    return language;
                },
                defaultHandler: error => {
                    let $loading = Vue.prototype.$loading();
                    Vue.nextTick(() => {
                        $loading.close();
                    });
                },
                globalErrorHandler: error => {
                    if (axios.isCancel(error)) {
                    } else if (error.response) {
                        if (error.response.status == 401) {
                            window.location.href = "/login";
                        }
                        let msg = error.response.data.msg;
                        Vue.prototype.$message({
                            showClose: true,
                            message: i18n.t(msg),
                            type: "error"
                        });
                    } else {
                    }
                    return Promise.reject(error);
                }
            }
        );
        Vue.prototype.SaaSApi = {
            getBaseUrl() {
                return requestClient.options.baseURL;
            },
            getConfigBySubDomain(sub_domain, options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/config/domain/${sub_domain}`,
                    {},
                    {},
                    options
                );
            },
            login(name, password, options = {}) {
                return requestClient.fetch(
                    request.METHOD_POST,
                    "/login",
                    {name, password},
                    {},
                    options
                );
            },
            logout(options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    "/logout",
                    {},
                    {},
                    options
                );
            },
            /*
            公司相关
             */
            getCompanies(parent_id, options = {}) {
                if (!parent_id) {
                    return new Promise(() => {
                    });
                }
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/companies/${parent_id}/companies`,
                    {},
                    {},
                    options
                );
            },
            getCompanyGlobalStatistics(company_id, options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/companies/${company_id}/statistics/global`,
                    {},
                    {},
                    options
                );
            },
            getCompanyVehicleStatistics(company_id,
                                        begin_at,
                                        end_at,
                                        dimension,
                                        options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/companies/${company_id}/statistics/vehicle`,
                    {
                        begin_at,
                        end_at,
                        dimension
                    },
                    {},
                    options
                );
            },
            getCompanyEventStatistics(company_id,
                                      begin_at,
                                      end_at,
                                      dimension,
                                      options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/companies/${company_id}/statistics/event`,
                    {
                        begin_at,
                        end_at,
                        dimension
                    },
                    {},
                    options
                );
            },
            // getCompanyDeviceStatistics(company_id, options = {}) {
            //     return requestClient.fetch(
            //         request.METHOD_GET,
            //         `/companies/${company_id}/statistics/device`,
            //         {},
            //         {},
            //         options
            //     );
            // },
            getCompanyDeviceStatistics(company_id,
                                       begin_at,
                                       end_at,
                                       dimension,
                                       options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/companies/${company_id}/statistics/device`,
                    {
                        begin_at,
                        end_at,
                        dimension
                    },
                    {},
                    options
                );
            },
            /**
             * 创建公司
             * @param company_id
             * @param entity
             *    name，address，type，contact，created_by，city
             * @returns {AxiosPromise<any>}
             */
            createCompany(company_id, entity, options = {}) {
                return requestClient.fetch(
                    request.METHOD_POST,
                    `/companies`,
                    {parent_id: company_id, ...entity},
                    {},
                    options
                );
            },
            /**
             * 编辑公司
             * @param company_id
             * @param entity
             *    name，address，type，contact，city
             * @returns {AxiosPromise<any>}
             */
            editCompany(company_id, entity, options = {}) {
                return requestClient.fetch(
                    request.METHOD_PUT,
                    `/companies/${company_id}`,
                    entity,
                    {},
                    options
                );
            },
            /*
            设备相关
             */
            getDevices(company_id, filter, page, page_size, options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/devices`,
                    {company_id, filter, page, page_size},
                    {},
                    {
                        paramsSerializer: function (params) {
                            return qs.stringify(params);
                        },
                        ...options
                    }
                );
            },
            getDeviceTrack(device_id, start_time, end_time, options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/devices/${device_id}/track`,
                    {
                        start_time,
                        end_time
                    },
                    {},
                    options
                );
            },
            getDeviceByCompany(company_id, device_id, options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/companies/${company_id}/devices/${device_id}`,
                    {},
                    {},
                    options
                );
            },
            /**
             * 批量获取设备最新位置
             * @param device_ids
             * @returns {AxiosPromise<any>}
             */
            getDeviceLatestPointMulti(device_ids, options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/devices/gps/latest`,
                    {
                        devices: device_ids
                    },
                    {},
                    {
                        paramsSerializer: function (params) {
                            return qs.stringify(params);
                        }, ...options
                    }
                );
            },
            /**
             * 获取设备最新位置
             * @param device_id
             * @returns {AxiosPromise<any>}
             */
            getDeviceLatestPoint(device_id, options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/devices/${device_id}/gps/latest`,
                    {},
                    {},
                    options
                );
            },
            /**
             * 创建设备
             * @param company_id
             * @param entity
             *    sn, type, hardware_version, hardware_model, manufacturer
             * @returns {AxiosPromise<any>}
             */
            createDevice(company_id, entity, options = {}) {
                return requestClient.fetch(
                    request.METHOD_POST,
                    `/devices`,
                    {company_id, ...entity},
                    {},
                    options
                );
            },
            /**
             * 编辑设备
             * @param device_id
             * @param entity
             *    sn, type, hardware_version, hardware_model, manufacturer
             * @returns {AxiosPromise<any>}
             */
            editDevice(device_id, entity, options = {}) {
                return requestClient.fetch(
                    request.METHOD_PUT,
                    `/devices/${device_id}`,
                    entity,
                    {},
                    options
                );
            },
            /**
             * 分配设备
             * @param company_id
             * @param devices
             * @param options
             * @return {AxiosPromise<any>|*|Promise<Response>}
             */
            distributeDevices(company_id, devices, options = {}) {
                return requestClient.fetch(
                    request.METHOD_POST,
                    `/devices/distribute/to/companies/${company_id}`,
                    {devices},
                    {},
                    {
                        paramsSerializer: function (params) {
                            return qs.stringify(params);
                        }, ...options
                    }
                );
            },
            /**
             * 回收设备
             * @param company_id
             * @param devices
             * @param options
             * @return {AxiosPromise<any>|*|Promise<Response>}
             */
            recycleDevices(company_id, devices, options = {}) {
                return requestClient.fetch(
                    request.METHOD_POST,
                    `/devices/recycle/to/companies/${company_id}`,
                    {devices},
                    {},
                    {
                        paramsSerializer: function (params) {
                            return qs.stringify(params);
                        }, ...options
                    }
                );
            },
            //绑定新设备
            bindNewVehicleDevice(vehicle_id, device_sn, options = {}) {
                return requestClient.fetch(
                    request.METHOD_POST,
                    `/vehicles/${vehicle_id}/devices/${device_sn}`,
                    {},
                    {},
                    options
                );
            },
            //更换设备
            changeVehicleDevice(vehicle_id,
                                device_sn,
                                new_device_sn,
                                options = {}) {
                return requestClient.fetch(
                    request.METHOD_PUT,
                    `/vehicles/${vehicle_id}/devices/${device_sn}?new_device_sn=${new_device_sn}`,
                    {},
                    {},
                    options
                );
            },
            //解绑设备
            deleteVehicleDevice(vehicle_id, device_sn, options = {}) {
                return requestClient.fetch(
                    request.METHOD_DELETE,
                    `/vehicles/${vehicle_id}/devices/${device_sn}`,
                    {},
                    {},
                    options
                );
            },
            /*
              车辆相关
            */
            getVehicles(company_id,
                        plate_num,
                        device_sn,
                        extra,
                        page,
                        page_size,
                        options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/vehicles`,
                    {
                        company_id,
                        plate_num,
                        device_sn,
                        extra,
                        page,
                        page_size
                    },
                    {},
                    options
                );
            },
            getVehicle(vehicle_id, options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/vehicles/${vehicle_id}`,
                    {},
                    {},
                    options
                );
            },
            // getVehiclesWithLatestGps(company_id, device_sn, plate_num, options = {}) {
            //     return requestClient.fetch(
            //         request.METHOD_GET,
            //         `/vehicles/location`,
            //         {company_id, plate_num, device_sn}, {}, options)
            // },
            getVehiclesOnlyLatestGpsByPage(company_id,
                                           page,
                                           page_size,
                                           options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/vehicles/location/only/page`,
                    {company_id, page, page_size},
                    {},
                    options
                );
            },
            // getVehiclesWithLatestGpsByPage(company_id,
            //                                device_sn,
            //                                plate_num,
            //                                page,
            //                                page_size,
            //                                options = {}) {
            //     return requestClient.fetch(
            //         request.METHOD_GET,
            //         `/vehicles/location/page`,
            //         {company_id, plate_num, device_sn, page, page_size},
            //         {},
            //         options
            //     );
            // },
            // getVehiclesTileConfig(company_id, map_width, map_height, zoom_max, zoom_min, options = {}) {
            //     return requestClient.fetch(
            //         request.METHOD_GET,
            //         `/companies/${company_id}/vehicles/tiles/config`,
            //         {
            //             map_dim: {width: map_width, height: map_height},
            //             zoom_max: zoom_max,
            //             zoom_min: zoom_min
            //         }, {}, {
            //             paramsSerializer: function (params) {
            //                 return qs.stringify(params);
            //             }, ...options
            //         })
            // },
            /**
             * 分数首页接口
             * @param vehicle_id
             * @param options
             * @returns {AxiosPromise<any>|*|Promise<Response>}
             */
            getVehicleScore(vehicle_id, options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/vehicles/${vehicle_id}/score`,
                    {},
                    {},
                    options
                );
            },
            /**
             * 总分
             * @param vehicle_id
             * @param start_date
             * @param end_data
             * @param options
             * @returns {AxiosPromise<any>|*|Promise<Response>}
             */
            getVehicleTotalScore(vehicle_id,
                                 start_date,
                                 end_date,
                                 options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/vehicles/${vehicle_id}/score/total`,
                    {start_date, end_date},
                    {},
                    options
                );
            },
            /**
             * 安全
             * @param vehicle_id
             * @param start_date
             * @param end_data
             * @param options
             * @returns {AxiosPromise<any>|*|Promise<Response>}
             */
            getVehicleSafetyScore(vehicle_id,
                                  start_date,
                                  end_date,
                                  options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/vehicles/${vehicle_id}/score/safety`,
                    {start_date, end_date},
                    {},
                    options
                );
            },
            /**
             * 道路
             * @param vehicle_id
             * @param start_date
             * @param end_data
             * @param options
             * @returns {AxiosPromise<any>|*|Promise<Response>}
             */
            getVehicleRoadScore(vehicle_id,
                                start_date,
                                end_date,
                                options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/vehicles/${vehicle_id}/score/road`,
                    {start_date, end_date},
                    {},
                    options
                );
            },
            /**
             * 环境
             * @param vehicle_id
             * @param start_date
             * @param end_data
             * @param options
             * @returns {AxiosPromise<any>|*|Promise<Response>}
             */
            getVehicleEnvironmentScore(vehicle_id,
                                       start_date,
                                       end_date,
                                       options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/vehicles/${vehicle_id}/score/environment`,
                    {start_date, end_date},
                    {},
                    options
                );
            },
            /**
             * 使用
             * @param vehicle_id
             * @param start_date
             * @param end_data
             * @param options
             * @returns {AxiosPromise<any>|*|Promise<Response>}
             */
            getVehicleUsageScore(vehicle_id,
                                 start_date,
                                 end_date,
                                 options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/vehicles/${vehicle_id}/score/usage`,
                    {start_date, end_date},
                    {},
                    options
                );
            },
            /**
             * 创建车辆
             * @param company_id
             * @param plate_num
             * @param entity
             *    vin，engine_num，use_type，brand_name，purchased_at：YYYY-MM-DD，driver_name，driver_mobile，model_id
             * @returns {AxiosPromise<any>}
             */
            createVehicle(company_id, plate_num, entity, options = {}) {
                return requestClient.fetch(
                    request.METHOD_POST,
                    `/vehicles`,
                    {company_id, plate_num, ...entity},
                    {},
                    options
                );
            },
            /**
             * 编辑车辆
             * @param vehicle_id
             * @param entity
             *    plate_num，vin，engine_num，use_type，brand_name，purchased_at：YYYY-MM-DD，driver_name，driver_mobile，model_id
             * @returns {AxiosPromise<any>}
             */
            editVehicle(vehicle_id, entity, options = {}) {
                return requestClient.fetch(
                    request.METHOD_PUT,
                    `/vehicles/${vehicle_id}`,
                    entity,
                    {},
                    options
                );
            },
            /*
            用户相关
             */
            getUsers(company_id, page, page_size, options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/users`,
                    {
                        company_id, page, page_size
                    },
                    {},
                    options
                );
            },
            /**
             * 创建用户
             * @param company_id
             * @param entity
             *    name，password，mobile，created_by
             * @returns {AxiosPromise<any>}
             */
            createUser(company_id, entity, options = {}) {
                return requestClient.fetch(
                    request.METHOD_POST,
                    `/users`,
                    {company_id, ...entity},
                    {},
                    options
                );
            },
            /**
             * 编辑用户
             * @param user_id
             * @param entity
             *    name，password，mobile
             * @returns {AxiosPromise<any>}
             */
            editUser(user_id, entity, options = {}) {
                return requestClient.fetch(
                    request.METHOD_PUT,
                    `/users/${user_id}`,
                    entity,
                    {},
                    options
                );
            },
            editOwnPassword(old_password, password, options = {}) {
                return requestClient.fetch(
                    request.METHOD_PUT,
                    `/users/my/password`,
                    {old_password, password},
                    {},
                    options
                );
            },
            /*
            事件相关
             */
            getEvents(company_id,
                      begin_at,
                      end_at,
                      types,
                      plate_num,
                      device_sn,
                      page,
                      page_size,
                      options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/events`,
                    {
                        company_id,
                        begin_at,
                        end_at,
                        types,
                        plate_num,
                        device_sn,
                        page,
                        page_size
                    },
                    {},
                    {
                        paramsSerializer: function (params) {
                            return qs.stringify(params);
                        },
                        ...options
                    }
                );
            },
            getEventsGps(company_id,
                         begin_at,
                         end_at,
                         types,
                         plate_num,
                         device_sn,
                         options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/events/gps`,
                    {
                        company_id,
                        begin_at,
                        end_at,
                        types,
                        plate_num,
                        device_sn
                    },
                    {},
                    options
                );
            },
            getEvent(event_id, vehicle_id, options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/events/${event_id}`,
                    {vehicle_id: vehicle_id},
                    {},
                    options
                );
            },
            getPoiEventsByDevice(device_id,
                                 start_time = null,
                                 end_time = null,
                                 page = null,
                                 page_size = null,
                                 options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/devices/${device_id}/events/type/poi`,
                    {start_time, end_time, page, page_size},
                    {},
                    options
                );
            },
            /*
            日志相关
             */
            getLogs(company_id,
                    begin_at,
                    end_at,
                    event_types,
                    device_sn,
                    keywords,
                    sort,
                    page,
                    page_size,
                    options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/logs`,
                    {
                        company_id,
                        begin_at,
                        end_at,
                        event_types,
                        device_sn,
                        keywords,
                        sort,
                        page,
                        page_size
                    },
                    {},
                    options
                );
            },
            /*
            行程相关
             */
            getTripList(vehicle_id,
                        begin_at,
                        end_at,
                        page,
                        page_size,
                        options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/vehicles/${vehicle_id}/trips`,
                    {begin_at, end_at, page, page_size},
                    {},
                    options
                );
            },
            getTrip(trip_id, vehicle_id, options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/trips/${trip_id}`,
                    {vehicle_id: vehicle_id},
                    {},
                    options
                );
            },
            getModules(company_id, options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/companies/${company_id}/modules`,
                    {},
                    {},
                    options
                );
            },
            /*
            角色相关
             */
            getActions(options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/actions`,
                    {},
                    {},
                    options
                );
            },
            getAllRoles(company_id, options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/roles/all`,
                    {company_id},
                    {},
                    options
                );
            },
            getRoles(company_id, page, page_size, options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/roles`,
                    {company_id, page, page_size},
                    {},
                    options
                );
            },
            createRole(company_id, name, banned_actions, options = {}) {
                return requestClient.fetch(
                    request.METHOD_POST,
                    `/roles`,
                    {company_id, name, banned_actions},
                    {},
                    options
                );
            },
            editRole(role_id, name, banned_actions, options = {}) {
                return requestClient.fetch(
                    request.METHOD_PUT,
                    `/roles/${role_id}`,
                    {name, banned_actions},
                    {},
                    options
                );
            },
            deleteRole(role_id, options = {}) {
                return requestClient.fetch(
                    request.METHOD_DELETE,
                    `/roles/${role_id}`,
                    {},
                    {},
                    options
                );
            },
            /*
            电子围栏相关
            */
            /**
             *
             * @param company_id
             * @param filter
             *    name,tag_id
             * @param page
             * @param page_size
             * @returns {AxiosPromise<any>}
             */
            getFences(company_id, filter, page, page_size, options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/companies/${company_id}/fences`,
                    {filter, page, page_size},
                    {},
                    {
                        paramsSerializer: function (params) {
                            return qs.stringify(params);
                        },
                        ...options
                    }
                );
            },
            getFence(fence_id, options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/fences/fence_id`,
                    {},
                    {},
                    options
                );
            },
            /**
             * 创建围栏
             * @param company_id
             * @param name
             * @param type
             *    circle | polygon | polyline | district
             * @param shape
             *    circle:
             *      {center:{longitude:xxxx, latitude:xxxx},radius:xxxx}
             *    polygon:
             *      [{longitude:xxxx, latitude:xxxx},{longitude:xxxx, latitude:xxxx},...]
             *    polyline:
             *      [{longitude:xxxx, latitude:xxxx},{longitude:xxxx, latitude:xxxx},...]
             *    district:
             *      徐汇区 | 北京朝阳区
             * @param tags
             *    ['a','b']
             * @returns {AxiosPromise<any>}
             */
            createFence(company_id, name, type, shape, tags, options = {}) {
                return requestClient.fetch(
                    request.METHOD_POST,
                    `/companies/${company_id}/fences`,
                    {name, type, shape, tags},
                    {},
                    options
                );
            },
            /**
             * 编辑围栏，不想修改的字段可以传 null
             * @param fence_id
             * @param name
             * @param type
             * @param shape
             * @param tags
             * @returns {AxiosPromise<any>}
             */
            updateFence(fence_id, name, type, shape, tags, options = {}) {
                return requestClient.fetch(
                    request.METHOD_PUT,
                    `/fences/${fence_id}`,
                    {name, type, shape, tags},
                    {},
                    options
                );
            },
            deleteFence(fence_id, options = {}) {
                return requestClient.fetch(
                    request.METHOD_DELETE,
                    `/fences/${fence_id}`,
                    {},
                    {},
                    options
                );
            },
            getFenceTagAutocomplete(company_id, query, options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/companies/${company_id}/fences/tags/autocomplete`,
                    {query},
                    {},
                    options
                );
            },
            getFenceEvents(fence_id, filter, page, page_size, options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/fences/${fence_id}/events`,
                    {filter, page, page_size},
                    {},
                    {
                        paramsSerializer: function (params) {
                            return qs.stringify(params);
                        },
                        ...options
                    }
                );

            },
            getSettingsI18n() {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/settings/i18n`,
                    {},
                    {},
                    options
                );
            },
            setSettingsI18n(language, timezone, options = {}) {
                return requestClient.fetch(
                    request.METHOD_POST,
                    `/settings/i18n`,
                    {
                        language: language,
                        timezone: timezone
                    },
                    {},
                    options
                );
            },

            //查询placeId
            queryPlaceId(place = {}) {
                return googleClient.fetch(
                    request.METHOD_GET,
                    `place/autocomplete/json?input=${place}&key=${googleKey}`
                );
            },
            //地点 ID 的反向地理编码
            querySearch(id, locale = {}) {
                return googleClient.fetch(
                    request.METHOD_GET,
                    `geocode/json?place_id=${id}&key=${googleKey}&language=${locale}`
                );
            },

            //地理逆编码 经纬度(wgs84) => 地址
            geoRecode(lng, lat, locale, coordinate = null, options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/geo/recode`,
                    {
                        longitude: lng,
                        latitude: lat,
                        language: locale,
                        coordinate: coordinate
                    },
                    {},
                    options
                );
            },
            //经纬度 => 全景
            geoPanorama(lng, lat, options = {}) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/geo/panorama`,
                    {
                        longitude: lng,
                        latitude: lat
                    },
                    {},
                    options
                );
            },
            // 获取装车审核列表
            getApprovalList(companyId, page = 1, pageSize = 20) {
                return requestClient.fetch(
                    request.METHOD_GET,
                    `/guest/supply-chain/equipments/work-order?page=${page}&pageSize=${pageSize}&company_id=${companyId}`
                );
            },
            /*
                审批列表 拒绝工单
                @params type 1: 通过  2: 拒绝
                @params vehicle: 车辆信息
            */
            approvalWorkOrder(id, type, vehicle) {
                return requestClient.fetch(
                    request.METHOD_PUT,
                    `/guest/supply-chain/equipments/work-order/${id}`,
                    {type, ...vehicle}
                );
            },
            /*
             车辆空载负载 for test
             @params isLoad 0: 空载 1: 负载
            */
            setCarLoadStatus(tripId, vehicleId, isLoad) {
                return requestClient.fetch(
                    request.METHOD_PATCH,
                    `/trips/${tripId}/goods/fully`,
                    {
                        vehicle_id: vehicleId,
                        is_load: isLoad
                    }
                );
            }
        };
    }
};
