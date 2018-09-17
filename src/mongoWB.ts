import FormulaValues from 'formula-values';

import ObjectUtils from './ObjectUtils';

let fvStore: any = {};

const evalFormulaValue = (expression: string, context: any, path: string) => {
	let fv: any;
	if (!fvStore[expression]) {
		fv = new FormulaValues(expression);
		fvStore[expression] = fv;
	} else {
		fv = fvStore[expression];
	}
	return fv.eval(context, {}, path);
};

const parseTemplate = (templateCopy: any, context: any, path: string = '') => {

	if (!ObjectUtils.isObject(templateCopy)) {
		return evalFormulaValue(templateCopy, context, path);
	}

	ObjectUtils.deepNavigate(templateCopy, path, (obj: any, objectProperty: string, objectValue: any) => {
		obj[objectProperty] = evalFormulaValue(objectValue, context, path + '.' + objectProperty);
	});

	return templateCopy;
};

const operations = {

	'#foreach': (options: any = {}, context: any = {}, path: string = '') => {

		let collection: any = options['#collection'];

		if (!Array.isArray(collection)) {
			collection = mongoWB(collection, context, path);
		}

		let result: any[] = [],
			template: any = options['#template'],
			templateCopy: any;

		if (!template) {
			return result;
		}

		for (let i = 0, length = collection.length; i < length; i++) {
			context['#index'] = i;
			context['#item'] = collection[i];

			templateCopy = JSON.parse(JSON.stringify(template));

			result.push(parseTemplate(
				mongoWB(templateCopy, context, path),
				context,
				path
			));
		}

		delete context['#index'];
		delete context['#item'];

		return result;
	},

	'#concat': (list: any[], context: any, path: string = '') => {
		if (!Array.isArray(list)) {
			return list;
		}

		let result: any[] = [],
			item: any;

		for (let i = 0, length = list.length; i < length; i++) {
			item = mongoWB(list[i], context, path);

			if (Array.isArray(item)) {
				result = result.concat(item);
			} else {
				result.push(item);
			}
		}
		return result;
	}

};

const mongoWB = (obj: any, context: any = {}, path: string = ''): any => {

	if (Array.isArray(obj)) {
		return obj.map((item: any, index: number) => {
			return mongoWB(item, context, path + '[' + index + ']');
		});
	}

	if (!ObjectUtils.isObject(obj)) {
		return evalFormulaValue(obj, context, path);
	}

	let resultingObj: any = {};
	for (let property in obj) {
		if (operations[property]) {
			resultingObj = operations[property](obj[property], context, path + '.' + property);
			break;
		} else {
			resultingObj[property] = mongoWB(obj[property], context, path + '.' + property);
		}
	}

	return resultingObj;
};

export default mongoWB;
