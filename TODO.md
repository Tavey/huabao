## 接口补充
```
接口地址： http://api.saas.hb.tst/trips/:id

需要改动：
1.增加新字段 
- device_cn  // 设备号
- driver_name // 司机
- plate_num // 车牌号
```

#### 车载状态字段增加
```
接口地址: http://api.saas.hb.tst/trips/:id

新增字段: 车载状态(共有三种状态, 默认为未标注)  
- 未标注
- 空载
- 满载


接口地址: http://api.saas.hb.tst/vehicles/10000221/trips
新增字段: 车载状态(共有三种状态, 默认为未标注, 在每个list里面)
- 未标注
- 空载
- 满载



添加设备
设备号存在 却出现未绑定情况 if_bind