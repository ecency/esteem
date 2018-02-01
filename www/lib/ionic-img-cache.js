(function(document) {
  'use strict';

  angular.module('ionicImgCache', ['ionic'])
    .run(init)
    .provider('ionicImgCache', ionicImgCacheProvider)
    .factory('ionImgCacheSrv', ionImgCacheSrv)
    .directive('ionImgCache', ionImgCache)
    .directive('ionImgCacheBg', ionImgCacheBg);

  function init($ionicPlatform, ionicImgCache, $log) {
    /* ngInject */

    ImgCache.options.skipURIencoding = true;
    ImgCache.options.debug = ionicImgCache.debug;
    ImgCache.options.localCacheFolder = ionicImgCache.folder;
    ImgCache.options.chromeQuota = ionicImgCache.quota * 1024 * 1024;
    ImgCache.options.cacheClearSize = ionicImgCache.cacheClearSize;

    $ionicPlatform.ready(function() {
      ImgCache.init(function() {

        if (ionicImgCache.debug) {
          $log.info('ionicImgCache initialized');
        }
      }, function() {
        if (ionicImgCache.debug) {
          $log.error('Failed to init ionicImgCache.');
        }
      });
    });
  }

  function ionicImgCacheProvider() {
    var debug = false;
    var quota = 50;
    var folder = 'ionic-img-cache';
    var cacheClearSize = 0;

    this.debug = function(value) {
      debug = !!value;
    }

    this.quota = function(value) {
      quota = isFinite(value) ? value : 50;
    }

    this.folder = function(value) {
      folder = '' + value;
    }

    this.cacheClearSize = function(value) {
      cacheClearSize = isFinite(value) ? value : 0;
    }

    this.$get = function() {
      return {
        debug: debug,
        quota: quota,
        folder: folder,
        cacheClearSize: cacheClearSize
      };
    };
  }

  function ionImgCacheSrv($q) {
    /* ngInject */

    /**
     * Adds file to local cache.
     * @param {string} src - image source url.
     */
    function add(src) {
      var defer = $q.defer();

      _checkImgCacheReady()
        .then(function() {
          ImgCache.cacheFile(src, function() {
            ImgCache.isCached(src, function(path, success) {
              defer.resolve(path);
            }, defer.reject);
          }, defer.reject);
        })
        .catch(defer.reject);

      return defer.promise;
    }

    /**
     * Gets file local url if it present in cache.
     * @param {string} src - image source url.
     */
    function get(src) {
      var defer = $q.defer();

      _checkImgCacheReady()
        .then(function() {
          ImgCache.isCached(src, function(path, success) {
            if (success) {
              defer.resolve(path);
            } else {
              defer.reject();
            }
          }, defer.reject);
        })
        .catch(defer.reject);

      return defer.promise;
    }

    /**
     * Removes file from local cache if it present.
     * @param {string} src - image source url.
     */
    function remove(src) {
      var defer = $q.defer();

      _checkImgCacheReady()
        .then(function() {
          ImgCache.isCached(src, function(path, success) {
            ImgCache.removeFile(src, function() {
              defer.resolve();
            }, defer.reject);
          }, defer.reject);
        })
        .catch(defer.reject);

      return defer.promise;
    }

    /**
     * Checks file cache status by url.
     * @param {string} src - image source url.
     */
    function checkCacheStatus(src) {
      var defer = $q.defer();

      _checkImgCacheReady()
        .then(function() {
          ImgCache.isCached(src, function(path, success) {
            if (success) {
              defer.resolve(path);
            } else {
              ImgCache.cacheFile(src, function() {
                ImgCache.isCached(src, function(path, success) {
                  defer.resolve(path);
                }, defer.reject);
              }, defer.reject);
            }
          }, defer.reject);
        })
        .catch(defer.reject);

      return defer.promise;
    }

    /**
     * Checks elements background file cache status by element.
     * @param {HTMLElement} element - element with background image.
     */
    function checkBgCacheStatus(element) {
      var defer = $q.defer();

      _checkImgCacheReady()
        .then(function() {
          ImgCache.isBackgroundCached(element, function(path, success) {
            if (success) {
              defer.resolve(path);
            } else {
              ImgCache.cacheBackground(element, function() {
                ImgCache.isBackgroundCached(element, function(path, success) {
                  defer.resolve(path);
                }, defer.reject);
              }, defer.reject);
            }
          }, defer.reject);
        })
        .catch(defer.reject);

      return defer.promise;
    }

    /**
     * Clears all cahced files.
     */
    function clearCache() {
      var defer = $q.defer();

      _checkImgCacheReady()
        .then(function() {
          ImgCache.clearCache(defer.resolve, defer.reject);
        })
        .catch(defer.reject);

      return defer.promise;
    }

    /**
     * Gets local cache size in bytes.
     */
    function getCacheSize() {
      var defer = $q.defer();

      _checkImgCacheReady()
        .then(function() {
          defer.resolve(ImgCache.getCurrentSize());
        })
        .catch(defer.reject);

      return defer.promise;
    }

    /**
     * Checks if imgcache library initialized.
     * @private
     */
    function _checkImgCacheReady() {
      var defer = $q.defer();

      if (ImgCache.ready) {
        defer.resolve();
      }
      else{
        document.addEventListener('ImgCacheReady', function() { // eslint-disable-line
          defer.resolve();
        }, false);
      }

      return defer.promise;
    }

    return {
      add: add,
      get: get,
      remove: remove,
      checkCacheStatus: checkCacheStatus,
      checkBgCacheStatus: checkBgCacheStatus,
      clearCache: clearCache,
      getCacheSize: getCacheSize
    };
  }

  function ionImgCache(ionImgCacheSrv) {
    /* ngInject */

    function link(scope, element, attrs) {
      attrs.$observe('ngSrc', function(src) {
        ionImgCacheSrv.checkCacheStatus(src)
          .then(function() {
            ImgCache.useCachedFile(element);
          });
      });
    }

    return {
      restrict: 'A',
      link: link
    };
  }

  function ionImgCacheBg(ionImgCacheSrv) {
    /* ngInject */

    function link(scope, element, attrs) {
      ionImgCacheSrv.checkBgCacheStatus(element)
        .then(function() {
          ImgCache.useCachedBackground(element);
        });

      attrs.$observe('ngStyle', function() {
        ionImgCacheSrv.checkBgCacheStatus(element)
          .then(function() {
            ImgCache.useCachedBackground(element);
          });
      });
    }

    return {
      restrict: 'A',
      link: link
    };
  }
})(document);
