# asyncGate.js

A lightweight API for performing parallel async tasks with a "gate" waiting for all to finish before proceeding.

## Explanation

Say you want do two or more asynchronous tasks in parallel (like `setTimeout` delays, XHR calls, etc). You want to easily listen for when all these different asynchronous tasks have completed. You need a gate.

You create a gate by calling `$AG(...)`. **Each time you call `$AG()`, you create a new, separate gate.**

To each gate, you pass in one or more functions, **which $AG will execute for you**. To each function that $AG executes, it will pass as the first parameter a trigger function. You simply need to make sure this trigger function is called at some point later, when your task is complete. NOTE: your tasks can be either synchronous (completing immediately) or asynchronous; it makes no difference to $AG.

To listen for when all previously specified functions have completed, and the gate can then be "opened" (metaphorically speaking), simply call `then(...)` on your gate to register a completion callback. You can call `then()` as many times as you would like. If you call `then()` on a gate that is already completed, the callback you specify will just be executed immediately.

If you want to add more asynchronously-completing functions to your gate to have it wait on, simply call `and(...)` on your gate. NOTE: You cannot call `and()` after you have called `then()` to register your completion callback(s).

Use `and()` without any parameters to add (and retrieve) a trigger function directly. This allows you to pass the trigger as a traditional callback parameter to other APIs. NOTE: because this form of the `and()` call returns a trigger function, it is not a "chainable" function as the other API calls/forms are; it must be called one at a time. See below for examples.

NOTE: `add()` was previously part of the API, but has now been removed, in favor of the empty `and()` form noted above.

## Usage Examples

Using the following example setup:

    function fn1(done) {
       setTimeout(done,1000);
    }
    
    function fn2(done) {
       setTimeout(done,2000);
    }
    
    function yay() {
       alert("Done!");
    }

Execute `fn1` and `fn2` in parallel, then call `yay` when complete:

    $AG(fn1,fn2).then(yay);
    
    // same as above
    $AG([fn1,fn2]).then(yay);
    
    // same as above    
    $AG([fn1],[[[fn2]]]).then(yay);

Execute `fn1`, then add `fn2` to be executed, then call `yay` when complete:

    $AG(fn1).and(fn2).then(yay);
    
    // same as above
    var gate = $AG(fn1);
    // later
    gate.and(fn2);
    // later
    gate.then(yay);

Use `and()` without any parameters to add (and retrieve) a trigger function directly (see discussion above):

    var gate = $AG();
    fn1(gate.and());
    // later
    fn2(gate.and());
    // later
    gate.then(yay);


## License 

The code and all the documentation are released under the MIT license.

http://getify.mit-license.org/
