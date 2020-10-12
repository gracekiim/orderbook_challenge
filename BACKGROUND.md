Background
==

We'll be building a price-time priority limit order book data structure. If you're unfamiliar with the concept of an order book, skimming through the examples below should tell you everything you need to know. Here's some vocab to start:

1. **order book**: When a trader tries to buy or sell, we'll keep track of their order for the future. There may not be any trades right away.
2. **limit**: Buyers are willing to take any price less than <code>x</code>, and sellers are willing to take any price greater than <code>y</code>.
3. **priority**: For any given order, there may be thousands of valid counterparties to trade with. We need a way of prioritizing who trades with whom.
4. **price-time**: We first prioritize by price -- if you're buying, you will buy for the lowest price possible, and if you're selling, you will sell for the highest price possible. If there are many traders offering to buy or sell at the same price <code>p</code>, then we prioritize by time -- of all the traders willing to buy or sell at <code>p</code>, the trader that placed their order _first_ gets matched for the trade.

## Examples

Notation:

`1. BUY 10 @ 2` means buy 10 scoops of ice cream for a maximum price of 2 pennies per scoop. If our order gets completed in full, we will have spent 20 pennies for 10 scoops of ice cream. The order's id is 1.

`2. SELL 15 @ 3` means sell 15 scoops of ice cream for a minimum price of 3 pennies per scoop. If our order gets completed in full, we will have received 45 pennies and sold 15 scoops of ice cream. The order's id is 2.

### Adding a limit buy order
Here's an ASCII representation of the initial state of our order book. There's nothing in it!
```
   Buy orders   |  Sell orders
----------------|---------------
                |
```

New order: `1. BUY 10 @ 2`
```
   Buy orders   |  Sell orders
----------------|---------------
1. BUY 10 @ 2   |
```

New order: `2. BUY 5 @ 3`
```
   Buy orders   |  Sell orders
----------------|---------------
2. BUY 5  @ 3   |
1. BUY 10 @ 2   |
```

New order: `3. SELL 50 @ 8`
```
   Buy orders   |  Sell orders
----------------|---------------
2. BUY 5  @ 3   | 3. SELL 50 @ 8
1. BUY 10 @ 2   |
```

New order: `4. SELL 5 @ 12`
```
   Buy orders   |  Sell orders
----------------|---------------
2. BUY 5  @ 3   | 3. SELL 50 @ 8
1. BUY 10 @ 2   | 4. SELL 5  @ 12
```

Notice how the buy orders are descending by price whereas the sell orders are ascending by price. When it's time to make a trade, we always start at the very top of each list.

New order: `5. BUY 51 @ 9`
```
   Buy orders   |  Sell orders
----------------|---------------
5. BUY 1  @ 9   | 4. SELL 5  @ 12
2. BUY 5  @ 3   | 
1. BUY 10 @ 2   | 
```

Finally, something interesting happened. Two orders were matched for a trade! Order 3 was selling for less than 9 pennies per scoop, so this new order was matched with it. Order 5 wanted to buy 51 scoops, but order 3 was only selling 50. Thus, there is 1 scoop remaining to be purchased at a price of 9 pennies per scoop. We add that remaining scoop to the left hand side as `5. BUY 1 @ 9`.

Notice how order 4 did not match with this order even though we wanted to buy 1 more scoop. 12 pennies per scoop is outside of our price range. If we queried `getOrder(5)` right now, we would get:

```javascript
{
  id: 5,
  isBuyOrder: true,
  quantity: 51,
  price: 9,
  executedQuantity: 50,
}
```

Refer to the main README for more info on these specifications.

New order: `6. SELL 10 @ 12`

New order: `7. SELL 1  @ 12`

New order: `8. SELL 2  @ 12`
```
   Buy orders   |  Sell orders
----------------|---------------
5. BUY 1  @ 9   | 4. SELL 5  @ 12
2. BUY 5  @ 3   | 6. SELL 10 @ 12
1. BUY 10 @ 2   | 7. SELL 1  @ 12
                | 8. SELL 2  @ 12
```

Notice the order in which these sells are listed. The order at price 12 that came first, order 4, is at the top because it has been waiting the longest to get matched.

New order: `9. BUY 15 @ 13`
```
   Buy orders   |  Sell orders
----------------|---------------
5. BUY 1  @ 9   | 7. SELL 1  @ 12
2. BUY 5  @ 3   | 8. SELL 2  @ 12
1. BUY 10 @ 2   |
```

We trade with the oldest sell orders first. Since we successfully bought the 15 scoops that we wanted, _no order_ is added to the book.

If we were to query `getQuantityAtPrice(12)`, then we would get `3` because between orders 7 and 8, there are 3 scoops being sold. There are no scoops at 13 pennies though, so `getQuantityAtPrice(13) === 0`.
