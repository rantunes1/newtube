angular.module('U2bApp.directives.tip', [])
    .run([function(){
        if (!angular.element().qtip) {
            throw new Error('missing "jquery.qtip.js" required by the Tip directive');
        }
    }])
    
    .directive('tip', ['$window', function($window) {
        return {
            restrict: 'EA',
           link: function (scope, element, attr) {
               scope.$on('$destroy', function () {
                    element.qtip('destroy');
                });
               
                scope.$watch(
                    function(){
                        return element.width();
                    },
                    function(){
                        element.qtip('reposition');
                    }
                );

                scope.$watch( 
                    function(){
                        return attr.title;
                    } , 
                    function qtip(value){
                        var text = (value || '>> no description <<');
                        var html = '';                        
                        angular.forEach(text, function(char){
                            var code = char.charCodeAt(0); 
                            if(code === 10 || code === 13){
                                //LF or CR
                                char = '<br/>';  
                            } 
                            html += char;
                        });
                        
                        var urls = html.match(/([^\]\/">]|^)((https?):\/\/[-A-ZÅÄÖ0-9+&@#\/%?=~_|!:,.;]*[-A-ZÅÄÖ0-9+&@#\/%=~_|])/ig);
                        angular.forEach(urls, function(url){
                            var anchor = '&nbsp;<a target="ytlink" href="'+ url +'">'+ url +'</a>';
                            html = html.replace(url,anchor);
                        });
                        
                        
                        api = element.qtip({
                            content: {
                                text: html
                            },
                            style: {
                                def: false, // Remove the default styling
                                classes: 'qtip-rounded qtip-tipsy',
                                tip: {
                                    corner: 'center left',
                                    border: 1,
                                }
                            },
                            position: {
                                my: 'top left',
                                at: 'center right',
                                target: element,
                                viewport: angular.element($window),
                                adjust:{
                                    method: 'flip shift'
                                }
                            },
                            show:{
                                delay: 1000,
                                solo: true
                            },
                            hide: {
                                fixed : true,
                                delay : 500
                            }
                        });
                    }
                );                
            }
        };
    }]);
