# asyncGate.js

A lightweight API for performing parallel async tasks with a "gate" waiting for all to finish before proceeding.

## Explanation

Say you want do two or more asynchronous tasks in parallel (like `setTimeout` delays, XHR calls, etc). You want to easily listen for when all these different asynchronous tasks have completed. You need a gate.

You create a gate by calling `$AG(...)`. **Each time you call `$AG()`, you create a new, separate gate.**

To each gate, you pass in one or more functions, **which $AG will execute for you**. To each function that $AG executes, it will pass as the first parameter a trigger function. You simply need to make sure this trigger function is called at some point later, when your task is complete. NOTE: your tasks can be either synchronous (completing immediately) or asynchronous; it makes no difference to $AG.

To listen for when all previously specified functions have completed, and the gate can then be "opened" (metaphorically speaking), simply call `then(...)` on your gate to register a completion callback. You can call `then()` as many times as you would like. If you call `then()` on a gate that is already completed, the callback you specify will just be executed immediately.

If you want to add more asynchronously-completing functions to your gate to have it wait on, simply call `and(...)` on your gate. NOTE: You cannot call `and()` after you have called `then()` to register your completion callback(s).

Also, you can just add a trigger function to the gate without having to pass a function to $AG to execute, using the `add()` API function. This function will add a trigger to the gate, and return it to you directly. You cause just call that function when you are ready to trigger that part of the gate. NOTE: because `add()` returns a trigger function, it is not a "chainable" function as the other API functions are. It must be called one at a time. See below for examples.

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

Use `add()` to add (and then retrieve) a trigger function directly:

    var gate = $AG();
    fn1(gate.add());
    // later
    fn2(gate.add());
    // later
    gate.then(yay);


## License 

(The MIT License)

Copyright (c) 2011 Kyle Simpson

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
