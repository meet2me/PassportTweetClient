module.exports = {
  encodeData : function(toEncode){
    // do something ...
    if( toEncode == null || toEncode == "" ) return ""
    else {
    var result= encodeURIComponent(toEncode);
    // Fix the mismatch between OAuth's  RFC3986's and Javascript's beliefs in what is right and wrong ;)
    return result.replace(/\!/g, "%21")
                 .replace(/\'/g, "%27")
                 .replace(/\(/g, "%28")
                 .replace(/\)/g, "%29")
                 .replace(/\*/g, "%2A");
    }    

    },
  generateNonce : function(){
    // do something ...
    var chars = '0123456789abcdef';
    var result = '';
    for (var i = 32; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
  }
};