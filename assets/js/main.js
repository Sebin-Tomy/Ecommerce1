!(function (e) {
  "use strict";
  if (
    (e(".menu-item.has-submenu .menu-link").on("click", function (s) {
      s.preventDefault(),
        e(this).next(".submenu").is(":hidden") &&
          e(this)
            .parent(".has-submenu")
            .siblings()
            .find(".submenu")
            .slideUp(200),
        e(this).next(".submenu").slideToggle(200);
    }),
    e("[data-trigger]").on("click", function (s) {
      s.preventDefault(), s.stopPropagation();
      var n = e(this).attr("data-trigger");
      e(n).toggleClass("show"),
        e("body").toggleClass("offcanvas-active"),
        e(".screen-overlay").toggleClass("show");
    }),
    e(".screen-overlay, .btn-close").click(function (s) {
      e(".screen-overlay").removeClass("show"),
        e(".mobile-offcanvas, .show").removeClass("show"),
        e("body").removeClass("offcanvas-active");
    }),
    e(".btn-aside-minimize").on("click", function () {
      window.innerWidth < 768
        ? (e("body").removeClass("aside-mini"),
          e(".screen-overlay").removeClass("show"),
          e(".navbar-aside").removeClass("show"),
          e("body").removeClass("offcanvas-active"))
        : e("body").toggleClass("aside-mini");
    }),
    e(".select-nice").length && e(".select-nice").select2(),
    e("#offcanvas_aside").length)
  ) {
    const e = document.querySelector("#offcanvas_aside");
    new PerfectScrollbar(e);
  }
  e(".darkmode").on("click", function () {
    e("body").toggleClass("dark");
  });
})(jQuery);

if (window.location.pathname == "/admin/add-products") {
  const form = document.getElementById("addproduct")
    let totalimages = 0;
  
    function imageupload(event) {
  
      const files = event.target.files;
      const imagecontainer = document.getElementById("imageContainer");
      const maximum = 5;
  
      const totalupload = totalimages + files.length;
      if (totalupload > maximum) {
          Swal.fire(`Oops! Upload only ${maximum} files.`, "Sorry");
          event.target.value = "";
          return;
      }
  
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        if (!file.type.startsWith("image/")) {
          console.log("File is not an image.", file.type);
          continue;
        }
  
        const imgdiv = document.createElement("div");
        imgdiv.classList.add("image-div");
  
        const img = document.createElement("img");
        img.style.height = "300px";
        img.style.width = "300px";
        img.setAttribute("name", 'image');
        img.classList.add("uploaded-image");
  
        const deletebutton = document.createElement("button");
        deletebutton.textContent = "Delete";
        deletebutton.classList.add("btn", "btn-danger", "m-2");
  
        deletebutton.addEventListener("click", function () {
          totalimages--;
          imgdiv.remove();
        });
  
        reader.onload = function (event) {
          img.src = event.target.result;
  
          const cropperdiv = document.createElement("div");
          cropperdiv.classList.add("cropper-container");
          cropperdiv.appendChild(img);
  
          imgdiv.appendChild(cropperdiv);
          const cropper = new Cropper(img, {
            dragMode: "move",
            aspectRatio: 1,
            autoCropArea: 0.8,
            restore: false,
            guides: false,
            center: false,
            responsive:true,
            highlight: false,
            cropBoxMovable: false,
            cropBoxResizable: false,
            toggleDragModeOnDblclick: false,
          });
  
          const cropbtn = document.createElement("button");
          cropbtn.classList.add("btn", "btn-primary", "m-2");
          cropbtn.textContent = "Crop";
          cropbtn.addEventListener("click", function (event) {
            event.preventDefault();
            const croppedCanvas = cropper.getCroppedCanvas();
  
            img.src = croppedCanvas.toDataURL()
  
            croppedCanvas.toBlob((blob) => {
              const fileName = Date.now();
              const file = new File([blob], `${fileName}.jpg`, { type: 'image/jpeg' });
  
              if (window.FileList && window.DataTransfer) {
                  const dataTransfer = new DataTransfer();
                  dataTransfer.items.add(file);
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.name = `image${i}`;
                  input.files = dataTransfer.files;
                 form.appendChild(input)
                 input.style.display = 'none'
                 } else {
                  console.error('FileList and DataTransfer are not supported in this browser.');
              }
          })
            cropper.destroy();
            cropbtn.remove();
      
  
          });
        
          imgdiv.appendChild(cropbtn);
          imgdiv.appendChild(deletebutton);
        };
  
        reader.readAsDataURL(file);
  
        imagecontainer.appendChild(imgdiv);
      }
      totalimages = totalupload;
    }
    const imageInput = document.getElementById("imageinput");
  imageInput.addEventListener("change", imageupload);
  
  }
//   if (window.location.pathname.includes("/admin/edit-product")) {
//     const form = document.getElementById("editproduct");
//     const count = document.getElementById('productImageCount').value
//     let totalImages = Number(count);

