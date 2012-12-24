/*! asyncGate.js
    v0.6.0 (c) Kyle Simpson
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
      function check_pool() {
        for (var i=0; i<pool.length; i++) {
          if (!pool[i]) return false;
        }
        return true;
      }
      
      function do_then_queue() {
        var fn;

        if (aborted) return;

        // reset the error queue, if necessary
        if (or_queue !== true && or_queue.length) or_queue = [];
        pool = [];
        
        // make sure at least one success callback is registered
        if (then_queue !== true && then_queue.length) {
          // empty the queue
          while (then_queue && (fn = then_queue.shift())) {
            if (msgs.length > 0) {
              fn.apply({},msgs);
              msgs = [];
            }
            else fn.call({});
          }
          then_queue = true; // flag it as complete
        }
      }

      function do_or_queue() {
        var fn;

        if (aborted) return;

        // reset the success queue
        then_queue = true;
        pool = [];
        
        // make sure at least one error callback is registered
        if (or_queue !== true && or_queue.length) {
          // empty the queue
          while (or_queue && (fn = or_queue.shift())) {
            if (msgs.length > 0) {
              fn.apply({},msgs);
              msgs = [];
            }
            else fn.call({});
          }
          or_queue = true; // flag it as complete
        }
      }

      function createTrigger() {
        var pool_idx = pool.length, fn, deferred;
        pool[pool_idx] = false;
        fn = function(){
          if (deferred) {
            deferred.abort();
            deferred = null;
          }
          if (!(gate_error || aborted)) {
            if (arguments.length > 0) msgs.push([].slice.call(arguments));
            pool[pool_idx] = true;
            if (check_pool()) do_then_queue();
          }
        };
        fn.fail = function(){
          if (deferred) {
            deferred.abort();
            deferred = null;
          }
          if (!(gate_error || aborted)) {
            if (arguments.length > 0) msgs.push([].slice.call(arguments));
            gate_error = true;
            do_or_queue();
          }
        };
        fn.abort = function(){
          if (deferred) {
            deferred.abort();
            deferred = null;
          }
          chainAPI.abort();
        };
        fn.defer = function(){
          if (deferred) throw new Error("defer() already called.");
          if (arguments.length == 0) throw new Error("Missing argument to defer().");
          deferred = global.$AG.apply(null,arguments)
          .then(function(){
            deferred = null;
            fn.apply(null,arguments);
          })
          .or(function(){
            deferred = null;
            fn.fail.apply(null,arguments);
          });
        };
        return fn;
      }

      var chainAPI,
          pool = [],
          then_queue = [],
          or_queue = [],
          msgs = [],
          gate_error = false,
          aborted = false
      ;
    
      chainAPI = {
        and: function() {
          if (gate_error || aborted) return chainAPI;

          // can't call `and()` anymore
          if (then_queue === true) {
            throw new Error("Wrong: gate has already been activated.");
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
          // if we're already in an error-state for this gate, ignore call
          if (gate_error || aborted) return chainAPI;

          // guard the parameter type... must be a function
          if (!is_func(fn)) throw new Error("Wrong: non-function parameter passed in.");
          
          // are we still adding to the `then` queue?
          if (then_queue !== true) {
            then_queue.push(fn);
            if (check_pool()) do_then_queue();
          }
          // otherwise, the gate's already open, so fire immediately
          else {
            or_queue = [];
            fn.apply({},msgs);
            msgs = [];
          }
          
          return chainAPI;
        },
        or: function(fn) {
          if (aborted) return chainAPI;

          // guard the parameter type... must be a function
          if (!is_func(fn)) throw new Error("Wrong: non-function parameter passed in.");

          if (gate_error || or_queue === true) {
            fn.apply({},msgs);
            msgs = [];
          }
          else {
            or_queue.push(fn);
          }

          return chainAPI;
        },
        abort: function() {
          aborted = true;
          pool = then_queue = or_queue = messages = null;
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