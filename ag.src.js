/*! asyncGate.js
    v0.3 (c) Kyle Simpson
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
        for (var i=0; i<pool.length; i++) {
          if (!pool[i]) return false;
        }
        return true;
      }
      
      function do_queue() {
        var fn;
        
        // make sure at least one `then` callback is registered
        if (then_queue !== true && then_queue.length) {
          pool = [];
          while (fn = then_queue.shift()) fn(); // empty the queue
          then_queue = true; // flag it as complete
        }
      }
      
      chainAPI = {
        and: function() {
          function createTrigger() {
            var pool_idx = pool.length;
            pool[pool_idx] = false;
            return function(){
              pool[pool_idx] = true;
              if (check_pool()) do_queue();
            };
          }

          // can't call
          if (then_queue === true || then_queue.length > 0) {
            throw new Error("Can't call `and()` anymore.");
          }

          var args, i;

          // special case: if no arguments provided, return the trigger function directly
          if (arguments.length == 0) return createTrigger();
        
          args = flatten_array([].slice.call(arguments));
          
          for (i=0; i<args.length; i++) {
            // guard the parameter type... must be a function
            if (!is_func(args[i])) throw new Error("Wrong: non-function parameter passed in.");
            
            args[i](createTrigger());
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
      if (arguments.length > 0) chainAPI.and.apply({},arguments);
      
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