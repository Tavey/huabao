export const HARDWARE_INFO = [
    {
        value: '智能车贴',
        label: '智能车贴',
        children: [{
            value: '沙湖科技',
            label: '沙湖科技',
            children: [{
                value: 'T1',
                label: 'T1',
                children: [{
                    value: '1.0.0.0',
                    label: '1.0.0.0'
                }]
            }]
        }]
    }, {
        value: '随行',
        label: '随行',
        children: [{
            value: '尧远通信',
            label: '尧远通信',
            children: [{
                value: 'U1',
                label: 'U1',
                children: [{
                    value: '1.0.0.0',
                    label: '1.0.0.0'
                }]
            }]
        }]
    }
];
export const HARDWARE_WORK_MODE = {
    1: '正常',
    2: '追踪',
    3: '紧急',
    4: '调试'
}
export const FIRMWARE_UPGRADE_OPTION = {
    1: '立即下载更新',
    2: '立即下载，休眠更新'
}
export const MANFACTURER_TYPE = {//生产厂商
    "百度": "百度",
    "谷歌": "谷歌"
}
export const VEHICLE_USE_TYPE = {//车辆使用类型
    '1': '一般乘用车',
    '2': '运营类乘用车辆',
    '3': '大型客运车辆',
    '4': '普通货物运输',
    '5': '集装箱货物运输',
    '6': '危化品运输',
    '7': '厢式货车',
    '8': '罐式货车',
    '9': '牵引车',
    '10': '普通挂车',
    '11': '罐式挂车',
    '12': '集装箱挂车',
    '13': '仓栅式货车',
    '14': '封闭货车',
    '15': '平板货车',
    '16': '自卸货车',
    '17': '特殊结构货车',
    '18': '专项作业车',
    '19': '厢式挂车',
    '20': '仓栅式挂车',
    '21': '平板挂车',
    '22': '自卸挂车',
    '23': '专项作业挂车',
    '24': '车辆运输车',
    '25': '车辆运输车(单排)'
};

export const EVENT_TYPE_FLAG = {
    'accelerate': '20',
    'brake': '21',
    'turn': '22',
    'crash': '23',
    'stop_1': '241',
    'stop_2': '242',
    'stop_3': '243',
    'stop_4': '244',
    'fence_enter': '251',
    'fence_leave': '252',
    'alarm': '32'
};

export const EVENT_TYPE = { //事件类型
    NORMAL: {
        [EVENT_TYPE_FLAG['accelerate']]: '急加速',
        [EVENT_TYPE_FLAG['brake']]: '急刹车',
        [EVENT_TYPE_FLAG['turn']]: '急转弯',
        [EVENT_TYPE_FLAG['stop_1']]: '停驶<10分钟',
        [EVENT_TYPE_FLAG['stop_2']]: '停驶10-15分钟',
        [EVENT_TYPE_FLAG['stop_3']]: '停驶15-30分钟',
        [EVENT_TYPE_FLAG['stop_4']]: '停驶>30分钟',
        [EVENT_TYPE_FLAG['fence_enter']]: '电子围栏 - 进入',
        [EVENT_TYPE_FLAG['fence_leave']]: '电子围栏 - 离开',
    },
    EMERGENCY: {
        [EVENT_TYPE_FLAG['crash']]: '碰撞',
        [EVENT_TYPE_FLAG['alarm']]: '用户报警',
    }
};

export const COORDINATE_GCJ02 = 'gcj02';
export const COORDINATE_WGS84 = 'wgs84';

export const EVENT_TYPE_ALL = { //事件类型
    [EVENT_TYPE_FLAG['accelerate']]: '急加速',
    [EVENT_TYPE_FLAG['brake']]: '急刹车',
    [EVENT_TYPE_FLAG['turn']]: '急转弯',
    [EVENT_TYPE_FLAG['stop_1']]: '停驶<10分钟',
    [EVENT_TYPE_FLAG['stop_2']]: '停驶10-15分钟',
    [EVENT_TYPE_FLAG['stop_3']]: '停驶15-30分钟',
    [EVENT_TYPE_FLAG['stop_4']]: '停驶>30分钟',
    [EVENT_TYPE_FLAG['fence_enter']]: '电子围栏 - 进入',
    [EVENT_TYPE_FLAG['fence_leave']]: '电子围栏 - 离开',
    [EVENT_TYPE_FLAG['crash']]: '碰撞',
    [EVENT_TYPE_FLAG['alarm']]: '用户报警',
};
export const COMPANY_TYPE = {
    '普通': '普通',
    '危险': '危险'
}
export const LOG_TYPE = {
    "01": "电源接通",
    "02": "设备配置信息",
    "03": "电源断开",
    "04": "心跳包",
    "05": "电压检测",
    "10": "引擎点火",
    "11": "单点GPS",
    "12": "引擎熄火",
    "13": "多点GPS",
    "14": "设备唤醒",
    "20": "急加速",
    "21": "急刹车",
    "22": "急转弯",
    "23": "碰撞",
    "30": "设备自检错误",
    "31": "调试信息",
    "32": "主动紧急请求",
    "33": "导杆弹出"
};

export const UPD_TYPE = {//更新方式
    '更新方式': '更新方式',
    '普通更新': '普通更新'
};
export const RULE_TYPE = {//规则状态
    '规则状态': '规则状态',
};
export const PARMETER_TYPE = {//参数
    '参数': '参数',
};
export const CONDITION_TYPE = {//条件搜索
    '条件搜索': '条件搜索',
};
export const CHANGE_TYPE = {//更改方式
    '更改方式': '更改方式',
};
export const NEWBUILD_TYPE = {//新建神级
    '新建升级': '新建升级',
};
/**
 * 可控制权限的操作
 */
