# asyncGate.js

A lightweight API for performing parallel async tasks with a "gate" waiting for all to finish before proceeding.

## Explanation

Say you want do two or more asynchronous tasks in parallel (like `setTimeout` delays, XHR calls, etc). You want to easily listen for when all these different asynchronous tasks have completed. You need a gate.

You create a gate by calling `$AG(...)`. **Each time you call `$AG()`, you create a new, separate gate.**

To each gate, you pass in one or more functions, **which $AG will execute for you**. To each function that $AG executes, it will pass as the first parameter a trigger. You simply need to make sure this trigger function is called at some point later, when your task is complete. NOTE: your tasks can be either synchronous (completing immediately) or asynchronous; it makes no difference to $AG.

The trigger can be called as a function directly, or you can add a flag to the trigger call which notifies the gate of a failure to properly complete.

For both the direct trigger call, and the failure flag trigger call, you can pass any number of parameters ("messages"), which will be passed along to the first success (`then()`) or failure (`or()`) handler. For instance, you can pass along the response text from an XHR call, or any error message you receive from the server.

To listen for when all previously specified functions have completed, and the gate can then be "opened" (metaphorically speaking), simply call `then(...)` on your gate to register a completion callback. You can call `then()` as many times as you would like. If you call `then()` on a gate that is already completed, the callback you specify will just be executed immediately.

To listen for any part of the gate failing, call `or(...)` on your gate to register a failure callback. You can call `or()` as many times as you would like. If you call `or()` on a gate that has already been flagged as failed, the callback you specify will just be executed immediately.

If you want to add more asynchronously-completing segments to your gate to have it wait on, simply call `and(...)` on your gate. NOTE: You cannot call `and()` after you have called `then()` to register your completion callback(s).

Use `and()` without any parameters to add (and retrieve) a trigger directly. This allows you to pass the trigger as a traditional callback parameter to other APIs. NOTE: because this form of the `and()` call returns a trigger, it is not a "chainable" function as the other API calls/forms are; it must be called one at a time. See below for examples.

NOTE: `add()` was previously part of the API, but has now been removed, in favor of the empty `and()` form noted above.

You can also `abort()` a gate at any time, which will prevent any further actions from occurring on that gate (all callbacks will be ignored). The call to `abort()` can happen on the gate API itself, or using the `abort` flag on a completion callback in any segment of the gate (see below).

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

Pass some messages from some of the segments of the gate to the completion callback:

    $AG(fn1,fn2)
    .and(function(done){
        setTimeout(function(){
            done("!");
        },500); // 500ms timeout will happen second
    })
    .and(function(done){
        setTimeout(function(){
            done("Hello","World");
        },100); // 100ms timeout will happen first
    })
    .then(function(msg1,msg2){
        alert(msg1); // ["Hello", "World"]
        alert(msg2); // ["!"]
    });
    
Listen for an error in one of the gate's segments:

    $AG(fn1,fn2)
    .and(function(done){
        setTimeout(function(){
            done.fail("bad news!"); // `fail` is the error flag
        },500);
    })
    .then(yay) // won't ever fire
    .or(function(errMsg){
        alert("Error: " + errMsg[0]); // Error: bad news!
    });

Abort a gate in progress:

    var gate = $AG(fn1,fn2).then(yay);
    setTimeout(function(){
        gate.abort(); // will stop the gate from running `yay()`
    },100);
    
    // same as above
    $AG(fn1,fn2)
    .and(function(done){
        setTimeout(function(){
            done.abort(); // `abort` flag will stop the gate from running `yay()`
        },100);
    })
    .then(yay);

## License 

The code and all the documentation are released under the MIT license.

http://getify.mit-license.org/
