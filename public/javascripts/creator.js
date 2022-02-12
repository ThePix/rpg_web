const level = parseInt(document.querySelector('#level').value)
const maxPoints = parseInt(document.querySelector('#maxPoints').value)
const inputs = document.querySelector('input')
const inputArray = []
// recently converted from JQuery, not properly checked !!!
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
    const inp = document.querySelector('#' + s)[0]
    let n = parseInt(inp.value)
    if (n > level) n = inp.value = level
    if (n < 0) n = inp.value = 0
    if (inp.dataset.group && n > 0) {
      disabledGroups.push(inp.dataset.group)
      document.querySelector('#' + s).setAttribute('disabled', false);
    }
    else {
      document.querySelector('#' + s).setAttribute('disabled', inp.dataset.group && disabledGroups.includes(inp.dataset.group));
    }
    points += n
  }
  document.querySelector('#points').innerHTML = points + '/' + maxPoints
  if (points > maxPoints) {
    document.querySelector('#points').style.backgroundColor = "red"
  }
  else if (points < maxPoints) {
    document.querySelector('#points').style.backgroundColor = "yellow"
  }
  else {
    document.querySelector('#points').style.backgroundColor = "lime"
  }
  
}


packageCountUpdate();