const fs = require('fs');
const path = require('path');

class Exchange {
  constructor() {
    this.id = 0;
    this.isBuyOrder = true;
    this.quantity = 0;
    this.price = 0;
    this.executedQuantity = 0;
  }

  updateOrder(isBuyOrder, quantity, price, executedQuantity) {
    this.id += 1;
    this.quantity = quantity;
    this.price = price;
    this.isBuyOrder = isBuyOrder;
    this.executedQuantity = executedQuantity;
  }

  writeToBook(data) {
    try {
      fs.writeFileSync(path.resolve(__dirname, './orderBook.json'), JSON.stringify(data));
      return this;
    } catch (err) {
      return 'Error in writing to book';
    }
  }

  notFirstOrder(quantityInput, priceInput, buy) {
    try {
      const book = JSON.parse(fs.readFileSync(path.resolve(__dirname, './orderBook.json')));
      for (let i = 0; i < book.length; i += 1) {
        const { isBuyOrder, price, quantity } = book[i];
        // if there's a match (can have 3 cases)
        if ((buy === true && isBuyOrder === !buy && price <= priceInput) || (buy === false && isBuyOrder === !buy && price >= priceInput)) {
          // case 1: sell qty > buy qty -> need to update sell order in book + don't add buy order to book
          if (quantity > quantityInput) {
            book[i].quantity -= quantityInput;
            book[i].executedQuantity += quantityInput;
            this.updateOrder(buy, quantityInput, priceInput, quantityInput);
            return this.writeToBook(book);
          }
          // case 2: sell qty === buy qty -> remove sell order from book + don't add buy order to book
          else if (quantity === quantityInput) {
            book.splice(i, 1);
            this.updateOrder(buy, quantityInput, priceInput, quantityInput);
            return this.writeToBook(book);
          }
          // case 3: sell qty < buy qty -> remove sell order from book + add buy order to book
          else {
            book.splice(i, 1);
            this.updateOrder(buy, quantityInput - quantity, priceInput, quantity);
            book.push(this);
            fs.writeFileSync(path.resolve(__dirname, './orderBook.json'), JSON.stringify(book));
            this.quantity = quantityInput;
            return this;
          }
        }
      }
      // if there's no match, add to order book as is
      this.updateOrder(buy, quantityInput, priceInput, 0);
      book.push(this);
      return this.writeToBook(book);
    } catch (err) {
      return 'Error in notFirstOrder';
    }
  }

  sync(fileName) {
    // try catch block to return contents of order book - return error message if none found
    try {
      return JSON.parse(fs.readFileSync(path.resolve(__dirname, `${fileName}`)));
    } catch (err) {
      return 'No orders in book';
    }
  }

  buy(buyQuantity, buyPrice) {
    // if it's the first order, add order to book
    if (this.id === 0) {
      this.updateOrder(true, buyQuantity, buyPrice, 0);
      return this.writeToBook([this]);
    }
    else {
      return this.notFirstOrder(buyQuantity, buyPrice, true);
    }
  }

  sell(sellQuantity, sellPrice) {
    // if it's the first order, add order to book
    if (this.id === 0) {
      this.updateOrder(false, sellQuantity, sellPrice, 0);
      return this.writeToBook([this]);
    }
    else {
      return this.notFirstOrder(sellQuantity, sellPrice, false);
    }
  }

  getQuantityAtPrice(givenPrice) {
    try {
      const book = JSON.parse(fs.readFileSync(path.resolve(__dirname, './orderBook.json')));
      // iterate through each order and if there is an order with the given price, add to counter
      return book.reduce((acc, curr) => {
        if (curr.price === givenPrice) acc += curr.quantity;
        return acc;
      }, 0)
    } catch (err) {
      return 'No orders in book';
    }
  }

  getOrder(givenID) {
    // Grab all orders from order book and see if the id exists
    try {
      const book = JSON.parse(fs.readFileSync(path.resolve(__dirname, './orderBook.json')));
      const result = book.find(obj => obj.id === givenID);
      return result ? result : 'Order does not exist'
    } catch (err) {
      return 'No orders in book';
    }
  }
}

module.exports = Exchange;