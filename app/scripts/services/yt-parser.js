angular.module('U2bApp.services.yt-parser', []).provider('YTParser', [
function() {'use strict';

    this.$get = ['$log',
    function($log) {
        throw new Error('YTParser cannot be instantiated');
    }];

    this.parseUser = function(userItem) {
        //https://developers.google.com/youtube/2.0/reference
        //FEEDs: watchhistory watchlater subscriptions liveevent favorites contacts inbox playlists uploads newsubscriptionvideos recentactivity

        var feeds = {};
        angular.forEach(userItem.gd$feedLink || [], function(feed) {
            var ytFeedType = feed.rel || '';
            var feedType = ytFeedType.substring(ytFeedType.lastIndexOf('.') + 1).toLowerCase();
            feeds[feedType] = {
                url : feed.href,
                count : feed.countHint
            };
        });

        return {
            id : userItem.yt$userId.$t, //id
            gplusId : userItem.yt$googlePlusUserId.$t,
            channelId : userItem.yt$channelId.$t,
            title : userItem.title.$t,
            created : userItem.published ? new Date(userItem.published.$t) : null,
            lastChanged : userItem.updated ? new Date(userItem.updated.$t) : null,
            //category
            //content
            //@todo         link*,
            //author,
            aboutMe : userItem.yt$aboutMe ? userItem.yt$aboutMe.$t : null,
            age : userItem.yt$age ? userItem.yt$age.$t : null,
            books : userItem.yt$books ? userItem.yt$books.$t : null,
            company : userItem.yt$company ? userItem.yt$company.$t : null,
            firstName : userItem.firstName ? userItem.firstName.$t : null,
            gender : userItem.yt$gender ? userItem.yt$gender.$t : null,
            hobbies : userItem.yt$hobbies ? userItem.yt$hobbies.$t : null,
            hometown : userItem.yt$hometown ? userItem.yt$hometown.$t : null,
            lastName : userItem.lastName ? userItem.lastName.$t : null,
            location : userItem.yt$location ? userItem.yt$location.$t : null,
            maxUploadDuration : userItem.yt$maxUploadDuration ? userItem.yt$maxUploadDuration.$t : null, //in seconds. absent means no limit
            movies : userItem.yt$movies ? userItem.yt$movies.$t : null,
            music : userItem.yt$music ? userItem.yt$music.$t : null,
            occupation : userItem.yt$occupation ? userItem.yt$occupation.$t : null,
            school : userItem.yt$school ? userItem.yt$school.$t : null,
            username : userItem.yt$username.$t,
            displayName : userItem.yt$username.display,
            statistics : {
                watched : userItem.yt$statistics ? userItem.yt$statistics.videoWatchCount : null,
                subscribers : userItem.yt$statistics ? userItem.yt$statistics.subscriberCount : null,
                favorited : userItem.yt$statistics ? userItem.yt$statistics.favoriteCount : null,
                views : userItem.yt$statistics ? userItem.yt$statistics.totalUploadViews : null
            },
            thumbnail : userItem.media$thumbnail ? userItem.media$thumbnail.url : null,
            feeds : feeds
        };
    };

    this.parseVideoList = function(videosList) {
        var parsedVideos = [];

        angular.forEach(videosList || [], function(video) {
            var acls = {};
            angular.forEach(video.yt$accessControl, function(acl) {
                acls[acl.action] = acl.permission;
            });

            var author = video.author[0];
            var media = video.media$group;
            var thumbsList = media.media$thumbnail;

            var comments = null;
            if ((acls.comment !== 'denied')) {
                //comments are allowed
                var commentsData = video.gd$comments.gd$feedLink;
                comments = {
                    feed : commentsData.href,
                    count : commentsData.countHint
                };
            }

            var thumbnails = {};
            angular.forEach(thumbsList, function(thumbnail) {
                var name = thumbnail.yt$name;
                delete thumbnail.yt$name;
                thumbnails[name] = thumbnail;
            });

            parsedVideos.push({
                id : media.yt$videoid.$t,
                title : video.title.$t,
                description : media.media$description.$t,
                author : {
                    id : author.yt$userId.$t,
                    name : author.name.$t,
                    uri : author.uri.$t
                },
                content : video.content,
                content_media : media.media$content,
                duration : media.yt$duration.seconds,
                aspectRatio : media.yt$aspectRatio ? media.yt$aspectRatio.$t : null,
                isHD : angular.isObject(video.yt$hd),
                thumbnails : thumbnails,
                activeThumbnail : 'mqdefault',
                comments : comments, //will be null if comments are not allowed
                acls : acls,
                links : video.link,
                ratings : angular.extend({}, video.gd$rating, video.yt$rating, video.yt$statistics),
                uploaded : new Date(media.yt$uploaded.$t),
                published : new Date(video.published.$t),
                updated : new Date(video.updated.$t)
            });
        });

        return parsedVideos;
    };

    this.parseChannel = function(channel) {
        var snippet = channel.snippet;
        var relatedPlaylists = channel.contentDetails.relatedPlaylists;
        return {
            id : channel.id,
            title : snippet.title,
            description : snippet.description,
            dateCreated : snippet.publishedAt,
            thumbnails : snippet.thumbnails,
            specialPlaylists : {
                favorites : relatedPlaylists.favorites,
                likes : relatedPlaylists.likes,
                uploads : relatedPlaylists.uploads,
                watchHistory : relatedPlaylists.watchHistory,
                watchLater : relatedPlaylists.watchLater
            },
            statistics : channel.statistics
        };
    };

    this.parseActivities = function(activities) {
        var parsedActivities = [];

        angular.forEach(activities, function(activity) {
            var userId = activity.yt$userId ? activity.yt$userId.$t : null;
            var channelId = activity.yt$channelId ? activity.yt$channelId.$t : null;
            var updateDate = activity.updated.$t;
            var id = (channelId || userId) + '@' + updateDate;

            parsedActivities.push({
                id : id,
                author : {
                    id : activity.author[0].yt$userId.$t,
                    name : activity.author[0].name.$t
                },
                type : activity.category[activity.category.length - 1].term,
                link : activity.link,
                title : activity.title.$t,
                channelId : channelId,
                videoId : activity.yt$videoid ? activity.yt$videoid.$t : null,
                userId : userId,
                updated : new Date(updateDate)
            });
        });

        return parsedActivities;
    };

    this.parsePlaylists = function(playlists) {
        var parsedPlaylists = [];

        angular.forEach(playlists || [], function(playlist) {
            parsedPlaylists.push({
                id : playlist.yt$playlistId.$t,
                title : playlist.title.$t,
                summary : playlist.summary.$t,
                contentURL : playlist.content.src,
                links : playlist.link,
                public : !playlist.yt$private,
                published : new Date(playlist.published.$t),
                numVideos : playlist.yt$countHint.$t,
                updated : new Date(playlist.updated.$t)
            });
        });

        return parsedPlaylists;
    };

    this.parsePlaylistItems = function(playlistsItem) {
        var parsedPlaylistsItems = [];

        angular.forEach(playlistsItem || [], function(playlistItem) {
            parsedPlaylistsItems.push(playlistItem.contentDetails.videoId);
        });

        return parsedPlaylistsItems;
    };
}]);
