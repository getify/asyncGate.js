/*! asyncGate.js
    v0.1 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function(global){

  var old_$AG = global.$AG;
  
  // test for function
  function is_func(func) { return Object.prototype.toString.call(func) == "[object Function]"; }
  
  // test for array
  function is_array(arr) { return Object.prototype.toString.call(arr) == "[object Array]"; }
  
  // flatten array
  function flatten_array(arr) {
    for (var i=0; i<arr.length; ) {
      if (is_array(arr[i])) {
        // prepend `splice()` arguments to `tmp` array, to enable `apply()` call
        arr.splice.apply(arr,[i,1].concat(arr[i]));
        continue;
      }
      i++;
    }
    
    return arr;
  }
  
  function create_sandbox() {
    var instanceAPI;
    
    instanceAPI = function() {
      var chainAPI,
          pool = [],
          then_queue = []
      ;
      
      function check_pool() {
        // make sure the pool isn't completed yet
        if (pool !== true) {
          // check everyone in the pool
          for (var i=0; i<pool.length; i++) {
            if (pool[i] !== true) return false; // bail, not done yet
          }
          pool = true; // flag it as complete
        }
        return (pool === true);
      }
      
      function do_queue() {
        var fn;
        
        // make sure at least one `then` callback is registered
        if (then_queue !== true && then_queue.length) {
          while (fn = then_queue.shift()) fn(); // empty the queue
          then_queue = true; // flag it as complete
        }
      }
      
      chainAPI = {
        and: function() {
          // can't call 
          if (then_queue === true || then_queue.length > 0) {
            throw new Error("Can't call `and()` anymore.");
            return chainAPI;
          }
        
          var args = flatten_array([].slice.call(arguments)),
              i
          ;
          
          for (i=0; i<args.length; i++) {
            (function(fn,pool_idx){ // capture some loop scope
              // guard the parameter type... must be a function
              if (!is_func(fn)) throw new Error("Wrong: non-function parameter passed in.");
            
              pool[pool_idx] = false;
              fn(function(){ // pass the trigger function to the callback
                pool[pool_idx] = true;
                if (check_pool()) do_queue();
              });
              
            })(args[i],pool.length);
          }
        
          return chainAPI;
        },
        then: function(fn) {
          // guard the parameter type... must be a function
          if (!is_func(fn)) throw new Error("Wrong: non-function parameter passed in.");
          
          // are we still adding to the `then` queue?
          if (then_queue !== true) {
            then_queue.push(fn);
            if (check_pool()) do_queue();
          }
          // otherwise, the gate's already open, so fire immediately
          else fn();
          
          return chainAPI;
        }
      };
      
      // add in arguments passed as constructor parameters
      chainAPI.and.apply({},arguments);
      
      return chainAPI;
    };
    
    // rollback to a previous $AG global ref, if any
    // and return this copy
    instanceAPI.noConflict = function() {
      var new_$AG = global.$AG;
      global.$AG = old_$AG;
      return new_$AG;
    };
    
    // create a fresh, clean, sandboxed copy of the current $AG
    instanceAPI.sandbox = function() {
      return create_sandbox();
    };
    
    return instanceAPI;
  }
  
  global.$AG = create_sandbox();

})(this);