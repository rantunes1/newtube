angular.module('U2bApp.services.globals', [])

.run(['$window', function($window) {
    if (!$window.store) { throw new Error('missing "store.js" required to run CacheService'); }
}])
.factory('store', ['$window', function($window) {
  return $window.store; 
}])


.run(['$window',function($window) {
    if (!$window.toastr) { throw new Error('missing "toastr.js" required to show notification messages'); }
}])
.factory('toastr', ['$window', function($window) {
  return $window.toastr; 
}])
;