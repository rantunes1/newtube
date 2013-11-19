angular.module('U2bApp.plugins.toastr', [])

.run(['$window',function($window) {
    if (!$window.toastr) { throw new Error('missing "toastr.js" required to show notification messages'); }
}])
.factory('toastr', ['$window', function($window) {
  return $window.toastr; 
}])
;