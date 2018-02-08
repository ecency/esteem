#!/usr/bin/env node

// Add Platform Class
// v1.0
// Automatically adds the platform class to the body tag
// after the `prepare` command. By placing the platform CSS classes
// directly in the HTML built for the platform, it speeds up
// rendering the correct layout/style for the specific platform
// instead of waiting for the JS to figure out the correct classes.

// Tambahkan Kelas Platform
// v1.0
// Secara otomatis menambahkan kelas platform ke tag bodi
// setelah perintah `prepare`. Dengan menempatkan platform kelas CSS
// langsung di HTML yang dibangun untuk platform, itu mempercepat
// render tata letak / gaya yang benar untuk platform tertentu
// daripada menunggu JS untuk mengetahui kelas yang benar.

var fs = require('fs');
var path = require('path');

var rootdir = process.argv[2];

var fs = membutuhkan ('fs');
var path = require ('path');

var rootdir = process.argv [2];

function addPlatformBodyTag(indexPath, platform) {
  // add the platform class to the body tag
  try {
    var platformClass = 'platform-' + platform;
    var cordovaClass = 'platform-cordova platform-webview';
    
fungsi menambahkan Platform Body Tag (index Path, platform) {
   // tambahkan kelas platform ke tag bodi
   coba {
     platform var Class = 'platform-' + platform;
     var cordova Class = 'platform - platform cordova - tampilan web';

    var html = fs.readFileSync(indexPath, 'utf8');

    var bodyTag = findBodyTag(html);
    if(!bodyTag) return; // no opening body tag, something's wrong

    if(bodyTag.indexOf(platformClass) > -1) return; // already added

    var newBodyTag = bodyTag;
     
    var html = fs.readFileSync (indexPath, 'utf8');

     var bodyTag = findBodyTag (html);
     jika (! bodyTag) kembali; // tidak ada tag badan pembuka, ada yang salah

     jika (bodyTag.indexOf (platformClass)> -1) kembali; // Telah ditambahkan

     var baru Body Tag = bodyTag;

    var classAttr = findClassAttr(bodyTag);
    if(classAttr) {
      // body tag has existing class attribute, add the classname
      var endingQuote = classAttr.substring(classAttr.length-1);
      var newClassAttr = classAttr.substring(0, classAttr.length-1);
      newClassAttr += ' ' + platformClass + ' ' + cordovaClass + endingQuote;
      newBodyTag = bodyTag.replace(classAttr, newClassAttr);

    } else {
      // add class attribute to the body tag
      newBodyTag = bodyTag.replace('>', ' class="' + platformClass + ' ' + cordovaClass + '">');
      
    var classAttr = findClassAttr (bodyTag);
     jika (classAttr) {
       // tag tubuh memiliki atribut kelas yang ada, tambahkan nama kelasnya
       var endingQuote = classAttr.substring (classAttr.length-1);
       var newClassAttr = classAttr.substring (0, classAttr.length-1);
       newClassAttr + = '' + platformClass + '' + cordovaClass + endingQuote;
       newBodyTag = bodyTag.replace (classAttr, newClassAttr);

     } lain {
       // tambahkan atribut kelas ke tag bodi
       newBodyTag = bodyTag.replace ('>', 'class =' '+ platformClass +' '+ cordovaClass +' "> ');
    }

    html = html.replace(bodyTag, newBodyTag);

    fs.writeFileSync(indexPath, html, 'utf8');

    process.stdout.write('add to body class: ' + platformClass + '\n');
  } catch(e) {
    process.stdout.write(e);
    
    html = html.replace (bodyTag, newBodyTag);

     fs.writeFileSync (indexPath, html, 'utf8');

     process.stdout.write ('tambahkan ke kelas tubuh:' + platformClass + '\ n');
   } menangkap (e) {
     process.stdout.write (e);
  }
}

function findBodyTag(html) {
  // get the body tag
  try{
    return html.match(/<body(?=[\s>])(.*?)>/gi)[0];
  }catch(e){}
}

function findClassAttr(bodyTag) {
  // get the body tag's class attribute
  try{
    return bodyTag.match(/ class=["|'](.*?)["|']/gi)[0];
  }catch(e){}
  
  fungsi findBodyTag (html) {
   // ambil tag body
   mencoba{
     return html.match (/ <body (? = [\ s>]) (. *?)> / gi) [0];
   } catch (e) {}
}

fungsi findClassAttr (bodyTag) {
   // dapatkan atribut kelas tag body
   mencoba{
     kembali bodyTag.match (/ class = ["| '] (. *?) [" |'] / gi) [0];
   } catch (e) {}
  
}

if (rootdir) {

  // go through each of the platform directories that have been prepared
  var platforms = (process.env.CORDOVA_PLATFORMS ? process.env.CORDOVA_PLATFORMS.split(',') : []);

  for(var x=0; x<platforms.length; x++) {
    // open up the index.html file at the www root
    try {
      var platform = platforms[x].trim().toLowerCase();
      var indexPath;

      if(platform == 'android') {
        indexPath = path.join('platforms', platform, 'assets', 'www', 'index.html');
      } else {
        indexPath = path.join('platforms', platform, 'www', 'index.html');
      }

      if(fs.existsSync(indexPath)) {
        addPlatformBodyTag(indexPath, platform);
      }

    } catch(e) {
      process.stdout.write(e);
    }
    
    jika (rootdir) {

   // pergi melalui masing-masing direktori platform yang telah disiapkan
   platform var = (process.env.CORDOVA_PLATFORMS? process.env.CORDOVA_PLATFORMS.split (','): []);

   untuk (var x = 0; x <platforms.length; x ++) {
     // buka file index.html di root www
     coba {
       platform var = platform [x] .trim () toLowerCase ();
       var indexPath;

       jika (platform == 'android') {
         indexPath = path.join ('platform', platform, 'aset', 'www', 'index.html');
       } lain {
         indexPath = path.join ('platform', platform, 'www', 'index.html');
       }

       jika (fs.existsSync (indexPath)) {
         addPlatformBodyTag (indexPath, platform);
       }

     } menangkap (e) {
       process.stdout.write (e);
     }
     
  }
