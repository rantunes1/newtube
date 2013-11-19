angular
    .module('U2bApp.directives.textbox', ['U2bApp.plugins.tip'])    
    
    .directive('textbox', ['$window', 'tip', function($window, tip) { 
        'use strict';
        
        var windowElem = angular.element($window);
        return {
            restrict: 'EA',
            link: function (scope, element, attr) {
                scope.$on('$destroy', function () {
                    tip(element,'destroy');
                });
               
                scope.$watch(
                    function(){
                        return element.width();
                    },
                    function(){
                        tip(element,'reposition');
                    }
                );

                scope.$watch( 
                    function(){
                        return attr.title;
                    } , 
                    function (value){
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
                        
                        tip(element,{
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
                                viewport: windowElem,
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
