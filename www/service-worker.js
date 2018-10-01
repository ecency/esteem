var precacheConfig  = [
  ["", "0"],
  ["index.html", "1"],
  ["service-worker.js", "2"],
  ["css/font-awesome.css", "3"],
  ["css/ionic.app.css", "4"],
  ["css/ionic.app.min.css", "5"],
  ["css/ionic.css", "6"],
  ["css/style.css", "7"],
  ["fonts/fontawesome-webfont.eot", "8"],
  ["fonts/fontawesome-webfont.svg", "9"],
  ["fonts/fontawesome-webfont.ttf", "10"],
  ["fonts/fontawesome-webfont.woff", "11"],
  ["fonts/fontawesome-webfont.woff2", "12"],
  ["fonts/ FontAwesome.otf", "13"],
  ["fonts/ionicons.eot", "14"],
  ["fonts/ionicons.svg", "15"],
  ["fonts/ionicons.ttf", "16"],
  ["fonts/ionicons.woff", "17"],
  ["img/about.png", "18"],
  ["img/esteem.png", "19"],
  ["img/esteem_white.png", "20"],
  ["img/isimage.png", "21"],
  ["img/logo.png", "22"],
  ["img/logo_steemfest.png", "23"],
  ["img/logo_steemmonitor.png", "24"],
  ["img/noimage.png", "25"],
  ["img/nsfwimage.png", "26"],
  ["img/ollist.png", "27"],
  ["img/photo.png", "28"],
  ["img/plus.png", "29"],
  ["img/steemDeclined.png", "30"],
  ["img/steem_icon.png", "31"],
  ["img/tap_to_see_image.xcf", "32"],
  ["img/ullist.png", "33"],
  ["img/user_profile.png", "34"],
  ["img/ user_profile.xcf", "35"],
  ["js/index.js", "36"],
  ["js/lib.js", "37"],
  ["lib/blockies.js", "38"],
  ["lib/firebase.js", "39"],
  ["lib/highcharts.src.js", "40"],
  ["lib/highstock.src.js", "41"],
  ["lib/imgcache.js", "42"],
  ["lib/ion-datetime-picker.min.css", "43"],
  ["lib/ion-datetime-picker.min.js", "44"],
  ["lib/ionic-img-cache.js", "45"],
  ["lib/ marked.js", "46"],
  ["lib/moment-with-locales.min.js", "47"],
  ["lib/speakingurl.min.js", "48"],
  ["templates/gallery_images.html", "49"],
  ["templates/info.html", "50"],
  ["templates/login.html", "51"],
  ["templates/pincode.html", "52"],
  ["templates/popover.html", "53"],
  ["templates/reply.html", "54"],
  ["templates/search.html", "55"],
  ["templates/story.html", "56"]
],
cacheName = "sw-precache-v3-eSteem-" + (self.registration ? self.registration.scope : ""),
ignoreUrlParametersMatching = [/^utm_/],
addDirectoryIndex = function(e, t) {
    var n = new URL(e);
    return "/" === n.pathname.slice(-1) && (n.pathname += t), n.toString()
},
cleanResponse = function(e) {
    return e.redirected ? ("body" in e ? Promise.resolve(e.body) : e.blob()).then(function(t) {
        return new Response(t, {
            headers: e.headers,
            status: e.status,
            statusText: e.statusText
        })
    }) : Promise.resolve(e)
},
createCacheKey = function(e, t, n, r) {
    var a = new URL(e);
    return r && a.pathname.match(r) || (a.search += (a.search ? "&" : "") + encodeURIComponent(t) + "=" + encodeURIComponent(n)), a.toString()
},
isPathWhitelisted = function(e, t) {
    if (0 === e.length) return !0;
    var n = new URL(t).pathname;
    return e.some(function(e) {
        return n.match(e)
    })
},
stripIgnoredUrlParameters = function(e, t) {
    var n = new URL(e);
    return n.hash = "", n.search = n.search.slice(1).split("&").map(function(e) {
        return e.split("=")
    }).filter(function(e) {
        return t.every(function(t) {
            return !t.test(e[0])
        })
    }).map(function(e) {
        return e.join("=")
    }).join("&"), n.toString()
},
hashParamName = "_sw-precache",
urlsToCacheKeys = new Map(precacheConfig.map(function(e) {
    var t = e[0],
        n = e[1],
        r = new URL(t, self.location),
        a = createCacheKey(r, hashParamName, n, !1);
    return [r.toString(), a]
}));

function setOfCachedUrls(e) {
return e.keys().then(function(e) {
    return e.map(function(e) {
        return e.url
    })
}).then(function(e) {
    return new Set(e)
})
}
self.addEventListener("install", function(e) {
e.waitUntil(caches.open(cacheName).then(function(e) {
    return setOfCachedUrls(e).then(function(t) {
        return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(n) {
            if (!t.has(n)) {
                var r = new Request(n, {
                    credentials: "same-origin"
                });
                return fetch(r).then(function(t) {
                    if (!t.ok) throw new Error("Request for " + n + " returned a response with status " + t.status);
                    return cleanResponse(t).then(function(t) {
                        return e.put(n, t)
                    })
                })
            }
        }))
    })
}).then(function() {
    return self.skipWaiting()
}))
}), self.addEventListener("activate", function(e) {
var t = new Set(urlsToCacheKeys.values());
e.waitUntil(caches.open(cacheName).then(function(e) {
    return e.keys().then(function(n) {
        return Promise.all(n.map(function(n) {
            if (!t.has(n.url)) return e.delete(n)
        }))
    })
}).then(function() {
    return self.clients.claim()
}))
}), self.addEventListener("fetch", function(e) {
if ("GET" === e.request.method) {
    var t, n = stripIgnoredUrlParameters(e.request.url, ignoreUrlParametersMatching);
    (t = urlsToCacheKeys.has(n)) || (n = addDirectoryIndex(n, "index.html"), t = urlsToCacheKeys.has(n));
    0, t && e.respondWith(caches.open(cacheName).then(function(e) {
        return e.match(urlsToCacheKeys.get(n)).then(function(e) {
            if (e) return e;
            throw Error("The cached response that was expected is missing.")
        })
    }).catch(function(t) {
        return console.warn('Couldn\'t serve response for "%s" from cache: %O', e.request.url, t), fetch(e.request)
    }))
}
});