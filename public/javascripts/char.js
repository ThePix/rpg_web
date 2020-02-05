const refresh = parseInt($('#refresh').val())
const maxMessages = parseInt($('#maxMessages').val())
const chr = $('#sender').val()


$('#content').keypress(function(event){
  const keycode = (event.keyCode ? event.keyCode : event.which);
  if(keycode == '13'){
    sendMessage()
  }
});



const sendMessage = function() {
  if ($('#content').val() === '') return
  
  const xhr = new XMLHttpRequest();
  const url = "url";
  xhr.open("POST", '/message', true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onreadystatechange = function () { 
    if (xhr.readyState == 4 && xhr.status == 200) {
      console.log(xhr.responseText)
      const json = JSON.parse(xhr.responseText)
      console.log(json)
    }
  }
  const data = JSON.stringify({sender:chr, recipient:$('#recipient').val(), content:$('#content').val().trim(),});
  console.log(data)
  xhr.send(data);
  $('#content').val('')
  $('#recipient').val('GM')
}


const updatePage = function() {
  const httpRequest = new XMLHttpRequest();
  if (!httpRequest) {
    alert('Giving up :( Cannot create an XMLHTTP instance');
    return false;
  }
  httpRequest.onreadystatechange = function (){
    if (this.readyState == 4 && this.status == 200) {
      const data = JSON.parse(this.responseText);
      console.log(data);
      for (let key in data.char) {
        $('#' + key).html(data.char[key])
      }
      for (let i = 0; i < maxMessages; i++) {
        if (data.messages[i]) {
          $('#msg' + i).html('<b>' + data.messages[i].title + ':</b> ' + data.messages[i].content)
          $('#msg' + i).css('background-color', data.messages[i].type === 'sent' ? '#ccf' : '#afa')
        }
      }
    }
  };
  httpRequest.open('GET', 'chars.json?name=' + chr);
  httpRequest.send();

}



updatePage()


setInterval(updatePage, refresh * 1000)