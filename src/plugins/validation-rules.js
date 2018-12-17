exports.install = function (Vue, options) {


    const mobile = (rule, value, callback) => {
        var reg = /^[0-9]+.?[0-9]*$/;
        if (!reg.test(value)) {
            callback(new Error('请输入数字'));
        } else {
            callback();
        }
    }
    const plateNum = (rule, value, callback) => {
        let reg = /^([\u4e00-\u9fa5][a-zA-Z](([DF](?![a-zA-Z0-9]*[IO])[0-9]{4,5})|([0-9]{5}[DF])))|([冀豫云辽黑湘皖鲁苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼渝京津沪新京军空海北沈兰济南广成使领A-Z]{1}[a-zA-Z0-9]{5,6}[a-zA-Z0-9挂学警港澳]{1})$/;
        if (!reg.test(value)) {
            callback(new Error('请输正确的车牌号'));
        } else {
            callback();
        }
    }
    const special = (rule, value, callback) => {
        let reg = /^[\da-zA-Z]+$/;
        if (!reg.test(value)) {
            callback(new Error('不能输入特殊字符'));
        } else {
            callback();
        }
    }
    const space = (rule, value, callback)=>{
        let reg = /^\s+|\s+$/g;
        if (reg.test(value)) {
            callback(new Error('不能输入空格'));
        } else {
            callback();
        }
    }
    /**
     * 参数 item
     * required/change     true 二选一必填项
     * maxLength  字符串的最大长度
     * minLength  字符串的最小长度
     * min 和 max 必须同时给 min <= max    数字 !str
     *                     min == max    限制长度
     * type
     *      手机号 mobile
     *      车牌号 plateNum
     * */

    Vue.prototype.filterRules = function (item) {
        let rules = [];
        if (item.type) {
            let type = item.type;
            switch (type) {
                case 'mobile':
                    rules.push({ validator: mobile, trigger: 'blur' });
                    break;
                case 'plateNum':
                    rules.push({ validator: plateNum, trigger: 'blur' });
                    break;
                case 'number':
                    rules.push({ type: 'number', message: '请输入数字' });
                    rules.push({ min: 8, message: '最少8位!', trigger: 'blur' });
                case 'special':
                    rules.push({ validator: special, trigger: 'blur' });
                case 'space':
                    rules.push({ validator: space, trigger: 'blur' });
                default:
                    rules.push({});
                    break;
            }
        }
        if (item.required) {
            rules.push({ required: true, message: '不能为空!', trigger: 'blur' });
        }
        if (item.change) {
            rules.push({ required: true, message: '请选择类型', trigger: 'change' });
        }
        if (item.maxLength) {
            rules.push({ min: 1, max: item.maxLength, message: '最多' + item.maxLength + '个字符!', trigger: 'blur' })
        }
        if (item.minLength) {
            rules.push({ min: item.minLength, message: '最少' + item.minLength + '个字符!', trigger: 'blur' })
        }
        if (item.min && item.max) {
            if (item.min == item.max) {
                rules.push({ min: item.min, max: item.max, message: '必须是' + item.min + '位字符！', trigger: 'blur' })
            } else {
                rules.push({
                    min: item.min,
                    max: item.max,
                    message: '字符长度在' + item.min + '至' + item.max + '之间!',
                    trigger: 'blur'
                })
            }
        }
        


        return rules;
    };
};