export const ACTIONS = {
    "VehicleList": "vehicle-list",
    "VehicleDetail": "vehicle-detail",
    "CreateVehicle": "create-vehicle",
    "UpdateVehicle": "update-vehicle",
    "DeviceList": "device-list",
    "CreateDevice": "create-device",
    "UpdateDevice": "update-device",
    "DistributionDevice": "distribution-device",
    "RecycleDevice": "recycle-device",
    "BindDevice": "bind-device",
    "UnbindDevice": "unbind-device",
    "RebindDevice": "rebind-device",
    "SetupApprovalList": "setup-approval-list",
    "UpdateSetupApproval": "update-setup-approval",
    "DeleteSetupApproval": "delete-setup-approval",
    "AccountList": "account-list",
    "CreateAccount": "create-account",
    "UpdateAccount": "update-account",
    "CompanyList": "company-list",
    "CreateCompany": "create-company",
    "UpdateCompany": "update-company",
    "RoleList": "role-list",
    "CreateRole": "create-role",
    "UpdateRole": "update-role",
    "DeleteRole": "delete-role",
    "FenceList": "fence-list",
    "CreateFence": "create-fence",
    "UpdateFence": "update-fence",
    "DeleteFence": "delete-fence",
    "TripList": "trip-list",
    "TripDetail": "trip-detail",
    "EventList": "event-list",
    "EventDetail": "event-detail",
    "StatisticsBasic": "statistics-basic",
    "StatisticsDevice": "statistics-device"
};
// export const ACTIONS = {
//     "VehicleList": "vehicle-list",
//     "VehicleDetail": "vehicle-detail",
//     "CreateVehicle": "create-vehicle",
//     "UpdateVehicle": "update-vehicle",
//     "DeleteVehicle": "delete-vehicle",
//     "BindDevice": "bind-device",
//     "UnbindDevice": "unbind-device",
//     "RebindDevice": "rebind-device",
//     "DeviceList": "device-list",
//     "FenceList": "fence-list",
//     "CreateDevice": "create-device",
//     "UpdateDevice": "update-device",
//     "DeleteDevice": "delete-device",
//     "AccountList": "account-list",
//     "CreateAccount": "create-account",
//     "UpdateAccount": "update-account",
//     "DeleteAccount": "delete-account",
//     "CompanyList": "company-list",
//     "CreateCompany": "create-company",
//     "UpdateCompany": "update-company",
//     "DeleteCompany": "delete-company",
//     "RoleList": "role-list",
//     "CreateRole": "create-role",
//     "UpdateRole": "update-role",
//     "DeleteRole": "delete-role",
//     "TripList": "trip-list",
//     "TripDetail": "trip-detail",
//     "EventList": "event-list",
//     "EventDetail": "event-detail",
//     "LogList": "log-list",
//     "StatisticsBasic": "statistics-basic",
//     "StatisticsDevice": "statistics-device"
// };

export const TABLE_INFO = {
    DEFAULT_PAGE_SIZE: 15
};

export const CAR_STATUS_ICON = {      // 车辆状态icon (g:正常，r: 故障， y:行驶)
    "1": "jc",
    "2": "jc",
    "3": "kc",
    "4": "hc",
    "5": "hc",
    "6": "whp",
    "7": "hc",
    "8": "ygc",
    "9": "tzc",
    "10": "gc",
    "11": "ygc",
    "12": "gc",
    "13": "hc",
    "14": "hc",
    "15": "hc",
    "16": "hc",
    "17": "hc",
    "18": "tzc",
    "19": "gc",
    "20": "gc",
    "21": "gc",
    "22": "gc",
    "23": "tzc",
    "24": "gc",
    "25": "gc"
};


export const LOGIN_BG = {   // 登录页面背景
    "huabao": ''
};

export const SLOGAN = {
    'default': [
        '助您揭示风险，发现机会',
        'Using Risk Analysis to Reveal Opportunities',
        '数字化风险管控，早发现，早避损',
        'Digitalized risk management, keep biz safe',
        '风险识别，监测，治理三位一体',
        'risk identification monitoring and control',
        '视图，仪表盘，深度分析风险',
        'View, dashboard and model for risk management',
    ],
    'zgc': [
        '找罐车运力监管平台，努力让每一辆罐车满载去满载回'
    ]
};
export const PRIVACY = require('@/privacy.json');

export const TIMEZONE = [
    ["Australia/Sydney", "+10"],
    ["Asia/Tokyo", "+09"],
    ["Asia/Seoul", "+09"],
    ["Asia/Shanghai", "+08"],
    ["Asia/Hong_Kong", "+08"],
    ["Asia/Taipei", "+08"],
    ["Asia/Jakarta", "+07"],
    ["Asia/Bangkok", "+07"],
    ["Asia/Dubai", "+04"],
    ["Africa/Cairo", "+02"],
    ["Europe/Vienna", "+01"],
    ["Europe/Rome", "+01"],
    ["Europe/Paris", "+01"],
    ["Europe/Berlin", "+01"],
    ["Europe/London", "+00"],
    ["America/Los_Angeles", "-08"],
    ["America/Phoenix", "-07"],
    ["America/Chicago", "-06"],
    ["America/New_York", "-05"],
    ["America/Santiago", "-04"],
    ["Etc/UTC", "+00"],
]
