module.exports = {
  encodeData : function(toEncode){
    if( toEncode === null || toEncode === '' ) {
      // console.log("Null");
      return;
    }

    else {
      var result= encodeURIComponent(toEncode);
      return result.replace(/\!/g, '%21')
                   .replace(/\'/g, '%27')
                   .replace(/\(/g, '%28')
                   .replace(/\)/g, '%29')
                   .replace(/\*/g, '%2A');
    }
  },
  generateNonce : function(){
    // do something ...
    var chars = '0123456789abcdef';
    var result = '';
    for (var i = 32; i > 0; i=i-1) {
      result += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    return result;
  }
};