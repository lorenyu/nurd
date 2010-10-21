// import libraries
var fs = require('fs');
var http = require('http');
var url = require('url');
var util = require('util');
var EventEngine = require('./EventEngine.js').EventEngine;

this.EventEngineHttpServer = function(config) {
    
    // Private properties and methods

    function textResponse(response, text, responseCode) {
        responseCode = responseCode || 200;

        response.writeHead(responseCode, {
            'Content-Type': 'text/plain',
            'Content-Length': text.length
        });
        response.end(text);
    }

    function jsonResponse(response, json, responseCode) {
        responseCode = responseCode || 200;
        if (typeof(json) !== 'string') {
            json = JSON.stringify(object);
        }

        response.writeHead(responseCode, {
            'Content-Type': 'application/json',
            'Content-Length': json.length
        });
        response.end(json);
    }

    function notifyClients() {
        var now = (new Date()).getTime();
        for (clientId in clientsById) { // TODO: add "hasOwnProperty" check
            var client = clientsById[clientId];
            if (client.response) {
                var newEvents = getEventsBetween(client.lastUpdated, now);
                jsonResponse(client.response, newEvents);
                client.response = null;
                for (var i = 0, n = newEvents.length; i < n; i += 1) {
                    newEvents[i].numClientsToNotify -= 1;
                }
            }
        }
        cleanupEvents();
    }

    function onServerEvent(event) {
        event.numClientsToNotify = clients.length;
        event.serverTime = (new Date()).getTime();
        events.push(event);

        notifyClients();
    }

    function cleanupEvents() {
        // TODO uncomment when ready to test more
        /*
        while (events.length > 0 && events[0].numClientsToNotify === 0) {
            events.shift();
        }
*/
    }

    function getEventsBetween(minTime, maxTime) {
        var result = [];
        var i = 0;
        while (i < events.length && events[i].serverTime < minTime) {
            i += 1;
        }
        while (events[i].serverTime < maxTime) {
            result.push(events[i]);
        }
        return result;
    }


    var getMap = {};

    function extname (path) {
        var index = path.lastIndexOf(".");
        return index < 0 ? "" : path.substring(index);
    }

    function staticHandler(filename) {
        var body, headers;
        var contentType = mime.lookupExtension(extname(filename));
        
        function loadResponseData(callback) {
            if (body && headers) {
                callback();
                return;
            }

            util.puts("loading " + filename + "...");
            fs.readFile(filename, function (err, data) {
                if (err) {
                    util.puts("Error loading " + filename);
                } else {
                    body = data;
                    headers = { "Content-Type": contentType
                                , "Content-Length": body.length
                              };
                    headers["Cache-Control"] = "public";
                    util.puts("static file " + filename + " loaded");
                    callback();
                }
            });
        }
        
        return function (req, res) {
            loadResponseData(function () {
                res.writeHead(200, headers);
                res.end(req.method === "HEAD" ? "" : body);
            });
        }
    };

    // stolen from jack- thanks
    var mime = {
        // returns MIME type for extension, or fallback, or octet-steam
        lookupExtension : function(ext, fallback) {
            return mime.TYPES[ext.toLowerCase()] || fallback || 'application/octet-stream';
        },
        
        // List of most common mime-types, stolen from Rack.
        TYPES : { ".3gp"   : "video/3gpp"
                  , ".a"     : "application/octet-stream"
                  , ".ai"    : "application/postscript"
                  , ".aif"   : "audio/x-aiff"
                  , ".aiff"  : "audio/x-aiff"
                  , ".asc"   : "application/pgp-signature"
                  , ".asf"   : "video/x-ms-asf"
                  , ".asm"   : "text/x-asm"
                  , ".asx"   : "video/x-ms-asf"
                  , ".atom"  : "application/atom+xml"
                  , ".au"    : "audio/basic"
                  , ".avi"   : "video/x-msvideo"
                  , ".bat"   : "application/x-msdownload"
                  , ".bin"   : "application/octet-stream"
                  , ".bmp"   : "image/bmp"
                  , ".bz2"   : "application/x-bzip2"
                  , ".c"     : "text/x-c"
                  , ".cab"   : "application/vnd.ms-cab-compressed"
                  , ".cc"    : "text/x-c"
                  , ".chm"   : "application/vnd.ms-htmlhelp"
                  , ".class"   : "application/octet-stream"
                  , ".com"   : "application/x-msdownload"
                  , ".conf"  : "text/plain"
                  , ".cpp"   : "text/x-c"
                  , ".crt"   : "application/x-x509-ca-cert"
                  , ".css"   : "text/css"
                  , ".csv"   : "text/csv"
                  , ".cxx"   : "text/x-c"
                  , ".deb"   : "application/x-debian-package"
                  , ".der"   : "application/x-x509-ca-cert"
                  , ".diff"  : "text/x-diff"
                  , ".djv"   : "image/vnd.djvu"
                  , ".djvu"  : "image/vnd.djvu"
                  , ".dll"   : "application/x-msdownload"
                  , ".dmg"   : "application/octet-stream"
                  , ".doc"   : "application/msword"
                  , ".dot"   : "application/msword"
                  , ".dtd"   : "application/xml-dtd"
                  , ".dvi"   : "application/x-dvi"
                  , ".ear"   : "application/java-archive"
                  , ".eml"   : "message/rfc822"
                  , ".eps"   : "application/postscript"
                  , ".exe"   : "application/x-msdownload"
                  , ".f"     : "text/x-fortran"
                  , ".f77"   : "text/x-fortran"
                  , ".f90"   : "text/x-fortran"
                  , ".flv"   : "video/x-flv"
                  , ".for"   : "text/x-fortran"
                  , ".gem"   : "application/octet-stream"
                  , ".gemspec" : "text/x-script.ruby"
                  , ".gif"   : "image/gif"
                  , ".gz"    : "application/x-gzip"
                  , ".h"     : "text/x-c"
                  , ".hh"    : "text/x-c"
                  , ".htm"   : "text/html"
                  , ".html"  : "text/html"
                  , ".ico"   : "image/vnd.microsoft.icon"
                  , ".ics"   : "text/calendar"
                  , ".ifb"   : "text/calendar"
                  , ".iso"   : "application/octet-stream"
                  , ".jar"   : "application/java-archive"
                  , ".java"  : "text/x-java-source"
                  , ".jnlp"  : "application/x-java-jnlp-file"
                  , ".jpeg"  : "image/jpeg"
                  , ".jpg"   : "image/jpeg"
                  , ".js"    : "application/javascript"
                  , ".json"  : "application/json"
                  , ".log"   : "text/plain"
                  , ".m3u"   : "audio/x-mpegurl"
                  , ".m4v"   : "video/mp4"
                  , ".man"   : "text/troff"
                  , ".mathml"  : "application/mathml+xml"
                  , ".mbox"  : "application/mbox"
                  , ".mdoc"  : "text/troff"
                  , ".me"    : "text/troff"
                  , ".mid"   : "audio/midi"
                  , ".midi"  : "audio/midi"
                  , ".mime"  : "message/rfc822"
                  , ".mml"   : "application/mathml+xml"
                  , ".mng"   : "video/x-mng"
                  , ".mov"   : "video/quicktime"
                  , ".mp3"   : "audio/mpeg"
                  , ".mp4"   : "video/mp4"
                  , ".mp4v"  : "video/mp4"
                  , ".mpeg"  : "video/mpeg"
                  , ".mpg"   : "video/mpeg"
                  , ".ms"    : "text/troff"
                  , ".msi"   : "application/x-msdownload"
                  , ".odp"   : "application/vnd.oasis.opendocument.presentation"
                  , ".ods"   : "application/vnd.oasis.opendocument.spreadsheet"
                  , ".odt"   : "application/vnd.oasis.opendocument.text"
                  , ".ogg"   : "application/ogg"
                  , ".p"     : "text/x-pascal"
                  , ".pas"   : "text/x-pascal"
                  , ".pbm"   : "image/x-portable-bitmap"
                  , ".pdf"   : "application/pdf"
                  , ".pem"   : "application/x-x509-ca-cert"
                  , ".pgm"   : "image/x-portable-graymap"
                  , ".pgp"   : "application/pgp-encrypted"
                  , ".pkg"   : "application/octet-stream"
                  , ".pl"    : "text/x-script.perl"
                  , ".pm"    : "text/x-script.perl-module"
                  , ".png"   : "image/png"
                  , ".pnm"   : "image/x-portable-anymap"
                  , ".ppm"   : "image/x-portable-pixmap"
                  , ".pps"   : "application/vnd.ms-powerpoint"
                  , ".ppt"   : "application/vnd.ms-powerpoint"
                  , ".ps"    : "application/postscript"
                  , ".psd"   : "image/vnd.adobe.photoshop"
                  , ".py"    : "text/x-script.python"
                  , ".qt"    : "video/quicktime"
                  , ".ra"    : "audio/x-pn-realaudio"
                  , ".rake"  : "text/x-script.ruby"
                  , ".ram"   : "audio/x-pn-realaudio"
                  , ".rar"   : "application/x-rar-compressed"
                  , ".rb"    : "text/x-script.ruby"
                  , ".rdf"   : "application/rdf+xml"
                  , ".roff"  : "text/troff"
                  , ".rpm"   : "application/x-redhat-package-manager"
                  , ".rss"   : "application/rss+xml"
                  , ".rtf"   : "application/rtf"
                  , ".ru"    : "text/x-script.ruby"
                  , ".s"     : "text/x-asm"
                  , ".sgm"   : "text/sgml"
                  , ".sgml"  : "text/sgml"
                  , ".sh"    : "application/x-sh"
                  , ".sig"   : "application/pgp-signature"
                  , ".snd"   : "audio/basic"
                  , ".so"    : "application/octet-stream"
                  , ".svg"   : "image/svg+xml"
                  , ".svgz"  : "image/svg+xml"
                  , ".swf"   : "application/x-shockwave-flash"
                  , ".t"     : "text/troff"
                  , ".tar"   : "application/x-tar"
                  , ".tbz"   : "application/x-bzip-compressed-tar"
                  , ".tcl"   : "application/x-tcl"
                  , ".tex"   : "application/x-tex"
                  , ".texi"  : "application/x-texinfo"
                  , ".texinfo" : "application/x-texinfo"
                  , ".text"  : "text/plain"
                  , ".tif"   : "image/tiff"
                  , ".tiff"  : "image/tiff"
                  , ".torrent" : "application/x-bittorrent"
                  , ".tr"    : "text/troff"
                  , ".txt"   : "text/plain"
                  , ".vcf"   : "text/x-vcard"
                  , ".vcs"   : "text/x-vcalendar"
                  , ".vrml"  : "model/vrml"
                  , ".war"   : "application/java-archive"
                  , ".wav"   : "audio/x-wav"
                  , ".wma"   : "audio/x-ms-wma"
                  , ".wmv"   : "video/x-ms-wmv"
                  , ".wmx"   : "video/x-ms-wmx"
                  , ".wrl"   : "model/vrml"
                  , ".wsdl"  : "application/wsdl+xml"
                  , ".xbm"   : "image/x-xbitmap"
                  , ".xhtml"   : "application/xhtml+xml"
                  , ".xls"   : "application/vnd.ms-excel"
                  , ".xml"   : "application/xml"
                  , ".xpm"   : "image/x-xpixmap"
                  , ".xsl"   : "application/xml"
                  , ".xslt"  : "application/xslt+xml"
                  , ".yaml"  : "text/yaml"
                  , ".yml"   : "text/yaml"
                  , ".zip"   : "application/zip"
                }
    };


    function defaultHandler(request, response) {
        var urlInfo = url.parse(request.url, true);
        var pathname = urlInfo.pathname;
        var queryParams = urlInfo.query;

        switch (urlInfo.pathname) {
        case '/ajax/send':
            var event = {
                name: queryParams.en, // use short query params so URL remains short
                data: queryParams.dt  
            };
            jsonResponse(response, {success:true});
            EventEngine.fire(event);
            break;
        case '/ajax/recv':
            // check nonce to prevent a client from pretending to be another client
            var clientId = queryParams.id;
            var nonce = queryParams.nc;
            var client = clientsById[clientId];
            //if (client.nonce == nonce) { // TODO: uncomment once we want to test security
            client.response = response;
            //}
            break;
        case '/ajax/join':
            util.puts('joining');
            break;
        default:
            textResponse(response, 'Invalid command');
        }
    }




    var server = http.createServer(function(request, response) {
        var urlInfo = url.parse(request.url, true);
        var pathname = urlInfo.pathname;
        var queryParams = urlInfo.query;

        util.puts(pathname);
        var filename = '.' + pathname;
        util.puts(filename);
        fs.stat(filename, function(err, stats) {
            util.puts('asfd');
            util.puts(stats);
            if (stats) {
                staticHandler(filename)(request, response);
            } else {
                defaultHandler(request, response);
            }
        });
    });


    // Public Properties and Methods
    this.close = function(errno) { server.close(errno); };
    this.listen = function(port, hostname, callback) { server.listen(port, hostname, callback) };

    // Constructor
    EventEngine.observe('serverEvent', onServerEvent);
};