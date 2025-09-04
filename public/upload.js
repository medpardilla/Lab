document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput');
  const browseLink = document.getElementById('browse-link');
  const message = document.getElementById('message');
  const dropzone = document.getElementById('dropzone');
  const uploadList = document.getElementById('uploadList');
  const form = document.getElementById('uploadForm');

  let filesToUpload = [];

  // Trigger file input when "Browse" is clicked
  browseLink.addEventListener('click', (e) => {
    e.preventDefault();
    fileInput.click();
  });

  // Add files when input changes
  fileInput.addEventListener('change', () => {
    addFiles(fileInput.files);
    fileInput.value = ''; // Clear the input so it can be used again with the same files
  });

  // Drag and drop functionality
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  });

  // Function to add files to the list and ensure no duplicates
  function addFiles(files) {
    for (const file of files) {
      // Prevent duplicates by name and size
      if (!filesToUpload.some(f => f.name === file.name && f.size === file.size)) {
        filesToUpload.push(file);
      }
    }
    renderFileList();
  }

  // Render the file list with progress bars
  function renderFileList() {
    uploadList.innerHTML = '';
    filesToUpload.forEach((file, index) => {
      const fileRow = document.createElement('div');
      fileRow.className = 'file-row';
      fileRow.innerHTML = `
        <span class="file-name" title="${file.name}">${file.name}</span>
        <progress value="0" max="100"></progress>
        <button class="remove-btn" title="Remove">&times;</button>
      `;

      // Remove button functionality
      fileRow.querySelector('.remove-btn').addEventListener('click', () => {
        filesToUpload.splice(index, 1);
        renderFileList();
      });

      uploadList.appendChild(fileRow);
    });
  }

  // Submit the form and handle the file upload
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (filesToUpload.length === 0) {
      setMessage('Please select at least one file.', 'error');
      return;
    }

    setMessage('', '');
    form.querySelector('button[type="submit"]').disabled = true;

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const fileRow = uploadList.children[i];
        const progressBar = fileRow.querySelector('progress');

        const formData = new FormData();
        formData.append('file', file);

        await uploadFile(formData, progressBar);
      }

      setMessage('All files uploaded successfully!', 'success');
      filesToUpload = [];
      renderFileList();
      form.reset();
    } catch (err) {
      setMessage('Error uploading files.', 'error');
    } finally {
      form.querySelector('button[type="submit"]').disabled = false;
    }
  });

  // Handle the actual file upload with progress tracking
  function uploadFile(formData, progressBar) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/upload'); // Ensure your server endpoint is correct

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = (e.loaded / e.total) * 100;
          progressBar.value = percent;
        }
      });

      xhr.onload = () => {
        if (xhr.status === 200) {
          progressBar.value = 100;
          resolve();
        } else {
          reject(new Error('Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));

      xhr.send(formData);
    });
  }

  // Set the status message (error/success)
  function setMessage(text, type) {
    message.textContent = text;
    message.className = type ? `message ${type}` : 'message';
  }
});
