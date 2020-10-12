const Exchange = require('../lib/index');
const fs = require('fs');
const path = require('path');

const exchange = new Exchange();

// clear order book before and after starting tests
beforeAll(() => {
	fs.writeFileSync(path.resolve(__dirname, '../lib/orderBook.json'), '');
});

afterAll(() => {
	fs.writeFileSync(path.resolve(__dirname, '../lib/orderBook.json'), '');
});

// sync
describe('Sync', () => {
	it('Sync method should return an empty book on first call', () => {
		expect(exchange.sync('../lib/orderBook.json')).toBe('No orders in book');
	});
});

// buy
describe('Limit buy', () => {
	it('First buy order should have ID of 1 and return passed params', () => {
		const result = {id: 1, isBuyOrder: true, quantity: 2, price: 3, executedQuantity: 0};
		expect(exchange.buy(2, 3)).toEqual(result);
	});

	it('It should add limit buys to the order book', () => {
		const result = [
			{id: 1, isBuyOrder: true, quantity: 2, price: 3, executedQuantity: 0},
			{id: 2, isBuyOrder: true, quantity: 2, price: 3, executedQuantity: 0}
		];
		expect(exchange.buy(2, 3)).toEqual({id: 2, isBuyOrder: true, quantity: 2, price: 3, executedQuantity: 0})
		expect(exchange.sync('../lib/orderBook.json')).toEqual(result);
	});
});

// sell
describe('Limit sell', () => {
	it('It should add limit sells to the order book', () => {
		const result = [
			{id: 1, isBuyOrder: true, quantity: 2, price: 3, executedQuantity: 0},
			{id: 2, isBuyOrder: true, quantity: 2, price: 3, executedQuantity: 0},
			{id: 3, isBuyOrder: false, quantity: 4, price: 5, executedQuantity: 0}
		];
		expect(exchange.sell(4, 5)).toEqual({id: 3, isBuyOrder: false, quantity: 4, price: 5, executedQuantity: 0})
		expect(exchange.sync('../lib/orderBook.json')).toEqual(result);
	});
});

// getQuantityAtPrice
describe('Get quantity at price', () => {
	it('It should get the quantity at price', () => {
		expect(exchange.getQuantityAtPrice(3)).toBe(4)
	});

	it('It should return 0 if there is no quantity at price found', () => {
		expect(exchange.getQuantityAtPrice(100)).toBe(0)
	});
});

// getOrder
describe('Get order by ID', () => {
	it('It should get order by given ID', () => {
		const result = {id: 2, isBuyOrder: true, quantity: 2, price: 3, executedQuantity: 0};
		expect(exchange.getOrder(2)).toEqual(result)
	});

	it('It should return the appropriate error message if the given ID is not found', () => {
		expect(exchange.getOrder(100)).toBe('Order does not exist')
	});
});

// buy and sell edge cases
describe('When there is a trade available', () => {
	it('If the qty in order book is greater than new order, it should update book and not add new order to book', () => {
		const result = [
			{id: 1, isBuyOrder: true, quantity: 2, price: 3, executedQuantity: 0},
			{id: 2, isBuyOrder: true, quantity: 2, price: 3, executedQuantity: 0},
			{id: 3, isBuyOrder: false, quantity: 1, price: 5, executedQuantity: 3}
		];
		expect(exchange.buy(3, 6)).toEqual({id: 4, isBuyOrder: true, quantity: 3, price: 6, executedQuantity: 3})
		expect(exchange.sync('../lib/orderBook.json')).toEqual(result);
	});
	
	it('If the qty in order book is equal to new order, it should remove first matching order from book and not add new order to book', () => {
		const result = [
			{id: 2, isBuyOrder: true, quantity: 2, price: 3, executedQuantity: 0},
			{id: 3, isBuyOrder: false, quantity: 1, price: 5, executedQuantity: 3}
		];
		expect(exchange.sell(2, 2)).toEqual({id: 5, isBuyOrder: false, quantity: 2, price: 2, executedQuantity: 2})
		expect(exchange.sync('../lib/orderBook.json')).toEqual(result);
	});

	it('If the qty in new order is greater than one in order book, it should remove order from book and add new order to book', () => {
		const result = [
			{id: 3, isBuyOrder: false, quantity: 1, price: 5, executedQuantity: 3},
			{id: 6, isBuyOrder: false, quantity: 3, price: 3, executedQuantity: 2}
		];
		expect(exchange.sell(5, 3)).toEqual({id: 6, isBuyOrder: false, quantity: 5, price: 3, executedQuantity: 2})
		expect(exchange.sync('../lib/orderBook.json')).toEqual(result);
	});
})