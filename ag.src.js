(function(global){

  var old_$AG = global.$AG;

	// test for function
	function is_func(func) { return Object.prototype.toString.call(func) == "[object Function]"; }

	// test for array
	function is_array(arr) { return Object.prototype.toString.call(arr) == "[object Array]"; }
	
	function create_sandbox() {
    var instanceAPI;
    
    instanceAPI = function() {
      var chainAPI,
          pool = [],
          then_queue = []
      ;
      
      function check_pool() {
        if (pool !== true) {
          for (var i=0; i<pool.length; i++) {
            if (pool[i] !== true) return false;
          }
          pool = true;
        }
        return (pool === true);
      }
      
      function do_queue() {
        var fn;
        while (fn = then_queue.shift()) fn();
        then_queue = true;
      }
      
      chainAPI = {
        and: function() {
          return chainAPI;
        },
        then: function(fn) {
          if (then_queue !== true) then_queue.push(fn);
          else fn();
          
          return chainAPI;
        }
      };
      
      chainAPI.and.apply({},arguments); // add in arguments passed as constructor parameters
      
      return chainAPI;
    };
    
    instanceAPI.noConflict = function() {
      var new_$AG = global.$AG;
      global.$AG = old_$AG;
      return new_$AG;
    };
    
    instanceAPI.sandbox = function() {
      return create_sandbox();
    };
    
    return instanceAPI;
  }
  
  global.$AG = create_sandbox();

})(this);