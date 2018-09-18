var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define("ObjectUtils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var isObject = function (obj) {
        return obj === Object(obj);
    };
    var deepNavigate = function (obj, path, callback) {
        if (path === void 0) { path = ''; }
        for (var property in obj) {
            if (isObject(obj[property])) {
                deepNavigate(obj[property], path + '.' + property, callback);
            }
            else {
                callback(obj, property, obj[property]);
            }
        }
    };
    var deepExtend = function (destination, source) {
        for (var property in source) {
            if (source[property] &&
                source[property].constructor &&
                source[property].constructor === Object) {
                destination[property] = destination[property] || {};
                deepExtend(destination[property], source[property]);
            }
            else {
                destination[property] = source[property];
            }
        }
        return destination;
    };
    var getIt = function (obj, property, emptyValue) {
        emptyValue = typeof emptyValue !== 'undefined' ? emptyValue : null;
        var result = property.split('.').reduce(function (memo, key) {
            return memo ? memo[key] : emptyValue;
        }, obj);
        return 'undefined' === typeof result ? emptyValue : result;
    };
    var singleVariableRegex = /^\{\{(.*?)\}\}$/;
    var variablesRegex = /\{\{(.*?)\}\}/gi;
    var parseContext = function (value, context) {
        if (!value.replace) {
            return value;
        }
        if (singleVariableRegex.test(value)) {
            var reference = value.replace(singleVariableRegex, function (match, reference) {
                reference = reference.trim();
                return reference;
            });
            value = getIt(context, reference, value);
        }
        else {
            value = value.replace(variablesRegex, function (match, reference) {
                reference = reference.trim();
                return getIt(context, reference, match);
            });
        }
        return value;
    };
    var parseParams = function (params, context) {
        if (!params) {
            return {};
        }
        if (params !== Object(params)) {
            return parseContext(params, context);
        }
        var parsedParams = Array.isArray(params) ? params.slice() : Object.assign({}, params), value;
        for (var property in parsedParams) {
            value = parsedParams[property];
            if (value === Object(value)) {
                parsedParams[property] = parseParams(value, context);
            }
            else {
                parsedParams[property] = parseContext(value, context);
            }
        }
        return parsedParams;
    };
    exports.default = {
        isObject: isObject,
        deepNavigate: deepNavigate,
        deepExtend: deepExtend,
        getIt: getIt,
        parseParams: parseParams,
        parseContext: parseContext
    };
});
define("mongoWB", ["require", "exports", "formula-values", "ObjectUtils"], function (require, exports, formula_values_1, ObjectUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    formula_values_1 = __importDefault(formula_values_1);
    ObjectUtils_1 = __importDefault(ObjectUtils_1);
    var fvStore = {};
    var evalFormulaValue = function (expression, context, path) {
        var fv;
        if (!fvStore[expression]) {
            fv = new formula_values_1.default(expression);
            fvStore[expression] = fv;
        }
        else {
            fv = fvStore[expression];
        }
        return fv.eval(context, {}, path);
    };
    var parseTemplate = function (templateCopy, context, path) {
        if (path === void 0) { path = ''; }
        if (!ObjectUtils_1.default.isObject(templateCopy)) {
            return evalFormulaValue(templateCopy, context, path);
        }
        ObjectUtils_1.default.deepNavigate(templateCopy, path, function (obj, objectProperty, objectValue) {
            obj[objectProperty] = evalFormulaValue(objectValue, context, path + '.' + objectProperty);
        });
        return templateCopy;
    };
    var operations = {
        '#foreach': function (options, context, path) {
            if (options === void 0) { options = {}; }
            if (context === void 0) { context = {}; }
            if (path === void 0) { path = ''; }
            var collection = options['#collection'];
            if (!Array.isArray(collection)) {
                collection = mongoWB(collection, context, path);
            }
            var result = [], template = options['#template'], templateCopy;
            if (!template) {
                return result;
            }
            for (var i = 0, length = collection.length; i < length; i++) {
                context['#index'] = i;
                context['#item'] = collection[i];
                templateCopy = JSON.parse(JSON.stringify(template));
                result.push(parseTemplate(mongoWB(templateCopy, context, path), context, path));
            }
            delete context['#index'];
            delete context['#item'];
            return result;
        },
        '#concat': function (list, context, path) {
            if (path === void 0) { path = ''; }
            if (!Array.isArray(list)) {
                return list;
            }
            var result = [], item;
            for (var i = 0, length = list.length; i < length; i++) {
                item = mongoWB(list[i], context, path);
                if (Array.isArray(item)) {
                    result = result.concat(item);
                }
                else {
                    result.push(item);
                }
            }
            return result;
        }
    };
    var mongoWB = function (obj, context, path) {
        if (context === void 0) { context = {}; }
        if (path === void 0) { path = ''; }
        if (Array.isArray(obj)) {
            return obj.map(function (item, index) {
                return mongoWB(item, context, path + '[' + index + ']');
            });
        }
        if (!ObjectUtils_1.default.isObject(obj)) {
            return evalFormulaValue(obj, context, path);
        }
        var resultingObj = {};
        for (var property in obj) {
            if (operations[property]) {
                resultingObj = operations[property](obj[property], context, path + '.' + property);
                break;
            }
            else {
                resultingObj[property] = mongoWB(obj[property], context, path + '.' + property);
            }
        }
        return resultingObj;
    };
    exports.default = mongoWB;
});
//# sourceMappingURL=mongoWBTS.js.map