//     function deleteImage(params){
//       console.log(params);
//       document.getElementById(`imgDiv${params}`).remove()
//       totalImages--
// console.log(totalImages);

//     }
// console.log(totalImages);
    
//     function imageUpload(event) {
//       const files = event.target.files;
//       const imageContainer = document.getElementById("imageContainer");
//       imageContainer.innerHTML = ''; 
//       const maximum = 5;

//       const totalUpload = totalImages + files.length;
//       if (totalUpload > maximum) {
//           Swal.fire(`Oops! Upload only ${maximum} files.`, "Sorry");
//           event.target.value = "";
//           return;
//       }

//       for (let i = 0; i < files.length; i++) {
//           const file = files[i];
//           const reader = new FileReader();
//           if (!file.type.startsWith("image/")) {
//               console.log("File is not an image.", file.type);
//               continue;
//           }
//           const imgDiv = document.createElement("div");
//           imgDiv.classList.add("image-div");
//           const img = document.createElement("img");
//           img.style.height = "300px";
//           img.style.width = "300px";
//           img.setAttribute("name", 'image');
//           img.classList.add("uploaded-image");
//           const deleteButton = document.createElement("button");
//           deleteButton.textContent = "Delete";
//           deleteButton.classList.add("btn", "btn-danger", "m-2");
//           deleteButton.addEventListener("click", function () {
//               totalImages--;
//               imgDiv.remove();
//           });
//            reader.onload = function (event) {
//               img.src = event.target.result;

//               const cropperDiv = document.createElement("div");
//               cropperDiv.classList.add("cropper-container");
//               cropperDiv.appendChild(img);

//               imgDiv.appendChild(cropperDiv);
//               const cropper = new Cropper(img, {
//                   dragMode: "move",
//                   aspectRatio: 1,
//                   autoCropArea: 0.8,
//                   restore: false,
//                   guides: false,
//                   center: false,
//                   responsive: true,
//                   highlight: false,
//                   cropBoxMovable: false,
//                   cropBoxResizable: false,
//                   toggleDragModeOnDblclick: false,
//               });

//               const cropBtn = document.createElement("button");
//               cropBtn.classList.add("btn", "btn-primary", "m-2");
//               cropBtn.textContent = "Crop";
//               cropBtn.addEventListener("click", function (event) {
//                   event.preventDefault();
//                   const croppedCanvas = cropper.getCroppedCanvas();

//                   img.src = croppedCanvas.toDataURL();
//                   croppedCanvas.toBlob((blob) => {
//                     const fileName = Date.now();
//                     const file = new File([blob], `${fileName}.jpg`, { type: 'image/jpeg' });
        
//                     if (window.FileList && window.DataTransfer) {
//                         const dataTransfer = new DataTransfer();
//                         dataTransfer.items.add(file);
//                         const input = document.createElement('input');
//                         input.type = 'file';
//                         input.name = `image${i}`;
//                         input.files = dataTransfer.files;
//                        form.appendChild(input)
//                        input.style.display = 'none'
//                        } else {
//                         console.error('FileList and DataTransfer are not supported in this browser.');
//                     }
//                 })
//                   cropper.destroy();
//                   cropBtn.remove();
//               });

//               imgDiv.appendChild(cropBtn);
//               imgDiv.appendChild(deleteButton);
//           };

//           reader.readAsDataURL(file);

