<meta http-equiv="Content-type" content="text/html; charset=utf-8" />
<?php 
$key = 'bb50e25806abece0d6ce4518cfb3d03c';

function string_encrypt($string, $key) {
    $crypted_text = mcrypt_encrypt(MCRYPT_RIJNDAEL_256, $key, $string, MCRYPT_MODE_ECB);
    return base64_encode($crypted_text);
}

/*function string_decrypt($encrypted_string, $key) {
    return mcrypt_decrypt(MCRYPT_RIJNDAEL_256, $key, base64_decode('6bABe16eD8Y28tQ30R6EmDbW9H3qrMxrBC4qEc6JAvw='), MCRYPT_MODE_ECB);
}*/
function string_decrypt($text, $key){
   $iv_size = mcrypt_get_iv_size(MCRYPT_RIJNDAEL_256, MCRYPT_MODE_ECB);
   $iv = mcrypt_create_iv($iv_size, MCRYPT_RAND);
   return trim(mcrypt_decrypt(MCRYPT_RIJNDAEL_256, $key, base64_decode($text), MCRYPT_MODE_ECB, $iv));
 }
echo 'Provided Text:    <br />' . $test_str =  'lófasz ez';                           
echo '<br />';echo '<br />';

echo 'Encrypted Value:  <br />' . $enc_str = string_encrypt($test_str, $key);
echo '<br />';echo '<br />';

echo 'Decrypted Value:  <br />' . string_decrypt($enc_str, $key);
echo '<br />';echo '<br />';
?>
<script src='stringcoders.base64.js'></script>
<script src='rijndael.js'></script>
<script src='mcrypt.js'></script>

<script lang='javascript'  charset="utf-8">
    var is_IE = /*@cc_on!@*/false;
    var message = '';

    var str = '<?php echo $test_str ?>';
    (is_IE) ? (message+= 'Provided Text:' + str) : console.log('Provided Text: \n' + str);
    str = unescape(encodeURIComponent(str));

    /* 
        I added this. Converted to ISO Latin before encryting and vice versa on decryption.
        Though don't know how this made work.
    */  
   // var enc_str = mcrypt.Encrypt(str, '');
	enc_str = mcrypt.Encrypt(str, 'bb50e25806abece0d6ce4518cfb3d03c', 'bb50e25806abece0d6ce4518cfb3d03c', 'rijndael-256', 'ecb');
    enc_str = btoa(enc_str);
    (is_IE) ? (message+= 'Encrypted Value:' + enc_str) : console.log('\nEncyrpted Value:\n' + enc_str);

    var dec_str = base64.decode(enc_str);
    dec_str = mcrypt.Decrypt(dec_str, '').replace(/\x00+$/g, '');
    dec_str = decodeURIComponent(escape(dec_str));
    (is_IE) ? (message+= 'Decrypted Value:' + dec_str) : console.log('\nDecrypted Value:\n' + dec_str); 

    (is_IE) ? alert(message) : '';
</script>