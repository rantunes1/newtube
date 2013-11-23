A client for youtube's API implemented with angular.js  
A replacement for youtube website

Tired of Google's non stopping changes to youtube, I decided to use their API and create my own youtube website. 

This is a sandbox project I use mainly to test new web based components or techniques.

### How to install ###

1 - Install node.js  
2 - Install grunt-cli (`npm -g install grunt-cli`)  
3 -  install bower (`npm install -g bower`)  
4 - execute the commands:  
`git clone git://github.com/rantunes1/newtube`   
`cd newtube`    
 `npm install`  
 `bower install`  
 `grunt server `  
4 - open [http://localhost:9009/](http://localhost:9009/) in your browser  

###### note: to play a video you have to click on its description on the thumbnail.

---
***
###### features already implemented:  
- user authentication with google oauth (working but not completed)  
- user subscriptions page  
    - shows information for individual videos (ratings, views, etc)  
    - shows video description on a text bubble  
    - video title links to video page  
- video player page      
    - youtube player is integrated on page and working. this page needs to be extended.
- user channel's page   
    - routing only  
- a working notifications' wall. still needs formatting.

@todo how to use
@todo configuration
@todo list & credit 3rd party plugins

planed features 

(roadmap 1.0):

subscriptions page (video wall)  
    - dynamically update of subscriptions' feed  
    - allow user to dismiss videos  
    - allow user to show/hide dismissed videos  
    - allow user to show/hide watched videos  
    - allow user to like the video   
    - show icon if user liked/favorited the video  
    - show counter if user added video to playlist(s)  
    - allow user to send video to watch later playlist  
    - allow user to sort videos  
video player page  
    - allow user to change player configuration  
    - show comments (as tree)  
    - show related videos  
    - add video download option  
channel page  
    - show info about the channel  
    - show list of videos user liked/favorited/playlisted on the channel  
new pages:  
    - search videos (this will probably be the homepage)  
    - playlists   
    - live events  
    - what to watch (watch later + recommended)  
notifications  
    - add links to channel/video (show thumbnail?)  
    
(roadmap 1.1):  
    - allow user to edit information   
    - allow user to post comments  
    - allow user to add notes to video  
    

######by [Ricardo Antunes](https://github.com/rantunes1) 