const refresh = parseInt(document.querySelector('#refresh')?.value)
const maxMessages = parseInt(document.querySelector('#maxMessages')?.value)
const chr = document.querySelector('#sender').value


document.querySelector('#content').addEventListener('keydown', function(event){
  const keycode = (event.keyCode ? event.keyCode : event.which);
  if(keycode == '13'){
    sendMessage()
  }
})



const sendMessage = function() {
  if (document.querySelector('#content').value === '') return
  
  const xhr = new XMLHttpRequest();
  const url = "url";
  xhr.open("POST", '/chars/message', true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onreadystatechange = function () { 
    if (xhr.readyState == 4 && xhr.status == 200) {
      console.log(xhr.responseText)
      const json = JSON.parse(xhr.responseText)
      console.log(json)
    }
  }
  const data = JSON.stringify({sender:chr, recipient:document.querySelector('#recipient').value, content:document.querySelector('#content').value.trim(),});
  console.log(data)
  xhr.send(data)
  document.querySelector('#content').value = ''
  document.querySelector('#recipient').value = 'GM'
}


const msgColours = {
  sent: '#ccf',
  received: '#afa',
  alert: '#ff8',
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
      //console.log(data);
      if (data.char) {
        for (let key in data.char) {
          document.querySelector('#' + key).innerHTML = data.char[key]
        }
      }
      //console.log("here" + data.messages.length);
      for (let i = 0; i < maxMessages; i++) {
        if (data.messages[i]) {
      console.log('#msg' + i);
          document.querySelector('#msg' + i).innerHTML = '<b>' + data.messages[i].title + ':</b> ' + data.messages[i].content
          document.querySelector('#msg' + i).style.backgroundColor = msgColours[data.messages[i].type]
        }
      }
    }
  };
  httpRequest.open('GET', '/chars/' + chr + '.json');
  httpRequest.send();

}



updatePage()

console.log("About to setInterval")
setInterval(updatePage, refresh * 1000)