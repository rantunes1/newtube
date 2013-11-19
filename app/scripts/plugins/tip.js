angular.module('U2bApp.plugins.tip', [])

.run([function(){
    if (!angular.element().qtip) {
        throw new Error('missing <jquery.qtip.js>');
    }
}])
.factory('tip', [function() {
  return function(element, value){
      return element.qtip(value);
  }; 
}]);