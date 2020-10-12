# How to run tests
```
npm run test
```

# Optimization suggestions
1. Use map instead of array: 
My instinct was to use an array to push and slice orders as they came in. A hash table probably would've been more efficient in this case because like arrays, they're also iterable and remember original insertion order of keys. However, because they use key value pairs, you have better time complexity O(1) when it comes to lookup, e.g. searching for an order by ID. 

2. Hash id's: 
Currently, ID is allocated by incrementing 1 from the previous order. This is a suboptimal in terms of security - in the real world, ideally you'd want to hash the IDs and give each order a unique ID by using some sort of hashing algorithm as well as considering a strategy for collision.
