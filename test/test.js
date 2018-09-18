'use strict';
var expect = require('chai').expect;
var mongoWB = require('../dist/mongoWB.node.js').default;

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

describe('mongoWB orders tests', () => {
	var context = {
		orders: [
			{
				provider: 'Beef n Bunz',
				product: 'Beef n Bunz',
				amount: 21,
				comments: 'White bread, rare'
			},
			{
				provider: '727',
				product: 'Four Cheese Philly',
				amount: 14,
				comments: 'Meat only, with jalapeños'
			},
			{
				provider: 'La Estancia',
				product: 'Tenderloin',
				amount: 7,
				comments: 'Rare'
			},
			{
				provider: 'Pollos Santa Lucía',
				product: 'Chicken Tenders',
				amount: 1,
				comments: 'Deep fried yuca'
			}
		]
	},
	recipe = {
		'#concat': [
		{
			'#foreach': {
				'#collection': '={{orders}}',
				'#template': {
					'index': '={{#index}} + 1',
					'text': 'Pick {{#item.amount}} {{#item.product}}'
				}
			}
		},
		{
			'text': 'Sign orders'
		}
		]
	};
	var result = mongoWB(recipe, context),
		size = result ? result.length : 1;

	it('Should be an array', () => {
		expect(result).to.be.an('array');
	});

	it('Should contain objects', () => {
		var randomItem = getRandomInt(0, size - 1);
		expect(result[randomItem]).to.be.an('object');
	});

	it('Should contain an object (except the last item) with an index property', () => {
		var randomItem = getRandomInt(0, size - 2);
		expect(result[randomItem]).to.have.own.property('index');
	});

	it('Should contain an object with a text property', () => {
		var randomItem = getRandomInt(0, size - 1);
		expect(result[randomItem]).to.have.own.property('text');
	});

	it('Should contain the name of the product from a random item (except the last one)', () => {
		var randomItem = getRandomInt(0, size - 2),
			productText = context.orders[randomItem].product;
		expect(result[randomItem].text).to.contain(productText);
	});

});