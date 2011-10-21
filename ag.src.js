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
          ready = false,
          triggered = false
      ;
      
      chainAPI = {
        and: function(fn) {
          return chainAPI;
        },
        then: function(fn) {
          return chainAPI;
        }
      };
      
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