//           imageContainer.appendChild(imgDiv);
//       }
//       totalImages = totalUpload;
//   }
// const imageInput = document.getElementById("imageinput");
// imageInput.addEventListener("change", imageUpload);
// }
if (window.location.pathname.includes("/admin/edit-product"))  {
  const form = document.getElementById("editproduct")

  for (let i = 0; i < 5; i++) {
    const button = document.getElementById(`button${i}`);
    const input = document.getElementById(`input${i}`);
    const image = document.getElementById(`image${i}`);
    const oldimage = document.getElementById(`oldimage${i}`)
  
    const deletebtn = document.getElementById(`deletebutton${i}`);
  if(deletebtn){
    deletebtn.addEventListener("click", () => {
      image.src = "";
      image.style.display = "none";
      deletebtn.style.display = "none";
      button.textContent = "Add";
      oldimage.disabled = true
    });}
    if(button){
    button.addEventListener("click", function () {
      
      input.click();
    });
    input.dataset.index = i;
    input.addEventListener("change", uploaded);
  }}


  function uploaded(event) {
    const file = event.target.files[0];
    const button = document.getElementById(`button${event.target.dataset.index}`);
    const oldimage = document.getElementById(`oldimage${event.target.dataset.index}`)
    const image = document.getElementById(`image${event.target.dataset.index}`);
    const imgdiv = document.getElementById(`imgdiv${event.target.dataset.index}`);
    const deletebtn = document.getElementById(`deletebutton${event.target.dataset.index}`);

    if(oldimage){
    oldimage.disabled = true
    }

    image.style.display = "flex";
    button.textContent = "Change";
    deletebtn.style.display = "flex";
    const reader = new FileReader();

      reader.onload = function(event) {
          image.src = event.target.result;
          const cropperdiv = document.createElement('div');
          cropperdiv.classList.add('cropper-container');
          cropperdiv.appendChild(image);
    
          imgdiv.appendChild(cropperdiv);
    
          const cropper = new Cropper(image, {
            dragMode: 'move',
            aspectRatio: 1,
            autoCropArea: .80,
            restore: false,
            guides: false,
            center: false,
            highlight: false,
            cropBoxMovable: false,
            cropBoxResizable: false,
            toggleDragModeOnDblclick: false,
          });
    
          const cropbtn = document.createElement('button');
          cropbtn.classList.add('btn', 'btn-primary', 'm-2');
          cropbtn.textContent = 'Crop';
          cropbtn.addEventListener('click', function(event) {
            event.preventDefault();
            const croppedCanvas = cropper.getCroppedCanvas();

            image.src = croppedCanvas.toDataURL()
  
            croppedCanvas.toBlob((blob) => {
              const fileName = Date.now();
              const file = new File([blob], `${fileName}.jpg`, { type: 'image/jpeg' });
  
              if (window.FileList && window.DataTransfer) {
                  const dataTransfer = new DataTransfer();
                  dataTransfer.items.add(file);
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.name = `image${event.target.dataset.index}`;
                  input.files = dataTransfer.files;
                 form.appendChild(input)
                 input.style.display = 'none'
                 
              } else {
                  console.error('FileList and DataTransfer are not supported in this browser.');
              }
          })
            cropper.destroy();
            cropbtn.remove();
      
          });
    
          imgdiv.appendChild(cropbtn);
      };
    
      reader.readAsDataURL(file);
    }}
if (window.location.pathname.includes("/user-edit"))  {
      const form = document.getElementById("editProfileForm")
    
      for (let i = 0; i < 5; i++) {
        const button = document.getElementById(`button${i}`);
        const input = document.getElementById(`input${i}`);
        const image = document.getElementById(`image${i}`);
        const oldimage = document.getElementById(`oldimage${i}`)
      
        const deletebtn = document.getElementById(`deletebutton${i}`);
      if(deletebtn){
        deletebtn.addEventListener("click", () => {
          image.src = "";
          image.style.display = "none";
          deletebtn.style.display = "none";
          button.textContent = "Add";
          oldimage.disabled = true
        });}
        if(button){
        button.addEventListener("click", function () {
          
          input.click();
        });
        input.dataset.index = i;
        input.addEventListener("change", uploaded);
      }}
    
    
      function uploaded(event) {
        const file = event.target.files[0];
        const button = document.getElementById(`button${event.target.dataset.index}`);
        const oldimage = document.getElementById(`oldimage${event.target.dataset.index}`)
        const image = document.getElementById(`image${event.target.dataset.index}`);
        const imgdiv = document.getElementById(`imgdiv${event.target.dataset.index}`);
        const deletebtn = document.getElementById(`deletebutton${event.target.dataset.index}`);
    
        if(oldimage){
        oldimage.disabled = true
        }
    
        image.style.display = "flex";
        button.textContent = "Change";
        deletebtn.style.display = "flex";
        const reader = new FileReader();
    
          reader.onload = function(event) {
              image.src = event.target.result;
              const cropperdiv = document.createElement('div');
              cropperdiv.classList.add('cropper-container');
              cropperdiv.appendChild(image);
        
              imgdiv.appendChild(cropperdiv);
        
              const cropper = new Cropper(image, {
                dragMode: 'move',
                aspectRatio: 1,
                autoCropArea: .80,
                restore: false,
                guides: false,
                center: false,
                highlight: false,
                cropBoxMovable: false,
                cropBoxResizable: false,
                toggleDragModeOnDblclick: false,
              });
        
              const cropbtn = document.createElement('button');
              cropbtn.classList.add('btn', 'btn-primary', 'm-2');
              cropbtn.textContent = 'Crop';
              cropbtn.addEventListener('click', function(event) {
                event.preventDefault();
                const croppedCanvas = cropper.getCroppedCanvas();
    
                image.src = croppedCanvas.toDataURL()
      
                croppedCanvas.toBlob((blob) => {
                  const fileName = Date.now();
                  const file = new File([blob], `${fileName}.jpg`, { type: 'image/jpeg' });
      
                  if (window.FileList && window.DataTransfer) {
                      const dataTransfer = new DataTransfer();
                      dataTransfer.items.add(file);
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.name = `image${event.target.dataset.index}`;
                      input.files = dataTransfer.files;
                     form.appendChild(input)
                     input.style.display = 'none'
                     
                  } else {
                      console.error('FileList and DataTransfer are not supported in this browser.');
                  }
              })
                cropper.destroy();
                cropbtn.remove();
          
              });
        
              imgdiv.appendChild(cropbtn);
          };
        
          reader.readAsDataURL(file);
        }}