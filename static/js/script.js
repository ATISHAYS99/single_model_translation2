let transcriptionInProgress = false;

let outputDisplayed = false;
// Function to handle file selection
async function handleFileSelect(event) {
    event.preventDefault();

    if (transcriptionInProgress) {
        alert("Transcription is in progress. Please wait until it completes.");
        return;
    }

    if (outputDisplayed) {
        alert("This action is not allowed");
        return;
    }

    const fileInput = document.getElementById('audioFileInput');
    const files = event.target.files || event.dataTransfer.files;
    const file = files[0];
    fileInput.files = files;

    if (!file) {
        alert('Please select an audio file.');
        return;
    }

    const allowedExtensions = ['wav', 'mp3', 'm4a', 'flac', 'ogg', 'aac'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const validExtension = allowedExtensions.includes(fileExtension);
    const validMimeType = file.type.startsWith('audio/');
   
    if (!validExtension || !validMimeType) {
        alert('Invalid file type. Please upload a valid audio file.');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB. Please select a smaller audio file.');
        fileInput.value = ''; // Clear input value
        return;
    }

    // Create an audio element to check the duration
    const audioElement = document.createElement('audio');
    audioElement.src = URL.createObjectURL(file);

    // Wait for the metadata to load to get the duration
    audioElement.onloadedmetadata = function() {
        if (audioElement.duration <= 0) {
            alert('Invalid audio file. The duration is 0 seconds.');
            return;
        }

        // Remove any existing audio element
        const existingAudio = document.querySelector('audio');
        if (existingAudio) {
            existingAudio.remove();
        }

        // Append the new audio element
        audioElement.controls = true;
        const audioContainer = document.querySelector('.text-container-main');
        audioContainer.appendChild(audioElement);

        const formData = new FormData();
        formData.append('audio', file);

        const transcribeBtn = document.getElementById('transcribeBtn');
        const fileUploadSection = document.getElementById('fileUploadSection');
        const fileInfoSection = document.getElementById('fileInfoSection');
        const anotheraudio = document.getElementById('anotheraudio');

        fileUploadSection.style.display = 'none';
        fileInfoSection.style.display = 'block';

        document.getElementById('audioFileName').textContent = file.name;
        document.getElementById('audioFileSize').textContent = (file.size / 1024).toFixed(2) + ' KB';

        transcribeBtn.style.display = 'block';
        anotheraudio.style.display = 'block';
    };

    audioElement.onerror = function() {
        alert('Invalid audio file.');
        alert(this.error)
        alert(audioElement.duration)
        fileInput.value = ''; // Clear input value
    };
}

async function transcribe() {
    
    var formData = new FormData();

    if (transcriptionInProgress) {
        console.log("Transcription process already in progress. Cannot start another.");
        return;
    }

    console.log("Transcription process started.");
    transcriptionInProgress = true;
    try {
        const fileInput = document.getElementById('audioFileInput');
        const file = fileInput.files[0];
        if (!file) {
            alert('Please select an audio file.');
            transcriptionInProgress = false;
            return;
        }

        formData.append('audio', file);

        const loader = document.getElementById('loader');
        const transcribeBtn = document.getElementById('transcribeBtn');
        const fileInfoSection = document.getElementById('fileInfoSection');
        const transcriptionOutput = document.getElementById('transcriptionOutput');
        const downloadBtn = document.getElementById('downloadBtn');
        const anotheraudio = document.getElementById('anotheraudio');
        const cancel = document.getElementById('cancel');
        const tryanother = document.getElementById('tryanother');
        const fileUploadSection = document.getElementById('fileUploadSection');

        transcribeBtn.style.display = 'none';
        anotheraudio.style.display = 'none';
        
        loader.style.display = 'block';
        cancel.style.display = 'block';

        try {
            const response = await fetch('http://localhost:5000/transcribe', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            transcribeBtn.textContent = 'Transcribe';
            transcribeBtn.disabled = false;

            if (data.transcription) {
                transcriptionOutput.textContent = data.transcription;
                cancel.style.display = 'none';
                downloadBtn.style.display = 'block';
                tryanother.style.display = 'block';
                loader.style.display = 'none';
                fileInfoSection.style.display = 'none';
                outputDisplayed = true;

            } else {
                transcriptionOutput.textContent = "Transcription not available.";
            }

            transcriptionInProgress = false; // Transcription process completed
        } catch (error) {
            console.error('Error:', error);
            transcribeBtn.textContent = 'Transcribe';
            transcribeBtn.disabled = false;
            transcriptionInProgress = false; // Transcription process ended with error
            window.location.href = '/error.html';
        }
    } catch (error) {
        console.error('Error:', error);
        transcriptionInProgress = false; // Transcription process ended with error
        window.location.href = '/error.html';
    }
}

function downloadTranscription() {
    const transcriptionOutput = document.getElementById('transcriptionOutput').textContent;

    const blob = new Blob([transcriptionOutput], { type: 'text/plain' });

    const downloadLink = document.createElement('a');
    downloadLink.download = 'transcription.txt';
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.click();
}

document.addEventListener('dragover', function(event) {
    event.preventDefault();
});

document.addEventListener('drop', function(event) {
    event.preventDefault();
    handleFileSelect(event);
});

const fileInput = document.getElementById('audioFileInput');
fileInput.addEventListener('change', handleFileSelect);

function reloadPage() {
    transcriptionInProgress = false; // Cancel transcription process if ongoing
    location.reload();
}



let container1 = document.getElementById('Square');

    window.onmousemove = function (e) {
        let x = -e.x / 90,
            y = -e.y / 90;

        container1.style.right = x + 'px';
        container1.style.bottom = y + 'px';
    }
    /* Mobile gyroscope */
    window.addEventListener("deviceorientation", function (e) {
        container1.style.right = e.gamma/3 + "px"
        container1.style.bottom = e.beta/3 + "px"
    })