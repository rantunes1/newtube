angular.module('U2bApp.plugins.tubeplayer', [])

.run([function(){
    if (!angular.element().qtip) {
        throw new Error('missing <jQuery.tubeplayer.js>');
    }
}])
.factory('tubeplayer', [function() {
    return function(element, value){
      return element.tubeplayer(value);
  }; 
}]);