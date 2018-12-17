 export const scoreMap = {
     '1': '综合',
     '2': '用车',
     '3': '环境',
     '4': '安全',
     '5': '区域和道路',
     '6': '车型和性能表现'
 }
 export const chartMap = {
     'Usage': {
        title: '用车',
        methodType: 'y'
     },
     'Environment': {
         title: '环境',
         methodType: 'x',
     },
     'Safety': {
         title: '安全',
         methodType: 'y',
     },
     'Road': {
         title: '区域和道路',
         methodType: 'x',
     },
 }

 export const mockData = {
    radar: [
        [
            {'综合': 868,},
            {'用车': 466,},
            {'安全': 806,},
            {'区域和道路': 432,},
            {'环境': 256,},
            {'车型和性能': '777'},
        ],
        [
            // {'综合': 868,},
            {'用车': 576,},
            {'安全': 836,},
            {'区域和道路': 632,},
            {'环境': 346,},
            {'车型和性能': 577},
        ],
        [
            {'综合': 854,},
            {'用车': 506,},
            {'安全': 766,},
            {'区域和道路': 752,},
            {'环境': 834,},
            {'车型和性能': '687'},
        ],
        [
            {'综合': 746,},
            {'用车': 677,},
            {'安全': 746,},
            {'区域和道路': 734,},
            {'环境': 746,},
            {'车型和性能': '744'},
        ],
        [
            {'综合': 968,},
            {'用车': 940,},
            {'安全': 980,},
            {'区域和道路': 965,},
            {'环境': 907,},
            {'车型和性能': 987},
        ],
    ],
    y: [{
      title: '用车',
      dom: 'ychart1',
      data: [846, 405, 844, 240, 489, 210],
      label: ['里程', '行程', '行驶速度', '用车类型', '用车时间', '用车强度']
    },
      {
        title: '安全',
        dom: 'ychart2',
        data: [846, 405, 844, 240, 489, 210],
        label: ['急加速', '急刹车', '急转向', '事故', '超速', '交通违法']
      }],
    x: [{
      title: '环境',
      dom: 'xchart1',
      data: [580, 321, 876, 640],
      label: ['天气', '日夜比例', '拥堵状况', '路面状态']
    },
      {
        title: '区域和道路',
        dom: 'xchart2',
        data: [580, 321, 876],
        label: ['行政区', '道路等级', '行驶区域']
      },
      {
        title: '车型和性能',
        dom: 'xchart3',
        data: [580, 321, 876, 640],
        label: ['车型', '功重比', '扭重比', '车龄']
      }
    ]
  }

export const labelMap = {
  'Road': [
      '道路等级',
      '省/市/区',
  ],
  'Safety': [
    "超速", 
    "事故", 
    "急转弯", 
    "急刹车",
    "急加速",
  ],
  'Usage': [
      '里程',
      '行程',
      '行驶速度',
      '工/假日',
      '行驶时间',
      '用车强度',
      '用车类型',
  ],
  'Environment': [
      '出行/高峰',
      '日夜比例',
      '天气'
  ],
} 


export const getSuitability = (arr1, arr2) => {
    let wArr = [.4, .25, .2, .1, .05]
    // console.log(arr1)
    // console.log(arr2)
    let _arr = arr1.map((d, i) => {
        if (typeof arr1[i] === 'object' && typeof arr2[i] === 'object') {
            return Object.values(arr2[i])[0] / Object.values(arr1[i])[0] * wArr[i]
        }
        return arr1[i] / arr2[i] * wArr[i]
    })
    return _arr.reduce((a, b) => a + b)
}
