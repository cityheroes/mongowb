
const isObject = (obj: any) => {
	return obj === Object(obj);
};

const deepNavigate = (obj: any, path: string = '', callback: any) => {
	for (let property in obj) {
		if (isObject(obj[property])) {
			deepNavigate(obj[property], path + '.' + property, callback);
		} else {
			callback(obj, property, obj[property]);
		}
	}
};

const deepExtend = (destination: any, source: any) => {
	for (let property in source) {
		if (
			source[property] &&
			source[property].constructor &&
			source[property].constructor === Object
		) {
			destination[property] = destination[property] || {};
			deepExtend(destination[property], source[property]);
		} else {
			destination[property] = source[property];
		}
	}
	return destination;
};

const getIt = (obj: any, property: string, emptyValue: any) => {
	emptyValue = typeof emptyValue !== 'undefined' ? emptyValue : null;

	let result = property.split('.').reduce((memo: any, key: string) => {
		return memo ? memo[key] : emptyValue;
	}, obj);
	return 'undefined' === typeof result ? emptyValue : result;
};

let singleVariableRegex = /^\{\{(.*?)\}\}$/;
let variablesRegex = /\{\{(.*?)\}\}/gi;

const parseContext = (value: any, context: string) => {

	if (!value.replace) {
		return value;
	}

	if (singleVariableRegex.test(value)) {
		let reference = value.replace(singleVariableRegex, (match: any, reference: any) =>  {
			reference = reference.trim();
			return reference;
		});
		value = getIt(context, reference, value);
	} else {
		value = value.replace(variablesRegex, (match: any, reference: any) => {
			reference = reference.trim();
			return getIt(context, reference, match);
		});
	}

	return value;
};

const parseParams = (params: any, context: string) => {

	if (!params) {
		return {};
	}

	if (params !== Object(params)) {
		return parseContext(params, context);
	}

	let parsedParams = Array.isArray(params) ? params.slice() : Object.assign({}, params),
		value;

	for (let property in parsedParams) {
		value = parsedParams[property];
		if (value === Object(value)) {
			parsedParams[property] = parseParams(value, context);
		} else {
			parsedParams[property] = parseContext(value, context);
		}
	}

	return parsedParams;
};

export default {
	isObject: isObject,
	deepNavigate: deepNavigate,
	deepExtend: deepExtend,
	getIt: getIt,
	parseParams: parseParams,
	parseContext: parseContext
};