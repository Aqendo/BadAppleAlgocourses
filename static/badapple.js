const GREEN = '<td class="aboba ok" rowspan="1" colspan="1">+1</td>'
const RED = '<td class="aboba bad" rowspan="1" colspan="1" title="-1">-1</td>'
const WIDE_RED = '<td class="aboba" rowspan="1" colspan="1" style="background-color: lightcoral;">1.25</td>'
const WIDE_GREEN = '<td class="aboba" rowspan="1" colspan="1" style="background-color: lightgreen;">8.00</td>'
const GRAY = '<td class="aboba gray" rowspan="1" colspan="1"></td>';
const WIDTH = 152;
const wide_indicies = [16, 25, 33, 43, 52, 60, 69, 80, 89, 100, 111, 127, 143, 157]
let arrTrs
let trs
let tbody
function doGrey() {
  console.log(frames.length)
  try{
    let trs = tbody.querySelectorAll("tr")
    for (let index_tr in trs) {
      if (index_tr <= 1) continue
      let tds = trs[index_tr].querySelectorAll("td")
      for (let td_index in tds) {
        if (td_index <= 5) continue
        tds[td_index].outerHTML = GRAY;
      }
    }
  } catch (e) {

  }
  
}
function fill(frame) {
  try {
    let trs = tbody.querySelectorAll("tr")
    for (let index_tr in trs) {
      if (index_tr <= 1) continue
      let true_tr_index = index_tr - 2;
      let tds = trs[index_tr].querySelectorAll("td")
      for (let td_index in tds) {
        if (td_index <= 5) continue
        let true_td_index = td_index - 6;
        if (true_tr_index * WIDTH + true_td_index >= frame.length) return
        if (wide_indicies.includes(parseInt(td_index, 10))) {
          tds[td_index].outerHTML = (frame[true_tr_index * WIDTH + true_td_index] == '0' ? WIDE_RED : WIDE_GREEN);  
        } else {
          tds[td_index].outerHTML = (frame[true_tr_index * WIDTH + true_td_index] == '0' ? RED : GREEN);
        }
      }
    }
  } catch (e) {
  } 
}

async function doWork() {
  doGrey()
  console.log(frames.length)
  for (let frame of frames) {
    console.log(frame.length)
    fill(frame)
    await new Promise(r => setTimeout(r, 600));
  }
}
window.onload = function() {
  tbody = document.querySelector("tbody")
}