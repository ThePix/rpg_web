const level = parseInt($('#level').val())
const maxPoints = parseInt($('#maxPoints').val())
const inputs = $('input')
const inputArray = []

for (let inp of inputs) {
  if (inp.id.startsWith('package_')) {
    inputArray.push(inp.id)
    inp.addEventListener('change', packageCountUpdate);
  }
}


function packageCountUpdate(event) {
  // are we at max points?
  let points = 0
  let disabledGroups = []
  for (let s of inputArray) {
    const inp = $('#' + s)[0]
    const n = parseInt(inp.value)
    if (n > level) n = inp.value = level
    if (inp.dataset.group && n > 0) {
      disabledGroups.push(inp.dataset.group)
      $('#' + s).prop('disabled', false);
    }
    else {
      $('#' + s).prop('disabled', inp.dataset.group && disabledGroups.includes(inp.dataset.group));
    }
    points += n
  }
  $('#points').html(points + '/' + maxPoints)
  if (points > maxPoints) {
    $('#points').css("background-color", "red");
  }
  else if (points < maxPoints) {
    $('#points').css("background-color", "yellow");
  }
  else {
    $('#points').css("background-color", "lime");
  }
  
}


packageCountUpdate();