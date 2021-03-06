// Script to convert LinkedIn contacts to a csv file that Anki can load.
// 1. Go to https://www.linkedin.com/mynetwork/invite-connect/connections/
// 2. Scoll down and down and down until now new contacts appear.
// 3. Press Command+Option-J to open console. (Ctrl-Alt-J on Windows)
// 4. Click in text entry at bottom
// 5. Copy and paste this entire file
// 6. A file called "contacts.csv" will created and downloaded
// 7. Open Anki and select "Import..."
// 8. Select the "contacts.csv" file
// 9. Select deck type of "Basic" or "Basic and Reverved Card"
// 10. Click "Import"

// Function to download data as a file
(function(console){
    console.save = function(data, filename){
        if(!data) {
            console.error('Console.save: No data')
            return;
        }
        if(!filename) filename = 'console.json'
        if(typeof data === "object"){
            data = JSON.stringify(data, undefined, 4)
        }
        var blob = new Blob([data], {type: 'text/json'}),
            e    = document.createEvent('MouseEvents'),
            a    = document.createElement('a')
        a.download = filename
        a.href = window.URL.createObjectURL(blob)
        a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        a.dispatchEvent(e)
    }
})(console)
// Get names, occumations, photoTags
names = [...document.querySelectorAll('.mn-connection-card__name')].map(x=>x.innerHTML.trim())
links = [...document.querySelectorAll('.mn-connection-card__link')].map(x=>x.href)
occupations = [...document.querySelectorAll('.mn-connection-card__occupation')].map(x=>x.innerHTML.trim())
photoTags = [...document.querySelectorAll('.lazy-image.presence-entity__image.EntityPhoto-circle-5')]
// Func to turn photo urls into data URI's (That don't need internet connection)
function getDataUri(url, callback) {
    return new Promise(resolve => {
        var image = new Image();
        image.setAttribute('crossOrigin', 'anonymous')
        image.onload = function () {
            console.log(`Loading: ${url}`)
            var canvas = document.createElement('canvas')
            canvas.width = this.naturalWidth
            canvas.height = this.naturalHeight
            canvas.getContext('2d').drawImage(this, 0, 0, 150, 150)
            // Resolve
            resolve(canvas.toDataURL('image/jpeg', 0.2))
        };
        image.src = url;
    })
}
// Create promises for photo downloads
photoPromises=photoTags.map(
    async (imgTag)=>{
        if (!imgTag.src) return Promise.resolve('')
        const dataURI= await getDataUri(imgTag.src)
        return dataURI
    }
)
// Wait for photos and then combine all together and download
Promise.all(photoPromises).then((dataUriArray) => {
    const photos = dataUriArray

    allArray = names.map((name,idx)=>{
        // Must use backgrond image because anki tries to change host of img tag
        photoDiv = photos[idx] ? `<div style="width:150px;height:150px;background-image:url(${photos[idx]})"> </div>` : ''
        return `${photoDiv}\t<h1><a href="${links[idx]}">${name}</a></h1><p>${occupations[idx]}</p>`
    });
    const csv=allArray.join("\n")
    console.save(csv,"linkedin_face_to_names.csv")

    rawDatArray = names.map((name,idx)=>{
        return `${name}\t${links[idx]}\t${occupations[idx]}\t${photos[idx]}`
    })
    const rawDataCsv=rawDatArray.join("\n")
    console.save(rawDataCsv,"linkedin_contact_data.csv")

})
